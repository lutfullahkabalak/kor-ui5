import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { bankInfo, bankLogoVersion, findBankLogo } from "./bankLogos";
import { countryName, flagCode, flagUrl, initials, message, tone } from "./util";
import "./library";

/**
 * Banka logosu. Logo sırayla `src`, `registerBankLogos` kaydı ve `setBankLogoProvider`
 * sunucusundan gelir. Hiçbiri yoksa veya resim yüklenemezse dünyadaki her banka için
 * BIC/addan üretilen işaret ve ülke bayrağı gösterilir. Kor banka logosu dağıtmaz.
 *
 * @namespace kor.ui
 */
export default class BankLogo extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $BankLogoSettings);
	constructor(id?: string, settings?: $BankLogoSettings);
	constructor(id?: string, settings?: $BankLogoSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Banka adı; ekran okuyucu metni ve baş harfler */
			name: { type: "string", defaultValue: "" },
			/** SWIFT/BIC kodu (8 veya 11 hane); kayıt anahtarı ve ülke bayrağı buradan */
			bic: { type: "string", defaultValue: "" },
			/** IBAN; BIC yoksa yalnız ülke bayrağı için okunur, DOM'a yazılmaz */
			iban: { type: "string", defaultValue: "" },
			/** Uygulamanın kendi banka anahtarı ("TR-00062" gibi); kayıtta önce buna bakılır */
			key: { type: "string", defaultValue: "" },
			/** Logo adresi; verilirse kayda bakılmaz */
			src: { type: "string", defaultValue: "" },
			/** Kenar, piksel */
			size: { type: "int", defaultValue: 40 },
			/** Biçim: square veya circle */
			shape: { type: "string", defaultValue: "square" },
			/** Köşede ülke bayrağı */
			showFlag: { type: "boolean", defaultValue: true }
		}
	};
	private failed = "";
	private drawn = -1;
	onBeforeRendering(): void {
		// Kayıt değiştiyse yüklenemeyen adres yeniden denenir
		if (this.drawn !== bankLogoVersion()) this.failed = "";
		this.drawn = bankLogoVersion();
	}
	onAfterRendering(): void {
		this.getDomRef()?.querySelector("img.korBankLogoImg")?.addEventListener("error", this);
	}
	handleEvent(event: Event): void {
		if (event.type !== "error") return;
		this.failed = (event.target as HTMLImageElement).getAttribute("src") ?? "";
		this.invalidate();
	}
	/** Çizilecek logo; yoksa üretilen işaret */
	getResolved(): { src: string; name: string; color: string; country: string } {
		const info = bankInfo(this.getBic(), this.getIban(), this.getName(), this.getKey());
		const own = safeSrc(this.getSrc());
		const hit = own ? { src: own, name: "", color: "" } : findBankLogo(info);
		const src = safeSrc(hit?.src ?? "");
		return { src: src && src !== this.failed ? src : "", name: info.name || hit?.name || "", color: hit?.color ?? "", country: flagCode(info.country) };
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: BankLogo) {
			const logo = c.getResolved();
			const info = bankInfo(c.getBic(), "", "", "");
			const size = Math.max(16, c.getSize());
			const label = [logo.name || info.bic8 || message("BANK_LOGO"), logo.country && countryName(logo.country)].filter(Boolean).join(", ");
			rm.openStart("span", c).class("korBankLogo").class(c.getShape() === "circle" ? "korBankLogo-circle" : "korBankLogo-square");
			rm.style("--kor-logo", `${size}px`).attr("role", "img").attr("aria-label", label).attr("title", label);
			if (logo.src) rm.class("korBankLogoHasImg");
			else rm.style("--kor-tone", logo.color && /^#[0-9a-f]{3,8}$/i.test(logo.color) ? logo.color : `var(--kor-data${tone(info.bank || logo.name || "?")})`);
			rm.openEnd();
			if (logo.src) {
				rm.voidStart("img").class("korBankLogoImg").attr("src", logo.src).attr("alt", "").attr("loading", "lazy").attr("decoding", "async").attr("draggable", "false").voidEnd();
			} else {
				const text = (logo.name ? initials(logo.name) : info.bank.slice(0, 2)) || "?";
				rm.openStart("span").class("korBankLogoMark").attr("aria-hidden", "true").openEnd().text(text.toLocaleUpperCase()).close("span");
			}
			if (c.getShowFlag() && logo.country) {
				rm.voidStart("img").class("korBankLogoFlag").attr("src", flagUrl(logo.country, true)).attr("alt", "").attr("aria-hidden", "true").attr("loading", "lazy").voidEnd();
			}
			rm.close("span");
		}
	};
}

/** Yalnız http(s), göreli ve resim data: adresleri */
function safeSrc(src: string): string {
	if (!src) return "";
	if (/^data:image\/(png|jpe?g|gif|webp|svg\+xml)[;,]/i.test(src)) return src;
	try {
		return /^https?:$/.test(new URL(src, document.baseURI).protocol) ? src : "";
	} catch {
		return "";
	}
}
