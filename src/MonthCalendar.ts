import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type CalendarEvent from "./CalendarEvent";
import { dayNames, weekStart } from "./Calendar";
import type { Press } from "./util";
import { dateText, isRtl, isoDate, message, renderIcon, stateKey, toDate } from "./util";
import "./library";

/**
 * Etkinlikleri ay görünümünde gösterir; dar yerde günün listesi altta çıkar.
 *
 * @namespace kor.ui
 */
export default class MonthCalendar extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MonthCalendarSettings);
	constructor(id?: string, settings?: $MonthCalendarSettings);
	constructor(id?: string, settings?: $MonthCalendarSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "events",
		properties: {
			/** Gösterilen gün; boşsa bugün */
			date: { type: "any", defaultValue: null, bindable: "bindable" },
			/** Günde en çok etiket */
			maxPerDay: { type: "int", defaultValue: 3 },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Etkinlikler */
			events: { type: "kor.ui.CalendarEvent", multiple: true, singularName: "event" }
		},
		events: {
			/** Gün seçildi, yyyy-MM-dd */
			daySelect: { parameters: { date: { type: "string" } } },
			/** Etkinlik açıldı */
			eventPress: { parameters: { key: { type: "string" }, event: { type: "object" } } },
			/** Görünen aralık değişti */
			monthChange: { parameters: { start: { type: "string" }, end: { type: "string" } } }
		}
	};
	private moved = false;

	private day(): Date {
		return toDate(this.getDate()) ?? (toDate(new Date(new Date().setHours(12))) as Date);
	}
	private first(): Date {
		const day = this.day();
		const one = new Date(day.getFullYear(), day.getMonth(), 1);
		return new Date(one.getFullYear(), one.getMonth(), 1 - ((one.getDay() - weekStart() + 7) % 7));
	}
	private on(day: Date): CalendarEvent[] {
		const at = isoDate(day);
		return this.getEvents().filter((event) => {
			const start = this.local(event.getStart());
			return start && start <= at && at <= (this.local(event.getEnd()) || start);
		}).sort((a, b) => a.getTime().localeCompare(b.getTime()));
	}
	private local(value: unknown): string {
		const date = toDate(value);
		return date ? isoDate(date) : "";
	}
	private go(day: Date, focus = false): void {
		const old = this.day();
		const month = old.getMonth() !== day.getMonth() || old.getFullYear() !== day.getFullYear();
		this.moved = focus;
		// Bağlı alan Date ise Date kalır
		this.setDate(this.getDate() instanceof Date ? day : isoDate(day));
		if (month) {
			const start = this.first();
			this.fireMonthChange({ start: isoDate(start), end: isoDate(new Date(start.getFullYear(), start.getMonth(), start.getDate() + 41)) });
		}
		this.fireDaySelect({ date: isoDate(day) });
	}
	private shift(months: number): Date {
		const day = this.day();
		const last = new Date(day.getFullYear(), day.getMonth() + months + 1, 0).getDate();
		return new Date(day.getFullYear(), day.getMonth() + months, Math.min(day.getDate(), last));
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const chip = target.closest<HTMLElement>("[data-ev]");
		const nav = target.closest<HTMLElement>("[data-nav]")?.dataset.nav;
		const cell = target.closest<HTMLElement>("[data-day]");
		if (chip) {
			const item = this.getEvents()[Number(chip.dataset.ev)];
			this.fireEventPress({ key: item.getKey(), event: item });
		} else if (nav) this.go(nav === "0" ? (toDate(new Date(new Date().setHours(12))) as Date) : this.shift(Number(nav)));
		else if (cell) this.go(toDate(cell.dataset.day) as Date, true);
	}
	onkeydown(event: KeyboardEvent): void {
		const cell = event.target as HTMLElement;
		if (!cell.dataset.day) return;
		const day = this.day();
		const by = (n: number) => new Date(day.getFullYear(), day.getMonth(), day.getDate() + n);
		const side = isRtl() ? -1 : 1;
		const to = { ArrowRight: by(side), ArrowLeft: by(-side), ArrowDown: by(7), ArrowUp: by(-7), PageDown: this.shift(1), PageUp: this.shift(-1) }[event.key];
		if (to) {
			event.preventDefault();
			this.go(to, true);
		} else if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			this.go(day, true);
		}
	}
	onAfterRendering(): void {
		if (this.moved) (this.getDomRef() as HTMLElement).querySelector<HTMLElement>('[data-day][tabindex="0"]')?.focus();
		this.moved = false;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: MonthCalendar) {
			const id = c.getId();
			const day = c.day();
			const here = isoDate(day);
			const now = isoDate(new Date());
			const first = c.first();
			const all = c.getEvents();
			const chip = (item: CalendarEvent, at: string) => {
				const start = c.local(item.getStart());
				rm.openStart("button").attr("type", "button").class("korMonthChip").class(`korState-${stateKey(item.getState())}`).attr("data-ev", all.indexOf(item)).attr("title", item.getTitle());
				if (start < at) rm.class("korMonthGoes");
				rm.openEnd();
				if (item.getTime() && start === at) rm.openStart("span").class("korNum").openEnd().text(item.getTime()).close("span");
				rm.openStart("b").openEnd().text(item.getTitle()).close("b").close("button");
			};
			rm.openStart("section", c).class("korMonth").attr("aria-label", c.getLabel() || message("CALENDAR")).openEnd();
			rm.openStart("header").openEnd();
			rm.openStart("h3", `${id}-t`).attr("aria-live", "polite").openEnd().text(dateText(day, "MMMM yyyy")).close("h3");
			([["-1", isRtl() ? "chevron-right" : "chevron-left", "PREV"], ["0", "", "TODAY"], ["1", isRtl() ? "chevron-left" : "chevron-right", "NEXT"]] as const).forEach(([nav, icon, text]) => {
				rm.openStart("button", `${id}-n${nav}`).attr("type", "button").class("korBtn").class("korBtn-ghost").attr("data-nav", nav);
				if (icon) rm.class("korBtnIcon").attr("aria-label", message(text));
				rm.openEnd();
				if (icon) renderIcon(rm, icon);
				else rm.text(message(text));
				rm.close("button");
			});
			rm.close("header");
			rm.openStart("div").class("korMonthGrid").attr("role", "grid").attr("aria-labelledby", `${id}-t`).openEnd();
			rm.openStart("div").class("korMonthNames").attr("role", "row").openEnd();
			dayNames().forEach((name) => rm.openStart("span").attr("role", "columnheader").openEnd().text(name).close("span"));
			rm.close("div");
			for (let w = 0; w < 6; w++) {
				rm.openStart("div").class("korMonthRow").attr("role", "row").openEnd();
				for (let d = 0; d < 7; d++) {
					const date = new Date(first.getFullYear(), first.getMonth(), first.getDate() + w * 7 + d);
					const at = isoDate(date);
					const items = c.on(date);
					// Fazlası varsa son yer "+n" için ayrılır
					const room = items.length > c.getMaxPerDay() ? Math.max(0, c.getMaxPerDay() - 1) : items.length;
					rm.openStart("div", `${id}-d${w * 7 + d}`).class("korMonthDay").attr("role", "gridcell").attr("data-day", at).attr("tabindex", at === here ? "0" : "-1").attr("aria-selected", String(at === here)).attr("aria-label", `${dateText(date, "d MMMM yyyy")}${items.length ? `, ${message("EVENTS", [items.length])}` : ""}`);
					if (date.getMonth() !== day.getMonth()) rm.class("korMonthOut");
					if (at === here) rm.class("korMonthOn");
					if (at === now) rm.class("korMonthNow").attr("aria-current", "date");
					rm.openEnd();
					rm.openStart("span").class("korMonthNum").class("korNum").openEnd().text(String(date.getDate())).close("span");
					items.slice(0, room).forEach((item) => chip(item, at));
					if (items.length > room) rm.openStart("span").class("korMonthMore").openEnd().text(message("MORE_N", [items.length - room])).close("span");
					if (items.length) rm.openStart("span").class("korMonthDots").attr("aria-hidden", "true").openEnd();
					if (items.length) items.slice(0, 3).forEach((item) => rm.openStart("i").class(`korState-${stateKey(item.getState())}`).openEnd().close("i"));
					if (items.length) rm.close("span");
					rm.close("div");
				}
				rm.close("div");
			}
			rm.close("div");
			const list = c.on(day);
			rm.openStart("div").class("korMonthList");
			if (list.length > c.getMaxPerDay()) rm.class("korMonthListOn");
			rm.openEnd();
			rm.openStart("h4").openEnd().text(dateText(day, "d MMMM")).close("h4");
			if (list.length) list.forEach((item) => chip(item, here));
			else rm.openStart("p").openEnd().text(message("NO_EVENT")).close("p");
			rm.close("div").close("section");
		}
	};
}
