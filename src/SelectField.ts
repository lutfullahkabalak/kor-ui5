import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type Item from "sap/ui/core/Item";
import { esc, Float, fold, iconHtml, message, renderIcon } from "./util";
import "./library";

/**
 * Yazarak süzülen seçim alanı.
 *
 * @namespace kor.ui
 */
export default class SelectField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $SelectFieldSettings);
	constructor(id?: string, settings?: $SelectFieldSettings);
	constructor(id?: string, settings?: $SelectFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Seçili anahtar */
			selectedKey: { type: "string", defaultValue: "", bindable: "bindable" },
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
			change: { parameters: { key: { type: "string" } } }
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
	private selectedText(): string {
		return this.getItems().find((item) => item.getKey() === this.getSelectedKey())?.getText() ?? "";
	}
	onAfterRendering(): void {
		if (!this.float) this.input().value = this.selectedText();
	}
	onclick(): void {
		if (this.getEnabled()) this.open("");
	}
	oninput(): void {
		this.open(this.input().value);
	}
	private open(query: string): void {
		const needle = fold(query);
		this.hits = this.getItems().filter((item) => fold(item.getText()).includes(needle));
		this.active = Math.max(0, this.hits.findIndex((item) => item.getKey() === this.getSelectedKey()));
		if (!this.float) {
			const list = document.createElement("div");
			list.className = "korMenu korList";
			list.id = `${this.getId()}-list`;
			list.setAttribute("role", "listbox");
			list.addEventListener("pointerdown", (event) => {
				event.preventDefault();
				const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
				if (i !== undefined) this.pick(this.hits[Number(i)]);
			});
			this.float = new Float((this.input().closest(".korBox") as HTMLElement), list, () => {
				this.float = undefined;
				this.input()?.setAttribute("aria-expanded", "false");
				this.input()?.removeAttribute("aria-activedescendant");
				if (this.input()) this.input().value = this.selectedText();
			});
			this.input().setAttribute("aria-expanded", "true");
			this.input().select();
		}
		this.paint();
		this.float.place();
	}
	private paint(): void {
		const list = this.float!.element;
		list.innerHTML = this.hits.length
			? this.hits.map((item, i) => `<div role="option" id="${this.getId()}-o${i}" data-i="${i}" aria-selected="${item.getKey() === this.getSelectedKey()}" class="korMenuItem${i === this.active ? " korMenuActive" : ""}"><span>${esc(item.getText())}</span>${item.getKey() === this.getSelectedKey() ? iconHtml("check") : ""}</div>`).join("")
			: `<div class="korMenuNone">${esc(message("NO_RESULT"))}</div>`;
		this.input().setAttribute("aria-activedescendant", this.hits.length ? `${this.getId()}-o${this.active}` : "");
		list.querySelector(".korMenuActive")?.scrollIntoView({ block: "nearest" });
	}
	private pick(item?: Item): void {
		if (!item) return;
		const key = item.getKey();
		const changed = key !== this.getSelectedKey();
		this.setProperty("selectedKey", key, true);
		this.float?.close();
		this.input().value = this.selectedText();
		if (changed) this.fireChange({ key });
	}
	onkeydown(event: KeyboardEvent): void {
		const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
		if (step) {
			event.preventDefault();
			if (!this.float) this.open("");
			else if (this.hits.length) {
				this.active = (this.active + step + this.hits.length) % this.hits.length;
				this.paint();
			}
		} else if (event.key === "Enter" && this.float) {
			event.preventDefault();
			this.pick(this.hits[this.active]);
		} else if (event.key === "Escape" && this.float) {
			event.preventDefault();
			event.stopPropagation();
			this.float.close();
		} else if (event.key === "Tab") this.float?.close();
	}
	exit(): void {
		this.float?.close();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: SelectField) {
			const id = c.getId();
			const note = c.getError() || c.getHelp();
			rm.openStart("div", c).class("korField");
			if (c.getError()) rm.class("korFieldError");
			rm.openEnd();
			if (c.getLabel()) {
				rm.openStart("label").class("korLabel").attr("for", `${id}-in`).openEnd().text(c.getLabel());
				if (c.getRequired()) rm.openStart("span").class("korRequired").attr("aria-hidden", "true").openEnd().text("*").close("span");
				rm.close("label");
			}
			rm.openStart("div").class("korBox").class("korSelect").openEnd();
			rm.voidStart("input", `${id}-in`).class("korInput").attr("role", "combobox").attr("aria-expanded", "false").attr("aria-autocomplete", "list").attr("aria-controls", `${id}-list`).attr("autocomplete", "off").attr("placeholder", c.getPlaceholder() || message("CHOOSE"));
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
