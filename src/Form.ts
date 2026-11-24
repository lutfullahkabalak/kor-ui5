import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { message } from "./util";
import "./library";

type Field = Control & { getRequired?(): boolean; setError?(text: string): unknown; getError?(): string; getValue?(): unknown; getSelectedKey?(): string; getSelectedKeys?(): string[]; getStart?(): unknown; getVisible(): boolean };

/**
 * Form düzeni: solda bölüm başlığı, sağda alanlar. `validate()` zorunlu alanları denetler.
 *
 * @namespace kor.ui
 */
export default class Form extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FormSettings);
	constructor(id?: string, settings?: $FormSettings);
	constructor(id?: string, settings?: $FormSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "sections",
		properties: {
			/** Bölüm başlıkları alanların üstünde (dar yerler için) */
			stacked: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Bölümler */
			sections: { type: "kor.ui.FormSection", multiple: true, singularName: "section" }
		}
	};
	/** Formun tüm alanları */
	getFields(): Control[] {
		return this.getSections().flatMap((section) => section.getContent());
	}
	private empty(field: Field): boolean {
		const value = field.getSelectedKeys?.() ?? field.getSelectedKey?.() ?? field.getStart?.() ?? field.getValue?.();
		return value === undefined || value === null || value === "" || (Array.isArray(value) && !value.length);
	}
	/** Boş zorunlu alanları işaretler, ilk hatalıya odaklanır; hepsi doluysa true */
	validate(): boolean {
		const text = message("REQUIRED");
		let first: Field | undefined;
		(this.getFields() as Field[]).forEach((field) => {
			if (!field.getVisible() || !field.setError) return;
			if (field.getRequired?.() && this.empty(field)) field.setError(text);
			// Yalnızca kendi koyduğumuz hata kaldırılır
			else if (field.getError?.() === text) field.setError("");
			if (field.getError?.()) first ??= field;
		});
		first?.focus();
		return !first;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Form) {
			rm.openStart("div", c).class("korForm").attr("role", "form");
			if (c.getStacked()) rm.class("korFormStacked");
			rm.openEnd();
			c.getSections().forEach((section) => {
				const title = section.getTitle();
				rm.openStart("section", section).class("korFormSection").attr("role", "group");
				if (title) rm.attr("aria-labelledby", `${section.getId()}-t`);
				else rm.class("korFormBare");
				rm.openEnd();
				if (title) {
					rm.openStart("div").class("korFormSide").openEnd().openStart("h3", `${section.getId()}-t`).openEnd().text(title).close("h3");
					if (section.getText()) rm.openStart("p").openEnd().text(section.getText()).close("p");
					rm.close("div");
				}
				rm.openStart("div").class("korFormGrid").style("--kor-fields", String(section.getColumns())).openEnd();
				section.getContent().forEach((item) => rm.renderControl(item));
				rm.close("div").close("section");
			});
			rm.close("div");
		}
	};
}
