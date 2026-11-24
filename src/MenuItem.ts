import Element from "sap/ui/core/Element";
import "./library";

/**
 * Düğme menüsündeki satır
 *
 * @namespace kor.ui
 */
export default class MenuItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MenuItemSettings);
	constructor(id?: string, settings?: $MenuItemSettings);
	constructor(id?: string, settings?: $MenuItemSettings) {
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
			/** Geri dönüşü zor işlem */
			danger: { type: "boolean", defaultValue: false }
		}
	};
}
