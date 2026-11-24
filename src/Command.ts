import Element from "sap/ui/core/Element";
import "./library";

/**
 * Komut paletindeki satır
 *
 * @namespace kor.ui
 */
export default class Command extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CommandSettings);
	constructor(id?: string, settings?: $CommandSettings);
	constructor(id?: string, settings?: $CommandSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** İkinci satır metni */
			hint: { type: "string", defaultValue: "" },
			/** Simge */
			icon: { type: "string", defaultValue: "" },
			/** Bölüm */
			group: { type: "string", defaultValue: "" },
			/** Aramada eşleşen ek sözcükler */
			keywords: { type: "string", defaultValue: "" }
		},
		events: {
			/** Komut seçildi */
			press: {}
		}
	};
}
