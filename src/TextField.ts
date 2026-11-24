import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { renderIcon } from "./util";
import "./library";

/**
 * Etiketi, yardım ve hata metni içinde gelen metin alanı. `rows` > 1 ise çok satırlıdır.
 *
 * @namespace kor.ui
 */
export default class TextField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TextFieldSettings);
	constructor(id?: string, settings?: $TextFieldSettings);
	constructor(id?: string, settings?: $TextFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Değer */
			value: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Yer tutucu */
			placeholder: { type: "string", defaultValue: "" },
			/** Yardım metni */
			help: { type: "string", defaultValue: "" },
			/** Hata metni; doluysa alan hatalıdır */
			error: { type: "string", defaultValue: "" },
			/** Ön simge */
			icon: { type: "string", defaultValue: "" },
			/** Son ek */
			unit: { type: "string", defaultValue: "" },
			/** text, email, tel, url, search, password veya date */
			type: { type: "string", defaultValue: "text" },
			/** Satır sayısı */
			rows: { type: "int", defaultValue: 1 },
			/** Zorunlu */
			required: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Alandan çıkıldı, değer değişti */
			change: { parameters: { value: { type: "string" } } },
			/** Her tuşta */
			liveChange: { parameters: { value: { type: "string" } } }
		}
	};
	protected input(): HTMLInputElement {
		return this.getDomRef("in") as unknown as HTMLInputElement;
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("in") ?? this.getDomRef()) as Element;
	}
	getIdForLabel(): string {
		return `${this.getId()}-in`;
	}
	oninput(): void {
		this.fireLiveChange({ value: this.input().value });
	}
	onchange(): void {
		const value = this.input().value;
		if (value === this.getValue()) return;
		this.setProperty("value", value, true);
		this.fireChange({ value });
	}
	onAfterRendering(): void {
		// DOM yamalanırken yazılmış değer korunur; modelden gelen değer geçerlidir
		if (document.activeElement !== this.input()) this.input().value = this.getValue();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: TextField) {
			const id = c.getId();
			const note = c.getError() || c.getHelp();
			rm.openStart("div", c).class("korField");
			if (c.getError()) rm.class("korFieldError");
			rm.openEnd();
			if (c.getLabel()) {
				rm.openStart("label").class("korLabel").attr("for", `${id}-in`).openEnd().text(c.getLabel());
				if (c.getRequired()) rm.openStart("span").class("korRequired").attr("aria-hidden", "true").openEnd().text("*").close("span");
				rm.close("label");
			}
			rm.openStart("div").class("korBox").openEnd();
			renderIcon(rm, c.getIcon());
			const area = c.getRows() > 1;
			const tag = area ? "textarea" : "input";
			if (area) rm.openStart(tag, `${id}-in`).attr("rows", c.getRows());
			else rm.voidStart(tag, `${id}-in`).attr("type", c.getType()).attr("value", c.getValue());
			rm.class("korInput").attr("placeholder", c.getPlaceholder());
			if (!c.getLabel()) rm.attr("aria-label", c.getPlaceholder());
			if (c.getRequired()) rm.attr("aria-required", "true");
			if (c.getError()) rm.attr("aria-invalid", "true");
			if (note) rm.attr("aria-describedby", `${id}-note`);
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			if (area) rm.openEnd().text(c.getValue()).close(tag);
			else rm.voidEnd();
			if (c.getUnit()) rm.openStart("span").class("korUnit").openEnd().text(c.getUnit()).close("span");
			rm.close("div");
			if (note) {
				rm.openStart("div", `${id}-note`).class("korNote").openEnd();
				if (c.getError()) renderIcon(rm, "circle-alert");
				rm.text(note).close("div");
			}
			rm.close("div");
		}
	};
}
