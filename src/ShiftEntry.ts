import Element from "sap/ui/core/Element";
import "./library";

/**
 * Vardiya ataması
 *
 * @namespace kor.ui
 */
export default class ShiftEntry extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ShiftEntrySettings);
	constructor(id?: string, settings?: $ShiftEntrySettings);
	constructor(id?: string, settings?: $ShiftEntrySettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Kişi */
			person: { type: "string", defaultValue: "" },
			/** Gün */
			date: { type: "any" },
			/** Vardiya anahtarı */
			shift: { type: "string", defaultValue: "" }
		}
	};
}
