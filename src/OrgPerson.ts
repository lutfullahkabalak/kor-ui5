import Element from "sap/ui/core/Element";
import "./library";

/**
 * Şemadaki kişi veya kadro
 *
 * @namespace kor.ui
 */
export default class OrgPerson extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $OrgPersonSettings);
	constructor(id?: string, settings?: $OrgPersonSettings);
	constructor(id?: string, settings?: $OrgPersonSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Yöneticinin anahtarı */
			managerKey: { type: "string", defaultValue: "" },
			/** Ad */
			name: { type: "string", defaultValue: "" },
			/** Görev */
			role: { type: "string", defaultValue: "" },
			/** Boş kadro */
			vacant: { type: "boolean", defaultValue: false },
			/** Durum; boşsa gösterilmez */
			state: { type: "string", defaultValue: "" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" }
		}
	};
}
