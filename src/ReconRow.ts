import Element from "sap/ui/core/Element";
import "./library";

/**
 * Mutabakat matrisinde bir karşı taraf (cari)
 *
 * @namespace kor.ui
 */
export default class ReconRow extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ReconRowSettings);
	constructor(id?: string, settings?: $ReconRowSettings);
	constructor(id?: string, settings?: $ReconRowSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "cells",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			title: { type: "string", defaultValue: "" },
			/** Ek bilgi (vergi numarası, şehir) */
			text: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Dönem hücreleri */
			cells: { type: "kor.ui.ReconCell", multiple: true, singularName: "cell" }
		}
	};
}
