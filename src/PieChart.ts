import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { amount, compact, message, num, pct } from "./util";
import "./library";

type Part = { keys: string[]; label: string; value: number; share: number; tone: number };

/**
 * Bir bütünün paylarını pasta veya halka olarak gösterir.
 *
 * @namespace kor.ui
 */
export default class PieChart extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $PieChartSettings);
	constructor(id?: string, settings?: $PieChartSettings);
	constructor(id?: string, settings?: $PieChartSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "slices",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** pie veya donut */
			kind: { type: "string", defaultValue: "pie" },
			/** Çap, piksel */
			size: { type: "int", defaultValue: 220 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Kısa sayılar (1,2 Mn) */
			compact: { type: "boolean", defaultValue: false },
			/** Halkanın ortasındaki ad; boşsa "Toplam" */
			totalLabel: { type: "string", defaultValue: "" },
			/** En çok dilim (2-6). Fazlası "Diğer" diliminde toplanır */
			maxSlices: { type: "int", defaultValue: 6 }
		},
		aggregations: {
			/** Dilimler */
			slices: { type: "kor.ui.PieSlice", multiple: true, singularName: "slice" }
		},
		events: {
			/** Dilime basıldı. "Diğer" için key boştur, keys içindeki dilimleri verir */
			slicePress: { parameters: { key: { type: "string" }, keys: { type: "object" } } }
		}
	};
	init(): void {
		const on = (raw: unknown) => this.mark((((raw as { target: Element }).target).closest?.("[data-i]") as HTMLElement | null)?.dataset.i);
		this.attachBrowserEvent("pointerover", on);
		this.attachBrowserEvent("focusin", on);
		this.attachBrowserEvent("pointerleave", () => this.mark());
		this.attachBrowserEvent("focusout", () => this.mark());
	}
	onclick(event: Press): void {
		const i = (event.target as Element).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i === undefined || !this.hasListeners("slicePress")) return;
		const { keys, tone } = this.getParts()[Number(i)];
		this.fireSlicePress({ key: tone ? keys[0] : "", keys });
	}
	private mark(i?: string): void {
		const root = this.getDomRef();
		root?.querySelectorAll<HTMLElement>("[data-i]").forEach((el) => {
			el.classList.toggle("korDim", i !== undefined && el.dataset.i !== i);
			el.classList.toggle("korOn", el.dataset.i === i);
		});
		const part = this.getParts()[Number(i ?? -1)];
		const value = this.getDomRef("value");
		const name = this.getDomRef("name");
		if (value) value.textContent = part ? pct(part.share * 100, 1) : this.shown(this.getSum());
		if (name) name.textContent = part ? part.label : this.getTotalLabel() || message("TOTAL_ALL");
	}
	private shown(value: number): string {
		return this.getCompact() ? compact(value) : num(value, this.getDecimals());
	}
	private getSum(): number {
		return this.getSlices().reduce((sum, s) => sum + Math.max(0, amount(s.getValue())), 0);
	}
	/** Çizilen dilimler ve payları. tone 0 "Diğer" dilimidir. */
	getParts(): Part[] {
		const sum = this.getSum();
		const all = this.getSlices().map((s) => ({ keys: [s.getKey()], label: s.getLabel(), value: amount(s.getValue()) }));
		const max = Math.max(2, Math.min(6, this.getMaxSlices()));
		let kept = all;
		if (all.length > max) {
			const big = new Set([...all].sort((a, b) => b.value - a.value).slice(0, max - 1));
			kept = all.filter((p) => big.has(p));
			const rest = all.filter((p) => !big.has(p));
			kept.push({ keys: rest.flatMap((p) => p.keys), label: message("OTHER"), value: rest.reduce((s, p) => s + Math.max(0, p.value), 0) });
		}
		return kept.map((p, i) => ({ ...p, share: sum ? Math.max(0, p.value) / sum : 0, tone: all.length > max && i === kept.length - 1 ? 0 : i + 1 }));
	}
	/** Dilim yolu; komşularla arasında 2 piksel boşluk bırakır */
	private static path(from: number, to: number, outer: number, inner: number): string {
		const full = to - from > 2 * Math.PI - 1e-6;
		const at = (r: number, a: number) => `${(r * Math.sin(a)).toFixed(2)} ${(-r * Math.cos(a)).toFixed(2)}`;
		const ring = (r: number, sweep: number) => `M${at(r, 0)}A${r} ${r} 0 1 ${sweep} ${at(r, Math.PI)}A${r} ${r} 0 1 ${sweep} ${at(r, 0)}Z`;
		if (full) return ring(outer, 1) + (inner ? ring(inner, 0) : "");
		const size = to - from;
		const pad = (r: number) => Math.min(1 / r, size / 4);
		const big = (r: number) => (size - 2 * pad(r) > Math.PI ? 1 : 0);
		const edge = `${at(outer, from + pad(outer))}A${outer} ${outer} 0 ${big(outer)} 1 ${at(outer, to - pad(outer))}`;
		if (inner) return `M${edge}L${at(inner, to - pad(inner))}A${inner} ${inner} 0 ${big(inner)} 0 ${at(inner, from + pad(inner))}Z`;
		const tip = size < Math.PI ? Math.min(outer / 2, 1 / Math.sin(size / 2)) : 0;
		return `M${edge}L${at(tip, (from + to) / 2)}Z`;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: PieChart) {
			const id = c.getId();
			const parts = c.getParts();
			const live = c.hasListeners("slicePress");
			const donut = c.getKind() === "donut";
			const sum = c.getSum();
			rm.openStart("div", c).class("korPie").attr("role", "group").attr("aria-label", c.getLabel() || message("PIE_CHART")).openEnd();
			if (!sum && !parts.length) {
				rm.openStart("div").class("korMenuNone").openEnd().text(message("NO_DATA")).close("div").close("div");
				return;
			}
			rm.openStart("div").class("korPiePlot").style("--kor-size", `${c.getSize()}px`).attr("aria-hidden", "true").openEnd();
			rm.openStart("svg").attr("viewBox", "-100 -100 200 200").attr("focusable", "false").openEnd();
			if (!sum) rm.openStart("path").class("korPieNone").attr("d", PieChart.path(0, 7, 98, donut ? 64 : 0)).openEnd().close("path");
			let turn = 0;
			parts.forEach((p, i) => {
				const from = turn;
				turn += p.share * 2 * Math.PI;
				if (!p.share) return;
				rm.openStart("path").class("korSlice").class(`korInk${p.tone}`).attr("data-i", i).attr("d", PieChart.path(from, turn, 98, donut ? 64 : 0));
				if (live) rm.class("korLive");
				rm.openEnd().close("path");
			});
			rm.close("svg");
			if (donut) {
				rm.openStart("div").class("korPieHole").openEnd();
				rm.openStart("b", `${id}-value`).openEnd().text(c.shown(sum)).close("b");
				rm.openStart("span", `${id}-name`).openEnd().text(c.getTotalLabel() || message("TOTAL_ALL")).close("span");
				rm.close("div");
			}
			rm.close("div");
			// Gösterge aynı zamanda grafiğin metin karşılığıdır
			rm.openStart("ul").class("korPieList").attr("role", "list").openEnd();
			parts.forEach((p, i) => {
				rm.openStart("li").openEnd();
				const tag = live ? "button" : "div";
				rm.openStart(tag).class("korPieRow").attr("data-i", i);
				if (live) rm.attr("type", "button");
				rm.openEnd();
				rm.openStart("i").class("korPieKey").class(`korInk${p.tone}`).openEnd().close("i");
				rm.openStart("span").class("korPieName").openEnd().text(p.label).close("span");
				rm.openStart("span").class("korPieValue").class("korNum").openEnd().text(`${c.shown(p.value)}${c.getUnit() ? ` ${c.getUnit()}` : ""}`).close("span");
				rm.openStart("b").class("korNum").openEnd().text(p.value < 0 ? "–" : pct(p.share * 100, 1)).close("b");
				rm.close(tag).close("li");
			});
			rm.close("ul").close("div");
		}
	};
}
