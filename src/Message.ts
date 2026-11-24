import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon, stateIcons, stateKey } from "./util";
import "./library";

/**
 * Sayfa içi mesaj.
 *
 * @namespace kor.ui
 */
export default class Message extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MessageSettings);
	constructor(id?: string, settings?: $MessageSettings);
	constructor(id?: string, settings?: $MessageSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "actions",
		properties: {
			/** success, wait, danger, info veya none; UI5 mesaj türleri de geçer */
			state: { type: "string", defaultValue: "info" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Kapatılabilir */
			closable: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Eylemler */
			actions: { type: "sap.ui.core.Control", multiple: true, singularName: "action" }
		},
		events: {
			/** Kapatıldı */
			close: {}
		}
	};
	onclick(event: Press): void {
		if (!(event.target as HTMLElement).closest("[data-close]")) return;
		this.setVisible(false);
		this.fireClose();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Message) {
			const key = stateKey(c.getState());
			rm.openStart("div", c).class("korMessage").class(`korState-${key}`).attr("role", key === "danger" ? "alert" : "status").openEnd();
			rm.openStart("span").class("korStatusGlyph").openEnd();
			renderIcon(rm, key === "danger" ? "circle-alert" : key === "info" ? "info" : stateIcons[key]);
			rm.close("span");
			rm.openStart("div").class("korMessageBody").openEnd();
			rm.openStart("span").class("korSr").openEnd().text(message(`LEVEL_${key.toUpperCase()}`)).close("span");
			if (c.getTitle()) rm.openStart("div").class("korMessageTitle").openEnd().text(c.getTitle()).close("div");
			if (c.getText()) rm.openStart("div").openEnd().text(c.getText()).close("div");
			rm.close("div");
			c.getActions().forEach((action) => rm.renderControl(action));
			if (c.getClosable()) {
				rm.openStart("button").attr("type", "button").class("korCalOpen").attr("data-close", "1").attr("aria-label", message("CLOSE")).openEnd();
				renderIcon(rm, "x");
				rm.close("button");
			}
			rm.close("div");
		}
	};
}
