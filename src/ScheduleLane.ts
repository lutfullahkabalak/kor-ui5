import Element from "sap/ui/core/Element";
import "./library";

/**
 * Plan tahtası şeridi (kaynak)
 *
 * @namespace kor.ui
 */
export default class ScheduleLane extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ScheduleLaneSettings);
	constructor(id?: string, settings?: $ScheduleLaneSettings);
	constructor(id?: string, settings?: $ScheduleLaneSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Alt metin */
			text: { type: "string", defaultValue: "" },
			/** Doluluk, yüzde */
			capacity: { type: "float", defaultValue: -1 }
		}
	};
}
