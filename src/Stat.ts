import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { num, pct, reducedMotion, renderIcon, sparkHtml } from "./util";
import "./library";

/**
 * Büyük sayı: değer değişince sayarak gider; değişim ve küçük eğri yanında.
 *
 * @namespace kor.ui
 */
export default class Stat extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $StatSettings);
	constructor(id?: string, settings?: $StatSettings);
	constructor(id?: string, settings?: $StatSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Değer */
			value: { type: "float", defaultValue: 0 },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Değişim, yüzde; 0 gizler */
			delta: { type: "float", defaultValue: 0 },
			/** Artış iyi mi */
			upIsGood: { type: "boolean", defaultValue: true },
			/** Değişimin açıklaması */
			note: { type: "string", defaultValue: "" },
			/** Küçük eğri */
			trend: { type: "object" },
			/** Büyük boy */
			hero: { type: "boolean", defaultValue: false }
		},
		events: {
			/** Basıldı */
			press: {}
		}
	};
	private shown?: number;
	private frame = 0;

	onclick(): void {
		this.firePress();
	}
	onAfterRendering(): void {
		const spark = this.getDomRef("spark");
		if (spark) spark.innerHTML = sparkHtml((this.getTrend() as number[]) ?? [], 96, 30);
		const el = this.getDomRef("num") as HTMLElement;
		const to = this.getValue();
		const from = this.shown ?? (reducedMotion() ? to : to * 0.82);
		cancelAnimationFrame(this.frame);
		this.shown = to;
		const done = () => (el.textContent = num(to, this.getDecimals()));
		if (from === to || reducedMotion() || document.hidden) {
			done();
			return;
		}
		const begin = performance.now();
		const tick = (now: number) => {
			const t = Math.min(1, (now - begin) / 700);
			if (t === 1) {
				done();
				return;
			}
			el.textContent = num(from + (to - from) * (1 - (1 - t) ** 4), this.getDecimals());
			this.frame = requestAnimationFrame(tick);
		};
		el.textContent = num(from, this.getDecimals());
		this.frame = requestAnimationFrame(tick);
	}
	exit(): void {
		cancelAnimationFrame(this.frame);
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Stat) {
			const delta = c.getDelta();
			rm.openStart("div", c).class("korStat");
			if (c.getHero()) rm.class("korStatHero");
			rm.openEnd();
			rm.openStart("div").class("korStatLabel").openEnd().text(c.getLabel()).close("div");
			rm.openStart("div").class("korStatRow").openEnd();
			rm.openStart("div").class("korStatValue").openEnd();
			rm.openStart("span", `${c.getId()}-num`).openEnd().text(num(c.getValue(), c.getDecimals())).close("span");
			if (c.getUnit()) rm.openStart("span").class("korStatUnit").openEnd().text(c.getUnit()).close("span");
			rm.close("div");
			if (c.getTrend()) rm.openStart("div", `${c.getId()}-spark`).class("korStatSpark").openEnd().close("div");
			rm.close("div");
			if (delta || c.getNote()) {
				rm.openStart("div").class("korStatNote").openEnd();
				if (delta) {
					rm.openStart("span").class("korDelta").class(delta > 0 === c.getUpIsGood() ? "korDeltaGood" : "korDeltaBad").openEnd();
					renderIcon(rm, delta > 0 ? "trending-up" : "trending-down");
					rm.text(pct(Math.abs(delta), 1)).close("span");
				}
				rm.text(c.getNote()).close("div");
			}
			rm.close("div");
		}
	};
}
