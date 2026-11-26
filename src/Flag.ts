import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { countryName, flagCode, flagUrl, message } from "./util";
import "./library";

/**
 * Ülke, bölge veya kuruluş bayrağı. ISO 3166-1 ülkelerinin tümü (249), İngiltere'nin
 * ülkeleri ("gb-sct"), bazı bölgeler ("es-ct") ve kuruluşlar ("eu", "un") vardır.
 * Bayrak yalnızca görününce yüklenir; ad, uygulama dilinde okunur.
 *
 * @namespace kor.ui
 */
export default class Flag extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FlagSettings);
	constructor(id?: string, settings?: $FlagSettings);
	constructor(id?: string, settings?: $FlagSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Bayrak kodu: ISO 3166-1 alfa-2 ("TR"), alt bölge ("gb-sct") veya kuruluş ("eu"). Bilinmeyen kod boş bayrak gösterir */
			code: { type: "string", defaultValue: "" },
			/** Biçim: rect (4:3), square veya circle */
			shape: { type: "string", defaultValue: "rect" },
			/** Yükseklik, piksel */
			size: { type: "int", defaultValue: 18 },
			/** Ekran okuyucu metni; boşsa ülke adı */
			alt: { type: "string", defaultValue: "" },
			/** Süs: yanında ülke adı yazıyorsa ekran okuyucu bayrağı atlar */
			decorative: { type: "boolean", defaultValue: false }
		}
	};
	/** Gösterilen bayrağın kodu; bilinmiyorsa boş */
	getKnownCode(): string {
		return flagCode(this.getCode());
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Flag) {
			const shape = ["square", "circle"].includes(c.getShape()) ? c.getShape() : "rect";
			const size = Math.max(8, c.getSize());
			const label = c.getAlt() || countryName(c.getCode()) || message("FLAG_UNKNOWN");
			rm.voidStart("img", c).class("korFlag").class(`korFlag-${shape}`);
			rm.attr("src", flagUrl(c.getCode(), shape !== "rect")).attr("loading", "lazy").attr("decoding", "async").attr("draggable", "false");
			rm.attr("width", String(shape === "rect" ? Math.round((size * 4) / 3) : size)).attr("height", String(size));
			if (c.getDecorative()) rm.attr("alt", "").attr("aria-hidden", "true");
			else rm.attr("alt", label).attr("title", label);
			rm.voidEnd();
		}
	};
}
