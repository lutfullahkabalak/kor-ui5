import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { message, renderIcon, safeHref } from "./util";
import "./library";

/**
 * Metin bağlantısı. `href` yoksa düğme gibi davranır.
 *
 * @namespace kor.ui
 */
export default class Link extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $LinkSettings);
	constructor(id?: string, settings?: $LinkSettings);
	constructor(id?: string, settings?: $LinkSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Adres; yalnız http, https, mailto, tel ve göreli adresler açılır */
			href: { type: "string", defaultValue: "" },
			/** _blank yeni sekmede açar */
			target: { type: "string", defaultValue: "" },
			/** Ön simge */
			icon: { type: "string", defaultValue: "" },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Basıldı; preventDefault adresi açmaz */
			press: { allowPreventDefault: true }
		}
	};
	onclick(event: { preventDefault(): void }): void {
		if (!this.getEnabled() || !this.firePress()) event.preventDefault();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Link) {
			const href = safeHref(c.getHref());
			const tag = href && c.getEnabled() ? "a" : "button";
			rm.openStart(tag, c).class("korLink");
			if (tag === "a") {
				rm.attr("href", href);
				if (c.getTarget()) rm.attr("target", c.getTarget()).attr("rel", "noopener noreferrer");
			} else {
				rm.attr("type", "button");
				if (!c.getEnabled()) rm.attr("disabled", "disabled");
			}
			rm.openEnd();
			renderIcon(rm, c.getIcon());
			rm.openStart("span").openEnd().text(c.getText()).close("span");
			if (tag === "a" && c.getTarget() === "_blank") {
				renderIcon(rm, "arrow-up-right");
				rm.openStart("span").class("korSr").openEnd().text(message("NEW_TAB")).close("span");
			}
			rm.close(tag);
		}
	};
}
