import Element from "sap/ui/core/Element";
import "./library";

/**
 * Teslimat durağı
 *
 * @namespace kor.ui
 */
export default class DeliveryStop extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DeliveryStopSettings);
	constructor(id?: string, settings?: $DeliveryStopSettings);
	constructor(id?: string, settings?: $DeliveryStopSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Alıcı */
			title: { type: "string", defaultValue: "" },
			/** Adres */
			text: { type: "string", defaultValue: "" },
			/** Saat veya zaman aralığı */
			time: { type: "string", defaultValue: "" },
			/** Koli sayısı */
			parcels: { type: "int", defaultValue: 1 },
			/** success teslim, danger teslim edilemedi, wait gecikecek, none sırada */
			state: { type: "string", defaultValue: "none" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" }
		}
	};
}
