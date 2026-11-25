import Element from "sap/ui/core/Element";
import "./library";

/**
 * Eğitim bölümü
 *
 * @namespace kor.ui
 */
export default class CourseModule extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CourseModuleSettings);
	constructor(id?: string, settings?: $CourseModuleSettings);
	constructor(id?: string, settings?: $CourseModuleSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ad */
			title: { type: "string", defaultValue: "" },
			/** Süre veya açıklama */
			text: { type: "string", defaultValue: "" },
			/** video, quiz, exam, lab, reading veya live */
			kind: { type: "string", defaultValue: "reading" },
			/** Tür simgesi yerine */
			icon: { type: "string", defaultValue: "" },
			/** İlerleme, 0-100 */
			progress: { type: "float", defaultValue: 0 },
			/** Bitince gösterilen sonuç */
			score: { type: "string", defaultValue: "" },
			/** Kilitli */
			locked: { type: "boolean", defaultValue: false }
		}
	};
}
