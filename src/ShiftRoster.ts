import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type ShiftType from "./ShiftType";
import type { Press } from "./util";
import { dateText, isRtl, isoDate, message, num, renderFace, renderIcon, toDate } from "./util";
import "./library";

/**
 * Vardiya çizelgesi: kişiler ve günler; hücreye bastıkça vardiya değişir, eksik kadro işaretlenir.
 *
 * @namespace kor.ui
 */
export default class ShiftRoster extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ShiftRosterSettings);
	constructor(id?: string, settings?: $ShiftRosterSettings);
	constructor(id?: string, settings?: $ShiftRosterSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "shifts",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** İlk gün: Date veya yyyy-MM-dd */
			start: { type: "any" },
			/** Gün sayısı */
			days: { type: "int", defaultValue: 7 },
			/** Kişiler */
			people: { type: "string[]", defaultValue: [] },
			/** Yalnız gösterim */
			readOnly: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Vardiya türleri */
			shifts: { type: "kor.ui.ShiftType", multiple: true, singularName: "shift" },
			/** Atamalar */
			entries: { type: "kor.ui.ShiftEntry", multiple: true, singularName: "entry" }
		},
		events: {
			/** Hücre değişti; boş vardiya izinli demektir. Veriyi uygulama günceller */
			change: { parameters: { person: { type: "string" }, date: { type: "string" }, shift: { type: "string" } } }
		}
	};
	private at = "0|0";

	private list(): Date[] {
		const first = toDate(this.getStart()) ?? (toDate(new Date(new Date().setHours(12))) as Date);
		return Array.from({ length: Math.max(1, this.getDays()) }, (_, i) => new Date(first.getFullYear(), first.getMonth(), first.getDate() + i));
	}
	private map(): Map<string, string> {
		return new Map(this.getEntries().map((entry) => {
			const date = toDate(entry.getDate());
			return [`${date ? isoDate(date) : ""}|${entry.getPerson()}`, entry.getShift()];
		}));
	}
	onclick(event: Press): void {
		const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-at]");
		if (!cell || this.getReadOnly()) return;
		this.at = cell.dataset.at as string;
		const [p, d] = this.at.split("|").map(Number);
		const person = this.getPeople()[p];
		const date = isoDate(this.list()[d]);
		const keys = [...this.getShifts().map((shift) => shift.getKey()), ""];
		const shift = keys[(keys.indexOf(this.map().get(`${date}|${person}`) ?? "") + 1) % keys.length];
		this.fireChange({ person, date, shift });
	}
	onkeydown(event: KeyboardEvent): void {
		const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-at]");
		const side = isRtl() ? -1 : 1;
		const step = { ArrowRight: [0, side], ArrowLeft: [0, -side], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[event.key];
		if (!cell || !step) return;
		event.preventDefault();
		const [p, d] = (cell.dataset.at as string).split("|").map(Number);
		const to = (this.getDomRef() as HTMLElement).querySelector<HTMLElement>(`[data-at="${p + step[0]}|${d + step[1]}"]`);
		if (!to) return;
		this.at = to.dataset.at as string;
		cell.tabIndex = -1;
		to.tabIndex = 0;
		to.focus();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: ShiftRoster) {
			const days = c.list();
			const map = c.map();
			const people = c.getPeople();
			const shifts = c.getShifts();
			const now = isoDate(new Date());
			const byKey = new Map(shifts.map((shift) => [shift.getKey(), shift]));
			const mark = (shift: ShiftType | undefined) => {
				if (!shift) return;
				renderIcon(rm, shift.getIcon() || "clock");
				rm.openStart("span").openEnd().text(shift.getShort() || shift.getTitle()).close("span");
			};
			rm.openStart("section", c).class("korRoster").attr("aria-label", c.getLabel() || message("ROSTER")).openEnd();
			rm.openStart("div").class("korRosterKey").openEnd();
			shifts.forEach((shift) => {
				rm.openStart("span", shift).class(`korTone${shift.getTone()}`).class("korRosterChip").openEnd();
				renderIcon(rm, shift.getIcon() || "clock");
				rm.openStart("span").openEnd().text(`${shift.getTitle()} ${shift.getTime()}`.trim()).close("span").close("span");
			});
			rm.close("div");
			rm.openStart("div").class("korRosterScroll").openEnd().openStart("table").openEnd().openStart("thead").openEnd().openStart("tr").openEnd().openStart("td").openEnd().close("td");
			days.forEach((day) => {
				rm.openStart("th").attr("scope", "col");
				if (day.getDay() % 6 === 0) rm.class("korRosterRest");
				if (isoDate(day) === now) rm.class("korRosterNow").attr("aria-current", "date");
				rm.openEnd().openStart("span").openEnd().text(dateText(day, "EEE")).close("span").openStart("b").class("korNum").openEnd().text(dateText(day, "d MMM")).close("b").close("th");
			});
			rm.close("tr").close("thead").openStart("tbody").openEnd();
			people.forEach((person, p) => {
				rm.openStart("tr").openEnd().openStart("th").attr("scope", "row").openEnd().openStart("span").class("korRosterWho").openEnd();
				renderFace(rm, person);
				rm.openStart("span").openEnd().text(person).close("span").close("span").close("th");
				days.forEach((day, d) => {
					const shift = byKey.get(map.get(`${isoDate(day)}|${person}`) ?? "");
					const at = `${p}|${d}`;
					rm.openStart("td").openEnd();
					const tag = c.getReadOnly() ? "span" : "button";
					rm.openStart(tag, `${c.getId()}-c${p}-${d}`).class("korRosterCell");
					if (shift) rm.class("korRosterChip").class(`korTone${shift.getTone()}`);
					if (tag === "button") rm.attr("type", "button").attr("data-at", at).attr("tabindex", at === c.at ? "0" : "-1").attr("aria-label", `${person}, ${dateText(day, "d MMMM")}: ${shift ? shift.getTitle() : message("DAY_OFF")}`);
					rm.openEnd();
					if (shift) mark(shift);
					else rm.text("–");
					rm.close(tag).close("td");
				});
				rm.close("tr");
			});
			rm.close("tbody");
			const need = shifts.filter((shift) => shift.getNeed() > 0);
			if (need.length) {
				rm.openStart("tfoot").openEnd();
				need.forEach((shift) => {
					rm.openStart("tr").openEnd().openStart("th").attr("scope", "row").openEnd().text(shift.getTitle()).close("th");
					days.forEach((day) => {
						const have = people.filter((person) => map.get(`${isoDate(day)}|${person}`) === shift.getKey()).length;
						rm.openStart("td").class("korNum");
						if (have < shift.getNeed()) rm.class("korRosterLow");
						rm.openEnd();
						if (have < shift.getNeed()) renderIcon(rm, "triangle-alert");
						rm.text(`${num(have)} / ${num(shift.getNeed())}`).close("td");
					});
					rm.close("tr");
				});
				rm.close("tfoot");
			}
			rm.close("table").close("div").close("section");
		}
	};
}
