import Element from "sap/ui/core/Element";
import "./library";

/**
 * Karşılaştırma satırı
 *
 * @namespace kor.ui
 */
export default class CompareRow extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CompareRowSettings);
	constructor(id?: string, settings?: $CompareRowSettings);
	constructor(id?: string, settings?: $CompareRowSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Alan adı */
			label: { type: "string", defaultValue: "" },
			/** Sütun sırasıyla değerler */
			values: { type: "any" },
			/** Grup başlığı */
			group: { type: "string", defaultValue: "" },
			/** min veya max: en iyi sayı işaretlenir */
			best: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Birim */
			unit: { type: "string", defaultValue: "" }
		}
	};
}
