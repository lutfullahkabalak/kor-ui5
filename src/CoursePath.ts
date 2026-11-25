import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, num, pct, renderIcon } from "./util";
import "./library";

/**
 * Öğrenme yolu: bölümler kıvrılan yolda sırayla açılır.
 *
 * @namespace kor.ui
 */
export default class CoursePath extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CoursePathSettings);
	constructor(id?: string, settings?: $CoursePathSettings);
	constructor(id?: string, settings?: $CoursePathSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "modules",
		properties: {
			/** Eğitim */
			title: { type: "string", defaultValue: "" },
			/** Açıklama */
			text: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Bölümler */
			modules: { type: "kor.ui.CourseModule", multiple: true, singularName: "module" }
		},
		events: {
			/** Açık bölüme basıldı */
			press: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.firePress({ key: this.getModules()[Number(i)].getKey() });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: CoursePath) {
			const modules = c.getModules();
			const done = modules.filter((m) => m.getProgress() >= 100).length;
			const next = modules.findIndex((m) => m.getProgress() < 100);
			rm.openStart("section", c).class("korPath").attr("aria-label", c.getTitle() || message("COURSE")).style("--kor-part", String(modules.length ? done / modules.length : 0)).openEnd();
			rm.openStart("header").openEnd().openStart("div").openEnd().openStart("h3").openEnd().text(c.getTitle()).close("h3");
			if (c.getText()) rm.openStart("p").openEnd().text(c.getText()).close("p");
			rm.close("div").openStart("b").class("korNum").openEnd().text(`${num(done)} / ${num(modules.length)}`).close("b").close("header");
			rm.openStart("ol").openEnd();
			modules.forEach((m, i) => {
				const full = m.getProgress() >= 100;
				const locked = m.getLocked();
				rm.openStart("li", m).class(i % 2 ? "korPathB" : "korPathA");
				if (full) rm.class("korPathDone");
				if (locked) rm.class("korPathLocked");
				if (i === next && !locked) rm.class("korPathNext").attr("aria-current", "step");
				rm.openEnd();
				rm.openStart("button", `${m.getId()}-b`).attr("type", "button").attr("data-i", i).style("--kor-part", String(Math.max(0, Math.min(1, m.getProgress() / 100))));
				if (locked) rm.attr("disabled", "disabled");
				rm.openEnd();
				rm.openStart("span").class("korPathDot").attr("aria-hidden", "true").openEnd().openStart("span").openEnd();
				renderIcon(rm, locked ? "lock" : full ? "check" : m.getIcon() || ({ video: "circle-play", quiz: "file-check", exam: "award", lab: "microscope", reading: "book-open", live: "video" } as Record<string, string>)[m.getKind()] || "book-open");
				rm.close("span").close("span");
				rm.openStart("span").class("korPathText").openEnd();
				rm.openStart("span").class("korListTitle").openEnd().text(m.getTitle()).close("span");
				rm.openStart("span").class("korListText").openEnd().text([m.getText(), locked ? message("LOCKED") : full ? m.getScore() || message("COMPLETED") : m.getProgress() > 0 ? pct(m.getProgress()) : ""].filter(Boolean).join(" · ")).close("span");
				rm.close("span").close("button").close("li");
			});
			rm.close("ol").close("section");
		}
	};
}
