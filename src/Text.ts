import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import "./library";

const tags: Record<string, string> = { display: "h1", title: "h2", heading: "h3" };

/**
 * Metin: display, title, heading, body veya muted.
 *
 * @namespace kor.ui
 */
export default class Text extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TextSettings);
	constructor(id?: string, settings?: $TextSettings);
	constructor(id?: string, settings?: $TextSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** display, title, heading, body veya muted */
			kind: { type: "string", defaultValue: "body" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Text) {
			const tag = tags[c.getKind()] ?? "p";
			rm.openStart(tag, c).class("korText").class(`korText-${c.getKind()}`).openEnd().text(c.getText()).close(tag);
		}
	};
}
