import Element from "sap/ui/core/Element";
import "./library";

/**
 * Mesaj satırı
 *
 * @namespace kor.ui
 */
export default class MessageItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MessageItemSettings);
	constructor(id?: string, settings?: $MessageItemSettings);
	constructor(id?: string, settings?: $MessageItemSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Önem veya UI5 mesaj türü */
			state: { type: "string", defaultValue: "info" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** İlgili alanın kimliği */
			target: { type: "string", defaultValue: "" }
		}
	};
}
