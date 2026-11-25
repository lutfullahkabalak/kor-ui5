import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type Lesson from "./Lesson";
import { minutesOf, showTime } from "./time";
import type { Press } from "./util";
import { dateText, message, renderIcon, tone } from "./util";
import "./library";

/**
 * Haftalık ders programı; çakışan dersler yan yana çizilir.
 *
 * @namespace kor.ui
 */
export default class Timetable extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TimetableSettings);
	constructor(id?: string, settings?: $TimetableSettings);
	constructor(id?: string, settings?: $TimetableSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "lessons",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Gün sayısı, haftanın ilk gününden */
			days: { type: "int", defaultValue: 5 },
			/** İlk gün; 1 pazartesi, 0 pazar */
			firstDay: { type: "int", defaultValue: 1 },
			/** Gün başı */
			from: { type: "string", defaultValue: "08:00" },
			/** Gün sonu */
			until: { type: "string", defaultValue: "17:00" },
			/** Bir saatin yüksekliği, piksel */
			hourHeight: { type: "int", defaultValue: 56 }
		},
		aggregations: {
			/** Dersler */
			lessons: { type: "kor.ui.Lesson", multiple: true, singularName: "lesson" }
		},
		events: {
			/** Derse basıldı */
			press: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.firePress({ key: this.getLessons()[Number(i)].getKey() });
	}
	private place(day: number): { lesson: Lesson; a: number; b: number; col: number; cols: number }[] {
		const list = this.getLessons().filter((lesson) => lesson.getDay() === day).map((lesson) => ({ lesson, a: minutesOf(lesson.getStart()) ?? 0, b: minutesOf(lesson.getEnd()) ?? 0, col: 0, cols: 1 })).filter((x) => x.b > x.a).sort((x, y) => x.a - y.a || y.b - x.b);
		let group: typeof list = [];
		let end = -1;
		const close = () => {
			const cols = Math.max(1, ...group.map((x) => x.col + 1));
			group.forEach((x) => (x.cols = cols));
			group = [];
		};
		list.forEach((x) => {
			if (x.a >= end) close();
			const busy = group.filter((y) => y.b > x.a).map((y) => y.col);
			while (busy.includes(x.col)) x.col++;
			group.push(x);
			end = Math.max(end, x.b);
		});
		close();
		return list;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Timetable) {
			const from = minutesOf(c.getFrom()) ?? 480;
			const until = Math.max(from + 60, minutesOf(c.getUntil()) ?? 1020);
			const px = c.getHourHeight() / 60;
			const live = c.hasListeners("press");
			const days = Array.from({ length: Math.max(1, Math.min(7, c.getDays())) }, (_, i) => (c.getFirstDay() + i) % 7);
			const now = new Date();
			const minute = now.getHours() * 60 + now.getMinutes();
			rm.openStart("section", c).class("korTable2").attr("tabindex", "0").attr("role", "region").attr("aria-label", c.getLabel() || message("TIMETABLE")).style("--kor-days", String(days.length)).style("--kor-hour", `${c.getHourHeight()}px`).openEnd();
			rm.openStart("div").class("korTableHours").attr("aria-hidden", "true").style("height", `${(until - from) * px}px`).openEnd();
			for (let m = Math.ceil(from / 60) * 60; m <= until; m += 60) rm.openStart("span").class("korNum").style("top", `${(m - from) * px}px`).openEnd().text(showTime(m)).close("span");
			rm.close("div");
			days.forEach((day) => {
				const today = day === now.getDay();
				const name = dateText(new Date(2024, 0, 7 + day), "EEEE");
				rm.openStart("div").class("korTableDay");
				if (today) rm.class("korTableToday");
				rm.openEnd().openStart("h4", `${c.getId()}-d${day}`).openEnd().text(name).close("h4");
				rm.openStart("ul").attr("aria-labelledby", `${c.getId()}-d${day}`).style("height", `${(until - from) * px}px`).openEnd();
				c.place(day).forEach(({ lesson, a, b, col, cols }) => {
					if (b <= from || a >= until) return;
					const top = (Math.max(a, from) - from) * px;
					rm.openStart("li", lesson).class(`korTone${lesson.getTone() || tone(lesson.getTitle())}`).style("top", `${top}px`).style("height", `${(Math.min(b, until) - Math.max(a, from)) * px - 3}px`).style("inset-inline-start", `calc(${(col / cols) * 100}% + 2px)`).style("width", `calc(${100 / cols}% - 4px)`);
					if (lesson.getCancelled()) rm.class("korLessonOff");
					if (cols > 1) rm.class("korLessonClash");
					rm.openEnd();
					const tag = live ? "button" : "div";
					rm.openStart(tag, `${lesson.getId()}-b`).class("korLesson");
					if (live) rm.attr("type", "button").attr("data-i", c.getLessons().indexOf(lesson));
					rm.openEnd();
					rm.openStart("b").openEnd();
					if (cols > 1) renderIcon(rm, "triangle-alert");
					rm.text(lesson.getTitle()).close("b");
					if (lesson.getCancelled()) rm.openStart("span").openEnd().text(message("CANCELLED")).close("span");
					rm.openStart("span").class("korNum").openEnd().text(`${showTime(a)} – ${showTime(b)}`).close("span");
					if (lesson.getText()) rm.openStart("span").openEnd().text(lesson.getText()).close("span");
					rm.close(tag).close("li");
				});
				rm.close("ul");
				if (today && minute > from && minute < until) rm.openStart("i").class("korTableNow").style("top", `${36 + (minute - from) * px}px`).attr("aria-hidden", "true").openEnd().close("i");
				rm.close("div");
			});
			rm.close("section");
		}
	};
}
