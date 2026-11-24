import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type FilterField from "./FilterField";
import type { Press } from "./util";
import { Float, esc, message, num, parseNum, renderIcon } from "./util";
import "./library";

// Etiket ≥ ve ≤ gösterir; GT/LT adları dışarıya verilmiş sözleşmedir
const operators = { Contains: FilterOperator.Contains, EQ: FilterOperator.EQ, GT: FilterOperator.GE, LT: FilterOperator.LE };
type Token = { field: FilterField; op: "Contains" | "EQ" | "GT" | "LT"; value: string | number };

/**
 * Akıllı süzgeç: yazılanı alanlara göre yorumlar, hazır UI5 Filter dizisi verir.
 *
 * @namespace kor.ui
 */
export default class FilterBar extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FilterBarSettings);
	constructor(id?: string, settings?: $FilterBarSettings);
	constructor(id?: string, settings?: $FilterBarSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "fields",
		properties: {
			/** Yer tutucu */
			placeholder: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Süzülebilen alanlar */
			fields: { type: "kor.ui.FilterField", multiple: true, singularName: "field" }
		},
		events: {
			/** Kaydedilebilir durum değişti */
			stateChange: {},
			/** Süzgeç değişti; filters doğrudan ListBinding.filter'a verilir */
			change: { parameters: { filters: { type: "object" } } }
		}
	};
	private tokens: Token[] = [];
	private hits: Token[] = [];
	private active = 0;
	private float?: Float;

	private input(): HTMLInputElement {
		return this.getDomRef("in") as unknown as HTMLInputElement;
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("in") ?? this.getDomRef()) as Element;
	}
	/** Geçerli süzgeçler: aynı alan VEYA, farklı alanlar VE */
	getFilters(): Filter[] {
		const groups = new Map<string, Token[]>();
		this.tokens.forEach((t) => {
			const key = `${t.field.getPath()}|${t.op === "EQ" || t.op === "Contains" ? "any" : t.op}`;
			groups.set(key, [...(groups.get(key) ?? []), t]);
		});
		return [...groups.values()].map((list) => new Filter({ filters: list.map((t) => new Filter(t.field.getPath(), operators[t.op], t.value)), and: false }));
	}
	/** Kod ile süzgeç ekler */
	addToken(path: string, op: Token["op"], value: string | number): void {
		const field = this.getFields().find((f) => f.getPath() === path);
		if (field) this.add({ field, op, value });
	}
	/** Tümünü kaldırır */
	clear(): void {
		this.tokens = [];
		this.changed();
	}
	/** Kaydedilebilir süzgeç */
	getState(): object {
		return this.tokens.map((t) => ({ path: t.field.getPath(), op: t.op, value: t.value }));
	}
	/** `getState` çıktısını geri yükler */
	setState(state: { path: string; op: Token["op"]; value: string | number }[]): void {
		this.tokens = (state ?? []).flatMap((t) => {
			const field = this.getFields().find((f) => f.getPath() === t.path);
			return field ? [{ field, op: t.op, value: t.value }] : [];
		});
		this.changed();
	}
	private add(token: Token): void {
		if (!this.tokens.some((t) => t.field === token.field && t.op === token.op && t.value === token.value)) this.tokens.push(token);
		if (this.getDomRef()) this.input().value = "";
		this.float?.close();
		this.changed();
	}
	private changed(): void {
		this.invalidate();
		this.fireChange({ filters: this.getFilters() });
		this.fireStateChange();
	}
	private label(t: Token): { name: string; op: string; value: string } {
		const op = { Contains: message("CONTAINS"), EQ: "=", GT: "≥", LT: "≤" }[t.op];
		return { name: t.field.getLabel(), op, value: typeof t.value === "number" ? `${num(t.value)} ${t.field.getUnit()}`.trim() : t.value };
	}
	private suggest(text: string): Token[] {
		const raw = text.trim();
		const q = raw.toLocaleLowerCase();
		const out: Token[] = [];
		const scaled = /^([<>]?)=?\s*([\d.,]+)\s*(b|bin|k|m|mn)?$/i.exec(raw);
		this.getFields().forEach((field) => {
			if (field.getType() === "option") {
				((field.getOptions() as string[]) ?? []).filter((o) => !q || o.toLocaleLowerCase().includes(q) || field.getLabel().toLocaleLowerCase().includes(q)).forEach((value) => out.push({ field, op: "EQ", value }));
			} else if (field.getType() === "number" && scaled) {
				const unit = (scaled[3] ?? "").toLowerCase();
				const value = parseNum(scaled[2]) * (unit.startsWith("m") ? 1e6 : unit ? 1e3 : 1);
				if (Number.isFinite(value)) {
					if (scaled[1] !== "<") out.push({ field, op: "GT", value });
					if (scaled[1] !== ">") out.push({ field, op: "LT", value });
				}
			} else if (field.getType() === "text" && raw && !/^[<>]/.test(raw)) out.push({ field, op: "Contains", value: raw });
		});
		return out.filter((t) => !this.tokens.some((x) => x.field === t.field && x.op === t.op && x.value === t.value)).slice(0, 9);
	}
	private open(): void {
		this.hits = this.suggest(this.input().value);
		this.active = Math.min(this.active, Math.max(0, this.hits.length - 1));
		if (!this.hits.length) {
			this.float?.close();
			return;
		}
		if (!this.float) {
			const list = document.createElement("div");
			list.className = "korMenu korList";
			list.id = `${this.getId()}-list`;
			list.setAttribute("role", "listbox");
			list.addEventListener("pointerdown", (event) => {
				event.preventDefault();
				const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
				if (i !== undefined) this.add(this.hits[Number(i)]);
			});
			this.float = new Float(this.getDomRef() as HTMLElement, list, () => {
				this.float = undefined;
				this.input()?.setAttribute("aria-expanded", "false");
			});
			this.input().setAttribute("aria-expanded", "true");
		}
		this.float.element.innerHTML = `<div class="korMenuHead">${esc(message("EXAMPLES"))}</div>${this.hits.map((t, i) => { const l = this.label(t); return `<div role="option" id="${this.getId()}-o${i}" data-i="${i}" aria-selected="${i === this.active}" class="korMenuItem${i === this.active ? " korMenuActive" : ""}"><span class="korTokenName">${esc(l.name)}</span><span class="korTokenOp">${esc(l.op)}</span><b>${esc(l.value)}</b></div>`; }).join("")}`;
		this.input().setAttribute("aria-activedescendant", `${this.getId()}-o${this.active}`);
		this.float.place();
	}
	oninput(): void {
		this.active = 0;
		this.open();
	}
	onfocusin(event: Press): void {
		if (event.target === this.input()) this.open();
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.target !== this.input()) return;
		const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
		if (step) {
			event.preventDefault();
			if (this.float) this.active = (this.active + step + this.hits.length) % this.hits.length;
			this.open();
		} else if (event.key === "Enter" && this.float) {
			event.preventDefault();
			this.add(this.hits[this.active]);
		} else if (event.key === "Escape" && this.float) {
			event.preventDefault();
			event.stopPropagation();
			this.float.close();
		} else if (event.key === "Backspace" && !this.input().value && this.tokens.length) {
			this.tokens.pop();
			this.float?.close();
			this.changed();
		} else if (event.key === "Tab") this.float?.close();
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const at = target.closest<HTMLElement>("[data-drop]")?.dataset.drop;
		if (at !== undefined) {
			this.tokens.splice(Number(at), 1);
			this.changed();
		} else if (target.closest("[data-clear]")) this.clear();
		else if (target === this.input()) this.open();
		else this.input().focus();
	}
	exit(): void {
		this.float?.close();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: FilterBar) {
			const id = c.getId();
			rm.openStart("div", c).class("korFilter").openEnd();
			renderIcon(rm, "funnel");
			c.tokens.forEach((t, i) => {
				const l = c.label(t);
				rm.openStart("span").class("korToken").openEnd();
				rm.openStart("span").class("korTokenName").openEnd().text(l.name).close("span");
				rm.openStart("span").class("korTokenOp").openEnd().text(l.op).close("span");
				rm.openStart("b").openEnd().text(l.value).close("b");
				rm.openStart("button").attr("type", "button").attr("data-drop", i).attr("aria-label", `${message("CLEAR")}: ${l.name} ${l.value}`).openEnd();
				renderIcon(rm, "x");
				rm.close("button").close("span");
			});
			const hint = c.getPlaceholder() || message("FILTER_PLACEHOLDER");
			rm.voidStart("input", `${id}-in`).class("korFilterInput").attr("role", "combobox").attr("aria-expanded", "false").attr("aria-controls", `${id}-list`).attr("autocomplete", "off").attr("spellcheck", "false").attr("aria-label", hint).attr("placeholder", c.tokens.length ? "" : hint).voidEnd();
			if (c.tokens.length) rm.openStart("button").attr("type", "button").class("korFilterClear").attr("data-clear", "1").openEnd().text(message("CLEAR")).close("button");
			rm.close("div");
		}
	};
}
