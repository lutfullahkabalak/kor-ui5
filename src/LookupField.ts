import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import type Context from "sap/ui/model/Context";
import type ListBinding from "sap/ui/model/ListBinding";
import Button from "./Button";
import Column from "./Column";
import DataGrid from "./DataGrid";
import Dialog from "./Dialog";
import FilterBar from "./FilterBar";
import FilterField from "./FilterField";
import type { Press } from "./util";
import { Float, esc, iconHtml, message, num, renderIcon } from "./util";
import "./library";

export type LookupEntry = { key: string; text: string };
const LIMIT = 8;

/**
 * Değer yardımı (F4): yazınca önerir, F4 ile süzülebilir tabloda aratır. Tek veya çoklu.
 * `rows` bir UI5 liste bağlamasıdır; şablon istemez.
 *
 * @namespace kor.ui
 */
export default class LookupField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $LookupFieldSettings);
	constructor(id?: string, settings?: $LookupFieldSettings);
	constructor(id?: string, settings?: $LookupFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "columns",
		properties: {
			/** Seçili anahtar (tek seçim) */
			value: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Seçili kaydın metni (tek seçim) */
			text: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Çoklu seçim: {key, text} dizisi */
			selection: { type: "object", defaultValue: null, bindable: "bindable" },
			/** Birden çok kayıt */
			multiple: { type: "boolean", defaultValue: false },
			/** Anahtar alanı */
			keyPath: { type: "string", defaultValue: "id" },
			/** Metin alanı */
			textPath: { type: "string", defaultValue: "name" },
			/** Öneride ikinci bilgi alanı */
			infoPath: { type: "string", defaultValue: "" },
			/** Etiket; pencerenin de başlığıdır */
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
			/** Penceredeki sütunlar; boşsa anahtar ve metin */
			columns: { type: "kor.ui.Column", multiple: true, singularName: "column" },
			/** Penceredeki süzgeç alanları */
			filterFields: { type: "kor.ui.FilterField", multiple: true, singularName: "filterField" },
			/** Kayıtlar; yalnızca bağlama ile */
			rows: { type: "sap.ui.core.Element", multiple: true, singularName: "row", bindable: "bindable", _doesNotRequireFactory: true }
		},
		events: {
			/** Değer değişti */
			change: { parameters: { value: { type: "string" }, text: { type: "string" }, context: { type: "object" }, selection: { type: "object" } } }
		}
	};
	private float?: Float;
	private hits: Context[] = [];
	private recent: LookupEntry[] = [];
	private active = 0;
	private query = "";
	private asked = "";
	private loading = false;
	private timer = 0;
	private heard?: ListBinding;
	private bad = "";
	private dialog?: Dialog;
	private grid?: DataGrid;

	private input(): HTMLInputElement {
		return this.getDomRef("in") as unknown as HTMLInputElement;
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("in") ?? this.getDomRef()) as Element;
	}
	getIdForLabel(): string {
		return `${this.getId()}-in`;
	}
	private chosen(): LookupEntry[] {
		return (this.getSelection() as LookupEntry[] | null) ?? [];
	}
	private entry(context: Context): LookupEntry {
		return { key: String(context.getProperty(this.getKeyPath()) ?? ""), text: String(context.getProperty(this.getTextPath()) ?? "") };
	}
	private shown(): string {
		return this.getMultiple() ? "" : this.getText() || this.getValue();
	}
	/** Form denetimi için: çoklu seçimde dizi */
	getSelectedKeys(): string[] {
		return this.getMultiple() ? this.chosen().map((e) => e.key) : this.getValue() ? [this.getValue()] : [];
	}

	/* Bağlama */
	updateRows(): void {
		if (!this.query) return;
		this.hits = (this.getBinding("rows") as unknown as { getContexts(s: number, n: number): Context[] })?.getContexts(0, LIMIT).filter((c) => c && !c.getPath().endsWith("/-2")) ?? [];
		if (this.float) this.paint();
		if (this.asked && !this.loading) this.resolve();
	}
	refreshRows(): void {
		if (this.query) (this.getBinding("rows") as unknown as { getContexts(s: number, n: number): Context[] })?.getContexts(0, LIMIT);
	}
	private remote(): boolean {
		return !this.getBinding("rows")?.getModel()?.isA("sap.ui.model.ClientModel");
	}
	private received(): void {
		this.loading = false;
		this.updateRows();
	}
	/** Sunucu modelinde yazma bitince sorar; `now` bekletmez */
	private search(text: string, now = false): void {
		window.clearTimeout(this.timer);
		const query = text.trim();
		if (query && query === this.query) return;
		if (!query) {
			this.query = "";
			this.hits = [];
			return;
		}
		if (this.remote() && !now) {
			this.loading = true;
			this.query = query;
			this.hits = [];
			this.timer = window.setTimeout(() => {
				this.timer = 0;
				this.query = "";
				this.search(query, true);
			}, 220);
			return;
		}
		this.query = query;
		const binding = this.getBinding("rows") as ListBinding | undefined;
		if (!binding) return;
		if (this.heard !== binding) {
			this.heard = binding;
			binding.attachEvent("dataReceived", this.received, this);
		}
		this.loading = this.remote();
		this.hits = [];
		const or = [this.getKeyPath(), this.getTextPath()].map((path) => new Filter(path, FilterOperator.Contains, this.query));
		binding.filter([new Filter({ filters: or, and: false })]);
		this.updateRows();
	}

	/* Seçim */
	private take(entry: LookupEntry, context?: Context): void {
		this.bad = "";
		this.asked = "";
		this.recent = [entry, ...this.recent.filter((e) => e.key !== entry.key)].slice(0, 5);
		if (this.getMultiple()) {
			if (!this.chosen().some((e) => e.key === entry.key)) this.put([...this.chosen(), entry]);
			this.input().value = "";
		} else {
			const same = entry.key === this.getValue();
			this.setText(entry.text);
			this.setValue(entry.key);
			this.input().value = this.shown();
			if (!same) this.fireChange({ value: entry.key, text: entry.text, context, selection: undefined });
		}
		this.invalidate();
	}
	private put(list: LookupEntry[]): void {
		this.setSelection(list);
		this.fireChange({ value: "", text: "", context: undefined, selection: list });
	}
	private clear(): void {
		const had = this.getValue();
		this.bad = "";
		this.setText("");
		this.setValue("");
		this.invalidate();
		if (had) this.fireChange({ value: "", text: "", context: undefined, selection: undefined });
	}
	/** Yazılan metni kayda çevirir; veri gecikirse yanıt gelince yeniden denenir */
	private commit(): void {
		const text = this.input().value.trim();
		if (text === this.shown()) return;
		if (!text) {
			if (!this.getMultiple()) this.clear();
			return;
		}
		this.asked = text;
		const waiting = this.timer;
		window.clearTimeout(this.timer);
		this.timer = 0;
		// Bekletilen arama hemen yapılır
		if (waiting && this.loading) this.query = "";
		this.search(text, true);
		if (this.asked && !this.loading) this.resolve();
	}
	private resolve(): void {
		const text = this.asked.toLocaleLowerCase();
		const exact = this.hits.filter((c) => Object.values(this.entry(c)).some((v) => v.toLocaleLowerCase() === text));
		const hit = exact[0] ?? (this.hits.length === 1 ? this.hits[0] : undefined);
		if (hit) this.take(this.entry(hit), hit);
		else {
			this.asked = "";
			this.bad = message(this.hits.length ? "LOOKUP_MANY" : "LOOKUP_NONE");
			this.invalidate();
		}
	}

	/* Öneri listesi */
	private list(): { entry: LookupEntry; info: string; context?: Context }[] {
		if (!this.query) return this.recent.map((entry) => ({ entry, info: "" }));
		return this.hits.map((context) => ({ entry: this.entry(context), info: this.getInfoPath() ? String(context.getProperty(this.getInfoPath()) ?? "") : "", context }));
	}
	private suggest(): void {
		if (!this.list().length && !this.query) {
			this.float?.close();
			return;
		}
		if (!this.float) {
			const el = document.createElement("div");
			el.className = "korMenu korList";
			el.id = `${this.getId()}-list`;
			el.addEventListener("pointerdown", (event) => event.preventDefault());
			el.addEventListener("mousedown", (event) => event.preventDefault());
			el.addEventListener("click", (event) => {
				const target = event.target as HTMLElement;
				const i = target.closest<HTMLElement>("[data-i]")?.dataset.i;
				if (i !== undefined) this.choose(Number(i));
				else if (target.closest("[data-all]")) this.openDialog();
			});
			this.float = new Float(this.input().closest(".korBox") as HTMLElement, el, () => {
				this.float = undefined;
				this.input()?.setAttribute("aria-expanded", "false");
				this.input()?.removeAttribute("aria-activedescendant");
			});
			this.input().setAttribute("aria-expanded", "true");
		}
		this.paint();
	}
	private choose(i: number): void {
		const hit = this.list()[i];
		this.float?.close();
		if (hit) {
			this.take(hit.entry, hit.context);
			this.query = "";
		}
	}
	private paint(): void {
		const list = this.list();
		this.active = Math.min(this.active, Math.max(0, list.length - 1));
		const total = (this.getBinding("rows") as ListBinding | undefined)?.getLength() ?? 0;
		const mark = (text: string) => {
			const at = this.query ? text.toLocaleLowerCase().indexOf(this.query.toLocaleLowerCase()) : -1;
			return at < 0 ? esc(text) : `${esc(text.slice(0, at))}<mark>${esc(text.slice(at, at + this.query.length))}</mark>${esc(text.slice(at + this.query.length))}`;
		};
		this.float!.element.innerHTML = `${this.query ? "" : `<div class="korMenuHead">${esc(message("RECENT"))}</div>`}<div role="listbox">${list.map((h, i) => `<div role="option" id="${this.getId()}-o${i}" data-i="${i}" aria-selected="${i === this.active}" class="korMenuItem korLookupItem${i === this.active ? " korMenuActive" : ""}"><span class="korLookupText">${mark(h.entry.text)}</span><span class="korLookupInfo">${esc(h.info)}</span><span class="korLookupKey">${mark(h.entry.key)}</span></div>`).join("")}</div>${list.length ? "" : `<div class="korMenuNone">${esc(message(this.loading ? "LOADING" : "NO_RESULT"))}</div>`}<button type="button" tabindex="-1" class="korMenuItem korLookupAll" data-all="1">${iconHtml("search")}<span>${esc(this.query && total > list.length ? message("LOOKUP_MORE", [num(total)]) : message("LOOKUP_OPEN"))}</span><kbd class="korKbd">F4</kbd></button>`;
		this.input().setAttribute("aria-activedescendant", list.length ? `${this.getId()}-o${this.active}` : "");
		this.float!.place();
	}

	/* Arama penceresi */
	private openDialog(): void {
		this.float?.close();
		const info = this.getBindingInfo("rows") as unknown as { path: string; model?: string; parameters?: object; parts?: unknown[] } | undefined;
		if (!info || !this.getEnabled()) return;
		const typed = this.input().value.trim();
		const multi = this.getMultiple();
		this.dialog?.destroy();
		const columns = this.getColumns().length
			? this.getColumns().map((c) => c.clone() as Column)
			: [new Column({ label: message("KEY"), path: this.getKeyPath(), width: 140 }), new Column({ label: this.getLabel(), path: this.getTextPath(), width: 220, grow: 1 })];
		const fields = this.getFilterFields().length ? this.getFilterFields().map((f) => f.clone() as FilterField) : [new FilterField({ label: this.getLabel(), path: this.getTextPath() }), new FilterField({ label: message("KEY"), path: this.getKeyPath() })];
		const grid = (this.grid = new DataGrid({ columns, height: "420px", label: this.getLabel(), selectionMode: multi ? "Multi" : "None" }));
		const bar = new FilterBar({ fields, change: (event) => (grid.getBinding("rows") as ListBinding)?.filter((event.getParameters() as unknown as { filters: Filter[] }).filters) });
		const close = () => {
			this.dialog?.setOpen(false);
			window.setTimeout(() => this.input()?.focus());
		};
		const add = new Button({ kind: "primary", text: message("ADD"), visible: multi, enabled: false, press: () => {
			const more = grid.getSelectedContexts().map((c) => this.entry(c)).filter((e) => !this.chosen().some((x) => x.key === e.key));
			if (more.length) this.put([...this.chosen(), ...more]);
			this.input().value = "";
			close();
		} });
		grid.attachRowPress((event: unknown) => {
			if (multi) return;
			const context = (event as { getParameters(): { context: Context } }).getParameters().context;
			this.take(this.entry(context), context);
			close();
		});
		grid.attachSelectionChange((event: unknown) => {
			const count = (event as { getParameters(): { contexts: Context[] } }).getParameters().contexts.length;
			add.setEnabled(count > 0);
			add.setText(count ? `${message("ADD")} (${num(count)})` : message("ADD"));
		});
		const path = info.path ?? (info.parts?.[0] as { path: string }).path;
		const model = info.model ?? (info.parts?.[0] as { model?: string } | undefined)?.model;
		grid.bindAggregation("rows", { path: model ? `${model}>${path}` : path, parameters: info.parameters } as never);
		this.dialog = new Dialog({ title: this.getLabel(), subtitle: multi ? message("LOOKUP_PICK_MANY") : message("LOOKUP_PICK"), width: 820, content: [bar, grid], footer: multi ? [new Button({ text: message("CANCEL"), press: close }), add] : [], close: () => window.setTimeout(() => this.input()?.focus()) });
		this.addDependent(this.dialog);
		this.dialog.setOpen(true);
		if (typed && typed !== this.shown()) bar.addToken(this.getTextPath(), "Contains", typed);
	}

	/* Tuşlar */
	onAfterRendering(): void {
		if (!this.bad && !this.asked && document.activeElement !== this.input()) this.input().value = this.shown();
	}
	oninput(): void {
		this.active = 0;
		this.search(this.input().value);
		this.suggest();
	}
	onmousedown(event: Press & { preventDefault(): void }): void {
		if (event.target !== this.input()) event.preventDefault();
	}
	onclick(event: Press): void {
		if (!this.getEnabled()) return;
		const target = event.target as HTMLElement;
		const drop = target.closest<HTMLElement>("[data-drop]")?.dataset.drop;
		this.input().focus();
		if (drop !== undefined) this.put(this.chosen().filter((e) => e.key !== drop));
		else if (target.closest("[data-f4]")) this.openDialog();
		else if (target === this.input()) {
			if (!this.getMultiple()) this.input().select();
			this.suggest();
		}
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		if (event.target !== this.input()) return;
		const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
		if (event.key === "F4") {
			event.preventDefault();
			this.openDialog();
		} else if (step) {
			event.preventDefault();
			const count = this.list().length;
			if (this.float && count) {
				this.active = (this.active + step + count) % count;
				this.paint();
			} else this.suggest();
		} else if (event.key === "Enter") {
			event.preventDefault();
			if (this.float && this.list().length) this.choose(this.active);
			else this.commit();
		} else if (event.key === "Escape" && this.float) {
			event.preventDefault();
			event.stopPropagation();
			raw.stopPropagation();
			this.float.close();
		} else if (event.key === "Backspace" && this.getMultiple() && !this.input().value && this.chosen().length) this.put(this.chosen().slice(0, -1));
	}
	onfocusout(): void {
		this.float?.close();
		if (this.input() && !this.dialog?.getOpen()) this.commit();
	}
	exit(): void {
		window.clearTimeout(this.timer);
		this.float?.close();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: LookupField) {
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
			rm.openStart("div").class("korBox");
			if (c.getMultiple()) rm.class("korMulti");
			rm.openEnd();
			if (c.getMultiple()) {
				c.chosen().forEach((e) => {
					rm.openStart("span").class("korToken").openEnd().openStart("span").openEnd().text(e.text || e.key).close("span");
					rm.openStart("button").attr("type", "button").attr("tabindex", "-1").attr("data-drop", e.key).attr("aria-label", `${message("CLEAR")}: ${e.text || e.key}`);
					if (!c.getEnabled()) rm.attr("disabled", "disabled");
					rm.openEnd();
					renderIcon(rm, "x");
					rm.close("button").close("span");
				});
			}
			rm.voidStart("input", `${id}-in`).class("korInput").attr("role", "combobox").attr("aria-expanded", "false").attr("aria-autocomplete", "list").attr("aria-controls", `${id}-list`).attr("autocomplete", "off").attr("spellcheck", "false").attr("placeholder", c.getMultiple() && c.chosen().length ? "" : c.getPlaceholder());
			if (!c.getLabel()) rm.attr("aria-label", c.getPlaceholder());
			if (c.getRequired()) rm.attr("aria-required", "true");
			if (error) rm.attr("aria-invalid", "true");
			if (note) rm.attr("aria-describedby", `${id}-note`);
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.voidEnd();
			if (!c.getMultiple() && c.getText() && c.getValue()) rm.openStart("span").class("korUnit").class("korNum").openEnd().text(c.getValue()).close("span");
			rm.openStart("button").attr("type", "button").class("korCalOpen").attr("tabindex", "-1").attr("data-f4", "1").attr("data-kor-tip", message("LOOKUP_OPEN")).attr("data-kor-hint", "F4").attr("aria-label", message("LOOKUP_OPEN"));
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.openEnd();
			renderIcon(rm, "search");
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
