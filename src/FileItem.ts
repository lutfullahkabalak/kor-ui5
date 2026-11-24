import Element from "sap/ui/core/Element";
import "./library";

/**
 * Dosya satırı
 *
 * @namespace kor.ui
 */
export default class FileItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FileItemSettings);
	constructor(id?: string, settings?: $FileItemSettings);
	constructor(id?: string, settings?: $FileItemSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			name: { type: "string", defaultValue: "" },
			/** Boyut, bayt */
			size: { type: "float", defaultValue: 0 },
			/** İlerleme, yüzde */
			progress: { type: "float", defaultValue: 100 },
			/** Hata metni */
			error: { type: "string", defaultValue: "" }
		}
	};
}
