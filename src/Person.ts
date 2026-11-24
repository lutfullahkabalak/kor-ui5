import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { initials, tone } from "./util";
import "./library";

/**
 * Kişi yüzü: baş harfler, isimden gelen sabit ton.
 *
 * @namespace kor.ui
 */
export default class Person extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $PersonSettings);
	constructor(id?: string, settings?: $PersonSettings);
	constructor(id?: string, settings?: $PersonSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Ad */
			name: { type: "string", defaultValue: "" },
			/** Görev; verilirse ad da yazılır */
			role: { type: "string", defaultValue: "" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Person) {
			rm.openStart("span", c).class("korPerson").openEnd();
			rm.openStart("span").class("korFace").class(`korTone${tone(c.getName())}`).attr("title", c.getName());
			if (c.getRole()) rm.attr("aria-hidden", "true");
			else rm.attr("role", "img").attr("aria-label", c.getName());
			rm.openEnd().text(initials(c.getName())).close("span");
			if (c.getRole()) {
				rm.openStart("span").class("korPersonText").openEnd();
				rm.openStart("span").class("korPersonName").openEnd().text(c.getName()).close("span");
				rm.openStart("span").class("korPersonRole").openEnd().text(c.getRole()).close("span");
				rm.close("span");
			}
			rm.close("span");
		}
	};
}
