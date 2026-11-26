import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { dayText, message, num, parseNum, pct, renderIcon, toDate } from "./util";
import "./library";

export type EscalationStep = { date: Date | undefined; rate: number; rent: number; capped: boolean };
const rules = ["fixed", "index", "none"];

/**
 * Kira artış kuralı: sabit oran, endekse bağlı (tavanlı) veya artışsız; sonraki dönemlerin kirası önizlenir.
 *
 * @namespace kor.ui
 */
export default class EscalationField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $EscalationFieldSettings);
	constructor(id?: string, settings?: $EscalationFieldSettings);
	constructor(id?: string, settings?: $EscalationFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Başlık */
			label: { type: "string", defaultValue: "" },
			/** fixed, index veya none */
			rule: { type: "string", defaultValue: "fixed", bindable: "bindable" },
			/** Sabit artış oranı, yüzde */
			rate: { type: "float", defaultValue: 0, bindable: "bindable" },
			/** Endeks artışında tavan, yüzde; -1 tavan yok */
			cap: { type: "float", defaultValue: -1, bindable: "bindable" },
			/** Endeksin adı (ör. TÜFE 12 ay ortalaması) */
			indexName: { type: "string", defaultValue: "" },
			/** Endeksin dönem dönem beklenen değeri, yüzde */
			indexRates: { type: "float[]", defaultValue: [] },
			/** Bugünkü kira */
			base: { type: "any", defaultValue: 0 },
			/** Para birimi */
			currency: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 2 },
			/** İlk artış tarihi */
			start: { type: "any" },
			/** Artışlar arası ay */
			interval: { type: "int", defaultValue: 12 },
			/** Önizlenen dönem sayısı */
			periods: { type: "int", defaultValue: 5 },
			/** Değiştirilebilir */
			editable: { type: "boolean", defaultValue: true },
			/** Yardım metni */
			help: { type: "string", defaultValue: "" }
		},
		events: {
			/** Kural, oran veya tavan değişti */
			change: { parameters: { rule: { type: "string" }, rate: { type: "float" }, cap: { type: "float" } } }
		}
	};
	/** Sonraki dönemlerin artış oranı ve kirası. */
	getSchedule(): EscalationStep[] {
		const rule = rules.includes(this.getRule()) ? this.getRule() : "fixed";
		const first = toDate(this.getStart());
		const index = this.getIndexRates();
		const cap = this.getCap();
		let rent = Number(this.getBase()) || 0;
		const out: EscalationStep[] = [];
		for (let i = 0; i < Math.max(0, this.getPeriods()); i++) {
			let rate = 0;
			let capped = false;
			if (rule === "fixed") rate = this.getRate();
			else if (rule === "index") {
				// Endeksin son bilinen değeri sonraki dönemlerde de geçerli sayılır
				rate = index.length ? index[Math.min(i, index.length - 1)] : 0;
				if (cap >= 0 && rate > cap) {
					rate = cap;
					capped = true;
				}
			}
			rent = rent * (1 + rate / 100);
			const date = first ? new Date(first.getFullYear(), first.getMonth() + i * this.getInterval(), first.getDate()) : undefined;
			out.push({ date, rate, rent, capped });
		}
		return out;
	}
	private emit(): void {
		this.fireChange({ rule: this.getRule(), rate: this.getRate(), cap: this.getCap() });
	}
	onclick(event: Press): void {
		const rule = (event.target as HTMLElement).closest<HTMLElement>("[data-rule]")?.dataset.rule;
		if (!rule || !this.getEditable() || rule === this.getRule()) return;
		this.setRule(rule);
		this.emit();
	}
	onchange(event: Press): void {
		const input = event.target as HTMLInputElement;
		const part = input.dataset.part;
		if (!part) return;
		const text = input.value.trim();
		const value = text ? parseNum(text) : part === "cap" ? -1 : 0;
		if (!Number.isFinite(value)) {
			this.invalidate();
			return;
		}
		if (part === "rate") this.setRate(value);
		else this.setCap(value < 0 ? -1 : value);
		this.emit();
	}
	onsapenter(event: Press): void {
		(event.target as HTMLElement).blur?.();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: EscalationField) {
			const id = c.getId();
			const rule = rules.includes(c.getRule()) ? c.getRule() : "fixed";
			const editable = c.getEditable();
			const steps = c.getSchedule();
			const base = Number(c.getBase()) || 0;
			const money = (value: number) => `${num(value, c.getDecimals())} ${c.getCurrency()}`.trim();
			const top = Math.max(base, ...steps.map((s) => s.rent), 1);
			rm.openStart("div", c).class("korField").class("korEsc").attr("role", "group").attr("aria-labelledby", `${id}-lb`).openEnd();
			rm.openStart("span", `${id}-lb`).class("korLabel").openEnd().text(c.getLabel() || message("ESC_TITLE")).close("span");
			rm.openStart("div").class("korChips").attr("role", "radiogroup").attr("aria-label", message("ESC_RULE")).openEnd();
			rules.forEach((key) => {
				rm.openStart("button").attr("type", "button").attr("role", "radio").attr("data-rule", key).attr("aria-checked", String(key === rule));
				if (!editable) rm.attr("disabled", "disabled");
				rm.openEnd().text(message(`ESC_${key.toUpperCase()}`)).close("button");
			});
			rm.close("div");
			const field = (part: string, name: string, value: number, empty: boolean) => {
				rm.openStart("div").class("korField").openEnd();
				rm.openStart("label").class("korLabel").attr("for", `${id}-${part}`).openEnd().text(name).close("label");
				rm.openStart("div").class("korBox").openEnd();
				rm.voidStart("input", `${id}-${part}`).class("korInput").class("korNumber").attr("inputmode", "decimal").attr("autocomplete", "off").attr("data-part", part).attr("value", empty ? "" : num(value, 2));
				if (!editable) rm.attr("disabled", "disabled");
				if (part === "cap") rm.attr("placeholder", message("ESC_NO_CAP"));
				rm.voidEnd();
				rm.openStart("span").class("korUnit").openEnd().text("%").close("span");
				rm.close("div").close("div");
			};
			if (rule !== "none") {
				rm.openStart("div").class("korEscInputs").openEnd();
				if (rule === "fixed") field("rate", message("ESC_RATE"), c.getRate(), false);
				else {
					rm.openStart("div").class("korField").openEnd();
					rm.openStart("span").class("korLabel").openEnd().text(message("ESC_INDEX")).close("span");
					rm.openStart("div").class("korEscIndex").openEnd();
					renderIcon(rm, "activity");
					rm.text(c.getIndexName() || message("ESC_INDEX")).close("div");
					rm.close("div");
					field("cap", message("ESC_CAP"), c.getCap(), c.getCap() < 0);
				}
				rm.close("div");
			}
			if (c.getHelp()) rm.openStart("div").class("korNote").openEnd().text(c.getHelp()).close("div");
			rm.openStart("table").class("korEscTable").openEnd();
			rm.openStart("caption").class("korSr").openEnd().text(message("ESC_PREVIEW")).close("caption");
			rm.openStart("thead").openEnd().openStart("tr").openEnd();
			["ESC_PERIOD", "ESC_INCREASE", "ESC_RENT"].forEach((key) => rm.openStart("th").attr("scope", "col").openEnd().text(message(key)).close("th"));
			rm.openStart("th").attr("aria-hidden", "true").openEnd().close("th");
			rm.close("tr").close("thead").openStart("tbody").openEnd();
			const line = (date: string, rate: string, rent: number, capped: boolean, now: boolean) => {
				rm.openStart("tr");
				if (now) rm.class("korEscNow");
				rm.openEnd();
				rm.openStart("td").class("korNum").openEnd().text(date).close("td");
				rm.openStart("td").class("korNum").openEnd().text(rate);
				if (capped) rm.openStart("span").class("korEscCap").openEnd().text(message("ESC_CAPPED")).close("span");
				rm.close("td");
				rm.openStart("td").class("korNum").openEnd().text(money(rent)).close("td");
				rm.openStart("td").attr("aria-hidden", "true").openEnd().openStart("span").class("korEscBar").style("--kor-part", String(rent / top)).openEnd().close("span").close("td");
				rm.close("tr");
			};
			line(message("ESC_CURRENT"), "—", base, false, true);
			steps.forEach((s) => line(dayText(s.date) || "—", rule === "none" ? "—" : `+${pct(s.rate, 1)}`, s.rent, s.capped, false));
			rm.close("tbody").close("table").close("div");
		}
	};
}
