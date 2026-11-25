import Element from "sap/ui/core/Element";
import "./library";

/**
 * Öğrenci
 *
 * @namespace kor.ui
 */
export default class Student extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $StudentSettings);
	constructor(id?: string, settings?: $StudentSettings);
	constructor(id?: string, settings?: $StudentSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			name: { type: "string", defaultValue: "" },
			/** present, late, absent veya boş */
			state: { type: "string", defaultValue: "", bindable: "bindable" }
		}
	};
}
