import Element from "sap/ui/core/Element";
import "./library";

/**
 * Liste satırı
 *
 * @namespace kor.ui
 */
export default class ListItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ListItemSettings);
	constructor(id?: string, settings?: $ListItemSettings);
	constructor(id?: string, settings?: $ListItemSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Sağdaki değer */
			meta: { type: "string", defaultValue: "" },
			/** Simge */
			icon: { type: "string", defaultValue: "" },
			/** Kişi adı; simge yerine yüz */
			person: { type: "string", defaultValue: "" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" },
			/** Durum; boşsa gösterilmez */
			state: { type: "string", defaultValue: "" },
			/** Grup başlığı; aynı gruptakiler art arda olmalı */
			group: { type: "string", defaultValue: "" },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		}
	};
}
