import Element from "sap/ui/core/Element";
import "./library";

/**
 * Araç üzerinde bir hasar kaydı
 *
 * @namespace kor.ui
 */
export default class DamageMark extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DamageMarkSettings);
	constructor(id?: string, settings?: $DamageMarkSettings);
	constructor(id?: string, settings?: $DamageMarkSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Bölge: DamageMap.zones içindeki adlardan biri */
			zone: { type: "string", defaultValue: "" },
			/** scratch, dent, broken, missing veya other */
			kind: { type: "string", defaultValue: "scratch" },
			/** handover teslimde vardı, return iadede bulundu */
			stage: { type: "string", defaultValue: "handover" },
			/** Not */
			note: { type: "string", defaultValue: "" }
		}
	};
}
