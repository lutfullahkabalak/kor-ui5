import Element from "sap/ui/core/Element";
import "./library";

/**
 * Pano sütunu
 *
 * @namespace kor.ui
 */
export default class BoardColumn extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $BoardColumnSettings);
	constructor(id?: string, settings?: $BoardColumnSettings);
	constructor(id?: string, settings?: $BoardColumnSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** İş sınırı, 0 sınırsız */
			limit: { type: "int", defaultValue: 0 },
			/** Başlık durumu */
			state: { type: "string", defaultValue: "none" }
		}
	};
}
