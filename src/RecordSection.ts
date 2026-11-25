import Element from "sap/ui/core/Element";
import "./library";

/**
 * Kayıt sayfası bölümü
 *
 * @namespace kor.ui
 */
export default class RecordSection extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $RecordSectionSettings);
	constructor(id?: string, settings?: $RecordSectionSettings);
	constructor(id?: string, settings?: $RecordSectionSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
		}
	};
}
