import Element from "sap/ui/core/Element";
import "./library";

/**
 * Şelale adımı
 *
 * @namespace kor.ui
 */
export default class WaterfallStep extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $WaterfallStepSettings);
	constructor(id?: string, settings?: $WaterfallStepSettings);
	constructor(id?: string, settings?: $WaterfallStepSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			label: { type: "string", defaultValue: "" },
			/** Değişim miktarı; toplamda boş bırakılırsa hesaplanır */
			value: { type: "any", defaultValue: null },
			/** change veya total */
			kind: { type: "string", defaultValue: "change" }
		}
	};
}
