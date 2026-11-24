import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import Calendar, { allowed, readDate, showDate } from "./Calendar";
import type { Press } from "./util";
import { Float, dateValue, message, renderIcon, toDate } from "./util";
import "./library";

/**
 * Tarih aralığı: iki ay yan yana, hazır aralıklar, gün sayısı.
 *
 * @namespace kor.ui
 */
export default class DateRangeField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DateRangeFieldSettings);
	constructor(id?: string, settings?: $DateRangeFieldSettings);
	constructor(id?: string, settings?: $DateRangeFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Başlangıç: yyyy-MM-dd veya Date */
			start: { type: "any", defaultValue: null, bindable: "bindable" },
			/** Bitiş (dahil) */
			end: { type: "any", defaultValue: null, bindable: "bindable" },
			/** Hazır aralıklar gösterilsin */
			presets: { type: "boolean", defaultValue: true },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Yer tutucu */
			placeholder: { type: "string", defaultValue: "" },
			/** Yardım metni */
			help: { type: "string", defaultValue: "" },
			/** Hata metni */
			error: { type: "string", defaultValue: "" },
			/** En erken gün */
			min: { type: "any" },
			/** En geç gün */
			max: { type: "any" },
			/** Hafta sonu seçilemez */
			workdays: { type: "boolean", defaultValue: false },
			/** İşaretli günler: { "2026-12-31": "Yılbaşı arifesi" } */
			marks: { type: "object" },
			/** Zorunlu */
			required: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Değer değişti */
			change: { parameters: { start: { type: "any" }, end: { type: "any" } } }
		}
	};
	private float?: Float;
	private calendar?: Calendar;
	private bad = "";

	private input(): HTMLInputElement {
		return this.getDomRef("in") as unknown as HTMLInputElement;
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("in") ?? this.getDomRef()) as Element;
	}
	getIdForLabel(): string {
		return `${this.getId()}-in`;
	}
	private shown(): string {
		const a = toDate(this.getStart());
		const b = toDate(this.getEnd());
		return a ? `${showDate(a)} – ${showDate(b ?? a)}` : "";
	}
	private rules(): { min?: Date; max?: Date; workdays: boolean } {
		return { min: toDate(this.getMin()), max: toDate(this.getMax()), workdays: this.getWorkdays() };
	}
	private store(a?: Date, b?: Date): void {
		const model = this.getBinding("start")?.getModel();
		const put = (d?: Date) => (d ? dateValue(d, this.getStart(), model) : null);
		const start = put(a);
		const end = put(b ?? a);
		const same = String(toDate(this.getStart())) === String(a) && String(toDate(this.getEnd())) === String(b ?? a);
		this.bad = "";
		this.setStart(start);
		this.setEnd(end);
		this.invalidate();
		if (!same) this.fireChange({ start, end });
	}
	private fail(key: string): void {
		this.bad = message(key);
		this.invalidate();
	}
	private commit(text: string): void {
		const parts = text.split(/\s*[–—]\s*|\s+-\s+|\.\.\.?(?=\s*\d)/).filter(Boolean);
		const a = readDate(parts[0] ?? "");
		const b = parts.length > 1 ? readDate(parts[1]) : a;
		if (!text.trim()) this.store();
		else if (!a || !b || parts.length > 2) this.fail("DATE_BAD");
		else if (!allowed(a, this.rules()) || !allowed(b, this.rules())) this.fail("DATE_OFF");
		else this.store(a < b ? a : b, a < b ? b : a);
	}
	onAfterRendering(): void {
		if (!this.bad && !this.float) this.input().value = this.shown();
	}
	private open(): void {
		if (this.float || !this.getEnabled()) return;
		const input = this.input();
		const close = () => this.float?.close();
		this.calendar = new Calendar({
			id: this.getId(), range: true, presets: this.getPresets(), start: toDate(this.getStart()), end: toDate(this.getEnd()), ...this.rules(), marks: this.getMarks() as Record<string, string> | undefined,
			onPick: (a, b) => { close(); this.store(a, b); },
			onClear: () => { close(); this.store(); }
		});
		this.float = new Float(input.closest(".korBox") as HTMLElement, this.calendar.element, () => {
			this.float = undefined;
			this.calendar = undefined;
			this.input()?.setAttribute("aria-expanded", "false");
			this.input()?.removeAttribute("aria-activedescendant");
		}, false);
		input.setAttribute("aria-expanded", "true");
	}
	onmousedown(event: Press & { preventDefault(): void }): void {
		// Düğme odağı yazı alanından almasın
		if ((event.target as HTMLElement).closest("[data-cal]")) event.preventDefault();
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		if (target.closest("[data-cal]")) {
			this.input().focus();
			if (this.float) this.float.close();
			else this.open();
		} else if (target === this.input()) this.open();
	}
	oninput(): void {
		if (this.calendar) {
			this.calendar.active = false;
			const date = readDate(this.input().value);
			if (date) this.calendar.follow(date);
		}
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		if (event.target !== this.input()) return;
		if (!this.float && (event.key === "ArrowDown" || event.key === "F4")) {
			event.preventDefault();
			this.open();
			if (event.key === "ArrowDown") this.calendar?.key(event);
			this.input().setAttribute("aria-activedescendant", this.calendar?.cursorId() ?? "");
		} else if (event.key === "Escape" && this.float) {
			event.preventDefault();
			event.stopPropagation();
			this.float.close();
		} else if (event.key === "Tab") this.float?.close();
		else if (this.calendar?.key(event)) {
			event.preventDefault();
			this.input().setAttribute("aria-activedescendant", this.calendar?.cursorId() ?? "");
		} else if (event.key === "Enter") {
			this.float?.close();
			if (this.input().value !== this.shown()) this.commit(this.input().value);
		}
	}
	onfocusout(): void {
		const input = this.input();
		this.float?.close();
		if (input && input.value !== this.shown()) this.commit(input.value);
		else if (this.bad) {
			this.bad = "";
			this.invalidate();
		}
	}
	exit(): void {
		this.float?.close();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: DateRangeField) {
			const id = c.getId();
			const error = c.bad || c.getError();
			const note = error || c.getHelp();
			rm.openStart("div", c).class("korField");
			if (error) rm.class("korFieldError");
			rm.openEnd();
			if (c.getLabel()) {
				rm.openStart("label").class("korLabel").attr("for", `${id}-in`).openEnd().text(c.getLabel());
				if (c.getRequired()) rm.openStart("span").class("korRequired").attr("aria-hidden", "true").openEnd().text("*").close("span");
				rm.close("label");
			}
			rm.openStart("div").class("korBox").openEnd();
			rm.voidStart("input", `${id}-in`).class("korInput").class("korNumber").attr("role", "combobox").attr("aria-haspopup", "dialog").attr("aria-expanded", "false").attr("aria-controls", `${id}-cal`).attr("autocomplete", "off").attr("placeholder", c.getPlaceholder());
			if (!c.getLabel()) rm.attr("aria-label", c.getPlaceholder() || message("CALENDAR"));
			if (c.getRequired()) rm.attr("aria-required", "true");
			if (error) rm.attr("aria-invalid", "true");
			if (note) rm.attr("aria-describedby", `${id}-note`);
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.voidEnd();
			rm.openStart("button").attr("type", "button").class("korCalOpen").attr("tabindex", "-1").attr("data-cal", "1").attr("aria-label", message("OPEN_CALENDAR"));
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.openEnd();
			renderIcon(rm, "calendar-range");
			rm.close("button").close("div");
			if (note) {
				rm.openStart("div", `${id}-note`).class("korNote").openEnd();
				if (error) renderIcon(rm, "circle-alert");
				rm.text(note).close("div");
			}
			rm.close("div");
		}
	};
}
