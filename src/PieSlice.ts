import Element from "sap/ui/core/Element";
import "./library";

/**
 * Pasta grafiğinin dilimi
 *
 * @namespace kor.ui
 */
export default class PieSlice extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $PieSliceSettings);
	constructor(id?: string, settings?: $PieSliceSettings);
	constructor(id?: string, settings?: $PieSliceSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			label: { type: "string", defaultValue: "" },
			/** Değer. Sıfır ve eksi değer dilim çizmez, listede görünür */
			value: { type: "any", defaultValue: null }
		}
	};
}
