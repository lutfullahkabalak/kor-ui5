import Element from "sap/ui/core/Element";
import "./library";

/**
 * Sihirbaz adımı
 *
 * @namespace kor.ui
 */
export default class WizardStep extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $WizardStepSettings);
	constructor(id?: string, settings?: $WizardStepSettings);
	constructor(id?: string, settings?: $WizardStepSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** İleri düğmesinin metni */
			nextText: { type: "string", defaultValue: "" },
			/** Uygulamanın doğrulaması; false ilerletmez */
			valid: { type: "boolean", defaultValue: true, bindable: "bindable" }
		},
		aggregations: {
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
		}
	};
}
