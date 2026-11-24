import Element from "sap/ui/core/Element";
import "./library";

/**
 * Form bölümü
 *
 * @namespace kor.ui
 */
export default class FormSection extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FormSectionSettings);
	constructor(id?: string, settings?: $FormSectionSettings);
	constructor(id?: string, settings?: $FormSectionSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Alan sütunu */
			columns: { type: "int", defaultValue: 2 }
		},
		defaultAggregation: "content",
		aggregations: {
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
		}
	};
}
