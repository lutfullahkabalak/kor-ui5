import Element from "sap/ui/core/Element";
import "./library";

/**
 * Taksit
 *
 * @namespace kor.ui
 */
export default class Installment extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $InstallmentSettings);
	constructor(id?: string, settings?: $InstallmentSettings);
	constructor(id?: string, settings?: $InstallmentSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Vade */
			date: { type: "any" },
			/** Anapara */
			principal: { type: "any", defaultValue: 0 },
			/** Faiz ve vergiler */
			interest: { type: "any", defaultValue: 0 },
			/** success ödendi, danger gecikti, wait bekliyor, none sırada */
			state: { type: "string", defaultValue: "none" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" }
		}
	};
}
