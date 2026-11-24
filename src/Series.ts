import Element from "sap/ui/core/Element";
import "./library";

/**
 * Trend grafiğindeki seri
 *
 * @namespace kor.ui
 */
export default class Series extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $SeriesSettings);
	constructor(id?: string, settings?: $SeriesSettings);
	constructor(id?: string, settings?: $SeriesSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Ad */
			name: { type: "string", defaultValue: "" },
			/** Sayı dizisi */
			values: { type: "object" },
			/** area, line, bar veya ghost */
			kind: { type: "string", defaultValue: "line" }
		}
	};
}
