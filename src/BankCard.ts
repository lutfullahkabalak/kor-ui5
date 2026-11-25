import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, num, renderIcon } from "./util";
import "./library";

/**
 * Banka kartı: yalnız son dört hane, limit kullanımı ve dondurma.
 *
 * @namespace kor.ui
 */
export default class BankCard extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $BankCardSettings);
	constructor(id?: string, settings?: $BankCardSettings);
	constructor(id?: string, settings?: $BankCardSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Banka veya kart adı */
			bank: { type: "string", defaultValue: "" },
			/** Kart sahibi */
			holder: { type: "string", defaultValue: "" },
			/** Son dört hane; fazlası gösterilmez */
			last4: { type: "string", defaultValue: "" },
			/** Son kullanma, AA/YY */
			expiry: { type: "string", defaultValue: "" },
			/** Kart ağı metni */
			scheme: { type: "string", defaultValue: "" },
			/** Renk, 1-5 */
			tone: { type: "int", defaultValue: 1 },
			/** Kullanılan limit */
			used: { type: "float", defaultValue: 0 },
			/** Limit; 0 gösterilmez */
			limit: { type: "float", defaultValue: 0 },
			/** Para birimi */
			currency: { type: "string", defaultValue: "" },
			/** Donduruldu */
			frozen: { type: "boolean", defaultValue: false, bindable: "bindable" },
			/** Dondurma düğmesi */
			canFreeze: { type: "boolean", defaultValue: false }
		},
		events: {
			/** Dondurma değişiyor; preventDefault durdurur */
			freeze: { allowPreventDefault: true, parameters: { frozen: { type: "boolean" } } }
		}
	};
	onclick(event: Press): void {
		if (!(event.target as HTMLElement).closest("[data-freeze]")) return;
		const frozen = !this.getFrozen();
		if (this.fireFreeze({ frozen })) this.setFrozen(frozen);
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: BankCard) {
			// Tam numara yanlışlıkla bağlanırsa bile yalnız son dört hane DOM'a girer
			const last = c.getLast4().replace(/\D/g, "").slice(-4);
			const part = c.getLimit() > 0 ? c.getUsed() / c.getLimit() : 0;
			rm.openStart("section", c).class("korBank").attr("aria-label", [c.getBank(), last && message("CARD_ENDS", [last])].filter(Boolean).join(", "));
			if (c.getFrozen()) rm.class("korBankFrozen");
			rm.openEnd();
			rm.openStart("div").class("korBankFace").class(`korBankTone${Math.max(1, Math.min(5, c.getTone()))}`).openEnd();
			rm.openStart("span").class("korBankName").openEnd().text(c.getBank()).close("span");
			rm.openStart("span").class("korBankChip").attr("aria-hidden", "true").openEnd().close("span");
			renderIcon(rm, "nfc");
			rm.openStart("span").class("korBankNo").class("korNum").attr("dir", "ltr").openEnd().text(`•••• •••• •••• ${last || "••••"}`).close("span");
			rm.openStart("span").class("korBankHolder").openEnd().text(c.getHolder()).close("span");
			rm.openStart("span").class("korBankExp").class("korNum").openEnd().text(c.getExpiry()).close("span");
			rm.openStart("span").class("korBankScheme").openEnd().text(c.getScheme()).close("span");
			if (c.getFrozen()) {
				rm.openStart("span").class("korBankIce").openEnd();
				renderIcon(rm, "snowflake");
				rm.text(message("FROZEN")).close("span");
			}
			rm.close("div");
			if (c.getLimit() > 0) {
				rm.openStart("div").class("korBankLimit").class(`korState-${part >= 0.9 ? "danger" : part >= 0.75 ? "wait" : "none"}`).style("--kor-part", String(Math.max(0, Math.min(1, part)))).openEnd();
				rm.openStart("span").openEnd().text(message("AVAILABLE")).close("span");
				rm.openStart("b").class("korNum").openEnd().text(`${num(c.getLimit() - c.getUsed(), 2)} ${c.getCurrency()}`.trim()).close("b");
				rm.openStart("span").class("korProgressTrack").attr("role", "meter").attr("aria-label", message("LIMIT_USED")).attr("aria-valuemin", "0").attr("aria-valuemax", c.getLimit()).attr("aria-valuenow", c.getUsed()).openEnd().openStart("i").openEnd().close("i").close("span");
				rm.openStart("small").class("korNum").openEnd().text(`${num(c.getUsed(), 2)} / ${num(c.getLimit(), 2)} ${c.getCurrency()}`.trim()).close("small").close("div");
			}
			if (c.getCanFreeze()) {
				rm.openStart("button", `${c.getId()}-f`).attr("type", "button").class("korBtn").class("korBtn-neutral").attr("data-freeze", "1").openEnd();
				renderIcon(rm, c.getFrozen() ? "sun" : "snowflake");
				rm.openStart("span").openEnd().text(message(c.getFrozen() ? "UNFREEZE" : "FREEZE")).close("span").close("button");
			}
			rm.close("section");
		}
	};
}
