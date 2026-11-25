import Element from "sap/ui/core/Element";
import "./library";

/**
 * Matristeki kişi
 *
 * @namespace kor.ui
 */
export default class TalentPerson extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TalentPersonSettings);
	constructor(id?: string, settings?: $TalentPersonSettings);
	constructor(id?: string, settings?: $TalentPersonSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			name: { type: "string", defaultValue: "" },
			/** Görev */
			role: { type: "string", defaultValue: "" },
			/** Performans, 1-3 */
			performance: { type: "int", defaultValue: 2, bindable: "bindable" },
			/** Potansiyel, 1-3 */
			potential: { type: "int", defaultValue: 2, bindable: "bindable" }
		}
	};
}
