import Element from "sap/ui/core/Element";
import "./library";

/**
 * Pano kartı
 *
 * @namespace kor.ui
 */
export default class BoardCard extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $BoardCardSettings);
	constructor(id?: string, settings?: $BoardCardSettings);
	constructor(id?: string, settings?: $BoardCardSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Bulunduğu sütunun anahtarı */
			column: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Alt sol metin */
			meta: { type: "string", defaultValue: "" },
			/** Sorumlu */
			person: { type: "string", defaultValue: "" },
			/** Etiket */
			tag: { type: "string", defaultValue: "" },
			/** Durum */
			state: { type: "string", defaultValue: "none" }
		}
	};
}
