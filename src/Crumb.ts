import Element from "sap/ui/core/Element";
import "./library";

/**
 * Kırıntı yolu adımı
 *
 * @namespace kor.ui
 */
export default class Crumb extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CrumbSettings);
	constructor(id?: string, settings?: $CrumbSettings);
	constructor(id?: string, settings?: $CrumbSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Adres; boşsa yalnız select olayı */
			href: { type: "string", defaultValue: "" }
		}
	};
}
