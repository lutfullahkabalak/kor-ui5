import Element from "sap/ui/core/Element";
import "./library";

/**
 * Süreç akışındaki durak
 *
 * @namespace kor.ui
 */
export default class FlowNode extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FlowNodeSettings);
	constructor(id?: string, settings?: $FlowNodeSettings);
	constructor(id?: string, settings?: $FlowNodeSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Alt not */
			note: { type: "string", defaultValue: "" },
			/** Soldan kaçıncı sıra */
			column: { type: "int", defaultValue: 0 },
			/** Değer */
			value: { type: "float", defaultValue: 0 },
			/** none, wait veya danger */
			state: { type: "string", defaultValue: "none" }
		}
	};
}
