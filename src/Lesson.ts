import Element from "sap/ui/core/Element";
import "./library";

/**
 * Ders
 *
 * @namespace kor.ui
 */
export default class Lesson extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $LessonSettings);
	constructor(id?: string, settings?: $LessonSettings);
	constructor(id?: string, settings?: $LessonSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Ders */
			title: { type: "string", defaultValue: "" },
			/** Derslik veya öğretmen */
			text: { type: "string", defaultValue: "" },
			/** Gün; 1 pazartesi, 0 pazar */
			day: { type: "int", defaultValue: 1 },
			/** Başlangıç, HH:mm */
			start: { type: "string", defaultValue: "" },
			/** Bitiş, HH:mm */
			end: { type: "string", defaultValue: "" },
			/** Renk 1-6; 0 ise ders adından */
			tone: { type: "int", defaultValue: 0 },
			/** İptal */
			cancelled: { type: "boolean", defaultValue: false }
		}
	};
}
