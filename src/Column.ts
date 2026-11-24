import Element from "sap/ui/core/Element";
import "./library";

/**
 * DataGrid sütunu
 *
 * @namespace kor.ui
 */
export default class Column extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ColumnSettings);
	constructor(id?: string, settings?: $ColumnSettings);
	constructor(id?: string, settings?: $ColumnSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Başlık */
			label: { type: "string", defaultValue: "" },
			/** Satır bağlamına göre alan yolu */
			path: { type: "string", defaultValue: "" },
			/** text, link, number, currency, date, status, progress, person veya spark */
			type: { type: "string", defaultValue: "text" },
			/** Genişlik, piksel */
			width: { type: "float", defaultValue: 140 },
			/** Boş alandan alacağı pay */
			grow: { type: "float", defaultValue: 0 },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Birim alanı */
			unitPath: { type: "string", defaultValue: "" },
			/** Durum alanı: success, wait, danger, info, none */
			statePath: { type: "string", defaultValue: "" },
			/** Değer → durum eşlemesi */
			states: { type: "object" },
			/** Düzenlemede seçenek dizisi */
			options: { type: "object" },
			/** Hücre düzenlenebilir */
			editable: { type: "boolean", defaultValue: false },
			/** Sıralanabilir */
			sortable: { type: "boolean", defaultValue: true },
			/** Yatay kaydırmada sabit (ilk sütunlar) */
			pinned: { type: "boolean", defaultValue: false },
			/** (değer, bağlam) → metin */
			formatter: { type: "function" }
		}
	};
}
