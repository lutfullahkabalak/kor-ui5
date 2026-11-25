import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon } from "./util";
import Toast from "./Toast";
import "./library";

/**
 * Etiket ve değer çiftleri.
 *
 * @namespace kor.ui
 */
export default class Details extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DetailsSettings);
	constructor(id?: string, settings?: $DetailsSettings);
	constructor(id?: string, settings?: $DetailsSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** En çok sütun; yer darsa azalır */
			columns: { type: "int", defaultValue: 3 },
			/** Etiket değerin yanında */
			inline: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Alanlar */
			items: { type: "kor.ui.Detail", multiple: true, singularName: "item" }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-copy]")?.dataset.copy;
		if (i === undefined) return;
		const text = this.getItems()[Number(i)].getValue();
		navigator.clipboard.writeText(text).then(() => Toast.show(message("COPIED_VALUE", [text])), () => Toast.show(message("COPY_FAILED"), { state: "danger" }));
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Details) {
			rm.openStart("dl", c).class("korDetails").style("--kor-fields", String(c.getColumns()));
			if (c.getInline()) rm.class("korDetailsInline");
			rm.openEnd();
			c.getItems().forEach((item, i) => {
				rm.openStart("div", item).class("korDetail");
				if (item.getWide()) rm.class("korDetailWide");
				rm.openEnd();
				rm.openStart("dt").openEnd().text(item.getLabel()).close("dt");
				rm.openStart("dd").openEnd();
				const content = item.getContent();
				if (content) rm.renderControl(content);
				else {
					renderIcon(rm, item.getIcon());
					rm.openStart("span").openEnd().text(item.getValue() || "–").close("span");
					if (item.getCopyable() && item.getValue()) {
						rm.openStart("button").attr("type", "button").class("korCopy").attr("data-copy", i).attr("aria-label", message("COPY_VALUE", [item.getLabel()])).openEnd();
						renderIcon(rm, "copy");
						rm.close("button");
					}
				}
				rm.close("dd").close("div");
			});
			rm.close("dl");
		}
	};
}
