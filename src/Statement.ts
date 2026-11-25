import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type Transaction from "./Transaction";
import type { Press } from "./util";
import { dateText, isoDate, message, num, renderFace, renderIcon, renderStatus, toDate } from "./util";
import "./library";

/**
 * Hesap hareketleri: güne göre gruplu, giriş çıkış toplamı ve süzgeç.
 *
 * @namespace kor.ui
 */
export default class Statement extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $StatementSettings);
	constructor(id?: string, settings?: $StatementSettings);
	constructor(id?: string, settings?: $StatementSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Para birimi */
			currency: { type: "string", defaultValue: "" },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Güncel bakiye; verilirse her günün sonu gösterilir */
			balance: { type: "any", defaultValue: null },
			/** all, in veya out */
			filter: { type: "string", defaultValue: "all", bindable: "bindable" }
		},
		aggregations: {
			/** Hareketler, yeniden eskiye */
			items: { type: "kor.ui.Transaction", multiple: true, singularName: "item" }
		},
		events: {
			/** Harekete basıldı */
			press: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const filter = target.closest<HTMLElement>("[data-filter]")?.dataset.filter;
		const i = target.closest<HTMLElement>("[data-i]")?.dataset.i;
		if (filter) this.setFilter(filter);
		else if (i !== undefined) this.firePress({ key: this.getItems()[Number(i)].getKey() });
	}
	private money(value: number, sign = false): string {
		return `${value < 0 ? "−" : sign && value > 0 ? "+" : ""}${num(Math.abs(value), 2)} ${this.getCurrency()}`.trim();
	}
	private dayOf(item: Transaction): string {
		const date = toDate(item.getDate());
		return date ? isoDate(date) : "";
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Statement) {
			const items = c.getItems();
			const amounts = items.map((item) => Number(item.getAmount()) || 0);
			// İptal edilen hareket toplama girmez
			const counts = items.map((item) => item.getState() !== "danger");
			const into = amounts.reduce((sum, v, i) => sum + (counts[i] && v > 0 ? v : 0), 0);
			const out = amounts.reduce((sum, v, i) => sum + (counts[i] && v < 0 ? v : 0), 0);
			const raw = c.getBalance() as unknown;
			const hasBalance = raw !== null && raw !== undefined && raw !== "";
			let balance = Number(raw);
			const closing = new Map<string, number>();
			items.forEach((item, i) => {
				const day = c.dayOf(item);
				if (!closing.has(day)) closing.set(day, balance);
				if (counts[i]) balance -= amounts[i];
			});
			const live = c.hasListeners("press");
			rm.openStart("section", c).class("korState2").attr("aria-label", c.getLabel() || message("STATEMENT")).openEnd();
			rm.openStart("div").class("korStateTabs").attr("role", "group").openEnd();
			([["all", "ALL", ""], ["in", "MONEY_IN", c.money(into, true)], ["out", "MONEY_OUT", c.money(out)]] as const).forEach(([key, name, sum]) => {
				rm.openStart("button", `${c.getId()}-${key}`).attr("type", "button").attr("data-filter", key).attr("aria-pressed", String(c.getFilter() === key)).openEnd();
				rm.openStart("span").openEnd().text(message(name)).close("span");
				if (sum) rm.openStart("b").class("korNum").class(key === "in" ? "korMoneyIn" : "korMoneyOut").openEnd().text(sum).close("b");
				rm.close("button");
			});
			rm.close("div");
			let day: string | undefined;
			let any = false;
			rm.openStart("ul").openEnd();
			items.forEach((item, i) => {
				const amount = amounts[i];
				if ((c.getFilter() === "in" && amount <= 0) || (c.getFilter() === "out" && amount >= 0)) return;
				any = true;
				const at = c.dayOf(item);
				if (at !== day) {
					day = at;
					rm.openStart("li", `${item.getId()}-d`).class("korStateDay").openEnd().openStart("span").openEnd().text(dateText(item.getDate(), "d MMMM EEEE")).close("span");
					if (hasBalance) rm.openStart("span").class("korNum").openEnd().text(c.money(closing.get(at) as number)).close("span");
					rm.close("li");
				}
				rm.openStart("li", item).openEnd();
				const tag = live ? "button" : "div";
				rm.openStart(tag, `${item.getId()}-b`).class("korListRow");
				if (live) rm.class("korListLive").attr("type", "button").attr("data-i", i);
				rm.openEnd();
				if (item.getPerson()) renderFace(rm, item.getPerson());
				else {
					rm.openStart("span").class("korListIcon").openEnd();
					renderIcon(rm, item.getIcon() || ({ market: "shopping-cart", fuel: "fuel", food: "utensils", travel: "plane", salary: "banknote", transfer: "repeat", bill: "lightbulb", phone: "smartphone", health: "heart-pulse", education: "graduation-cap", rent: "house", cash: "landmark", saving: "piggy-bank", fee: "percent", store: "store" } as Record<string, string>)[item.getCategory()] || "receipt");
					rm.close("span");
				}
				rm.openStart("span").class("korListMain").openEnd().openStart("span").class("korListTitle").openEnd().text(item.getTitle()).close("span");
				if (item.getText()) rm.openStart("span").class("korListText").openEnd().text(item.getText()).close("span");
				rm.close("span").openStart("span").class("korListEnd").openEnd();
				if (item.getState()) renderStatus(rm, item.getStatusText() || (counts[i] ? "" : message("CANCELLED")), item.getState());
				rm.openStart("span").class("korNum").class("korStateSum").class(amount > 0 ? "korMoneyIn" : "korMoneyOut");
				if (!counts[i]) rm.class("korStateVoid");
				rm.openEnd().text(c.money(amount, true)).close("span").close("span").close(tag).close("li");
			});
			if (!any) rm.openStart("li", `${c.getId()}-none`).class("korMenuNone").openEnd().text(message("NO_DATA")).close("li");
			rm.close("ul").close("section");
		}
	};
}
