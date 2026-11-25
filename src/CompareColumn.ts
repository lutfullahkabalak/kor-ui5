import Element from "sap/ui/core/Element";
import "./library";

/**
 * Karşılaştırma sütunu
 *
 * @namespace kor.ui
 */
export default class CompareColumn extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CompareColumnSettings);
	constructor(id?: string, settings?: $CompareColumnSettings);
	constructor(id?: string, settings?: $CompareColumnSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Alt başlık */
			text: { type: "string", defaultValue: "" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" },
			/** Durum; boşsa gösterilmez */
			state: { type: "string", defaultValue: "" },
			/** Düğme metni */
			actionText: { type: "string", defaultValue: "" }
		}
	};
}
