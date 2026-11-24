import Element from "sap/ui/core/Element";
import "./library";

/**
 * Aşama
 *
 * @namespace kor.ui
 */
export default class Stage extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $StageSettings);
	constructor(id?: string, settings?: $StageSettings);
	constructor(id?: string, settings?: $StageSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Alt bilgi */
			info: { type: "string", defaultValue: "" },
			/** success, wait, danger, info, none */
			state: { type: "string", defaultValue: "none" }
		}
	};
}
