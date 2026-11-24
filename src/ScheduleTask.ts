import Element from "sap/ui/core/Element";
import "./library";

/**
 * Plan tahtası işi
 *
 * @namespace kor.ui
 */
export default class ScheduleTask extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ScheduleTaskSettings);
	constructor(id?: string, settings?: $ScheduleTaskSettings);
	constructor(id?: string, settings?: $ScheduleTaskSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Şerit anahtarı */
			lane: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Alt metin */
			text: { type: "string", defaultValue: "" },
			/** Başlangıç: Date veya yyyy-MM-dd */
			start: { type: "any" },
			/** Bitiş (dahil) */
			end: { type: "any" },
			/** İlerleme, yüzde */
			progress: { type: "float", defaultValue: 0 },
			/** success, wait, danger, info, none */
			state: { type: "string", defaultValue: "info" }
		}
	};
}
