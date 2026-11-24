import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { renderIcon } from "./util";
import "./library";

/**
 * Boş durum.
 *
 * @namespace kor.ui
 */
export default class Empty extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $EmptySettings);
	constructor(id?: string, settings?: $EmptySettings);
	constructor(id?: string, settings?: $EmptySettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "actions",
		properties: {
			/** Simge */
			icon: { type: "string", defaultValue: "inbox" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Sonraki adım */
			actions: { type: "sap.ui.core.Control", multiple: true, singularName: "action" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Empty) {
			rm.openStart("div", c).class("korEmpty").openEnd();
			renderIcon(rm, c.getIcon());
			rm.openStart("div").class("korEmptyTitle").openEnd().text(c.getTitle()).close("div");
			rm.openStart("div").class("korEmptyText").openEnd().text(c.getText()).close("div");
			c.getActions().forEach((action) => rm.renderControl(action));
			rm.close("div");
		}
	};
}
