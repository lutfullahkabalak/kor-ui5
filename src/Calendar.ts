import Core from "sap/ui/core/Core";
import LocaleData from "sap/ui/core/LocaleData";
import DateFormat from "sap/ui/core/format/DateFormat";
import { dateText, esc, iconHtml, isRtl, isoDate, message, reducedMotion, toDate } from "./util";

export type CalendarOptions = {
	id: string;
	range?: boolean;
	start?: Date;
	end?: Date;
	min?: Date;
	max?: Date;
	workdays?: boolean;
	marks?: Record<string, string>;
	presets?: boolean;
	onPick(start: Date, end?: Date): void;
	onClear?(): void;
};
type View = "days" | "months" | "years";

const add = (date: Date, days: number): Date => new Date(date.getFullYear(), date.getMonth(), date.getDate() + days);
/** Ay ekler; 31 Ocak + 1 ay = 28 Şubat */
const addMonths = (date: Date, months: number): Date => {
	const first = new Date(date.getFullYear(), date.getMonth() + months, 1);
	return new Date(first.getFullYear(), first.getMonth(), Math.min(date.getDate(), new Date(first.getFullYear(), first.getMonth() + 1, 0).getDate()));
};
const today = (): Date => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), now.getDate());
};
// 1.108 tiplerinde getInstance yok
const localeData = (): { getFirstDayOfWeek(): number; getDatePattern(style: string): string } =>
	(LocaleData as unknown as { getInstance(locale: unknown): never }).getInstance(Core.getConfiguration().getFormatSettings().getFormatLocale());
const weekStart = (): number => localeData().getFirstDayOfWeek();

export function showDate(value: unknown): string {
	const date = toDate(value);
	return date ? (DateFormat.getDateInstance({ style: "medium" }).format(date) as string) : "";
}

/** "bugün", "+3", "15", "15.12", "15.12.26" ve yerel biçimi anlar; anlamazsa undefined */
export function readDate(text: string): Date | undefined {
	const raw = text.trim().toLocaleLowerCase(Core.getConfiguration().getLanguageTag());
	if (!raw) return undefined;
	const words = message("DATE_WORDS").split(",");
	const word = words.indexOf(raw);
	if (word >= 0) return add(today(), word);
	const step = /^([+-])\s*(\d{1,4})$/.exec(raw);
	if (step) return add(today(), Number(step[1] + step[2]));
	const iso = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(raw);
	const now = today();
	const make = (y: number, m: number, d: number): Date | undefined => {
		const date = new Date(y, m - 1, d);
		return date.getMonth() === m - 1 && date.getDate() === d ? date : undefined;
	};
	if (iso) return make(Number(iso[1]), Number(iso[2]), Number(iso[3]));
	const parts = /^(\d{1,2})(?:[./\-\s](\d{1,2})(?:[./\-\s](\d{2}|\d{4}))?)?[./]?$/.exec(raw);
	if (parts) {
		const year = parts[3] ? Number(parts[3].length === 2 ? `20${parts[3]}` : parts[3]) : now.getFullYear();
		// Ay önce yazılan yerellerde (en-US) sıra çevrilir
		const monthFirst = !!parts[2] && /^M/.test(localeData().getDatePattern("short"));
		const [a, b] = [Number(parts[1]), Number(parts[2] ?? now.getMonth() + 1)];
		return monthFirst ? make(year, a, b) : make(year, b, a);
	}
	return (DateFormat.getDateInstance({ style: "medium" }) as unknown as { parse(text: string): Date | null }).parse(text.trim()) ?? undefined;
}

export function allowed(date: Date, o: Pick<CalendarOptions, "min" | "max" | "workdays">): boolean {
	return !(o.min && date < o.min) && !(o.max && date > o.max) && !(o.workdays && (date.getDay() === 0 || date.getDay() === 6));
}

/**
 * Alanların içinde açılan takvim (iç kullanım). Odak yazı alanında kalır; tuşlar `key` ile iletilir.
 */
export default class Calendar {
	readonly element = document.createElement("div");
	private cursor: Date;
	private month: Date;
	private view: View = "days";
	private start?: Date;
	private end?: Date;
	private hover?: Date;
	/** Kullanıcı ok tuşlarıyla takvime girdi */
	active = false;

