import Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon, stateIcons, stateKey } from "./util";
import "./library";

const ORDER = ["danger", "wait", "info", "success", "none"];

/**
 * Mesaj listesi: önem sırasıyla, türe göre süzülür; satıra basınca ilgili alana gider.
 * UI5 mesaj modeline bağlanabilir: `items="{message>/}"`, `state="{message>type}"`.
 *
 * @namespace kor.ui
 */
export default class MessageList extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MessageListSettings);
	constructor(id?: string, settings?: $MessageListSettings);
	constructor(id?: string, settings?: $MessageListSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		aggregations: {
			/** Mesajlar */
			items: { type: "kor.ui.MessageItem", multiple: true, singularName: "item" }
		},
		events: {
			/** Mesaja basıldı; hedef alan varsa odaklanmıştır */
			press: { parameters: { item: { type: "kor.ui.MessageItem" } } }
		}
	};
	private only = "";

	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const state = target.closest<HTMLElement>("[data-state]")?.dataset.state;
		const at = target.closest<HTMLElement>("[data-at]")?.dataset.at;
		if (state !== undefined) {
			this.only = this.only === state ? "" : state;
			this.invalidate();
		} else if (at !== undefined) {
			const item = this.getItems()[Number(at)];
			const id = item.getTarget();
			const control = id ? (Core.byId(id) as Control | undefined) : undefined;
			control?.getDomRef()?.scrollIntoView({ block: "center" });
			control?.focus();
			this.firePress({ item });
		}
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: MessageList) {
			const all = c.getItems().map((item, i) => ({ item, i, key: stateKey(item.getState()) })).sort((a, b) => ORDER.indexOf(a.key) - ORDER.indexOf(b.key));
			const kinds = ORDER.filter((key) => all.some((m) => m.key === key));
			if (!kinds.includes(c.only)) c.only = "";
			rm.openStart("div", c).class("korMessages").openEnd();
			if (kinds.length > 1) {
				rm.openStart("div").class("korMessageTabs").attr("role", "group").openEnd();
				kinds.forEach((key) => {
					rm.openStart("button").attr("type", "button").class("korMessageTab").class(`korState-${key}`).attr("data-state", key).attr("aria-pressed", String(c.only === key)).openEnd();
					rm.openStart("span").class("korStatusGlyph").openEnd();
					renderIcon(rm, stateIcons[key]);
					rm.close("span").text(`${message(`LEVEL_${key.toUpperCase()}`)} ${all.filter((m) => m.key === key).length}`).close("button");
				});
				rm.close("div");
			}
			rm.openStart("ul").class("korMessageItems").openEnd();
			all.filter((m) => !c.only || m.key === c.only).forEach(({ item, i, key }) => {
				rm.openStart("li", item).openEnd().openStart("button").attr("type", "button").class("korMessageItem").class(`korState-${key}`).attr("data-at", i).openEnd();
				rm.openStart("span").class("korStatusGlyph").openEnd();
				renderIcon(rm, stateIcons[key]);
				rm.close("span").openStart("span").class("korMessageBody").openEnd();
				rm.openStart("span").class("korSr").openEnd().text(message(`LEVEL_${key.toUpperCase()}`)).close("span");
				rm.openStart("span").class("korMessageTitle").openEnd().text(item.getTitle()).close("span");
				if (item.getText()) rm.openStart("span").class("korNote").openEnd().text(item.getText()).close("span");
				rm.close("span");
				if (item.getTarget()) renderIcon(rm, "arrow-right");
				rm.close("button").close("li");
			});
			rm.close("ul");
			if (!all.length) rm.openStart("div").class("korMenuNone").openEnd().text(message("NO_MESSAGE")).close("div");
			rm.close("div");
		}
	};
}
