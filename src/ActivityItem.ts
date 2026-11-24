import Element from "sap/ui/core/Element";
import "./library";

/**
 * Hareket kaydı
 *
 * @namespace kor.ui
 */
export default class ActivityItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ActivityItemSettings);
	constructor(id?: string, settings?: $ActivityItemSettings);
	constructor(id?: string, settings?: $ActivityItemSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Kişi */
			person: { type: "string", defaultValue: "" },
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Zaman */
			time: { type: "string", defaultValue: "" },
			/** Simge; boşsa kişi yüzü */
			icon: { type: "string", defaultValue: "" },
			/** Değişen alan */
			field: { type: "string", defaultValue: "" },
			/** Eski değer */
			oldValue: { type: "string", defaultValue: "" },
			/** Yeni değer */
			newValue: { type: "string", defaultValue: "" }
		}
	};
}
