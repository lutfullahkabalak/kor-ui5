import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { message } from "./util";
import "./library";

/**
 * Yükleniyor iskeleti. `loading` kapanınca içeriği gösterir.
 *
 * @namespace kor.ui
 */
export default class Skeleton extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $SkeletonSettings);
	constructor(id?: string, settings?: $SkeletonSettings);
	constructor(id?: string, settings?: $SkeletonSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Yükleniyor */
			loading: { type: "boolean", defaultValue: true, bindable: "bindable" },
			/** text, rows, cards veya chart */
			kind: { type: "string", defaultValue: "text" },
			/** Tekrar sayısı */
			count: { type: "int", defaultValue: 3 }
		},
		aggregations: {
			/** Yüklenince gösterilecek içerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
		}
	};
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Skeleton) {
			rm.openStart("div", c).class("korSkeleton").attr("aria-busy", String(c.getLoading()));
			if (c.getLoading()) rm.class(`korSk-${c.getKind()}`);
			rm.openEnd();
			if (!c.getLoading()) c.getContent().forEach((item) => rm.renderControl(item));
			else {
				rm.openStart("span").class("korSr").attr("role", "status").openEnd().text(message("LOADING")).close("span");
				const bone = (cls: string) => rm.openStart("i").class("korBone").class(cls).openEnd().close("i");
				const widths = [92, 78, 85, 64, 88, 71];
				for (let i = 0; i < c.getCount(); i++) {
					rm.openStart("div").class("korSkItem").attr("aria-hidden", "true").style("--kor-sk", `${widths[i % 6]}%`).style("animation-delay", `${i * 60}ms`).openEnd();
					if (c.getKind() === "rows") ["korBoneFace", "korBoneLine", "korBoneShort"].forEach(bone);
					else if (c.getKind() === "cards") ["korBoneShort", "korBoneBig", "korBoneLine"].forEach(bone);
					else bone(c.getKind() === "chart" ? "korBoneBar" : "korBoneLine");
					rm.close("div");
				}
			}
			rm.close("div");
		}
	};
}
