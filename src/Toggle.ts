import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { renderIcon } from "./util";
import "./library";

/**
 * Aç-kapa anahtarı.
 *
 * @namespace kor.ui
 */
export default class Toggle extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ToggleSettings);
	constructor(id?: string, settings?: $ToggleSettings);
	constructor(id?: string, settings?: $ToggleSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Açık / işaretli */
			selected: { type: "boolean", defaultValue: false, bindable: "bindable" },
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Açıklama */
			help: { type: "string", defaultValue: "" },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Değer değişti */
			change: { parameters: { selected: { type: "boolean" } } }
		}
	};
	onclick(): void {
		if (!this.getEnabled()) return;
		this.setSelected(!this.getSelected());
		this.fireChange({ selected: this.getSelected() });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Toggle) {
			rm.openStart("button", c).attr("type", "button").attr("role", "switch").attr("aria-checked", String(c.getSelected())).class("korToggle");
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.openEnd().openStart("span").class("korToggleMark").openEnd();
			renderIcon(rm, "check");
			rm.close("span").openStart("span").class("korCheckBody").openEnd().openStart("span").openEnd().text(c.getText()).close("span");
			if (c.getHelp()) rm.openStart("span").class("korNote").openEnd().text(c.getHelp()).close("span");
			rm.close("span").close("button");
		}
	};
}
