import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { compact, esc, num, smoothPath } from "./util";
import "./library";

/**
 * Zaman serisi: alan, çizgi, çubuk ve hedef gölgesi (ghost). Fareyle veya ok tuşlarıyla okunur.
 *
 * @namespace kor.ui
 */
export default class Trend extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TrendSettings);
	constructor(id?: string, settings?: $TrendSettings);
	constructor(id?: string, settings?: $TrendSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "series",
		properties: {
			/** Yatay eksen etiketleri */
			labels: { type: "object" },
			/** Yükseklik, piksel */
			height: { type: "int", defaultValue: 220 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Ekran okuyucu adı */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Seriler (en çok 4) */
			series: { type: "kor.ui.Series", multiple: true, singularName: "serie" }
		}
	};
	private observer?: ResizeObserver;
	private at = -1;
	private geo?: { left: number; inner: number; count: number; band: boolean };

	init(): void {
		this.attachBrowserEvent("pointermove", (raw: unknown) => {
			const event = (raw as { originalEvent: PointerEvent }).originalEvent;
			const plot = this.getDomRef("plot");
			if (!plot || !this.geo) return;
			const { left, inner, count, band } = this.geo;
			const x = event.clientX - plot.getBoundingClientRect().left - left;
			const i = band ? Math.floor((x / inner) * count) : Math.round((x / inner) * (count - 1));
			this.show(Math.max(0, Math.min(count - 1, i)));
		});
		this.attachBrowserEvent("pointerleave", () => this.show(-1));
	}
	onfocusout(): void {
		this.show(-1);
	}
	onkeydown(event: KeyboardEvent): void {
		const step = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
		if (!step || !this.geo) return;
		event.preventDefault();
		this.show(Math.max(0, Math.min(this.geo.count - 1, this.at < 0 ? (step > 0 ? 0 : this.geo.count - 1) : this.at + step)));
	}
	private values(i: number): number[] {
		return (this.getSeries()[i].getValues() as number[]) ?? [];
	}
	private x(i: number): number {
		const g = this.geo!;
		return g.left + (g.band ? ((i + 0.5) / g.count) * g.inner : (i / Math.max(1, g.count - 1)) * g.inner);
	}
	private show(i: number): void {
		const tip = this.getDomRef("tip") as HTMLElement | null;
		const plot = this.getDomRef("plot") as HTMLElement | null;
		if (!tip || !plot || i === this.at) return;
		this.at = i;
		plot.querySelectorAll<SVGElement>("[data-at]").forEach((el) => el.classList.toggle("korOn", Number(el.dataset.at) === i));
		plot.querySelectorAll(".korBar").forEach((el) => el.classList.toggle("korDim", i >= 0 && Number((el as SVGElement).dataset.bar) !== i));
		tip.hidden = i < 0;
		if (i < 0) return;
		const labels = (this.getLabels() as string[]) ?? [];
		tip.innerHTML = `<div class="korTipHead">${esc(labels[i])}</div>${this.getSeries().map((s, n) => `<div class="korTipRow"><span class="korKey korKey${n + 1}${s.getKind() === "ghost" ? " korKeyGhost" : ""}"></span><span>${esc(s.getName())}</span><b>${esc(num(this.values(n)[i] ?? 0, Number.isInteger(this.values(n)[i] ?? 0) ? 0 : 1))} ${esc(this.getUnit())}</b></div>`).join("")}`;
		const x = this.x(i);
		const flip = x + tip.offsetWidth + 20 > plot.clientWidth;
		tip.style.transform = `translate(${flip ? Math.max(0, x - tip.offsetWidth - 14) : x + 14}px, 8px)`;
	}
	onAfterRendering(): void {
		this.observer?.disconnect();
		this.observer = new ResizeObserver(() => this.draw());
		this.observer.observe(this.getDomRef("plot") as Element);
	}
	exit(): void {
		this.observer?.disconnect();
	}
	private draw(): void {
		const svg = this.getDomRef("svg");
		const plot = this.getDomRef("plot");
		if (!svg || !plot) return;
		const series = this.getSeries();
		const labels = (this.getLabels() as string[]) ?? [];
		const width = plot.clientWidth;
		const height = this.getHeight();
		const all = series.flatMap((_, i) => this.values(i));
		const top = Math.max(...all, 1);
		const mag = 10 ** Math.floor(Math.log10(top / 5));
		const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => Math.ceil(top / s) <= 5)!;
		const ticks = Math.ceil(top / step);
		const max = step * ticks;
		const left = 46;
		const bottom = 24;
		const band = series.some((s) => s.getKind() === "bar");
		const count = labels.length;
		const inner = width - left - (band ? 4 : 16);
		this.geo = { left, inner, count, band };
		this.at = -1;
		const y = (v: number) => 10 + (1 - v / max) * (height - bottom - 10);
		const base = y(0);
		let out = "";
		for (let i = 0; i <= ticks; i++) out += `<line class="korGridLine" x1="${left}" x2="${width}" y1="${y(step * i)}" y2="${y(step * i)}"/><text class="korAxis" x="${left - 10}" y="${y(step * i) + 4}" text-anchor="end">${esc(compact(step * i))}</text>`;
		const every = Math.max(1, Math.ceil(count / (inner / 56)));
		labels.forEach((text, i) => {
			if (i % every === 0) out += `<text class="korAxis" x="${this.x(i)}" y="${height - 4}" text-anchor="middle">${esc(text)}</text>`;
		});
		const bars = series.filter((s) => s.getKind() === "bar").length;
		let bar = 0;
		series.forEach((s, n) => {
			const values = this.values(n);
			const points = values.map((v, i) => [this.x(i), y(v)] as [number, number]);
			const cls = `korInk${n + 1}`;
			if (s.getKind() === "bar") {
				const slot = Math.min(26, ((inner / count) * 0.64) / bars);
				values.forEach((v, i) => {
					const x = this.x(i) - (slot * bars) / 2 + slot * bar;
					const h = Math.max(0, base - y(v));
					const r = Math.min(4, h, (slot - 2) / 2);
					out += `<path class="korBar ${cls}" data-bar="${i}" d="M${x + 1} ${base}V${y(v) + r}q0 ${-r} ${r} ${-r}H${x + slot - 1 - r}q${r} 0 ${r} ${r}V${base}Z"/>`;
				});
				bar++;
				return;
			}
			const path = smoothPath(points);
			if (s.getKind() === "area" && points.length) out += `<path class="korArea ${cls}" d="${path}L${points[points.length - 1][0]} ${base}L${points[0][0]} ${base}Z"/>`;
			out += `<path class="korLine ${cls}${s.getKind() === "ghost" ? " korGhost" : ""}" pathLength="${s.getKind() === "ghost" ? "" : 1}" d="${path}"/>`.replace(' pathLength=""', "");
			if (s.getKind() !== "ghost") out += points.map(([px, py], i) => `<circle class="korDot ${cls}" data-at="${i}" cx="${px}" cy="${py}" r="4.5"/>`).join("");
		});
		out += labels.map((_, i) => `<line class="korCross" data-at="${i}" x1="${this.x(i)}" x2="${this.x(i)}" y1="10" y2="${base}"/>`).join("");
		svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
		svg.innerHTML = out;
		this.show(-1);
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Trend) {
			const id = c.getId();
			const series = c.getSeries();
			const labels = (c.getLabels() as string[]) ?? [];
			rm.openStart("div", c).class("korTrend").attr("tabindex", "0").attr("role", "figure").attr("aria-label", c.getLabel()).openEnd();
			if (series.length > 1) {
				rm.openStart("div").class("korLegend").openEnd();
				series.forEach((s, i) => {
					rm.openStart("span").openEnd().openStart("span").class("korKey").class(`korKey${i + 1}`);
					if (s.getKind() === "ghost") rm.class("korKeyGhost");
					rm.openEnd().close("span").text(s.getName()).close("span");
				});
				rm.close("div");
			}
			rm.openStart("div", `${id}-plot`).class("korPlot").style("height", `${c.getHeight()}px`).openEnd();
			rm.openStart("svg", `${id}-svg`).attr("aria-hidden", "true").openEnd().close("svg");
			rm.openStart("div", `${id}-tip`).class("korTip").attr("aria-live", "polite").attr("hidden", "hidden").openEnd().close("div");
			rm.close("div");
			// Ekran okuyucu için tablo karşılığı
			rm.openStart("table").class("korSr").openEnd().openStart("tbody").openEnd();
			labels.forEach((label, i) => {
				rm.openStart("tr").openEnd().openStart("th").openEnd().text(label).close("th");
				series.forEach((s) => rm.openStart("td").openEnd().text(`${s.getName()}: ${num(((s.getValues() as number[]) ?? [])[i] ?? 0)} ${c.getUnit()}`).close("td"));
				rm.close("tr");
			});
			rm.close("tbody").close("table").close("div");
		}
	};
}
