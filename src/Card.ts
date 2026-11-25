import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon, stateIcons, stateKey } from "./util";
import "./library";

/**
 * Başlığı, durumu ve düğmeleri olan kart. `press` dinlenirse kartın tamamı basılır.
 *
 * @namespace kor.ui
 */
export default class Card extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CardSettings);
	constructor(id?: string, settings?: $CardSettings);
	constructor(id?: string, settings?: $CardSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Alt başlık */
			text: { type: "string", defaultValue: "" },
			/** Ön simge */
			icon: { type: "string", defaultValue: "" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" },
			/** Durum; boşsa gösterilmez */
			state: { type: "string", defaultValue: "" },
			/** Seçili */
			selected: { type: "boolean", defaultValue: false, bindable: "bindable" }
		},
		aggregations: {
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" },
			/** Alt düğmeler */
			footer: { type: "sap.ui.core.Control", multiple: true, singularName: "footerItem" }
		},
		events: {
			/** Karta basıldı */
			press: {}
		}
	};
	onclick(event: Press): void {
		const main = (event.target as HTMLElement).closest<HTMLElement>("[data-card]");
		if (main?.dataset.card === this.getId()) this.firePress();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Card) {
			const live = c.hasListeners("press");
			rm.openStart("article", c).class("korTile");
			if (live) rm.class("korTileLive");
			if (c.getSelected()) rm.class("korTileOn");
			if (c.getTitle()) rm.attr("aria-labelledby", `${c.getId()}-t`);
			rm.openEnd();
			rm.openStart("header").class("korTileHead").openEnd();
			if (c.getIcon()) {
				rm.openStart("span").class("korTileIcon").openEnd();
				renderIcon(rm, c.getIcon());
				rm.close("span");
			}
			rm.openStart("div").class("korTileTitles").openEnd();
			rm.openStart("h3", `${c.getId()}-t`).openEnd();
			if (live) {
				rm.openStart("button", `${c.getId()}-b`).attr("type", "button").attr("data-card", c.getId());
				if (c.getSelected()) rm.attr("aria-pressed", "true");
				rm.openEnd().text(c.getTitle()).close("button");
			} else rm.text(c.getTitle());
			rm.close("h3");
			if (c.getText()) rm.openStart("p").openEnd().text(c.getText()).close("p");
			rm.close("div");
			if (c.getState()) {
				const key = stateKey(c.getState());
				rm.openStart("span").class("korStatus").class(`korState-${key}`).openEnd();
				rm.openStart("span").class("korStatusGlyph").openEnd();
				renderIcon(rm, stateIcons[key]);
				rm.close("span").openStart("span").class("korStatusText").openEnd().text(c.getStatusText() || message(`STATE_${key.toUpperCase()}`)).close("span").close("span");
			}
			rm.close("header");
			if (c.getContent().length) {
				rm.openStart("div").class("korTileBody").openEnd();
				c.getContent().forEach((item) => rm.renderControl(item));
				rm.close("div");
			}
			if (c.getFooter().length) {
				rm.openStart("footer").class("korTileFoot").openEnd();
				c.getFooter().forEach((item) => rm.renderControl(item));
				rm.close("footer");
			}
			rm.close("article");
		}
	};
}
