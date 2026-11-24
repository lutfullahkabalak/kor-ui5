import Element from "sap/ui/core/Element";
import "./library";

/**
 * FilterBar alanı
 *
 * @namespace kor.ui
 */
export default class FilterField extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FilterFieldSettings);
	constructor(id?: string, settings?: $FilterFieldSettings);
	constructor(id?: string, settings?: $FilterFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Alan yolu */
			path: { type: "string", defaultValue: "" },
			/** text, number veya option */
			type: { type: "string", defaultValue: "text" },
			/** Seçenek dizisi */
			options: { type: "object" },
			/** Birim */
			unit: { type: "string", defaultValue: "" }
		}
	};
}
