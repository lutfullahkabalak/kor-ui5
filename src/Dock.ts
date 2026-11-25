import Element from "sap/ui/core/Element";
import "./library";

/**
 * Rampa
 *
 * @namespace kor.ui
 */
export default class Dock extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DockSettings);
	constructor(id?: string, settings?: $DockSettings);
	constructor(id?: string, settings?: $DockSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Rampa adı */
			name: { type: "string", defaultValue: "" },
			/** Yanaşan aracın plakası; boşsa rampa boş */
			plate: { type: "string", defaultValue: "" },
			/** Taşıyıcı veya açıklama */
			text: { type: "string", defaultValue: "" },
			/** loading, unloading, waiting, problem veya closed */
			state: { type: "string", defaultValue: "" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" },
			/** Yükleme veya boşaltma yüzdesi */
			progress: { type: "float", defaultValue: 0 }
		}
	};
}
