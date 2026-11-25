import Element from "sap/ui/core/Element";
import "./library";

/**
 * Hesap hareketi
 *
 * @namespace kor.ui
 */
export default class Transaction extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TransactionSettings);
	constructor(id?: string, settings?: $TransactionSettings);
	constructor(id?: string, settings?: $TransactionSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Karşı taraf */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Gün */
			date: { type: "any" },
			/** Tutar; çıkış eksidir */
			amount: { type: "any", defaultValue: 0 },
			/** market, fuel, food, travel, salary, transfer, bill, phone, health, education, rent, cash, saving, fee veya store */
			category: { type: "string", defaultValue: "" },
			/** Kategori simgesi yerine */
			icon: { type: "string", defaultValue: "" },
			/** Kişi; simge yerine yüz */
			person: { type: "string", defaultValue: "" },
			/** Durum; danger iptaldir ve toplama girmez */
			state: { type: "string", defaultValue: "" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" }
		}
	};
}
