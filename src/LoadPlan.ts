import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, num, pct, renderIcon, stateKey } from "./util";
import "./library";

/**
 * Araç yükleme planı: paletlerin yeri, ağırlık ve hacim doluluğu; aşım işaretlenir.
 *
 * @namespace kor.ui
 */
export default class LoadPlan extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $LoadPlanSettings);
	constructor(id?: string, settings?: $LoadPlanSettings);
	constructor(id?: string, settings?: $LoadPlanSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Araç veya plaka */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" },
			/** Palet yeri */
			slots: { type: "int", defaultValue: 33 },
			/** Yan yana sıra */
			lanes: { type: "int", defaultValue: 2 },
			/** Taşıma sınırı */
			maxWeight: { type: "float", defaultValue: 24000 },
			/** Ağırlık birimi */
			weightUnit: { type: "string", defaultValue: "kg" },
			/** Seçili yük */
			selectedKey: { type: "string", defaultValue: "", bindable: "bindable" }
		},
		aggregations: {
			/** Yükler, önden arkaya */
			items: { type: "kor.ui.LoadItem", multiple: true, singularName: "item" }
		},
		events: {
			/** Yüke basıldı */
			press: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i === undefined) return;
		const key = this.getItems()[Number(i)].getKey();
		this.setSelectedKey(key);
		this.firePress({ key });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: LoadPlan) {
			const items = c.getItems();
			const used = items.reduce((sum, item) => sum + Math.max(1, item.getSlots()), 0);
			const weight = items.reduce((sum, item) => sum + item.getWeight(), 0);
			const lanes = Math.max(1, c.getLanes());
			const cells = Math.max(c.getSlots(), used);
			const gauge = (label: string, value: number, max: number, unit: string) => {
				const part = max > 0 ? value / max : 0;
				const key = part > 1 ? "danger" : part > 0.95 ? "wait" : "success";
				rm.openStart("div").class("korLoadGauge").class(`korState-${key}`).style("--kor-part", String(Math.min(1, part))).attr("role", "meter").attr("aria-label", label).attr("aria-valuemin", "0").attr("aria-valuemax", max).attr("aria-valuenow", value).attr("aria-valuetext", `${num(value)} / ${num(max)} ${unit}`).openEnd();
				rm.openStart("span").openEnd().text(label).close("span");
				rm.openStart("b").class("korNum").openEnd().text(pct(part * 100)).close("b");
				rm.openStart("span").class("korProgressTrack").openEnd().openStart("i").openEnd().close("i").close("span");
				rm.openStart("small").class("korNum").openEnd();
				if (part > 1) {
					renderIcon(rm, "triangle-alert");
					rm.text(`${message("OVER_BY", [`${num(value - max)} ${unit}`])}`);
				} else rm.text(`${num(value)} / ${num(max)} ${unit}`);
				rm.close("small").close("div");
			};
			rm.openStart("section", c).class("korLoad").attr("aria-label", c.getTitle() || message("LOAD_PLAN")).openEnd();
			rm.openStart("header").openEnd().openStart("div").openEnd().openStart("h3").openEnd().text(c.getTitle()).close("h3");
			if (c.getText()) rm.openStart("p").openEnd().text(c.getText()).close("p");
			rm.close("div");
			gauge(message("SPACE"), used, c.getSlots(), message("PALLETS"));
			gauge(message("WEIGHT"), weight, c.getMaxWeight(), c.getWeightUnit());
			rm.close("header");
			rm.openStart("div").class("korLoadScroll").openEnd();
			rm.openStart("div").class("korLoadTruck").openEnd();
			rm.openStart("span").class("korLoadCab").attr("aria-hidden", "true").openEnd().openStart("i").openEnd().close("i").close("span");
			rm.openStart("ol").class("korLoadBay").style("--kor-lanes", String(lanes)).style("--kor-cells", String(Math.ceil(cells / lanes))).openEnd();
			let place = 0;
			items.forEach((item, i) => {
				const size = Math.max(1, item.getSlots());
				for (let k = 0; k < size; k++, place++) {
					const id = `${item.getId()}-s${k}`;
					rm.openStart("li", k ? id : item).class("korLoadItem").class(`korState-${stateKey(item.getState())}`).class(`korLoadTone${(i % 4) + 1}`);
					if (place >= c.getSlots()) rm.class("korLoadOver");
					if (item.getKey() === c.getSelectedKey() && c.getSelectedKey()) rm.class("korLoadOn");
					rm.openEnd();
					// Çok paletli yükün yalnız ilk yeri sekme durağıdır
					rm.openStart("button", `${id}-b`).attr("type", "button").attr("data-i", i).attr("title", item.getTitle());
					if (k) rm.attr("tabindex", "-1").attr("aria-hidden", "true");
					else rm.attr("aria-label", [item.getTitle(), item.getText(), message("PALLET_N", [size]), `${num(item.getWeight())} ${c.getWeightUnit()}`, item.getStop() && message("STOP_N", [item.getStop()]), place >= c.getSlots() && message("NO_SPACE")].filter(Boolean).join(", ")).attr("aria-pressed", String(item.getKey() === c.getSelectedKey() && !!c.getSelectedKey()));
					rm.openEnd();
					rm.openStart("b").class("korNum").openEnd().text(item.getStop() || String(i + 1)).close("b");
					rm.close("button").close("li");
				}
			});
			for (; place < Math.ceil(cells / lanes) * lanes; place++) {
				rm.openStart("li", `${c.getId()}-e${place}`).class("korLoadFree").attr("aria-hidden", "true");
				if (place >= c.getSlots()) rm.class("korLoadNone");
				rm.openEnd().close("li");
			}
			rm.close("ol");
			rm.openStart("span").class("korLoadDoor").attr("aria-hidden", "true").openEnd().close("span");
			rm.close("div").close("div");
			rm.openStart("ul").class("korLoadKey").openEnd();
			items.forEach((item, i) => {
				rm.openStart("li", `${item.getId()}-k`).class(`korLoadTone${(i % 4) + 1}`);
				if (item.getKey() === c.getSelectedKey() && c.getSelectedKey()) rm.class("korLoadOn");
				rm.openEnd();
				rm.openStart("i").class("korNum").attr("aria-hidden", "true").openEnd().text(item.getStop() || String(i + 1)).close("i");
				rm.openStart("span").openEnd().text(item.getTitle()).close("span");
				if (item.getText()) rm.openStart("small").openEnd().text(item.getText()).close("small");
				rm.openStart("em").class("korNum").openEnd().text(`${num(item.getWeight())} ${c.getWeightUnit()}`).close("em").close("li");
			});
			rm.close("ul").close("section");
		}
	};
}
