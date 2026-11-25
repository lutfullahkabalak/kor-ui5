import Element from "sap/ui/core/Element";
import "./library";

/**
 * Takvim etkinliği
 *
 * @namespace kor.ui
 */
export default class CalendarEvent extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CalendarEventSettings);
	constructor(id?: string, settings?: $CalendarEventSettings);
	constructor(id?: string, settings?: $CalendarEventSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** İlk gün: Date veya yyyy-MM-dd */
			start: { type: "any" },
			/** Son gün; boşsa tek gün */
			end: { type: "any" },
			/** Saat metni, HH:mm */
			time: { type: "string", defaultValue: "" },
			/** Durum rengi */
			state: { type: "string", defaultValue: "info" }
		}
	};
}
