import Element from "sap/ui/core/Element";
import "./library";

/**
 * Sevkiyat durağı
 *
 * @namespace kor.ui
 */
export default class ShipmentStop extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ShipmentStopSettings);
	constructor(id?: string, settings?: $ShipmentStopSettings);
	constructor(id?: string, settings?: $ShipmentStopSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Yer veya adım */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Zaman metni */
			time: { type: "string", defaultValue: "" },
			/** Simge; boşsa duruma göre */
			icon: { type: "string", defaultValue: "" },
			/** success geçildi, info yolda, wait bekliyor, danger sorun, none sırada */
			state: { type: "string", defaultValue: "none" },
			/** Bu duraktan çıkan bacağın taşıma türü */
			mode: { type: "string", defaultValue: "" }
		}
	};
}
