import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { minutesOf, readTime, showTime, timeValue } from "./time";
import type { Press } from "./util";
import { Float, esc, iconHtml, message, renderIcon } from "./util";
import "./library";

/**
 * Saat alanı: listeden seçilir ya da yazılır ("9", "930", "14.30", "şimdi", "+30").
 *
 * @namespace kor.ui
 */
export default class TimeField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TimeFieldSettings);
	constructor(id?: string, settings?: $TimeFieldSettings);
	constructor(id?: string, settings?: $TimeFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Saat: HH:mm, HH:mm:ss veya OData V2 Edm.Time */
			value: { type: "any", defaultValue: null, bindable: "bindable" },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Yer tutucu */
			placeholder: { type: "string", defaultValue: "" },
			/** Yardım metni */
			help: { type: "string", defaultValue: "" },
			/** Hata metni */
			error: { type: "string", defaultValue: "" },
			/** En erken saat, HH:mm */
			min: { type: "string", defaultValue: "" },
			/** En geç saat, HH:mm */
			max: { type: "string", defaultValue: "" },
			/** Listedeki aralık, dakika */
			step: { type: "int", defaultValue: 30 },
			/** Zorunlu */
			required: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Değer değişti */
			change: { parameters: { value: { type: "any" } } }
		}
	};
	private float?: Float;
	private slots: number[] = [];
	private active = -1;
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
		return showTime(minutesOf(this.getValue()));
	}
	private limits(): [number, number] {
		return [minutesOf(this.getMin()) ?? 0, minutesOf(this.getMax()) ?? 1439];
	}
	private store(minutes?: number): void {
		const same = minutesOf(this.getValue()) === minutes;
		this.bad = "";
		// Aynı dakika yeniden yazılmaz: saniye korunur
		if (!same) this.setValue(minutes === undefined ? null : timeValue(minutes, this.getValue(), this.getBinding("value")?.getModel()));
		this.invalidate();
		if (!same) this.fireChange({ value: this.getValue() });
	}
	private commit(text: string): void {
		const minutes = readTime(text);
		const [from, until] = this.limits();
		if (!text.trim()) this.store();
		else if (minutes === undefined || minutes < from || minutes > until) {
			this.bad = message(minutes === undefined ? "TIME_BAD" : "TIME_OFF");
			this.invalidate();
		} else this.store(minutes);
	}
	onAfterRendering(): void {
		if (!this.bad && !this.float) this.input().value = this.shown();
	}
	private open(): void {
		if (this.float || !this.getEnabled()) return;
		const [from, until] = this.limits();
		const step = Math.max(1, this.getStep());
		this.slots = [];
		for (let m = from; m <= until; m += step) this.slots.push(m);
		const now = new Date();
		const value = minutesOf(this.getValue());
		const near = value ?? now.getHours() * 60 + now.getMinutes();
		this.active = -1;
		const list = document.createElement("div");
		list.className = "korMenu korTimes";
		list.id = `${this.getId()}-list`;
		list.setAttribute("role", "listbox");
		list.innerHTML = this.slots.map((m, i) => `<div role="option" id="${this.getId()}-o${i}" data-i="${i}" aria-selected="${m === value}" class="korMenuItem"><span class="korNum">${esc(showTime(m))}</span>${m === value ? iconHtml("check") : ""}</div>`).join("");
		list.addEventListener("pointerdown", (event) => {
			event.preventDefault();
			const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
			if (i === undefined) return;
			this.float?.close();
			this.store(this.slots[Number(i)]);
		});
		this.float = new Float(this.input().closest(".korBox") as HTMLElement, list, () => {
			this.float = undefined;
			this.active = -1;
			this.input()?.setAttribute("aria-expanded", "false");
			this.input()?.removeAttribute("aria-activedescendant");
		});
		this.input().setAttribute("aria-expanded", "true");
		const at = Math.max(0, this.slots.findIndex((m) => m >= near));
		list.scrollTop = (list.children[at] as HTMLElement | undefined)?.offsetTop ?? 0;
		this.start = at;
	}
	private start = 0;
	private move(step: number): void {
		if (!this.slots.length) return;
		this.active = this.active < 0 ? this.start : (this.active + step + this.slots.length) % this.slots.length;
		const rows = this.float!.element.children;
		[...rows].forEach((row, i) => row.classList.toggle("korMenuActive", i === this.active));
		rows[this.active].scrollIntoView({ block: "nearest" });
		this.input().setAttribute("aria-activedescendant", rows[this.active].id);
	}
	onmousedown(event: Press & { preventDefault(): void }): void {
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
		this.active = -1;
		this.input().removeAttribute("aria-activedescendant");
		this.float?.element.querySelector(".korMenuActive")?.classList.remove("korMenuActive");
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.target !== this.input()) return;
		const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
		if (step || event.key === "F4") {
			event.preventDefault();
			if (!this.float) this.open();
			if (step && this.float) this.move(step);
		} else if (event.key === "Escape" && this.float) {
			event.preventDefault();
			event.stopPropagation();
			this.float.close();
		} else if (event.key === "Tab") this.float?.close();
		else if (event.key === "Enter") {
			const picked = this.slots[this.active];
			if (this.float && this.active >= 0) {
				event.preventDefault();
				this.float.close();
				this.store(picked);
			} else {
				this.float?.close();
				if (this.input().value !== this.shown()) this.commit(this.input().value);
			}
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
		render(rm: RenderManager, c: TimeField) {
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
			rm.voidStart("input", `${id}-in`).class("korInput").class("korNumber").attr("role", "combobox").attr("aria-expanded", "false").attr("aria-controls", `${id}-list`).attr("autocomplete", "off").attr("placeholder", c.getPlaceholder());
			if (!c.getLabel()) rm.attr("aria-label", c.getPlaceholder() || message("TIME"));
			if (c.getRequired()) rm.attr("aria-required", "true");
			if (error) rm.attr("aria-invalid", "true");
			if (note) rm.attr("aria-describedby", `${id}-note`);
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.voidEnd();
			rm.openStart("button").attr("type", "button").class("korCalOpen").attr("tabindex", "-1").attr("data-cal", "1").attr("aria-label", message("OPEN_TIMES"));
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.openEnd();
			renderIcon(rm, "clock");
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
