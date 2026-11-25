import Element from "sap/ui/core/Element";
import "./library";

/**
 * Araçtaki yük
 *
 * @namespace kor.ui
 */
export default class LoadItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $LoadItemSettings);
	constructor(id?: string, settings?: $LoadItemSettings);
	constructor(id?: string, settings?: $LoadItemSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Palet yeri sayısı */
			slots: { type: "int", defaultValue: 1 },
			/** Ağırlık */
			weight: { type: "float", defaultValue: 0 },
			/** Boşaltma durağı */
			stop: { type: "string", defaultValue: "" },
			/** Durum; danger ve wait çerçeveyle işaretlenir */
			state: { type: "string", defaultValue: "none" }
		}
	};
}