	constructor(private readonly o: CalendarOptions) {
		this.start = o.start;
		this.end = o.end;
		this.cursor = o.start ?? today();
		this.month = new Date(this.cursor.getFullYear(), this.cursor.getMonth(), 1);
		this.element.className = `korCal${o.range ? " korCalRange" : ""}`;
		this.element.id = `${o.id}-cal`;
		this.element.setAttribute("role", "dialog");
		this.element.setAttribute("aria-label", message("CALENDAR"));
		// Odak yazı alanından ayrılmasın (pencere içindeki odak tuzaklarıyla da uyumlu)
		this.element.addEventListener("pointerdown", (event) => event.preventDefault());
		this.element.addEventListener("mousedown", (event) => event.preventDefault());
		this.element.addEventListener("click", (event) => this.click(event.target as HTMLElement));
		this.element.addEventListener("pointerover", (event) => {
			const day = (event.target as HTMLElement).closest<HTMLElement>("[data-day]")?.dataset.day;
			if (day && this.o.range && this.start && !this.end) {
				this.hover = toDate(day);
				this.mark();
			}
		});
		this.element.addEventListener("pointerleave", () => {
			this.hover = undefined;
			this.mark();
		});
		this.paint();
	}
	cursorId(): string {
		return this.view === "days" ? `${this.o.id}-d${isoDate(this.cursor)}` : "";
	}
	/** Yazılan tarih takvimde gösterilir */
	follow(date: Date): void {
		this.cursor = date;
		if (!this.o.range) this.start = date;
		this.go(new Date(date.getFullYear(), date.getMonth(), 1));
	}
	/** Yazı alanından gelen tuş; işlendiyse true */
	key(event: KeyboardEvent): boolean {
		if (this.view !== "days") this.view = "days";
		const side = isRtl() ? -1 : 1;
		const week = (this.cursor.getDay() - weekStart() + 7) % 7;
		let to: Date | undefined;
		if (event.key === "ArrowDown") to = this.active ? add(this.cursor, 7) : this.cursor;
		else if (event.key === "ArrowUp" && this.active) to = add(this.cursor, -7);
		else if (event.key === "ArrowRight" && this.active) to = add(this.cursor, side);
		else if (event.key === "ArrowLeft" && this.active) to = add(this.cursor, -side);
		else if (event.key === "PageDown") to = addMonths(this.cursor, event.shiftKey ? 12 : 1);
		else if (event.key === "PageUp") to = addMonths(this.cursor, event.shiftKey ? -12 : -1);
		else if (event.key === "Home" && this.active) to = add(this.cursor, -week);
		else if (event.key === "End" && this.active) to = add(this.cursor, 6 - week);
		else if (event.key === "Enter" && this.active) {
			this.pick(this.cursor);
			return true;
		}
		if (!to) return false;
		this.active = true;
		this.cursor = to;
		if (this.o.range && this.start && !this.end) this.hover = to;
		const offset = (to.getFullYear() - this.month.getFullYear()) * 12 + to.getMonth() - this.month.getMonth();
		if (offset < 0 || offset >= this.panes()) this.go(new Date(to.getFullYear(), to.getMonth() - (offset > 0 ? this.panes() - 1 : 0), 1));
		else this.paint();
		return true;
	}
	private panes(): number {
		return this.o.range && window.innerWidth > 720 ? 2 : 1;
	}
	private go(month: Date): void {
		const dir = Math.sign(month.getTime() - this.month.getTime()) * (isRtl() ? -1 : 1);
		this.month = month;
		this.paint();
		if (dir && !reducedMotion()) this.element.querySelectorAll(".korCalGrid").forEach((el) => el.animate([{ opacity: 0, transform: `translateX(${dir * 18}px)` }, { opacity: 1, transform: "none" }], { duration: 220, easing: "cubic-bezier(.2,.8,.2,1)" }));
	}
	private click(target: HTMLElement): void {
		const get = (name: string) => target.closest<HTMLElement>(`[data-${name}]`)?.dataset[name];
		const step = get("step");
		const day = get("day");
		const month = get("month");
		const year = get("year");
		const preset = get("preset");
		if (day) this.pick(toDate(day)!);
		else if (step) {
			const months = this.view === "days" ? 1 : this.view === "months" ? 12 : 144;
			this.go(addMonths(this.month, Number(step) * months));
		} else if (month) {
			this.view = "days";
			this.go(new Date(this.month.getFullYear(), Number(month), 1));
		} else if (year) {
			this.view = "months";
			this.go(new Date(Number(year), this.month.getMonth(), 1));
		} else if (get("title")) {
			this.view = this.view === "days" ? "months" : this.view === "months" ? "years" : "days";
			this.paint();
		} else if (get("today")) {
			if (this.o.range) this.go(new Date(today().getFullYear(), today().getMonth(), 1));
			else if (allowed(today(), this.o)) this.pick(today());
		} else if (get("clear")) this.o.onClear?.();
		else if (preset) {
			const [a, b] = this.preset(preset);
			this.o.onPick(a, b);
		}
	}
	private pick(date: Date): void {
		if (!allowed(date, this.o)) return;
		this.cursor = date;
		if (!this.o.range) {
			this.o.onPick(date);
			return;
		}
		if (!this.start || this.end) {
			this.start = date;
			this.end = undefined;
			this.hover = undefined;
			this.paint();
			return;
		}
		const [a, b] = date < this.start ? [date, this.start] : [this.start, date];
		this.start = a;
		this.end = b;
		this.o.onPick(a, b);
	}
	private preset(key: string): [Date, Date] {
		const t = today();
		const monday = add(t, -((t.getDay() - weekStart() + 7) % 7));
		const q = Math.floor(t.getMonth() / 3) * 3;
		const y = t.getFullYear();
		const map: Record<string, [Date, Date]> = {
			WEEK: [monday, add(monday, 6)],
			MONTH: [new Date(y, t.getMonth(), 1), new Date(y, t.getMonth() + 1, 0)],
			LASTMONTH: [new Date(y, t.getMonth() - 1, 1), new Date(y, t.getMonth(), 0)],
			LAST30: [add(t, -29), t],
			QUARTER: [new Date(y, q, 1), new Date(y, q + 3, 0)],
			YEAR: [new Date(y, 0, 1), new Date(y, 11, 31)]
		};
		return map[key];
	}
	private mark(): void {
		const edge = this.start && !this.end ? this.hover : this.end;
		const [a, b] = this.start && edge ? (edge < this.start ? [edge, this.start] : [this.start, edge]) : [this.start, this.start];
		this.element.querySelectorAll<HTMLElement>("[data-day]").forEach((el) => {
			const date = toDate(el.dataset.day)!;
			const at = date.getTime();
			const isA = at === a?.getTime();
			const isB = at === b?.getTime();
			el.classList.toggle("korDayOn", isA || isB);
			el.classList.toggle("korDayA", !!this.o.range && isA && a !== b);
			el.classList.toggle("korDayB", !!this.o.range && isB && a !== b);
			el.classList.toggle("korDayIn", !!this.o.range && !!a && !!b && at > a.getTime() && at < b.getTime());
			el.classList.toggle("korDayCursor", this.active && at === this.cursor.getTime());
			el.setAttribute("aria-selected", String(isA || isB || el.classList.contains("korDayIn")));
		});
		const sum = this.element.querySelector(".korCalSum");
		if (sum) sum.textContent = a && edge ? `${dateText(a, "d MMM")} – ${dateText(b, "d MMM y")}, ${message("DAY_COUNT", [Math.round((b!.getTime() - a.getTime()) / 86400000) + 1])}` : message(a ? "PICK_END" : "PICK_START");
	}
	private pane(month: Date): string {
		const first = weekStart();
		const from = add(month, -((month.getDay() - first + 7) % 7));
		const t = today().getTime();
		const names = Array.from({ length: 7 }, (_, i) => add(from, i)).map((d) => `<span role="columnheader" aria-label="${esc(dateText(d, "EEEE"))}">${esc(dateText(d, "EEE"))}</span>`).join("");
		let rows = "";
		for (let w = 0; w < 6; w++) {
			const line = Array.from({ length: 7 }, (_, i) => add(from, w * 7 + i));
			rows += `<div role="row" class="korCalRow"><span class="korCalWeek" role="rowheader">${this.o.range && line.every((d) => d.getMonth() !== month.getMonth()) ? "" : esc(dateText(line[0], "w"))}</span>${line
				.map((d) => {
					if (d.getMonth() !== month.getMonth()) return `<span role="gridcell"${this.o.range ? ">" : ` class="korDay korDayOut" data-day="${isoDate(d)}">${d.getDate()}`}</span>`;
					const off = !allowed(d, this.o);
					const note = this.o.marks?.[isoDate(d)];
					return `<span role="gridcell" id="${this.o.id}-d${isoDate(d)}" class="korDay${d.getTime() === t ? " korDayToday" : ""}${d.getDay() % 6 === 0 ? " korDayRest" : ""}${off ? " korDayOff" : ""}${note ? " korDayNote" : ""}" data-day="${isoDate(d)}" aria-label="${esc(`${dateText(d, "d MMMM y EEEE")}${note ? `, ${note}` : ""}`)}"${off ? ' aria-disabled="true"' : ""}${d.getTime() === t ? ' aria-current="date"' : ""}${note ? ` title="${esc(note)}"` : ""}><i>${d.getDate()}</i></span>`;
				})
				.join("")}</div>`;
		}
		return `<div class="korCalPane"><div class="korCalGrid" role="grid" aria-label="${esc(dateText(month, "LLLL y"))}"><div role="row" class="korCalRow korCalNames"><span class="korCalWeek"></span>${names}</div>${rows}</div></div>`;
	}
	private paint(): void {
		const count = this.panes();
		const months = Array.from({ length: count }, (_, i) => new Date(this.month.getFullYear(), this.month.getMonth() + i, 1));
		const y = this.month.getFullYear();
		const decade = y - (y % 12);
		const nav = (step: number) => `<button type="button" tabindex="-1" class="korCalNav" data-step="${step}" aria-label="${esc(message(step < 0 ? "PREV" : "NEXT"))}">${iconHtml((step < 0) === !isRtl() ? "chevron-left" : "chevron-right")}</button>`;
		const title = (d: Date) => (this.view === "days" ? `<b>${esc(dateText(d, "LLLL"))}</b> ${d.getFullYear()}` : this.view === "months" ? `<b>${y}</b>` : `<b>${decade} – ${decade + 11}</b>`);
		const shown = this.view === "days" ? months : [this.month];
		let body: string;
		if (this.view === "days") body = months.map((m) => this.pane(m)).join("");
		else if (this.view === "months") body = `<div class="korCalPick">${Array.from({ length: 12 }, (_, i) => `<button type="button" tabindex="-1" data-month="${i}" class="${i === this.month.getMonth() ? "korOn" : ""}">${esc(dateText(new Date(y, i, 1), "LLLL"))}</button>`).join("")}</div>`;
		else body = `<div class="korCalPick">${Array.from({ length: 12 }, (_, i) => decade + i).map((n) => `<button type="button" tabindex="-1" data-year="${n}" class="${n === y ? "korOn" : ""}">${n}</button>`).join("")}</div>`;
		const presets = this.o.presets ? `<div class="korCalSide">${["WEEK", "MONTH", "LASTMONTH", "LAST30", "QUARTER", "YEAR"].map((k) => `<button type="button" tabindex="-1" data-preset="${k}">${esc(message(`RANGE_${k}`))}</button>`).join("")}</div>` : "";
		this.element.innerHTML = `${presets}<div class="korCalMain"><div class="korCalHead">${nav(-1)}${shown.map((d) => `<button type="button" tabindex="-1" class="korCalTitle" data-title="1" aria-live="polite">${title(d)}</button>`).join("")}${nav(1)}</div><div class="korCalPanes">${body}</div><div class="korCalFoot"><button type="button" tabindex="-1" data-today="1">${esc(message("TODAY"))}</button>${this.o.range ? '<span class="korCalSum"></span>' : '<span class="korCalSum0"></span>'}${this.o.onClear ? `<button type="button" tabindex="-1" data-clear="1">${esc(message("CLEAR"))}</button>` : ""}</div></div>`;
		this.mark();
	}
}
