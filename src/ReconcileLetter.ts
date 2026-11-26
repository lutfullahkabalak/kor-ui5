import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { dayText, message, num, parseNum, renderIcon, renderStatus, toDate } from "./util";
import "./library";

const reasons = ["payment", "invoice", "exchange", "return", "other"];

/**
 * Cari hesap mutabakat mektubu ve yanıtı. Karşı taraf "Mutabıkız" der ya da kendi bakiyesini,
 * sebebini ve açıklamasını girip "Mutabık değiliz" diye yanıtlar. Hukuki e-imza değildir.
 *
 * @namespace kor.ui
 */
export default class ReconcileLetter extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ReconcileLetterSettings);
	constructor(id?: string, settings?: $ReconcileLetterSettings);
	constructor(id?: string, settings?: $ReconcileLetterSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Gönderen firma */
			company: { type: "string", defaultValue: "" },
			/** Karşı taraf */
			party: { type: "string", defaultValue: "" },
			/** Mutabakat numarası */
			reference: { type: "string", defaultValue: "" },
			/** Bakiye tarihi: Date veya yyyy-MM-dd */
			date: { type: "any" },
			/** Yanıt için son gün */
			dueDate: { type: "any" },
			/** Bizim kayıtlarımıza göre bakiye */
			balance: { type: "any", defaultValue: 0 },
			/** debit: karşı taraf bize borçlu, credit: biz karşı tarafa borçluyuz */
			direction: { type: "string", defaultValue: "debit" },
			/** Para birimi */
			currency: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 2 },
			/** open, agreed veya disputed */
			status: { type: "string", defaultValue: "open", bindable: "bindable" },
			/** Karşı tarafın bildirdiği bakiye */
			theirBalance: { type: "any", defaultValue: null, bindable: "bindable" },
			/** Sebep: payment, invoice, exchange, return, other */
			reason: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Açıklama */
			note: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Yanıtlayan kişi */
			answeredBy: { type: "string", defaultValue: "" },
			/** Yanıt zamanı */
			answeredAt: { type: "any" },
			/** Yanıt verilebilir */
			editable: { type: "boolean", defaultValue: true },
			/** Bugün; boşsa sistem tarihi */
			today: { type: "any" }
		},
		aggregations: {
			/** İtiraz formunun altına konan içerik (ör. FileDrop ile ekstre) */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
		},
		events: {
			/** Yanıt gönderiliyor; preventDefault durdurur */
			respond: { allowPreventDefault: true, parameters: { status: { type: "string" }, theirBalance: { type: "float" }, reason: { type: "string" }, note: { type: "string" } } }
		}
	};
	private disputing = false;
	private missing = false;

	private amount(): number {
		return Number(this.getBalance()) || 0;
	}
	private money(value: number, sign = false): string {
		return `${value < 0 ? "−" : sign && value > 0 ? "+" : ""}${num(Math.abs(value), this.getDecimals())} ${this.getCurrency()}`.trim();
	}
	private dom<T extends HTMLElement>(part: string): T | null {
		return document.getElementById(`${this.getId()}-${part}`) as T | null;
	}
	/** Yanıt için kalan gün; son gün yoksa null. */
	getDaysLeft(): number | null {
		const due = toDate(this.getDueDate());
		if (!due) return null;
		const today = toDate(this.getToday()) ?? new Date();
		const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate());
		return Math.round((day(due) - day(today)) / 864e5);
	}
	/** Mutabıkız yanıtı verir. */
	agree(): boolean {
		return this.answer("agreed", this.amount(), "", "");
	}
	/** Mutabık değiliz yanıtı verir. */
	dispute(theirBalance: number, reason: string, note = ""): boolean {
		return this.answer("disputed", theirBalance, reason, note);
	}
	private answer(status: string, theirBalance: number, reason: string, note: string): boolean {
		if (!this.fireRespond({ status, theirBalance, reason, note })) return false;
		this.disputing = false;
		this.missing = false;
		this.setTheirBalance(theirBalance);
		this.setReason(reason);
		this.setNote(note);
		this.setStatus(status);
		return true;
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const action = target.closest<HTMLElement>("[data-act]")?.dataset.act;
		const reason = target.closest<HTMLElement>("[data-reason]");
		if (reason) {
			reason.parentElement?.querySelectorAll("[data-reason]").forEach((b) => b.setAttribute("aria-checked", String(b === reason)));
			return;
		}
		if (!action) return;
		if (action === "agree") this.agree();
		else if (action === "dispute") {
			this.disputing = true;
			this.invalidate();
		} else if (action === "cancel") {
			this.disputing = false;
			this.missing = false;
			this.invalidate();
		} else if (action === "send") {
			const text = this.dom<HTMLInputElement>("their")?.value.trim() ?? "";
			const chosen = this.getDomRef()?.querySelector<HTMLElement>('[data-reason][aria-checked="true"]')?.dataset.reason ?? "other";
			const note = this.dom<HTMLTextAreaElement>("note")?.value.trim() ?? "";
			const value = text ? parseNum(text) : NaN;
			if (!Number.isFinite(value)) {
				this.missing = true;
				this.invalidate();
				return;
			}
			this.dispute(value, chosen, note);
		}
	}
	oninput(event: Press): void {
		const input = event.target as HTMLInputElement;
		if (input.id !== `${this.getId()}-their`) return;
		const out = this.dom("diff");
		const value = input.value.trim() ? parseNum(input.value) : NaN;
		if (out) out.textContent = Number.isFinite(value) ? this.money(this.amount() - value, true) : "—";
	}
	onAfterRendering(): void {
		if (this.disputing) this.dom<HTMLInputElement>("their")?.focus();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: ReconcileLetter) {
			const id = c.getId();
			const status = ["agreed", "disputed"].includes(c.getStatus()) ? c.getStatus() : "open";
			const debit = c.getDirection() !== "credit";
			const left = c.getDaysLeft();
			rm.openStart("article", c).class("korLetter").class(`korLetter-${status}`).attr("aria-labelledby", `${id}-title`).openEnd();
			rm.openStart("header").openEnd();
			rm.openStart("span").class("korLetterMark").attr("aria-hidden", "true").openEnd();
			renderIcon(rm, "file-check");
			rm.close("span");
			rm.openStart("div").openEnd();
			rm.openStart("h3", `${id}-title`).openEnd().text(message("LETTER_TITLE")).close("h3");
			rm.openStart("span").class("korNum").openEnd().text([c.getReference(), dayText(c.getDate())].filter(Boolean).join(" · ")).close("span");
			rm.close("div");
			if (status === "agreed") renderStatus(rm, message("LETTER_AGREED"), "success");
			else if (status === "disputed") renderStatus(rm, message("LETTER_DISPUTED"), "danger");
			else if (left !== null && left < 0) renderStatus(rm, message("LETTER_LATE"), "danger");
			else renderStatus(rm, message("LETTER_WAITING"), "wait");
			rm.close("header");
			if (c.getCompany() || c.getParty()) {
				rm.openStart("p").class("korLetterFrom").openEnd();
				rm.openStart("span").openEnd().text(c.getCompany()).close("span");
				renderIcon(rm, "arrow-right");
				rm.openStart("b").openEnd().text(c.getParty()).close("b");
				rm.close("p");
			}
			rm.openStart("p").class("korLetterText").openEnd().text(message(debit ? "LETTER_TEXT_DEBIT" : "LETTER_TEXT_CREDIT", [dayText(c.getDate()), c.getParty() || "—"])).close("p");
			rm.openStart("div").class("korLetterSum").openEnd();
			rm.openStart("b").class("korNum").openEnd().text(c.money(c.amount())).close("b");
			rm.openStart("span").openEnd().text(message(debit ? "LETTER_DEBIT" : "LETTER_CREDIT")).close("span");
			rm.close("div");
			if (status === "open") {
				if (left !== null) {
					rm.openStart("p").class("korLetterDue").openEnd();
					renderIcon(rm, "clock");
					rm.text(left < 0 ? message("LETTER_DUE_PAST", [dayText(c.getDueDate())]) : message("LETTER_DUE", [dayText(c.getDueDate()), left])).close("p");
				}
				if (c.getEditable() && !c.disputing) {
					rm.openStart("div").class("korLetterActs").openEnd();
					rm.openStart("button").class("korBtn").class("korBtn-primary").attr("type", "button").attr("data-act", "agree").openEnd();
					renderIcon(rm, "check");
					rm.text(message("LETTER_AGREE")).close("button");
					rm.openStart("button").class("korBtn").attr("type", "button").attr("data-act", "dispute").openEnd().text(message("LETTER_DISPUTE")).close("button");
					rm.close("div");
				}
				if (c.getEditable() && c.disputing) {
					rm.openStart("div").class("korLetterForm").attr("role", "group").attr("aria-label", message("LETTER_DISPUTE")).openEnd();
					rm.openStart("div").class("korLetterPair").openEnd();
					rm.openStart("div").class("korField");
					if (c.missing) rm.class("korFieldError");
					rm.openEnd();
					rm.openStart("label").class("korLabel").attr("for", `${id}-their`).openEnd().text(message("LETTER_THEIR_BALANCE")).close("label");
					rm.openStart("div").class("korBox").openEnd();
					rm.voidStart("input", `${id}-their`).class("korInput").class("korNumber").attr("inputmode", "decimal").attr("autocomplete", "off").attr("aria-required", "true");
					if (c.missing) rm.attr("aria-invalid", "true").attr("aria-describedby", `${id}-miss`);
					rm.voidEnd();
					if (c.getCurrency()) rm.openStart("span").class("korUnit").openEnd().text(c.getCurrency()).close("span");
					rm.close("div");
					if (c.missing) {
						rm.openStart("div", `${id}-miss`).class("korNote").openEnd();
						renderIcon(rm, "circle-alert");
						rm.text(message("REQUIRED")).close("div");
					}
					rm.close("div");
					rm.openStart("div").class("korLetterDiff").openEnd().openStart("span").openEnd().text(message("MATCH_DIFF")).close("span");
					rm.openStart("b", `${id}-diff`).class("korNum").attr("aria-live", "polite").openEnd().text("—").close("b").close("div");
					rm.close("div");
					rm.openStart("div").class("korField").openEnd();
					rm.openStart("span", `${id}-rl`).class("korLabel").openEnd().text(message("LETTER_REASON")).close("span");
					rm.openStart("div").class("korChips").attr("role", "radiogroup").attr("aria-labelledby", `${id}-rl`).openEnd();
					reasons.forEach((key, i) => rm.openStart("button").attr("type", "button").attr("role", "radio").attr("data-reason", key).attr("aria-checked", String(i === 0)).openEnd().text(message(`REASON_${key.toUpperCase()}`)).close("button"));
					rm.close("div").close("div");
					rm.openStart("div").class("korField").openEnd();
					rm.openStart("label").class("korLabel").attr("for", `${id}-note`).openEnd().text(message("LETTER_NOTE")).close("label");
					rm.openStart("div").class("korBox").openEnd().openStart("textarea", `${id}-note`).class("korInput").attr("rows", 3).openEnd().close("textarea").close("div");
					rm.close("div");
					c.getContent().forEach((child) => rm.renderControl(child));
					rm.openStart("div").class("korLetterActs").openEnd();
					rm.openStart("button").class("korBtn").class("korBtn-primary").attr("type", "button").attr("data-act", "send").openEnd();
					renderIcon(rm, "send");
					rm.text(message("LETTER_SEND")).close("button");
					rm.openStart("button").class("korBtn").class("korBtn-ghost").attr("type", "button").attr("data-act", "cancel").openEnd().text(message("CANCEL")).close("button");
					rm.close("div").close("div");
				}
			} else {
				const raw = c.getTheirBalance() as unknown;
				const their = raw === null || raw === undefined || raw === "" ? NaN : Number(raw);
				rm.openStart("div").class("korLetterStamp").class(`korState-${status === "agreed" ? "success" : "danger"}`).openEnd();
				renderIcon(rm, status === "agreed" ? "check-check" : "circle-x");
				rm.openStart("div").openEnd();
				rm.openStart("b").openEnd().text(message(status === "agreed" ? "LETTER_AGREED" : "LETTER_DISPUTED")).close("b");
				const who = [c.getAnsweredBy(), dayText(c.getAnsweredAt())].filter(Boolean).join(" · ");
				if (who) rm.openStart("span").openEnd().text(who).close("span");
				rm.close("div").close("div");
				if (status === "disputed") {
					rm.openStart("dl").class("korLetterFacts").openEnd();
					const fact = (name: string, value: string) => rm.openStart("div").openEnd().openStart("dt").openEnd().text(name).close("dt").openStart("dd").openEnd().text(value).close("dd").close("div");
					if (!Number.isNaN(their)) {
						fact(message("LETTER_THEIR_BALANCE"), c.money(their));
						fact(message("MATCH_DIFF"), c.money(c.amount() - their, true));
					}
					if (c.getReason()) fact(message("LETTER_REASON"), message(`REASON_${c.getReason().toUpperCase()}`));
					if (c.getNote()) fact(message("LETTER_NOTE"), c.getNote());
					rm.close("dl");
				}
			}
			rm.close("article");
		}
	};
}
