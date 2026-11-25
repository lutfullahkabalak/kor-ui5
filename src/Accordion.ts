import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { renderIcon, stateKey } from "./util";
import "./library";

/**
 * Açılıp kapanan bölümler.
 *
 * @namespace kor.ui
 */
export default class Accordion extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $AccordionSettings);
	constructor(id?: string, settings?: $AccordionSettings);
	constructor(id?: string, settings?: $AccordionSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Aynı anda birden çok bölüm açılabilir */
			multiple: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Bölümler */
			items: { type: "kor.ui.AccordionItem", multiple: true, singularName: "item" }
		},
		events: {
			/** Bölüm açıldı veya kapandı */
			toggle: { parameters: { key: { type: "string" }, open: { type: "boolean" } } }
		}
	};
	onclick(event: Press): void {
		const head = (event.target as HTMLElement).closest<HTMLElement>("[data-acc]");
		// İç içe akordeonda yalnız kendi başlığı
		if (!head || head.dataset.of !== this.getId()) return;
		const item = this.getItems()[Number(head.dataset.acc)];
		const open = !item.getOpen();
		if (open && !this.getMultiple()) this.getItems().forEach((other) => other !== item && other.getOpen() && other.setOpen(false));
		item.setOpen(open);
		this.fireToggle({ key: item.getKey(), open });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Accordion) {
			rm.openStart("div", c).class("korAcc").openEnd();
			c.getItems().forEach((item, i) => {
				const id = item.getId();
				const open = item.getOpen();
				rm.openStart("section", item).class("korAccItem");
				if (open) rm.class("korAccOpen");
				rm.openEnd();
				rm.openStart("h3").class("korAccHead").openEnd();
				rm.openStart("button", `${id}-b`).attr("type", "button").attr("data-acc", i).attr("data-of", c.getId()).attr("aria-expanded", String(open)).attr("aria-controls", `${id}-c`).openEnd();
				renderIcon(rm, item.getIcon());
				rm.openStart("span").class("korAccTitles").openEnd();
				rm.openStart("span").class("korAccTitle").openEnd().text(item.getTitle()).close("span");
				if (item.getText()) rm.openStart("span").class("korAccText").openEnd().text(item.getText()).close("span");
				rm.close("span");
				if (item.getCount()) rm.openStart("span").class("korTabCount").class(`korState-${stateKey(item.getState())}`).openEnd().text(item.getCount()).close("span");
				renderIcon(rm, "chevron-down", "korAccTwist");
				rm.close("button").close("h3");
				rm.openStart("div", `${id}-c`).class("korAccBody").attr("role", "region").attr("aria-labelledby", `${id}-b`);
				if (!open) rm.attr("hidden", "hidden");
				rm.openEnd();
				if (open) item.getContent().forEach((child) => rm.renderControl(child));
				rm.close("div").close("section");
			});
			rm.close("div");
		}
	};
}
