import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { isRtl, message, num, renderIcon } from "./util";
import "./library";

/**
 * Yıldızla puanlama.
 *
 * @namespace kor.ui
 */
export default class Rating extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $RatingSettings);
	constructor(id?: string, settings?: $RatingSettings);
	constructor(id?: string, settings?: $RatingSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Puan */
			value: { type: "float", defaultValue: 0, bindable: "bindable" },
			/** En çok */
			max: { type: "int", defaultValue: 5 },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Yalnız gösterim; kesirli puan çizilir */
			readOnly: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Puan değişti */
			change: { parameters: { value: { type: "float" } } }
		}
	};
	private set(value: number): void {
		const next = Math.max(0, Math.min(this.getMax(), value));
		if (next === this.getValue()) return;
		this.setValue(next);
		this.fireChange({ value: next });
	}
	private active(): boolean {
		return this.getEnabled() && !this.getReadOnly();
	}
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-star]")?.dataset.star;
		// Aynı yıldıza basmak puanı siler
		if (i !== undefined && this.active()) this.set(Number(i) === this.getValue() ? 0 : Number(i));
	}
	onkeydown(event: KeyboardEvent): void {
		if (!this.active()) return;
		const side = isRtl() ? -1 : 1;
		const at = Math.round(this.getValue());
		const to = { ArrowRight: at + side, ArrowLeft: at - side, ArrowUp: at + 1, ArrowDown: at - 1, Home: 0, End: this.getMax() }[event.key];
		if (to === undefined) return;
		event.preventDefault();
		this.set(to);
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("stars") ?? this.getDomRef()) as Element;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Rating) {
			const id = c.getId();
			const text = message("RATING_OF", [num(c.getValue(), c.getValue() % 1 ? 1 : 0), c.getMax()]);
			rm.openStart("div", c).class("korField").class("korRating");
			if (!c.active()) rm.class("korRatingStill");
			if (!c.getEnabled()) rm.class("korRatingOff");
			rm.openEnd();
			if (c.getLabel()) rm.openStart("span", `${id}-l`).class("korLabel").openEnd().text(c.getLabel()).close("span");
			rm.openStart("span", `${id}-stars`).class("korStars").attr("aria-label", c.getReadOnly() ? `${c.getLabel()} ${text}`.trim() : c.getLabel() || message("RATING"));
			if (c.getReadOnly()) rm.attr("role", "img");
			else rm.attr("role", "slider").attr("tabindex", c.getEnabled() ? "0" : "-1").attr("aria-valuemin", "0").attr("aria-valuemax", c.getMax()).attr("aria-valuenow", c.getValue()).attr("aria-valuetext", text);
			if (!c.getEnabled()) rm.attr("aria-disabled", "true");
			rm.openEnd();
			for (let i = 1; i <= c.getMax(); i++) {
				rm.openStart("span").class("korStar").attr("data-star", i).style("--kor-part", String(Math.max(0, Math.min(1, c.getValue() - i + 1)))).openEnd();
				renderIcon(rm, "star");
				rm.openStart("span").class("korStarFill").openEnd();
				renderIcon(rm, "star");
				rm.close("span").close("span");
			}
			rm.close("span").close("div");
		}
	};
}
