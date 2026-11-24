import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { renderIcon } from "./util";
import "./library";

/**
 * Çizgi simge. Kor adı ("truck") veya UI5 adresi ("sap-icon://add") alır.
 *
 * @namespace kor.ui
 */
export default class Icon extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $IconSettings);
	constructor(id?: string, settings?: $IconSettings);
	constructor(id?: string, settings?: $IconSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Simge adı */
			name: { type: "string", defaultValue: "" },
			/** Boyut, piksel */
			size: { type: "int", defaultValue: 18 },
			/** Ekran okuyucu metni; boşsa süstür */
			alt: { type: "string", defaultValue: "" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Icon) {
			rm.openStart("span", c).class("korIconBox").style("font-size", `${c.getSize()}px`);
			if (c.getAlt()) rm.attr("role", "img").attr("aria-label", c.getAlt());
			rm.openEnd();
			renderIcon(rm, c.getName());
			rm.close("span");
		}
	};
}
