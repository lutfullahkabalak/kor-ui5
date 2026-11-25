import Element from "sap/ui/core/Element";
import "./library";

/**
 * Rampa bekleyen araç
 *
 * @namespace kor.ui
 */
export default class DockTruck extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DockTruckSettings);
	constructor(id?: string, settings?: $DockTruckSettings);
	constructor(id?: string, settings?: $DockTruckSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Plaka */
			plate: { type: "string", defaultValue: "" },
			/** Taşıyıcı veya açıklama */
			text: { type: "string", defaultValue: "" },
			/** Bekleme süresi veya randevu */
			time: { type: "string", defaultValue: "" }
		}
	};
}
