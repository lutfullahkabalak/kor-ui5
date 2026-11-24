import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { renderIcon } from "./util";
import "./library";

/**
 * Tek seçim: satır ya da açıklamalı kart.
 *
 * @namespace kor.ui
 */
export default class RadioGroup extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $RadioGroupSettings);
	constructor(id?: string, settings?: $RadioGroupSettings);
	constructor(id?: string, settings?: $RadioGroupSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Seçili anahtar */
			selectedKey: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Kart görünümü */
			cards: { type: "boolean", defaultValue: false },
			/** Hata metni */
			error: { type: "string", defaultValue: "" },
			/** Zorunlu */
			required: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Seçenekler */
			items: { type: "kor.ui.RadioItem", multiple: true, singularName: "item" }
		},
		events: {
			/** Seçim değişti */
			change: { parameters: { key: { type: "string" } } }
		}
	};
	getFocusDomRef(): Element {
		return (this.getDomRef()?.querySelector('[tabindex="0"]') ?? this.getDomRef()) as Element;
	}
	private pick(key: string): void {
		if (!this.getEnabled() || key === this.getSelectedKey()) return;
		this.setSelectedKey(key);
		this.fireChange({ key });
	}
	onclick(event: Press): void {
		const key = (event.target as HTMLElement).closest<HTMLElement>("[data-key]")?.dataset.key;
		if (key !== undefined) this.pick(key);
	}
	onkeydown(event: KeyboardEvent): void {
		const step = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[event.key];
		if (!step) return;
		event.preventDefault();
		const keys = this.getItems().map((item) => item.getKey());
		const at = keys.indexOf(this.getSelectedKey());
		this.pick(keys[((at < 0 ? (step > 0 ? -1 : 0) : at) + step + keys.length) % keys.length]);
		window.setTimeout(() => (this.getFocusDomRef() as HTMLElement | null)?.focus());
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: RadioGroup) {
			const id = c.getId();
			const keys = c.getItems().map((item) => item.getKey());
			const at = Math.max(0, keys.indexOf(c.getSelectedKey()));
			rm.openStart("div", c).class("korField");
			if (c.getError()) rm.class("korFieldError");
			rm.openEnd();
			if (c.getLabel()) {
				rm.openStart("span", `${id}-l`).class("korLabel").openEnd().text(c.getLabel());
				if (c.getRequired()) rm.openStart("span").class("korRequired").attr("aria-hidden", "true").openEnd().text("*").close("span");
				rm.close("span");
			}
			rm.openStart("div").class("korRadios").attr("role", "radiogroup").attr("aria-labelledby", `${id}-l`);
			if (c.getCards()) rm.class("korRadioCards");
			if (c.getRequired()) rm.attr("aria-required", "true");
			if (c.getError()) rm.attr("aria-invalid", "true").attr("aria-describedby", `${id}-note`);
			rm.openEnd();
			c.getItems().forEach((item, i) => {
				rm.openStart("button", item).attr("type", "button").class("korRadio").attr("role", "radio").attr("data-key", item.getKey()).attr("aria-checked", String(item.getKey() === c.getSelectedKey())).attr("tabindex", i === at ? "0" : "-1");
				if (!c.getEnabled()) rm.attr("disabled", "disabled");
				rm.openEnd();
				rm.openStart("span").class("korRadioMark").openEnd().close("span");
				rm.openStart("span").class("korCheckBody").openEnd().openStart("span").class("korRadioText").openEnd().text(item.getText()).close("span");
				if (item.getHelp()) rm.openStart("span").class("korNote").openEnd().text(item.getHelp()).close("span");
				rm.close("span");
				renderIcon(rm, item.getIcon());
				rm.close("button");
			});
			rm.close("div");
			if (c.getError()) {
				rm.openStart("div", `${id}-note`).class("korNote").openEnd();
				renderIcon(rm, "circle-alert");
				rm.text(c.getError()).close("div");
			}
			rm.close("div");
		}
	};
}
