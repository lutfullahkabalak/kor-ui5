import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { initials, renderIcon, tone } from "./util";
import "./library";

/**
 * Hareket dökümü: kim, ne zaman, neyi neden değiştirdi.
 *
 * @namespace kor.ui
 */
export default class Activity extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ActivitySettings);
	constructor(id?: string, settings?: $ActivitySettings);
	constructor(id?: string, settings?: $ActivitySettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		aggregations: {
			/** Kayıtlar */
			items: { type: "kor.ui.ActivityItem", multiple: true, singularName: "item" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Activity) {
			rm.openStart("ol", c).class("korActivity").openEnd();
			c.getItems().forEach((item) => {
				rm.openStart("li", item).class("korActivityItem").openEnd();
				rm.openStart("span").class("korFace").attr("aria-hidden", "true");
				if (item.getIcon()) rm.class("korFaceIcon").openEnd();
				else rm.class(`korTone${tone(item.getPerson())}`).openEnd().text(initials(item.getPerson()));
				if (item.getIcon()) renderIcon(rm, item.getIcon());
				rm.close("span");
				rm.openStart("div").class("korActivityBody").openEnd();
				rm.openStart("div").openEnd();
				rm.openStart("b").openEnd().text(item.getPerson()).close("b").text(` ${item.getText()} `);
				rm.openStart("span").class("korActivityTime").openEnd().text(item.getTime()).close("span");
				rm.close("div");
				if (item.getField()) {
					rm.openStart("div").class("korActivityChange").openEnd().text(`${item.getField()} `);
					rm.openStart("del").openEnd().text(item.getOldValue()).close("del");
					rm.text(" ");
					rm.openStart("ins").openEnd().text(item.getNewValue()).close("ins");
					rm.close("div");
				}
				rm.close("div").close("li");
			});
			rm.close("ol");
		}
	};
}
