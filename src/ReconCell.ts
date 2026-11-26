import Element from "sap/ui/core/Element";
import "./library";

/**
 * Mutabakat matrisinde bir dönem: bizim ve karşı tarafın belge adedi ile tutarı
 *
 * @namespace kor.ui
 */
export default class ReconCell extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ReconCellSettings);
	constructor(id?: string, settings?: $ReconCellSettings);
	constructor(id?: string, settings?: $ReconCellSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Dönem anahtarı; ReconMatrix.periods içindeki değerlerden biri */
			period: { type: "string", defaultValue: "" },
			/** Bizim belge adedi */
			ourCount: { type: "int", defaultValue: 0 },
			/** Bizim tutar */
			ourAmount: { type: "any", defaultValue: 0 },
			/** Karşı tarafın belge adedi; -1 yanıt gelmedi */
			theirCount: { type: "int", defaultValue: -1 },
			/** Karşı tarafın tutarı; boşsa yanıt gelmedi */
			theirAmount: { type: "any", defaultValue: null },
			/** Durum metni; boşsa hesaplanır */
			statusText: { type: "string", defaultValue: "" }
		}
	};
}
