import Element from "sap/ui/core/Element";
import "./library";

/**
 * Mutabakatta bir kayıt: bizim defterimizden veya karşı tarafın ekstresinden.
 *
 * @namespace kor.ui
 */
export default class MatchEntry extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MatchEntrySettings);
	constructor(id?: string, settings?: $MatchEntrySettings);
	constructor(id?: string, settings?: $MatchEntrySettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** ours bizim kaydımız, theirs karşı tarafın kaydı */
			side: { type: "string", defaultValue: "ours" },
			/** Belge tarihi: Date veya yyyy-MM-dd */
			date: { type: "any" },
			/** Belge numarası; otomatik eşleştirmede önce buna bakılır */
			document: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Tutar; iki tarafta da aynı yönle verilir (karşı tarafın ekstresi bizim yönümüze çevrilmiş) */
			amount: { type: "any", defaultValue: 0 },
			/** Eşleşme kimliği; aynı kimliği taşıyan kayıtlar birbiriyle eşleşmiştir. Boşsa açık kalem. */
			match: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Eşleşme otomatik kuruldu */
			auto: { type: "boolean", defaultValue: false, bindable: "bindable" }
		}
	};
}
