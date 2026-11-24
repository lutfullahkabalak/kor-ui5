import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { message, renderIcon, stateIcons, stateKey } from "./util";
import "./library";

/**
 * Bir kaydın aşamaları, tek çizgide.
 *
 * @namespace kor.ui
 */
export default class Stages extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $StagesSettings);
	constructor(id?: string, settings?: $StagesSettings);
	constructor(id?: string, settings?: $StagesSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "stages",
		aggregations: {
			/** Aşamalar */
			stages: { type: "kor.ui.Stage", multiple: true, singularName: "stage" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Stages) {
			rm.openStart("ol", c).class("korStages").openEnd();
			c.getStages().forEach((stage) => {
				const key = stateKey(stage.getState());
				rm.openStart("li", stage).class("korStage").class(`korState-${key}`);
				if (key === "info") rm.attr("aria-current", "step");
				rm.openEnd();
				rm.openStart("span").class("korStageMark").attr("role", "img").attr("aria-label", message(`STATE_${key.toUpperCase()}`)).openEnd();
				renderIcon(rm, stateIcons[key]);
				rm.close("span");
				rm.openStart("span").class("korStageTitle").openEnd().text(stage.getTitle()).close("span");
				rm.openStart("span").class("korStageInfo").openEnd().text(stage.getInfo()).close("span");
				rm.close("li");
			});
			rm.close("ol");
		}
	};
}
