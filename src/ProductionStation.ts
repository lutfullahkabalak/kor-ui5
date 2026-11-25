import Element from "sap/ui/core/Element";
import "./library";

/**
 * Üretim istasyonu
 *
 * @namespace kor.ui
 */
export default class ProductionStation extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ProductionStationSettings);
	constructor(id?: string, settings?: $ProductionStationSettings);
	constructor(id?: string, settings?: $ProductionStationSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			title: { type: "string", defaultValue: "" },
			/** Süreç: weaving, dyeing, cutting, sewing, pressing, welding, painting, assembly, robot, baking, smt, inspection, packing… */
			process: { type: "string", defaultValue: "" },
			/** Süreç simgesi yerine */
			icon: { type: "string", defaultValue: "" },
			/** info çalışıyor, success tamam, wait bekliyor, danger durdu, none boş */
			state: { type: "string", defaultValue: "info" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" },
			/** Hız */
			rate: { type: "float", defaultValue: 0 },
			/** Önünde bekleyen */
			queue: { type: "int", defaultValue: 0 }
		}
	};
}
