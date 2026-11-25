import Element from "sap/ui/core/Element";
import "./library";

/**
 * Makine süresi
 *
 * @namespace kor.ui
 */
export default class MachineSpan extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MachineSpanSettings);
	constructor(id?: string, settings?: $MachineSpanSettings);
	constructor(id?: string, settings?: $MachineSpanSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Süre, dakika */
			minutes: { type: "float", defaultValue: 0 },
			/** info çalıştı, wait ayar, danger arıza, none planlı duruş */
			state: { type: "string", defaultValue: "info" },
			/** Neden */
			text: { type: "string", defaultValue: "" }
		}
	};
}
