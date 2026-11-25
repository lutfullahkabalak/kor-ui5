import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderFace, renderIcon, stateIcons, stateKey } from "./util";
import "./library";

/**
 * Bildirim merkezi: okunmamış sayısı, süzgeç ve satır işlemi.
 *
 * @namespace kor.ui
 */
export default class Inbox extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $InboxSettings);
	constructor(id?: string, settings?: $InboxSettings);
	constructor(id?: string, settings?: $InboxSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Yalnız okunmamışlar */
			unreadOnly: { type: "boolean", defaultValue: false, bindable: "bindable" }
		},
		aggregations: {
			/** Bildirimler */
			items: { type: "kor.ui.InboxItem", multiple: true, singularName: "item" }
		},
		events: {
			/** Bildirim açıldı; okundu işaretlendi */
			press: { parameters: { key: { type: "string" }, item: { type: "object" } } },
			/** Satır işlemi */
			action: { parameters: { key: { type: "string" }, item: { type: "object" } } },
			/** Kaldırma istendi; satırı uygulama siler */
			dismiss: { parameters: { key: { type: "string" }, item: { type: "object" } } },
			/** Tümü okundu işaretlendi */
			readAll: {}
		}
	};
	onclick(event: Press): void {
		const target = (event.target as HTMLElement).closest<HTMLElement>("[data-inbox]");
		if (!target || target.dataset.of !== this.getId()) return;
		const what = target.dataset.inbox;
		if (what === "all" || what === "unread") {
			this.setUnreadOnly(what === "unread");
			return;
		}
		if (what === "read") {
			this.getItems().forEach((item) => item.getUnread() && item.setUnread(false));
			this.fireReadAll();
			return;
		}
		const item = this.getItems()[Number(target.dataset.i)];
		const key = item.getKey();
		if (what === "open") {
			if (item.getUnread()) item.setUnread(false);
			this.firePress({ key, item });
		} else if (what === "action") this.fireAction({ key, item });
		else this.fireDismiss({ key, item });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Inbox) {
			const id = c.getId();
			const unread = c.getItems().filter((item) => item.getUnread()).length;
			const button = (what: string, i?: number) => {
				rm.attr("type", "button").attr("data-inbox", what).attr("data-of", id);
				if (i !== undefined) rm.attr("data-i", i);
			};
			rm.openStart("section", c).class("korInbox").attr("aria-labelledby", `${id}-t`).openEnd();
			rm.openStart("header").openEnd();
			rm.openStart("h3", `${id}-t`).openEnd().text(c.getTitle() || message("INBOX")).close("h3");
			rm.openStart("span").class("korInboxTabs").openEnd();
			([["all", "ALL", false], ["unread", "UNREAD", true]] as const).forEach(([what, text, only]) => {
				rm.openStart("button", `${id}-${what}`);
				button(what);
				rm.attr("aria-pressed", String(c.getUnreadOnly() === only)).openEnd().text(message(text));
				if (only && unread) rm.openStart("span").class("korInboxCount").class("korNum").openEnd().text(String(unread)).close("span");
				rm.close("button");
			});
			rm.close("span");
			if (unread) {
				rm.openStart("button", `${id}-read`).class("korCopy").attr("aria-label", message("READ_ALL")).attr("data-kor-tip", message("READ_ALL"));
				button("read");
				rm.openEnd();
				renderIcon(rm, "check-check");
				rm.close("button");
			}
			rm.close("header");
			const rows = c.getItems().map((item, i) => ({ item, i })).filter(({ item }) => item.getUnread() || !c.getUnreadOnly());
			if (!rows.length) rm.openStart("div").class("korMenuNone").openEnd().text(message("INBOX_EMPTY")).close("div");
			rm.openStart("ul").openEnd();
			rows.forEach(({ item, i }) => {
				const key = stateKey(item.getState());
				rm.openStart("li", item).class(`korState-${key}`);
				if (item.getUnread()) rm.class("korInboxNew");
				rm.openEnd();
				if (item.getPerson()) renderFace(rm, item.getPerson());
				else {
					rm.openStart("span").class("korInboxMark").attr("aria-hidden", "true").openEnd();
					renderIcon(rm, item.getIcon() || (key === "none" ? "bell" : stateIcons[key]));
					rm.close("span");
				}
				rm.openStart("div").class("korInboxMain").openEnd();
				rm.openStart("button", `${item.getId()}-o`).class("korInboxOpen");
				button("open", i);
				rm.openEnd();
				if (item.getUnread()) rm.openStart("span").class("korSr").openEnd().text(`${message("UNREAD")}: `).close("span");
				rm.text(item.getTitle()).close("button");
				if (item.getText()) rm.openStart("p").openEnd().text(item.getText()).close("p");
				rm.openStart("div").class("korInboxFoot").openEnd();
				rm.openStart("span").openEnd().text(item.getTime()).close("span");
				if (item.getActionText()) {
					rm.openStart("button", `${item.getId()}-a`).class("korInboxAction");
					button("action", i);
					rm.openEnd().text(item.getActionText()).close("button");
				}
				rm.close("div").close("div");
				rm.openStart("button", `${item.getId()}-x`).class("korCopy").attr("aria-label", `${message("REMOVE")}: ${item.getTitle()}`);
				button("dismiss", i);
				rm.openEnd();
				renderIcon(rm, "x");
				rm.close("button").close("li");
			});
			rm.close("ul").close("section");
		}
	};
}
