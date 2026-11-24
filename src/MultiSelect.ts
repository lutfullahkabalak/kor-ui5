import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type Item from "sap/ui/core/Item";
import type { Press } from "./util";
import { esc, Float, fold, iconHtml, message, renderIcon } from "./util";
import "./library";

/**
 * Yazarak süzülen çoklu seçim.
 *
 * @namespace kor.ui
 */
export default class MultiSelect extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MultiSelectSettings);
	constructor(id?: string, settings?: $MultiSelectSettings);
	constructor(id?: string, settings?: $MultiSelectSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Seçili anahtarlar */
			selectedKeys: { type: "string[]", defaultValue: [], bindable: "bindable" },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Yer tutucu */
			placeholder: { type: "string", defaultValue: "" },
			/** Yardım metni */
			help: { type: "string", defaultValue: "" },
			/** Hata metni */
			error: { type: "string", defaultValue: "" },
			/** Zorunlu */
			required: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Seçenekler */
			items: { type: "sap.ui.core.Item", multiple: true, singularName: "item" }
		},
		events: {
			/** Seçim değişti */
			change: { parameters: { keys: { type: "string[]" } } }
		}
	};
	private float?: Float;
	private hits: Item[] = [];
	private active = 0;

	private input(): HTMLInputElement {
		return this.getDomRef("in") as unknown as HTMLInputElement;
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("in") ?? this.getDomRef()) as Element;
	}
	getIdForLabel(): string {
		return `${this.getId()}-in`;
	}
	private toggle(key: string): void {
		const keys = this.getSelectedKeys();
		const next = keys.includes(key) ? keys.filter((k) => k !== key) : [...keys, key];
		this.setSelectedKeys(next);
		this.input().value = "";
		this.fireChange({ keys: next });
		if (this.float) this.open();
	}
	private open(): void {
		const needle = fold(this.input().value);
		this.hits = this.getItems().filter((item) => fold(item.getText()).includes(needle));
		this.active = Math.min(this.active, Math.max(0, this.hits.length - 1));
		if (!this.float) {
			const list = document.createElement("div");
			list.className = "korMenu korList";
			list.id = `${this.getId()}-list`;
			list.setAttribute("role", "listbox");
			list.setAttribute("aria-multiselectable", "true");
			list.addEventListener("pointerdown", (event) => event.preventDefault());
			list.addEventListener("mousedown", (event) => event.preventDefault());
			list.addEventListener("click", (event) => {
				const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
				if (i !== undefined) {
					this.active = Number(i);
					this.toggle(this.hits[this.active].getKey());
				}
			});
			this.float = new Float(this.input().closest(".korBox") as HTMLElement, list, () => {
				this.float = undefined;
				this.input()?.setAttribute("aria-expanded", "false");
				this.input()?.removeAttribute("aria-activedescendant");
			});
			this.input().setAttribute("aria-expanded", "true");
		}
		const keys = this.getSelectedKeys();
		this.float.element.innerHTML = this.hits.length
			? this.hits.map((item, i) => { const on = keys.includes(item.getKey()); return `<div role="option" id="${this.getId()}-o${i}" data-i="${i}" aria-selected="${on}" class="korMenuItem${i === this.active ? " korMenuActive" : ""}"><span class="korGridCheck${on ? " korOn" : ""}">${iconHtml("check")}</span><span class="korMenuGrow">${esc(item.getText())}</span></div>`; }).join("")
			: `<div class="korMenuNone">${esc(message("NO_RESULT"))}</div>`;
		this.input().setAttribute("aria-activedescendant", this.hits.length ? `${this.getId()}-o${this.active}` : "");
		this.float.element.querySelector(".korMenuActive")?.scrollIntoView({ block: "nearest" });
		this.float.place();
	}
	onAfterRendering(): void {
		// Etiketler satır atlatınca liste yeni yerine taşınır
		if (this.float) this.input().setAttribute("aria-expanded", "true");
		this.float?.place();
	}
	oninput(): void {
		this.active = 0;
		this.open();
	}
	onmousedown(event: Press & { preventDefault(): void }): void {
		if (event.target !== this.input()) event.preventDefault();
	}
	onclick(event: Press): void {
		if (!this.getEnabled()) return;
		const drop = (event.target as HTMLElement).closest<HTMLElement>("[data-drop]")?.dataset.drop;
		this.input().focus();
		if (drop !== undefined) this.toggle(drop);
		else if ((event.target as HTMLElement).closest(".korBox")) this.open();
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.target !== this.input()) return;
		const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
		if (step) {
			event.preventDefault();
			if (this.float && this.hits.length) this.active = (this.active + step + this.hits.length) % this.hits.length;
			this.open();
		} else if (event.key === "Enter" && this.float) {
			event.preventDefault();
			if (this.hits[this.active]) this.toggle(this.hits[this.active].getKey());
		} else if (event.key === "Escape" && this.float) {
			event.preventDefault();
			event.stopPropagation();
			this.float.close();
		} else if (event.key === "Backspace" && !this.input().value && this.getSelectedKeys().length) this.toggle(this.getSelectedKeys().slice(-1)[0]);
	}
	onfocusout(): void {
		this.float?.close();
		if (this.input()) this.input().value = "";
	}
	exit(): void {
		this.float?.close();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: MultiSelect) {
			const id = c.getId();
			const note = c.getError() || c.getHelp();
			const keys = c.getSelectedKeys();
			rm.openStart("div", c).class("korField");
			if (c.getError()) rm.class("korFieldError");
			rm.openEnd();
			if (c.getLabel()) {
				rm.openStart("label").class("korLabel").attr("for", `${id}-in`).openEnd().text(c.getLabel());
				if (c.getRequired()) rm.openStart("span").class("korRequired").attr("aria-hidden", "true").openEnd().text("*").close("span");
				rm.close("label");
			}
			rm.openStart("div").class("korBox").class("korMulti").openEnd();
			c.getItems().filter((item) => keys.includes(item.getKey())).forEach((item) => {
				rm.openStart("span").class("korToken").openEnd().openStart("span").openEnd().text(item.getText()).close("span");
				rm.openStart("button").attr("type", "button").attr("tabindex", "-1").attr("data-drop", item.getKey()).attr("aria-label", `${message("CLEAR")}: ${item.getText()}`);
				if (!c.getEnabled()) rm.attr("disabled", "disabled");
				rm.openEnd();
				renderIcon(rm, "x");
				rm.close("button").close("span");
			});
			rm.voidStart("input", `${id}-in`).class("korInput").attr("role", "combobox").attr("aria-expanded", "false").attr("aria-autocomplete", "list").attr("aria-controls", `${id}-list`).attr("autocomplete", "off").attr("placeholder", keys.length ? "" : c.getPlaceholder() || message("CHOOSE"));
			if (!c.getLabel()) rm.attr("aria-label", c.getPlaceholder());
			if (c.getRequired()) rm.attr("aria-required", "true");
			if (c.getError()) rm.attr("aria-invalid", "true");
			if (note) rm.attr("aria-describedby", `${id}-note`);
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.voidEnd();
			renderIcon(rm, "chevrons-up-down");
			rm.close("div");
			if (note) {
				rm.openStart("div", `${id}-note`).class("korNote").openEnd();
				if (c.getError()) renderIcon(rm, "circle-alert");
				rm.text(note).close("div");
			}
			rm.close("div");
		}
	};
}
