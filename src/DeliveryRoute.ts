import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, num, renderFace, renderIcon, renderStatus, stateIcons, stateKey } from "./util";
import { vehicleKey, vehicles } from "./vehicles";
import "./library";

/**
 * Dağıtım turu: araç teslimat duraklarını sırayla gezer, kalan koli ve gecikme görünür.
 *
 * @namespace kor.ui
 */
export default class DeliveryRoute extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DeliveryRouteSettings);
	constructor(id?: string, settings?: $DeliveryRouteSettings);
	constructor(id?: string, settings?: $DeliveryRouteSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "stops",
		properties: {
			/** Tur adı veya plaka */
			title: { type: "string", defaultValue: "" },
			/** Sürücü */
			driver: { type: "string", defaultValue: "" },
			/** van, truck veya bike */
			mode: { type: "string", defaultValue: "van" },
			/** Biten durakları gizle */
			collapseDone: { type: "boolean", defaultValue: false, bindable: "bindable" }
		},
		aggregations: {
			/** Duraklar, sırayla */
			stops: { type: "kor.ui.DeliveryStop", multiple: true, singularName: "stop" }
		},
		events: {
			/** Durağa basıldı */
			stopPress: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		if (target.closest("[data-fold]")) this.setCollapseDone(!this.getCollapseDone());
		const i = target.closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.fireStopPress({ key: this.getStops()[Number(i)].getKey() });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: DeliveryRoute) {
			const stops = c.getStops();
			const states = stops.map((stop) => stateKey(stop.getState()));
			// Teslim edilemeyen durak da geçilmiştir
			const over = (i: number) => states[i] === "success" || states[i] === "danger";
			const done = states.filter((_, i) => over(i)).length;
			const next = states.findIndex((_, i) => !over(i));
			const left = stops.reduce((sum, stop, i) => sum + (over(i) ? 0 : stop.getParcels()), 0);
			const mode = vehicleKey(c.getMode());
			const live = c.hasListeners("stopPress");
			rm.openStart("section", c).class("korRound").style("--kor-part", String(stops.length ? done / stops.length : 0)).attr("aria-label", c.getTitle() || message("ROUND")).openEnd();
			rm.openStart("header").openEnd();
			if (c.getDriver()) renderFace(rm, c.getDriver());
			rm.openStart("div").class("korRoundTitles").openEnd();
			rm.openStart("h3").openEnd().text(c.getTitle()).close("h3");
			if (c.getDriver()) rm.openStart("p").openEnd().text(c.getDriver()).close("p");
			rm.close("div");
			rm.openStart("div").class("korRoundSum").class("korNum").openEnd();
			rm.openStart("b").openEnd().text(`${num(done)} / ${num(stops.length)}`).close("b");
			rm.openStart("span").openEnd().text(message("PARCELS_LEFT", [num(left)])).close("span").close("div");
			rm.close("header");
			rm.openStart("div").class("korProgressTrack").attr("aria-hidden", "true").openEnd().openStart("i").openEnd().close("i").close("div");
			if (done) {
				rm.openStart("button", `${c.getId()}-fold`).attr("type", "button").class("korRoundFold").attr("data-fold", "1").attr("aria-expanded", String(!c.getCollapseDone())).openEnd();
				rm.text(message("DONE_STOPS", [num(done)]));
				renderIcon(rm, c.getCollapseDone() ? "chevron-down" : "chevron-right");
				rm.close("button");
			}
			rm.openStart("ol").openEnd();
			stops.forEach((stop, i) => {
				if (c.getCollapseDone() && over(i)) return;
				const key = states[i];
				rm.openStart("li", stop).class(`korState-${key}`);
				if (over(i)) rm.class("korRoundOver");
				if (i === next) rm.class("korRoundNext").attr("aria-current", "step");
				rm.openEnd();
				if (i === next) rm.openStart("span").class("korRoundRide").attr("aria-hidden", "true").openEnd().unsafeHtml(vehicles[mode]).close("span");
				rm.openStart("span").class("korRoundPin").class("korNum").attr("aria-hidden", "true").openEnd();
				if (over(i)) renderIcon(rm, stateIcons[key]);
				else rm.text(String(i + 1));
				rm.close("span");
				const tag = live ? "button" : "div";
				rm.openStart(tag, `${stop.getId()}-b`).class("korRoundStop");
				if (live) rm.attr("type", "button").attr("data-i", i);
				rm.openEnd();
				rm.openStart("span").class("korRoundMain").openEnd();
				rm.openStart("span").class("korListTitle").openEnd().text(stop.getTitle()).close("span");
				if (stop.getText()) rm.openStart("span").class("korListText").openEnd().text(stop.getText()).close("span");
				rm.close("span");
				rm.openStart("span").class("korRoundEnd").openEnd();
				if (stop.getTime()) rm.openStart("span").class("korNum").openEnd().text(stop.getTime()).close("span");
				if (stop.getParcels()) rm.openStart("span").class("korRoundParcels").class("korNum").openEnd().text(message("PARCELS", [num(stop.getParcels())])).close("span");
				if (stop.getStatusText() || key === "danger" || key === "wait") renderStatus(rm, stop.getStatusText() || message(key === "danger" ? "NOT_DELIVERED" : "LATE"), key);
				rm.close("span").close(tag).close("li");
			});
			rm.close("ol").close("section");
		}
	};
}
