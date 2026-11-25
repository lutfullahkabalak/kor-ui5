import Element from "sap/ui/core/Element";
import "./library";

/**
 * Akordeon bölümü
 *
 * @namespace kor.ui
 */
export default class AccordionItem extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $AccordionItemSettings);
	constructor(id?: string, settings?: $AccordionItemSettings);
	constructor(id?: string, settings?: $AccordionItemSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Anahtar */
			key: { type: "string", defaultValue: "" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Alt başlık */
			text: { type: "string", defaultValue: "" },
			/** Ön simge */
			icon: { type: "string", defaultValue: "" },
			/** Sayaç */
			count: { type: "string", defaultValue: "" },
			/** Sayaç durumu */
			state: { type: "string", defaultValue: "none" },
			/** Açık */
			open: { type: "boolean", defaultValue: false, bindable: "bindable" }
		},
		aggregations: {
			/** İçerik; yalnız açıkken çizilir */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
		}
	};
}
