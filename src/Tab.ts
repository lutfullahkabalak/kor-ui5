import Element from "sap/ui/core/Element";
import "./library";

/**
 * Sekme
 *
 * @namespace kor.ui
 */
export default class Tab extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TabSettings);
	constructor(id?: string, settings?: $TabSettings);
	constructor(id?: string, settings?: $TabSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Simge */
			icon: { type: "string", defaultValue: "" },
			/** Sayı */
			count: { type: "string", defaultValue: "" },
			/** Sayının durumu */
			state: { type: "string", defaultValue: "none" }
		},
		defaultAggregation: "content",
		aggregations: {
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
		}
	};
}
