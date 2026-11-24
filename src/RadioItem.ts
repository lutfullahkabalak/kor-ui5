import Element from "sap/ui/core/Element";
import "./library";

/**
 * Tek seçim seçeneği
 *
 * @namespace kor.ui
 */
export default class RadioItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $RadioItemSettings);
	constructor(id?: string, settings?: $RadioItemSettings);
	constructor(id?: string, settings?: $RadioItemSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Açıklama */
			help: { type: "string", defaultValue: "" },
			/** Simge */
			icon: { type: "string", defaultValue: "" }
		}
	};
}
