import Element from "sap/ui/core/Element";
import "./library";

/**
 * Bildirim
 *
 * @namespace kor.ui
 */
export default class InboxItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $InboxItemSettings);
	constructor(id?: string, settings?: $InboxItemSettings);
	constructor(id?: string, settings?: $InboxItemSettings) {
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
			/** Zaman metni */
			time: { type: "string", defaultValue: "" },
			/** Gönderen; simge yerine yüz */
			person: { type: "string", defaultValue: "" },
			/** Simge */
			icon: { type: "string", defaultValue: "" },
			/** Durum */
			state: { type: "string", defaultValue: "none" },
			/** Okunmadı */
			unread: { type: "boolean", defaultValue: true, bindable: "bindable" },
			/** Satır işlemi metni */
			actionText: { type: "string", defaultValue: "" }
		}
	};
}
