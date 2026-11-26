import Element from "sap/ui/core/Element";
import "./library";

/**
 * Kira sözleşmesinde bir olay: artış, opsiyon, yenileme, fesih, satın alma veya not
 *
 * @namespace kor.ui
 */
export default class LeaseEvent extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $LeaseEventSettings);
	constructor(id?: string, settings?: $LeaseEventSettings);
	constructor(id?: string, settings?: $LeaseEventSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Tarih: Date veya yyyy-MM-dd */
			date: { type: "any" },
			/** increase, renewal, option, termination, purchase, note */
			kind: { type: "string", defaultValue: "note" },
			/** Başlık; boşsa türün adı */
			title: { type: "string", defaultValue: "" },
			/** Ek bilgi (ör. "%18", "TÜFE 12 ay ortalaması") */
			text: { type: "string", defaultValue: "" },
			/** Bildirim için son gün; opsiyon ve fesihte kullanılır */
			deadline: { type: "any" },
			/** success yapıldı, danger kaçırıldı; boşsa tarihten bulunur */
			state: { type: "string", defaultValue: "" }
		}
	};
}
