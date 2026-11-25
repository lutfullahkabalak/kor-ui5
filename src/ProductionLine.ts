import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type ProductionStation from "./ProductionStation";
import type { Press } from "./util";
import { message, num, renderIcon, renderStatus, stateKey } from "./util";
import { processIcon, productIcon } from "./processes";
import "./library";

/**
 * Üretim hattı: istasyonlar sektöre uygun süreç simgeleriyle, ürün bant üzerinde ilerler; darboğaz işaretlenir.
 *
 * @namespace kor.ui
 */
export default class ProductionLine extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ProductionLineSettings);
	constructor(id?: string, settings?: $ProductionLineSettings);
	constructor(id?: string, settings?: $ProductionLineSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "stations",
		properties: {
			/** Hat adı */
			title: { type: "string", defaultValue: "" },
			/** Ürün veya emir */
			text: { type: "string", defaultValue: "" },
			/** textile, automotive, food, beverage, pharma, electronics, furniture, metal, packaging, chemical, construction veya energy */
			sector: { type: "string", defaultValue: "" },
			/** Banttaki ürünün simgesi; boşsa sektöre göre */
			productIcon: { type: "string", defaultValue: "" },
			/** Hız birimi, örneğin ad/sa */
			unit: { type: "string", defaultValue: "" },
			/** En yavaş çalışan istasyonu işaretle */
			showBottleneck: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** İstasyonlar, sırayla */
			stations: { type: "kor.ui.ProductionStation", multiple: true, singularName: "station" }
		},
		events: {
			/** İstasyona basıldı */
			stationPress: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.fireStationPress({ key: this.getStations()[Number(i)].getKey() });
	}
	/** Hızı en düşük çalışan istasyon; tek hız varsa yok. */
	getBottleneck(): ProductionStation | undefined {
		const running = this.getStations().filter((station) => station.getRate() > 0 && stateKey(station.getState()) !== "danger");
		const rates = running.map((station) => station.getRate());
		if (new Set(rates).size < 2) return undefined;
		return running[rates.indexOf(Math.min(...rates))];
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: ProductionLine) {
			const stations = c.getStations();
			const slow = c.getShowBottleneck() ? c.getBottleneck() : undefined;
			const live = c.hasListeners("stationPress");
			const product = c.getProductIcon() || productIcon(c.getSector());
			const top = Math.max(1, ...stations.map((station) => station.getRate()));
			rm.openStart("section", c).class("korLine2").attr("aria-label", c.getTitle() || message("LINE")).openEnd();
			if (c.getTitle() || c.getText()) {
				rm.openStart("header").openEnd();
				rm.openStart("span").class("korTileIcon").openEnd();
				renderIcon(rm, product);
				rm.close("span").openStart("div").openEnd();
				rm.openStart("h3").openEnd().text(c.getTitle()).close("h3");
				if (c.getText()) rm.openStart("p").openEnd().text(c.getText()).close("p");
				rm.close("div").close("header");
			}
			rm.openStart("div").class("korLineScroll").openEnd();
			rm.openStart("ol").openEnd();
			stations.forEach((station, i) => {
				const key = stateKey(station.getState());
				const stopped = key === "danger" || key === "none";
				rm.openStart("li", station).class("korStation").class(`korState-${key}`);
				if (stopped) rm.class("korStationStop");
				if (station === slow) rm.class("korStationSlow");
				rm.openEnd();
				const tag = live ? "button" : "div";
				rm.openStart(tag, `${station.getId()}-b`).class("korStationBox");
				if (live) rm.attr("type", "button").attr("data-i", i);
				rm.openEnd();
				rm.openStart("span").class("korStationIcon").class(`korMotion-${station.getProcess() || "none"}`).openEnd();
				renderIcon(rm, station.getIcon() || processIcon(station.getProcess()));
				rm.close("span");
				rm.openStart("span").class("korStationName").openEnd().text(station.getTitle()).close("span");
				renderStatus(rm, station.getStatusText() || message({ success: "ST_DONE", info: "ST_RUN", wait: "ST_WAIT", danger: "ST_STOP", none: "ST_IDLE" }[key] as string), key);
				if (station.getRate() > 0) {
					rm.openStart("span").class("korStationRate").class("korNum").openEnd().text(`${num(station.getRate())} ${c.getUnit()}`.trim()).close("span");
					rm.openStart("span").class("korProgressTrack").style("--kor-part", String(station.getRate() / top)).attr("aria-hidden", "true").openEnd().openStart("i").openEnd().close("i").close("span");
				}
				if (station === slow) rm.openStart("span").class("korStationTag").openEnd().text(message("BOTTLENECK")).close("span");
				rm.close(tag);
				if (station.getQueue() > 0) rm.openStart("span").class("korStationQueue").class("korNum").openEnd().text(message("IN_QUEUE", [num(station.getQueue())])).close("span");
				rm.openStart("span").class("korBelt").attr("aria-hidden", "true").openEnd();
				if (!stopped) renderIcon(rm, product, "korBeltItem");
				rm.close("span").close("li");
			});
			rm.close("ol").close("div").close("section");
		}
	};
}
