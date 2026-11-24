import Element from "sap/ui/core/Element";
import "./library";

/**
 * İki durak arasındaki akış
 *
 * @namespace kor.ui
 */
export default class FlowLink extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FlowLinkSettings);
	constructor(id?: string, settings?: $FlowLinkSettings);
	constructor(id?: string, settings?: $FlowLinkSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Kaynak durak */
			source: { type: "string", defaultValue: "" },
			/** Hedef durak */
			target: { type: "string", defaultValue: "" },
			/** Miktar */
			value: { type: "float", defaultValue: 0 }
		}
	};
}
