import Element from "sap/ui/core/Element";
import "./library";

/**
 * Vardiya türü
 *
 * @namespace kor.ui
 */
export default class ShiftType extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ShiftTypeSettings);
	constructor(id?: string, settings?: $ShiftTypeSettings);
	constructor(id?: string, settings?: $ShiftTypeSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			title: { type: "string", defaultValue: "" },
			/** Hücredeki kısa ad */
			short: { type: "string", defaultValue: "" },
			/** Saat aralığı */
			time: { type: "string", defaultValue: "" },
			/** Simge: sun, sunset, moon, house… */
			icon: { type: "string", defaultValue: "" },
			/** Renk, 1-6 */
			tone: { type: "int", defaultValue: 1 },
			/** Gereken kişi; 0 denetlenmez */
			need: { type: "int", defaultValue: 0 }
		}
	};
}
