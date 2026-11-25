import Element from "sap/ui/core/Element";
import "./library";

/**
 * Isı haritası hücresi
 *
 * @namespace kor.ui
 */
export default class HeatCell extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $HeatCellSettings);
	constructor(id?: string, settings?: $HeatCellSettings);
	constructor(id?: string, settings?: $HeatCellSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Satır */
			row: { type: "string", defaultValue: "" },
			/** Sütun */
			column: { type: "string", defaultValue: "" },
			/** Değer */
			value: { type: "float", defaultValue: 0 },
			/** İpucu */
			text: { type: "string", defaultValue: "" }
		}
	};
}
