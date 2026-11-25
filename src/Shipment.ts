import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, pct, renderIcon, renderStatus, stateIcons, stateKey } from "./util";
import { vehicleKey, vehicles } from "./vehicles";
import "./library";

/**
 * Sevkiyatın yolculuğu: araç duraklar arasında ilerler, bacağa göre kamyon, gemi, uçak, tren, van veya kuryeye döner.
 *
 * @namespace kor.ui
 */
export default class Shipment extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ShipmentSettings);
	constructor(id?: string, settings?: $ShipmentSettings);
	constructor(id?: string, settings?: $ShipmentSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "stops",
		properties: {
			/** Takip numarası veya başlık */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Varış metni */
			eta: { type: "string", defaultValue: "" },
			/** truck, van, bike, train, ship veya plane */
			mode: { type: "string", defaultValue: "truck" },
			/** transit, waiting, problem, returning veya delivered */
			status: { type: "string", defaultValue: "transit" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" },
			/** Yolun yüzdesi; eksi ise duraklardan bulunur */
			progress: { type: "float", defaultValue: -1, bindable: "bindable" },
			/** Yol sahnesini çiz */
			scene: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Duraklar */
			stops: { type: "kor.ui.ShipmentStop", multiple: true, singularName: "stop" }
		},
		events: {
			/** Durağa basıldı */
			stopPress: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.fireStopPress({ key: this.getStops()[Number(i)].getKey() });
	}
	/** Aracın yoldaki yeri, 0-1. */
	getPosition(): number {
		const stops = this.getStops();
		const legs = Math.max(1, stops.length - 1);
		if (this.getStatus() === "delivered") return 1;
		if (this.getProgress() >= 0) return Math.min(1, this.getProgress() / 100);
		const states = stops.map((stop) => stateKey(stop.getState()));
		const done = states.lastIndexOf("success");
		const held = states.findIndex((s, i) => i > done && (s === "wait" || s === "danger"));
		const next = states.findIndex((s, i) => i > done && s === "info");
		// Bekleyen veya sorunlu durakta durur; sıradaki durağa giderken yoldadır
		if (held >= 0 && (next < 0 || held <= next)) return Math.min(1, held / legs);
		if (next > 0) return Math.min(1, (Math.max(0, done) + 0.55 * (next - Math.max(0, done))) / legs);
		return Math.max(0, Math.min(1, done / legs));
	}
	/** Bulunulan bacağın taşıma türü. */
	getLegMode(): string {
		const stops = this.getStops();
		const legs = Math.max(1, stops.length - 1);
		const x = this.getPosition() * legs;
		const leg = Math.min(legs - 1, Math.floor(x + 1e-6));
		return vehicleKey(stops[leg]?.getMode() || this.getMode());
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Shipment) {
			const stops = c.getStops();
			const at = c.getPosition();
			const mode = c.getLegMode();
			const status = ["transit", "waiting", "problem", "returning", "delivered"].includes(c.getStatus()) ? c.getStatus() : "transit";
			const state = { transit: "info", waiting: "wait", problem: "danger", returning: "wait", delivered: "success" }[status] as string;
			const live = c.hasListeners("stopPress");
			const legs = Math.max(1, stops.length - 1);
			rm.openStart("section", c).class("korShip").class(`korShip-${mode}`).class(`korShip-${status}`).class(`korState-${state}`).style("--kor-at", String(at)).style("--kor-stops", String(stops.length || 5));
			if (c.getTitle()) rm.attr("aria-labelledby", `${c.getId()}-t`);
			else rm.attr("aria-label", message("SHIPMENT"));
			rm.openEnd();
			rm.openStart("header").openEnd().openStart("div").openEnd();
			if (c.getTitle()) rm.openStart("h3", `${c.getId()}-t`).class("korNum").openEnd().text(c.getTitle()).close("h3");
			if (c.getText()) rm.openStart("p").openEnd().text(c.getText()).close("p");
			rm.close("div");
			rm.openStart("div").class("korShipEnd").openEnd();
			renderStatus(rm, c.getStatusText() || message(`SHIP_${status.toUpperCase()}`), state);
			if (c.getEta()) rm.openStart("span").class("korShipEta").openEnd().text(c.getEta()).close("span");
			rm.close("div").close("header");
			rm.openStart("div").class("korShipBody").openEnd();
			if (c.getScene()) {
				// Yolun anlamı duraklarda ve burada metin olarak da vardır
				rm.openStart("div").class("korShipScene").attr("role", "img").attr("aria-label", message("SHIP_AT", [message(`MODE_${mode.toUpperCase()}`), pct(at * 100)])).openEnd();
				rm.openStart("div").class("korShipSky").openEnd();
				for (let i = 0; i < 3; i++) rm.openStart("i").openEnd().close("i");
				rm.close("div");
				rm.openStart("div").class("korShipLane").openEnd();
				rm.openStart("div").class("korShipDone").openEnd().close("div");
				rm.openStart("div", `${c.getId()}-v`).class("korShipRide").openEnd();
				// Kip değişince çizim yenilensin diye anahtar kimliktedir
				rm.openStart("span", `${c.getId()}-v-${mode}`).class("korShipMove").openEnd().unsafeHtml(vehicles[mode]).close("span");
				if (status === "waiting" || status === "problem") {
					rm.openStart("span").class("korShipFlag").openEnd();
					renderIcon(rm, status === "problem" ? "triangle-alert" : "clock");
					rm.close("span");
				}
				rm.close("div").close("div").close("div");
			}
			rm.openStart("ol").class("korShipStops").openEnd();
			stops.forEach((stop, i) => {
				const key = stateKey(stop.getState());
				rm.openStart("li", stop).class(`korState-${key}`).style("--kor-i", String(i / legs));
				if (i / legs <= at + 1e-6) rm.class("korShipPast");
				if (key === "info") rm.attr("aria-current", "step");
				rm.openEnd();
				const tag = live ? "button" : "div";
				rm.openStart(tag).class("korShipStop");
				if (live) rm.attr("type", "button").attr("data-i", i);
				rm.openEnd();
				rm.openStart("span").class("korShipPin").attr("role", "img").attr("aria-label", message(`STATE_${key.toUpperCase()}`)).openEnd();
				renderIcon(rm, stop.getIcon() || stateIcons[key]);
				rm.close("span");
				rm.openStart("span").class("korShipName").openEnd().text(stop.getTitle()).close("span");
				if (stop.getText()) rm.openStart("span").class("korShipNote").openEnd().text(stop.getText()).close("span");
				if (stop.getTime()) rm.openStart("span").class("korShipTime").class("korNum").openEnd().text(stop.getTime()).close("span");
				rm.close(tag).close("li");
			});
			rm.close("ol").close("div").close("section");
		}
	};
}
