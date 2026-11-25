import Element from "sap/ui/core/Element";
import "./library";

/**
 * Ağaç seçeneği
 *
 * @namespace kor.ui
 */
export default class TreeItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TreeItemSettings);
	constructor(id?: string, settings?: $TreeItemSettings);
	constructor(id?: string, settings?: $TreeItemSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Üst öğenin anahtarı */
			parentKey: { type: "string", defaultValue: "" },
			/** Metin */
			text: { type: "string", defaultValue: "" }
		}
	};
}
