import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { compact, message, num } from "./util";
import "./library";

/**
 * Başlangıçtan sonuca giden artış ve azalışları gösterir.
 *
 * @namespace kor.ui
 */
export default class Waterfall extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $WaterfallSettings);
	constructor(id?: string, settings?: $WaterfallSettings);
	constructor(id?: string, settings?: $WaterfallSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "steps",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Çizim yüksekliği, piksel */
			height: { type: "int", defaultValue: 260 },
			/** Artış olumlu */
			upIsGood: { type: "boolean", defaultValue: true },
			/** Kısa sayılar (1,2 Mn) */
			compact: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Adımlar */
			steps: { type: "kor.ui.WaterfallStep", multiple: true, singularName: "step" }
		},
		events: {
			/** Adıma basıldı */
			stepPress: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.fireStepPress({ key: this.getSteps()[Number(i)].getKey() });
	}
	private shown(value: number, sign: boolean): string {
		const text = this.getCompact() ? compact(Math.abs(value)) : num(Math.abs(value), this.getDecimals());
		return (value < 0 ? "−" : sign && value > 0 ? "+" : "") + text;
	}
	/** Her adımın başladığı ve bittiği yer. */
	getRanges(): { from: number; to: number }[] {
		let sum = 0;
		return this.getSteps().map((step) => {
			const total = step.getKind() === "total";
			const from = total ? 0 : sum;
			// Değeri verilmeyen toplam o ana kadarki toplamdır
			const value = step.getValue() as unknown;
			sum = total ? (value === null || value === undefined || value === "" ? sum : Number(value)) : sum + Number(value ?? 0);
			return { from, to: sum };
		});
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Waterfall) {
			const steps = c.getSteps();
			const ranges = c.getRanges();
			const low = Math.min(0, ...ranges.flatMap((r) => [r.from, r.to]));
			const high = Math.max(0, ...ranges.flatMap((r) => [r.from, r.to]));
			const size = high - low || 1;
			const at = (value: number) => ((value - low) / size) * 100;
			const live = c.hasListeners("stepPress");
			rm.openStart("div", c).class("korFall").openEnd();
			if (!steps.length) rm.openStart("div").class("korMenuNone").openEnd().text(message("NO_DATA")).close("div");
			rm.openStart("ol").attr("aria-label", `${c.getLabel() || message("WATERFALL")}${c.getUnit() ? `, ${c.getUnit()}` : ""}`).style("--kor-plot", `${c.getHeight()}px`).style("--kor-zero", `${at(0)}%`).openEnd();
			steps.forEach((step, i) => {
				const { from, to } = ranges[i];
				const total = step.getKind() === "total";
				const value = total ? to : to - from;
				const kind = total ? "total" : value >= 0 === c.getUpIsGood() ? "good" : "bad";
				const text = c.shown(value, !total);
				rm.openStart("li", step).class("korFallStep").class(`korFall-${kind}`).openEnd();
				const tag = live ? "button" : "div";
				rm.openStart(tag).class("korFallCol");
				if (live) rm.attr("type", "button").attr("data-i", i);
				rm.openEnd();
				rm.openStart("span").class("korFallPlot").openEnd();
				rm.openStart("i").class("korFallZero").openEnd().close("i");
				rm.openStart("span").class("korFallBar").style("bottom", `${at(Math.min(from, to))}%`).style("height", `${(Math.abs(to - from) / size) * 100}%`).openEnd();
				rm.openStart("b").class("korNum").openEnd().text(text).close("b").close("span");
				if (i < steps.length - 1) rm.openStart("i").class("korFallLink").style("bottom", `${at(to)}%`).openEnd().close("i");
				rm.close("span");
				rm.openStart("span").class("korFallName").openEnd().text(step.getLabel()).close("span");
				rm.close(tag).close("li");
			});
			rm.close("ol");
			if (c.getUnit()) rm.openStart("div").class("korNote").openEnd().text(c.getUnit()).close("div");
			rm.close("div");
		}
	};
}
