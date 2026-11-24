import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import "./library";

/**
 * Yerleşim: satır, sütun veya ızgara. `columns` verilirse ızgaradır ve dar ekranda tek sütuna iner.
 *
 * @namespace kor.ui
 */
export default class Stack extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $StackSettings);
	constructor(id?: string, settings?: $StackSettings);
	constructor(id?: string, settings?: $StackSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** CSS ızgara sütunları: "2fr 1fr" */
			columns: { type: "string", defaultValue: "" },
			/** Yan yana */
			row: { type: "boolean", defaultValue: false },
			/** Boşluk, piksel */
			gap: { type: "int", defaultValue: 16 },
			/** Çapraz hizalama (CSS align-items) */
			align: { type: "string", defaultValue: "" },
			/** Ana eksen hizalaması (CSS justify-content) */
			justify: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content", bindable: "bindable" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Stack) {
			rm.openStart("div", c).class("korStack").style("gap", `${c.getGap()}px`);
			if (c.getColumns()) rm.class("korStackGrid").style("--kor-cols", c.getColumns());
			else if (c.getRow()) rm.class("korStackRow");
			if (c.getAlign()) rm.style("align-items", c.getAlign());
			if (c.getJustify()) rm.style("justify-content", c.getJustify());
			rm.openEnd();
			c.getContent().forEach((item) => rm.renderControl(item));
			rm.close("div");
		}
	};
}
