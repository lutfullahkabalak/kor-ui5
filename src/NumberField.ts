import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { num, parseNum, renderIcon } from "./util";
import "./library";

/**
 * Sayı alanı: yerel biçim, ok tuşları, düğmeler; etiketi sürükleyince değer akar.
 *
 * @namespace kor.ui
 */
export default class NumberField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $NumberFieldSettings);
	constructor(id?: string, settings?: $NumberFieldSettings);
	constructor(id?: string, settings?: $NumberFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Değer */
			value: { type: "float", defaultValue: 0, bindable: "bindable" },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Adım */
			step: { type: "float", defaultValue: 1 },
			/** En az */
			min: { type: "float", defaultValue: -1e15 },
			/** En çok */
			max: { type: "float", defaultValue: 1e15 },
			/** Yardım metni */
			help: { type: "string", defaultValue: "" },
			/** Hata metni */
			error: { type: "string", defaultValue: "" },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Değer değişti */
			change: { parameters: { value: { type: "float" } } }
		}
	};
	init(): void {
		this.attachBrowserEvent("pointerdown", (raw: unknown) => {
			const event = (raw as { originalEvent: PointerEvent }).originalEvent;
			const label = (event.target as HTMLElement).closest<HTMLElement>(".korScrub");
			if (!label || !this.getEnabled()) return;
			const from = this.getValue();
			let moved = false;
			label.setPointerCapture(event.pointerId);
			const move = (e: PointerEvent) => {
				const steps = Math.round((e.clientX - event.clientX) / 6);
				moved ||= steps !== 0;
				if (moved) this.commit(from + steps * this.getStep());
			};
			const up = () => {
				label.removeEventListener("pointermove", move);
				label.removeEventListener("pointerup", up);
				label.removeEventListener("pointercancel", up);
			};
			label.addEventListener("pointermove", move);
			label.addEventListener("pointerup", up);
			label.addEventListener("pointercancel", up);
		});
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("in") ?? this.getDomRef()) as Element;
	}
	getIdForLabel(): string {
		return `${this.getId()}-in`;
	}
	private commit(value: number): void {
		const scale = 10 ** this.getDecimals();
		const next = Math.round(Math.max(this.getMin(), Math.min(this.getMax(), value)) * scale) / scale;
		const changed = next !== this.getValue();
		this.setProperty("value", next, true);
		this.show();
		if (changed) this.fireChange({ value: next });
	}
	private show(): void {
		const input = this.getDomRef("in") as unknown as HTMLInputElement;
		input.value = num(this.getValue(), this.getDecimals());
		input.setAttribute("aria-valuenow", String(this.getValue()));
	}
	onAfterRendering(): void {
		this.show();
	}
	onclick(event: Press): void {
		const step = (event.target as HTMLElement).closest<HTMLElement>("[data-step]")?.dataset.step;
		if (step && this.getEnabled()) this.commit(this.getValue() + Number(step) * this.getStep());
	}
	onkeydown(event: KeyboardEvent): void {
		const step = { ArrowUp: 1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[event.key];
		if (!step || !this.getEnabled()) return;
		event.preventDefault();
		this.commit(this.typed() + step * this.getStep());
	}
	private typed(): number {
		const value = parseNum((this.getDomRef("in") as unknown as HTMLInputElement).value);
		return Number.isFinite(value) ? value : this.getValue();
	}
	onchange(): void {
		this.commit(this.typed());
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: NumberField) {
			const id = c.getId();
			const note = c.getError() || c.getHelp();
			const off = !c.getEnabled();
			rm.openStart("div", c).class("korField");
			if (c.getError()) rm.class("korFieldError");
			rm.openEnd();
			if (c.getLabel()) rm.openStart("label").class("korLabel").class("korScrub").attr("for", `${id}-in`).openEnd().text(c.getLabel()).close("label");
			rm.openStart("div").class("korBox").openEnd();
			rm.voidStart("input", `${id}-in`).class("korInput").class("korNumber").attr("inputmode", "decimal").attr("role", "spinbutton").attr("autocomplete", "off");
			if (c.getMin() > -1e15) rm.attr("aria-valuemin", c.getMin());
			if (c.getMax() < 1e15) rm.attr("aria-valuemax", c.getMax());
			if (c.getError()) rm.attr("aria-invalid", "true");
			if (note) rm.attr("aria-describedby", `${id}-note`);
			if (off) rm.attr("disabled", "disabled");
			rm.voidEnd();
			if (c.getUnit()) rm.openStart("span").class("korUnit").openEnd().text(c.getUnit()).close("span");
			rm.openStart("span").class("korSteps").attr("aria-hidden", "true").openEnd();
			(["minus", "plus"] as const).forEach((icon) => {
				rm.openStart("button").attr("type", "button").attr("tabindex", "-1").attr("data-step", icon === "plus" ? "1" : "-1");
				if (off) rm.attr("disabled", "disabled");
				rm.openEnd();
				renderIcon(rm, icon);
				rm.close("button");
			});
			rm.close("span").close("div");
			if (note) rm.openStart("div", `${id}-note`).class("korNote").openEnd().text(note).close("div");
			rm.close("div");
		}
	};
}
