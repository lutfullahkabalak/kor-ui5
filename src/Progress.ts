import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { message, pct, stateKey } from "./util";
import "./library";

/**
 * İlerleme çubuğu veya halkası.
 *
 * @namespace kor.ui
 */
export default class Progress extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ProgressSettings);
	constructor(id?: string, settings?: $ProgressSettings);
	constructor(id?: string, settings?: $ProgressSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Değer; eksi ise süresi bilinmeyen işlem */
			value: { type: "float", defaultValue: 0, bindable: "bindable" },
			/** En çok */
			max: { type: "float", defaultValue: 100 },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Değer metni; boşsa yüzde */
			text: { type: "string", defaultValue: "" },
			/** success, wait, danger, info, none */
			state: { type: "string", defaultValue: "none" },
			/** bar veya ring */
			kind: { type: "string", defaultValue: "bar" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Progress) {
			const busy = c.getValue() < 0;
			const part = busy ? 0.3 : Math.min(1, c.getMax() > 0 ? c.getValue() / c.getMax() : 0);
			const text = c.getText() || (busy ? "" : pct(part * 100));
			const ring = c.getKind() === "ring";
			rm.openStart("div", c).class("korProgress").class(ring ? "korProgressRing" : "korProgressBar").class(`korState-${stateKey(c.getState())}`);
			if (busy) rm.class("korProgressBusy");
			rm.style("--kor-part", String(part)).attr("role", "progressbar").attr("aria-label", c.getLabel() || message("PROGRESS"));
			if (!busy) rm.attr("aria-valuemin", "0").attr("aria-valuemax", c.getMax()).attr("aria-valuenow", Math.min(c.getValue(), c.getMax())).attr("aria-valuetext", text);
			rm.openEnd();
			if (ring) {
				rm.openStart("svg").attr("viewBox", "0 0 64 64").attr("aria-hidden", "true").openEnd();
				["korRingTrack", "korRingFill"].forEach((cls) => rm.openStart("circle").class(cls).attr("cx", "32").attr("cy", "32").attr("r", "27").attr("pathLength", "1").openEnd().close("circle"));
				rm.close("svg");
				rm.openStart("span").class("korRingText").openEnd().text(text).close("span");
				if (c.getLabel()) rm.openStart("span").class("korProgressLabel").openEnd().text(c.getLabel()).close("span");
			} else {
				if (c.getLabel() || text) {
					rm.openStart("div").class("korProgressHead").openEnd();
					rm.openStart("span").class("korProgressLabel").openEnd().text(c.getLabel()).close("span");
					rm.openStart("span").class("korNum").openEnd().text(text).close("span").close("div");
				}
				rm.openStart("span").class("korProgressTrack").openEnd().openStart("i").openEnd().close("i").close("span");
			}
			rm.close("div");
		}
	};
}
