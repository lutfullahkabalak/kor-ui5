import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { message, renderIcon, stateIcons, stateKey } from "./util";
import "./library";

/**
 * Durum: renk, şekil ve metin birlikte konuşur.
 *
 * @namespace kor.ui
 */
export default class Status extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $StatusSettings);
	constructor(id?: string, settings?: $StatusSettings);
	constructor(id?: string, settings?: $StatusSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Metin; boşsa durumun adı */
			text: { type: "string", defaultValue: "" },
			/** success, wait, danger, info veya none */
			state: { type: "string", defaultValue: "none" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Status) {
			const key = stateKey(c.getState());
			rm.openStart("span", c).class("korStatus").class(`korState-${key}`).openEnd();
			rm.openStart("span").class("korStatusGlyph").openEnd();
			renderIcon(rm, stateIcons[key]);
			rm.close("span");
			rm.openStart("span").class("korStatusText").openEnd().text(c.getText() || message(`STATE_${key.toUpperCase()}`)).close("span");
			rm.close("span");
		}
	};
}
