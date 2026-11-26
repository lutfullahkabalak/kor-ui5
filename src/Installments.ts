import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { dayText, message, num, renderIcon, renderStatus, stateKey } from "./util";
import "./library";

/**
 * Taksit veya kredi ödeme planı: anapara, faiz, ödenen ve sıradaki taksit.
 *
 * @namespace kor.ui
 */
export default class Installments extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $InstallmentsSettings);
	constructor(id?: string, settings?: $InstallmentsSettings);
	constructor(id?: string, settings?: $InstallmentsSettings) {
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
			/** Ondalık */
			decimals: { type: "int", defaultValue: 2 },
			/** Her taksitten sonra kalan anaparayı gösterir (kiralama ve kredi itfa tablosu) */
			showBalance: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Taksitler, sırayla */
			items: { type: "kor.ui.Installment", multiple: true, singularName: "item" }
		},
		events: {
			/** Taksite basıldı */
			press: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.firePress({ key: this.getItems()[Number(i)].getKey() });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Installments) {
			const items = c.getItems();
			const money = (value: number) => `${num(value, c.getDecimals())} ${c.getCurrency()}`.trim();
			// OData Edm.Decimal metin gelir
			const sums = items.map((item) => ({ principal: Number(item.getPrincipal()) || 0, interest: Number(item.getInterest()) || 0 }));
			const total = sums.map((s) => s.principal + s.interest);
			const top = Math.max(1, ...total);
			const paid = total.reduce((sum, v, i) => sum + (stateKey(items[i].getState()) === "success" ? v : 0), 0);
			const all = total.reduce((sum, v) => sum + v, 0);
			const next = items.findIndex((item) => stateKey(item.getState()) !== "success");
			const principal = sums.reduce((sum, s) => sum + s.principal, 0);
			let left = principal;
			const balances = sums.map((s) => (left -= s.principal));
			const live = c.hasListeners("press");
			rm.openStart("section", c).class("korLoan");
			if (c.getShowBalance()) rm.class("korLoanBal");
			rm.attr("aria-label", c.getLabel() || message("INSTALLMENTS")).openEnd();
			rm.openStart("header").style("--kor-part", String(all ? paid / all : 0)).openEnd();
			rm.openStart("div").openEnd().openStart("span").openEnd().text(message("REMAINING")).close("span").openStart("b").class("korNum").openEnd().text(money(all - paid)).close("b").close("div");
			rm.openStart("div").openEnd().openStart("span").openEnd().text(message("PAID")).close("span").openStart("b").class("korNum").openEnd().text(money(paid)).close("b").close("div");
			rm.openStart("span").class("korProgressTrack").attr("aria-hidden", "true").openEnd().openStart("i").openEnd().close("i").close("span").close("header");
			rm.openStart("div").class("korLegend").attr("aria-hidden", "true").openEnd();
			["PRINCIPAL", "INTEREST"].forEach((name, i) => rm.openStart("span").openEnd().openStart("i").class("korKey").class(`korKey${i + 1}`).openEnd().close("i").text(message(name)).close("span"));
			if (c.getShowBalance()) rm.openStart("span").class("korLoanLegendLeft").openEnd().text(message("BALANCE_AFTER")).close("span");
			rm.close("div").openStart("ol").openEnd();
			items.forEach((item, i) => {
				const key = stateKey(item.getState());
				rm.openStart("li", item).class(`korState-${key}`);
				if (key === "success") rm.class("korLoanPaid");
				if (i === next) rm.class("korLoanNext").attr("aria-current", "step");
				rm.openEnd();
				const tag = live ? "button" : "div";
				rm.openStart(tag, `${item.getId()}-b`).class("korLoanRow");
				if (live) rm.attr("type", "button").attr("data-i", i);
				rm.openEnd();
				rm.openStart("span").class("korLoanNo").class("korNum").openEnd();
				if (key === "success") {
					renderIcon(rm, "check");
					rm.openStart("span").class("korSr").openEnd().text(message("PAID")).close("span");
				} else rm.text(String(i + 1));
				rm.close("span");
				rm.openStart("span").class("korLoanDate").class("korNum").openEnd().text(dayText(item.getDate())).close("span");
				rm.openStart("span").class("korLoanBar").attr("role", "img").attr("aria-label", `${message("PRINCIPAL")} ${money(sums[i].principal)}, ${message("INTEREST")} ${money(sums[i].interest)}`).openEnd();
				rm.openStart("i").class("korKey1").style("width", `${(sums[i].principal / top) * 100}%`).openEnd().close("i").openStart("i").class("korKey2").style("width", `${(sums[i].interest / top) * 100}%`).openEnd().close("i").close("span");
				rm.openStart("b").class("korNum").openEnd().text(money(total[i]));
				if (item.getRemeasured()) rm.openStart("small").class("korLoanNew").openEnd().text(message("REMEASURED")).close("small");
				rm.close("b");
				if (c.getShowBalance()) rm.openStart("span").class("korLoanLeft").class("korNum").attr("aria-label", `${message("BALANCE_AFTER")} ${money(balances[i])}`).openEnd().text(money(balances[i])).close("span");
				rm.openStart("span").class("korLoanEnd").openEnd();
				if (i === next || key === "danger" || key === "wait") renderStatus(rm, item.getStatusText() || message(key === "danger" ? "OVERDUE" : "NEXT_PAYMENT"), key === "none" ? "info" : key);
				rm.close("span").close(tag).close("li");
			});
			rm.close("ol").close("section");
		}
	};
}
