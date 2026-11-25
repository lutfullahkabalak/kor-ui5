import Element from "sap/ui/core/Element";
import "./library";

/**
 * Ayrıntı alanı
 *
 * @namespace kor.ui
 */
export default class Detail extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DetailSettings);
	constructor(id?: string, settings?: $DetailSettings);
	constructor(id?: string, settings?: $DetailSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Değer */
			value: { type: "string", defaultValue: "" },
			/** Ön simge */
			icon: { type: "string", defaultValue: "" },
			/** Kopyalama düğmesi */
			copyable: { type: "boolean", defaultValue: false },
			/** Tüm satırı kaplar */
			wide: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Değer yerine kontrol */
			content: { type: "sap.ui.core.Control", multiple: false }
		}
	};
}
