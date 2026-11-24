import Element from "sap/ui/core/Element";
import "./library";

/**
 * Kabuk menüsündeki satır
 *
 * @namespace kor.ui
 */
export default class NavItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $NavItemSettings);
	constructor(id?: string, settings?: $NavItemSettings);
	constructor(id?: string, settings?: $NavItemSettings) {
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
			/** Bölüm başlığı */
			group: { type: "string", defaultValue: "" },
			/** Sağdaki sayı */
			count: { type: "string", defaultValue: "" }
		}
	};
}
