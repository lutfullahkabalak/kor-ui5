import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type TreeItem from "./TreeItem";
import { Float, esc, fold, iconHtml, isRtl, message, renderIcon } from "./util";
import "./library";

/**
 * Ağaçtan seçim alanı. Yazınca dallar süzülür.
 *
 * @namespace kor.ui
 */
export default class TreeField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TreeFieldSettings);
	constructor(id?: string, settings?: $TreeFieldSettings);
	constructor(id?: string, settings?: $TreeFieldSettings) {
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
			/** Yalnız uçlar seçilir */
			leafOnly: { type: "boolean", defaultValue: false },
			/** Alanda üst dallar da yazar */
			showPath: { type: "boolean", defaultValue: true },
			/** Zorunlu */
			required: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Düz liste; ağaç `parentKey` ile kurulur */
			items: { type: "kor.ui.TreeItem", multiple: true, singularName: "item" }
		},
		events: {
			/** Seçim değişti */
			change: { parameters: { key: { type: "string" } } }
		}
	};
	private float?: Float;
	private open = new Set<string>();
	private shownRows: { item: TreeItem; level: number; branch: boolean; opened: boolean }[] = [];
	private active = 0;
	private query = "";

	private input(): HTMLInputElement {
		return this.getDomRef("in") as unknown as HTMLInputElement;
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("in") ?? this.getDomRef()) as Element;
	}
	getIdForLabel(): string {
		return `${this.getId()}-in`;
	}
	private index(): { byKey: Map<string, TreeItem>; kids: Map<string, TreeItem[]> } {
		const byKey = new Map(this.getItems().map((item) => [item.getKey(), item]));
		const kids = new Map<string, TreeItem[]>();
		this.getItems().forEach((item) => {
			// Üstü listede olmayan öğe köktür
			const parent = byKey.has(item.getParentKey()) && item.getParentKey() !== item.getKey() ? item.getParentKey() : "";
			kids.set(parent, [...(kids.get(parent) ?? []), item]);
		});
		return { byKey, kids };
	}
	private path(key: string): TreeItem[] {
		const { byKey } = this.index();
		const out: TreeItem[] = [];
		for (let item = byKey.get(key); item && !out.includes(item); item = byKey.get(item.getParentKey())) out.unshift(item);
		return out;
	}
	private selectedText(): string {
		const path = this.path(this.getSelectedKey());
		return (this.getShowPath() ? path : path.slice(-1)).map((item) => item.getText()).join(" / ");
	}
	onAfterRendering(): void {
		if (!this.float) this.input().value = this.selectedText();
	}
	private list(): void {
		const { kids } = this.index();
		const needle = fold(this.query.trim());
		const hit = new Map<TreeItem, boolean>();
		const match = (item: TreeItem, seen: TreeItem[]): boolean => {
			if (seen.includes(item)) return false;
			const own = fold(item.getText()).includes(needle);
			const below = (kids.get(item.getKey()) ?? []).map((kid) => match(kid, [...seen, item])).some(Boolean);
			hit.set(item, own || below);
			return own || below;
		};
		if (needle) (kids.get("") ?? []).forEach((item) => match(item, []));
		this.shownRows = [];
		const walk = (parent: string, level: number) => (kids.get(parent) ?? []).forEach((item) => {
			if (needle && !hit.get(item)) return;
			const under = kids.get(item.getKey()) ?? [];
			const branch = under.length > 0;
			const opened = branch && (needle ? under.some((kid) => hit.get(kid)) : this.open.has(item.getKey()));
			this.shownRows.push({ item, level, branch, opened });
			if (opened) walk(item.getKey(), level + 1);
		});
		walk("", 0);
		this.active = Math.max(0, Math.min(this.active, this.shownRows.length - 1));
	}
	private show(query: string): void {
		this.query = query;
		if (!this.float) {
			this.path(this.getSelectedKey()).slice(0, -1).forEach((item) => this.open.add(item.getKey()));
			const tree = document.createElement("div");
			tree.className = "korMenu korTreeMenu";
			tree.id = `${this.getId()}-tree`;
			tree.setAttribute("role", "tree");
			tree.addEventListener("pointerdown", (event) => {
				event.preventDefault();
				const target = event.target as HTMLElement;
				const row = target.closest<HTMLElement>("[data-i]");
				if (!row) return;
				this.active = Number(row.dataset.i);
				const entry = this.shownRows[this.active];
				if (target.closest(".korTwist") || (entry.branch && this.getLeafOnly())) this.fold(entry.item, !entry.opened);
				else this.pick(entry.item);
			});
			this.float = new Float(this.input().closest(".korBox") as HTMLElement, tree, () => {
				this.float = undefined;
				this.input()?.setAttribute("aria-expanded", "false");
				this.input()?.removeAttribute("aria-activedescendant");
				if (this.input()) this.input().value = this.selectedText();
			});
			this.input().setAttribute("aria-expanded", "true");
			this.input().select();
		}
		this.list();
		if (!query) this.active = Math.max(0, this.shownRows.findIndex(({ item }) => item.getKey() === this.getSelectedKey()));
		else this.active = Math.max(0, this.shownRows.findIndex(({ item, branch }) => fold(item.getText()).includes(fold(query.trim())) && !(branch && this.getLeafOnly())));
		this.paint();
		this.float.place();
	}
	private fold(item: TreeItem, open: boolean): void {
		if (open) this.open.add(item.getKey());
		else this.open.delete(item.getKey());
		this.list();
		this.paint();
		this.float?.place();
	}
	private paint(): void {
		const id = this.getId();
		this.float!.element.innerHTML = this.shownRows.length
			? this.shownRows.map(({ item, level, branch, opened }, i) => {
				const on = item.getKey() === this.getSelectedKey();
				return `<div role="treeitem" id="${id}-o${i}" data-i="${i}" aria-level="${level + 1}" aria-selected="${on}"${branch ? ` aria-expanded="${opened}"` : ""} class="korMenuItem${i === this.active ? " korMenuActive" : ""}" style="--kor-level:${level}"><i class="${branch ? "korTwist" : "korTwist0"}">${branch ? iconHtml(opened ? "chevron-down" : isRtl() ? "chevron-left" : "chevron-right") : ""}</i><span>${esc(item.getText())}</span>${on ? iconHtml("check") : ""}</div>`;
			}).join("")
			: `<div class="korMenuNone">${esc(message("NO_RESULT"))}</div>`;
		if (this.shownRows.length) this.input().setAttribute("aria-activedescendant", `${id}-o${this.active}`);
		else this.input().removeAttribute("aria-activedescendant");
		this.float!.element.querySelector(".korMenuActive")?.scrollIntoView({ block: "nearest" });
	}
	private pick(item: TreeItem): void {
		const key = item.getKey();
		const changed = key !== this.getSelectedKey();
		this.setProperty("selectedKey", key, true);
		this.float?.close();
		this.input().value = this.selectedText();
		if (changed) this.fireChange({ key });
	}
	onclick(): void {
		if (this.getEnabled() && !this.float) this.show("");
	}
	oninput(): void {
		this.show(this.input().value);
	}
	onkeydown(event: KeyboardEvent): void {
		const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
		const entry = this.float ? this.shownRows[this.active] : undefined;
		// Arama sırasında yan oklar imleci taşır
		const side = entry && !this.query ? { ArrowRight: !isRtl(), ArrowLeft: isRtl() }[event.key] : undefined;
		if (step) {
			event.preventDefault();
			if (!this.float) this.show("");
			else if (this.shownRows.length) {
				this.active = (this.active + step + this.shownRows.length) % this.shownRows.length;
				this.paint();
			}
		} else if (entry && side !== undefined) {
			event.preventDefault();
			if (side) {
				if (entry.branch && !entry.opened) this.fold(entry.item, true);
			} else if (entry.opened) this.fold(entry.item, false);
			else {
				const up = this.shownRows.findIndex(({ item }) => item.getKey() === entry.item.getParentKey());
				if (up >= 0) this.active = up;
				this.paint();
			}
		} else if (event.key === "Enter" && this.float) {
			event.preventDefault();
			if (!entry) return;
			if (entry.branch && this.getLeafOnly()) this.fold(entry.item, !entry.opened);
			else this.pick(entry.item);
		} else if (event.key === "Escape" && this.float) {
			event.preventDefault();
			event.stopPropagation();
			this.float.close();
		} else if (event.key === "Tab") this.float?.close();
	}
	onfocusout(): void {
		this.float?.close();
		if (this.input()) this.input().value = this.selectedText();
	}
	exit(): void {
		this.float?.close();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: TreeField) {
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
			rm.voidStart("input", `${id}-in`).class("korInput").attr("role", "combobox").attr("aria-haspopup", "tree").attr("aria-expanded", "false").attr("aria-autocomplete", "list").attr("aria-controls", `${id}-tree`).attr("autocomplete", "off").attr("placeholder", c.getPlaceholder() || message("CHOOSE"));
			if (!c.getLabel()) rm.attr("aria-label", c.getPlaceholder() || message("CHOOSE"));
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
