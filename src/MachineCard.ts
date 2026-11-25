import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, pct, renderIcon, renderStatus, stateKey } from "./util";
import { processIcon } from "./processes";
import "./library";

/**
 * Makine kartı: OEE (kullanılabilirlik, performans, kalite) ve vardiya boyunca duruş şeridi.
 *
 * @namespace kor.ui
 */
export default class MachineCard extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MachineCardSettings);
	constructor(id?: string, settings?: $MachineCardSettings);
	constructor(id?: string, settings?: $MachineCardSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "spans",
		properties: {
			/** Makine */
			title: { type: "string", defaultValue: "" },
			/** İş emri veya operatör */
			text: { type: "string", defaultValue: "" },
			/** Süreç simgesi */
			process: { type: "string", defaultValue: "" },
			/** Süreç simgesi yerine */
			icon: { type: "string", defaultValue: "" },
			/** Durum */
			state: { type: "string", defaultValue: "info" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" },
			/** Kullanılabilirlik, 0-100 */
			availability: { type: "float", defaultValue: 0 },
			/** Performans, 0-100 */
			performance: { type: "float", defaultValue: 0 },
			/** Kalite, 0-100 */
			quality: { type: "float", defaultValue: 0 },
			/** OEE hedefi */
			target: { type: "float", defaultValue: 85 },
			/** Şeridin başı metni */
			from: { type: "string", defaultValue: "" },
			/** Şeridin sonu metni */
			until: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Vardiyadaki süreler, sırayla */
			spans: { type: "kor.ui.MachineSpan", multiple: true, singularName: "span" }
		},
		events: {
			/** Karta basıldı */
			press: {}
		}
	};
	onclick(event: Press): void {
		if ((event.target as HTMLElement).closest("[data-press]")) this.firePress();
	}
	/** OEE yüzdesi: üç oranın çarpımı. */
	getOee(): number {
		return (this.getAvailability() * this.getPerformance() * this.getQuality()) / 10000;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: MachineCard) {
			const oee = c.getOee();
			const key = stateKey(c.getState());
			const live = c.hasListeners("press");
			const level = oee >= c.getTarget() ? "success" : oee >= c.getTarget() * 0.75 ? "wait" : "danger";
			rm.openStart("article", c).class("korTile").class("korMachine");
			if (live) rm.class("korTileLive");
			rm.openEnd();
			rm.openStart("header").class("korTileHead").openEnd();
			rm.openStart("span").class("korTileIcon").openEnd();
			renderIcon(rm, c.getIcon() || processIcon(c.getProcess()));
			rm.close("span").openStart("div").class("korTileTitles").openEnd().openStart("h3").openEnd();
			if (live) rm.openStart("button", `${c.getId()}-b`).attr("type", "button").attr("data-press", "1").openEnd().text(c.getTitle()).close("button");
			else rm.text(c.getTitle());
			rm.close("h3");
			if (c.getText()) rm.openStart("p").openEnd().text(c.getText()).close("p");
			rm.close("div");
			renderStatus(rm, c.getStatusText() || message({ success: "ST_DONE", info: "ST_RUN", wait: "ST_WAIT", danger: "ST_STOP", none: "ST_IDLE" }[key] as string), key);
			rm.close("header");
			rm.openStart("div").class("korMachineBody").openEnd();
			rm.openStart("div").class("korMachineOee").class(`korState-${level}`).openEnd();
			rm.openStart("span").openEnd().text("OEE").close("span");
			rm.openStart("b").class("korNum").openEnd().text(pct(oee)).close("b");
			rm.openStart("small").class("korNum").openEnd().text(message("TARGET", [pct(c.getTarget())])).close("small").close("div");
			rm.openStart("dl").openEnd();
			([["AVAILABILITY", c.getAvailability()], ["PERFORMANCE", c.getPerformance()], ["QUALITY", c.getQuality()]] as [string, number][]).forEach(([name, value]) => {
				rm.openStart("div").style("--kor-part", String(Math.max(0, Math.min(1, value / 100)))).openEnd();
				rm.openStart("dt").openEnd().text(message(name)).close("dt").openStart("dd").class("korNum").openEnd().text(pct(value)).close("dd");
				rm.openStart("span").class("korProgressTrack").attr("aria-hidden", "true").openEnd().openStart("i").openEnd().close("i").close("span").close("div");
			});
			rm.close("dl").close("div");
			if (c.getSpans().length) {
				rm.openStart("div").class("korMachineStrip").attr("role", "list").attr("aria-label", message("DOWNTIME")).openEnd();
				c.getSpans().forEach((span) => {
					const state = stateKey(span.getState());
					rm.openStart("i", span).class(`korState-${state}`).class(`korSpan-${state}`).attr("role", "listitem").style("flex-grow", String(Math.max(0, span.getMinutes()))).attr("title", [span.getText() || message(`STATE_${state.toUpperCase()}`), message("MINUTES", [span.getMinutes()])].join(", ")).attr("aria-label", [span.getText() || message(`STATE_${state.toUpperCase()}`), message("MINUTES", [span.getMinutes()])].join(", ")).openEnd().close("i");
				});
				rm.close("div");
				if (c.getFrom() || c.getUntil()) rm.openStart("div").class("korMachineEnds").class("korNum").openEnd().openStart("span").openEnd().text(c.getFrom()).close("span").openStart("span").openEnd().text(c.getUntil()).close("span").close("div");
			}
			rm.close("article");
		}
	};
}
