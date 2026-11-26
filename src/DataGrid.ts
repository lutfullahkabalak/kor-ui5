import Control from "sap/ui/core/Control";
import type Binding from "sap/ui/model/ListBinding";
import type Context from "sap/ui/model/Context";
import Sorter from "sap/ui/model/Sorter";
import type Column from "./Column";
import Calendar, { readDate, showDate } from "./Calendar";
import gridRenderer from "./gridRenderer";
import Toast from "./Toast";
import { Float, dayText, esc, faceHtml, fold, iconHtml, dateValue, isMac, isRtl, isoDate, message, nextZ, num, parseNum, pct, sparkHtml, staticArea, statusHtml, toDate } from "./util";
import "./library";

type Raw = { originalEvent: PointerEvent };
type Cell = { row: number; col: number };
const CHECK = 44;

/**
 * Büyük tablo: sanal satırlar, klavye, aralık seçimi ve toplamı, yerinde düzenleme,
 * Excel ile kopyala-yapıştır. `rows` herhangi bir UI5 liste bağlamasını (JSON, OData) alır; şablon istemez.
 *
 * @namespace kor.ui
 */
export default class DataGrid extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DataGridSettings);
	constructor(id?: string, settings?: $DataGridSettings);
	constructor(id?: string, settings?: $DataGridSettings) {
		super(id, settings);
	}

	static readonly metadata: object = {
		library: "kor.ui",
		defaultAggregation: "columns",
		properties: {
			/** Yükseklik */
			height: { type: "sap.ui.core.CSSSize", defaultValue: "32rem" },
			/** Satır seçimi: None veya Multi */
			selectionMode: { type: "string", defaultValue: "None" },
			/** Alt özet çubuğu */
			summary: { type: "boolean", defaultValue: true },
			/** Boş metni */
			noData: { type: "string", defaultValue: "" },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Sütunlar */
			columns: { type: "kor.ui.Column", multiple: true, singularName: "column" },
			/** Satırlar; yalnızca bağlama ile kullanılır */
			rows: { type: "sap.ui.core.Element", multiple: true, singularName: "row", bindable: "bindable", _doesNotRequireFactory: true }
		},
		events: {
			/** Satır açıldı (bağlantı hücresi veya Enter) */
			rowPress: { parameters: { context: { type: "object" } } },
			/** Hücre değişti; değer modele yazılmıştır */
			cellChange: { parameters: { context: { type: "object" }, path: { type: "string" }, value: { type: "any" }, oldValue: { type: "any" } } },
			/** Sütun düzeni, genişlik veya sıralama değişti */
			stateChange: {},
			/** Satır seçimi değişti */
			selectionChange: { parameters: { contexts: { type: "object" } } }
		}
	};
	protected contexts: Context[] = [];
	protected total = 0;
	protected active: Cell = { row: 0, col: 0 };
	protected anchor: Cell = { row: 0, col: 0 };
	private picked = new Map<string, Context>();
	private wantAll = false;
	private stale = false;
	private widths: number[] = [];
	private userWidths = new Map<string, number>();
	private sortPath = "";
	private sortDesc = false;
	protected drawn = new Map<number, HTMLElement>();
	private editor?: { cell: Cell; input: HTMLInputElement | HTMLSelectElement; close?: () => void };
	private observer?: ResizeObserver;
	private frame = 0;
	private order: string[] = [];
	private hidden = new Set<string>();
	private settings?: Float;
	private menu?: { float: Float; col: number };
	private finder?: { el: HTMLElement; input: HTMLInputElement; count: HTMLElement };
	private findText = "";
	private hits?: { query: string; list: Cell[]; partial: boolean };
	/** Sütun sürüklendi; ardından gelen tıklama sıralama yapmasın */
	private dragged = false;

	init(): void {
		this.attachBrowserEvent("pointerdown", (e: unknown) => this.pointerDown((e as Raw).originalEvent));
		this.attachBrowserEvent("contextmenu", (e: unknown) => this.contextMenu((e as Raw).originalEvent));
		this.attachBrowserEvent("dblclick", (e: unknown) => {
			const target = (e as Raw).originalEvent.target as HTMLElement;
			// Ayraçta çift basış sütunu içeriğe göre genişletir (SAP GUI: en uygun genişlik)
			const grip = target.closest<HTMLElement>("[data-grip]");
			if (grip) {
				this.fitColumn(Number(grip.dataset.grip));
				return;
			}
			const cell = this.cellOf(target);
			// Düzenlenemeyen hücrede çift basış satırı açar
			if (cell && !this.edit(cell)) this.press(cell.row);
		});
		this.attachBrowserEvent("click", (e: unknown) => this.click((e as Raw).originalEvent));
		this.attachBrowserEvent("copy", (e: unknown) => this.copy((e as { originalEvent: ClipboardEvent }).originalEvent));
		this.attachBrowserEvent("paste", (e: unknown) => this.paste((e as { originalEvent: ClipboardEvent }).originalEvent));
	}
	exit(): void {
		this.editor?.close?.();
		this.settings?.close();
		this.menu?.float.close();
		this.observer?.disconnect();
		cancelAnimationFrame(this.frame);
	}

	gridRole(): string {
		return "grid";
	}
	private columnKey(column: Column): string {
		return column.getPath() || column.getLabel();
	}
	/** Görünen sütunlar, kullanıcının sırasıyla */
	protected cols(): Column[] {
		return this.ordered().filter((c) => !this.hidden.has(this.columnKey(c)));
	}
	private ordered(): Column[] {
		const rank = (c: Column) => {
			const at = this.order.indexOf(this.columnKey(c));
			return at < 0 ? this.order.length : at;
		};
		return [...this.getColumns()].sort((a, b) => rank(a) - rank(b));
	}
	/** Kaydedilebilir görünüm: sütun sırası, gizliler, genişlik, sıralama */
	getState(): object {
		const widths: Record<string, number> = {};
		this.getColumns().forEach((c) => {
			const w = this.userWidths.get(c.getId());
			if (w) widths[this.columnKey(c)] = Math.round(w);
		});
		return { order: [...this.order], hidden: [...this.hidden].sort(), widths, sort: this.sortPath, desc: this.sortDesc };
	}
	/** `getState` çıktısını geri yükler; tanımadığı sütunu yok sayar */
	setState(state: { order?: string[]; hidden?: string[]; widths?: Record<string, number>; sort?: string; desc?: boolean }): void {
		const keys = this.getColumns().map((c) => this.columnKey(c));
		this.order = (state.order ?? []).filter((k) => keys.includes(k));
		this.hidden = new Set((state.hidden ?? []).filter((k) => keys.includes(k)));
		this.userWidths = new Map(this.getColumns().flatMap((c) => (state.widths?.[this.columnKey(c)] ? [[c.getId(), state.widths[this.columnKey(c)]] as [string, number]] : [])));
		const sort = state.sort && keys.includes(state.sort) ? state.sort : "";
		if (sort !== this.sortPath || !!state.desc !== this.sortDesc) {
			this.sortPath = sort;
			this.sortDesc = !!state.desc;
			(this.getBinding("rows") as Binding | undefined)?.sort(sort ? new Sorter(sort, this.sortDesc) : ([] as never));
		}
		this.columnsChanged(false);
	}
	private columnsChanged(tell: boolean): void {
		const last = Math.max(0, this.cols().length - 1);
		this.active = { row: this.active.row, col: Math.min(this.active.col, last) };
		this.anchor = this.active;
		this.repaint();
		if (tell) this.fireStateChange();
	}
	/** Sütun ayarı panelini açar */
	openSettings(opener: Control | HTMLElement): void {
		if (this.settings) {
			this.settings.close();
			return;
		}
		const anchor = (opener instanceof HTMLElement ? opener : opener.getDomRef()) as HTMLElement;
		const panel = document.createElement("div");
		panel.className = "korMenu korColumns";
		panel.setAttribute("role", "dialog");
		panel.setAttribute("aria-label", message("COLUMNS"));
		const paint = () => {
			const shown = this.cols().length;
			panel.innerHTML = `<div class="korMenuHead">${esc(message("COLUMNS"))}</div>${this.ordered()
				.map((c, i, list) => {
					const on = !this.hidden.has(this.columnKey(c));
					const pin = c.getPinned();
					const prev = list[i - 1];
					const next = list[i + 1];
					return `<div class="korColumn" data-i="${i}" draggable="${!pin}"><span class="korColumnGrip">${pin ? "" : iconHtml("grip-vertical")}</span><button type="button" class="korColumnName" role="checkbox" aria-checked="${on}" data-toggle="${i}"${on && (shown === 1 || pin) ? ' aria-disabled="true"' : ""}><span class="korGridCheck${on ? " korOn" : ""}">${iconHtml("check")}</span><span>${esc(c.getLabel())}</span></button>${pin ? "" : `<button type="button" class="korCalOpen" data-up="${i}" aria-label="${esc(`${message("MOVE_UP")}: ${c.getLabel()}`)}"${!prev || prev.getPinned() ? " disabled" : ""}>${iconHtml("arrow-up")}</button><button type="button" class="korCalOpen" data-down="${i}" aria-label="${esc(`${message("MOVE_DOWN")}: ${c.getLabel()}`)}"${!next ? " disabled" : ""}>${iconHtml("arrow-down")}</button>`}</div>`;
				})
				.join("")}<button type="button" class="korMenuItem korColumnReset" data-reset="1">${iconHtml("undo-2")}<span>${esc(message("RESET"))}</span></button>`;
		};
		const reorder = (from: number, to: number) => {
			const list = this.ordered();
			if (from === to || list[from].getPinned() || list[to].getPinned()) return;
			const [moved] = list.splice(from, 1);
			list.splice(to, 0, moved);
			this.order = list.map((c) => this.columnKey(c));
			this.columnsChanged(true);
			paint();
		};
		paint();
		panel.addEventListener("click", (event) => {
			const at = (name: string) => (event.target as HTMLElement).closest<HTMLElement>(`[data-${name}]`)?.dataset[name];
			const [toggle, up, down] = [at("toggle"), at("up"), at("down")];
			if (toggle !== undefined) {
				const column = this.ordered()[Number(toggle)];
				const key = this.columnKey(column);
				if (!this.hidden.delete(key)) {
					if (this.cols().length === 1 || column.getPinned()) return;
					this.hidden.add(key);
				}
				this.columnsChanged(true);
				paint();
				panel.querySelector<HTMLElement>(`[data-toggle="${toggle}"]`)?.focus();
			} else if (up !== undefined || down !== undefined) {
				const from = Number(up ?? down);
				const to = from + (up !== undefined ? -1 : 1);
				reorder(from, to);
				(panel.querySelector<HTMLElement>(`[data-${up !== undefined ? "up" : "down"}="${to}"]:not(:disabled)`) ?? panel.querySelector<HTMLElement>(`[data-toggle="${to}"]`))?.focus();
			} else if (at("reset") !== undefined) {
				this.order = [];
				this.hidden.clear();
				this.userWidths.clear();
				this.columnsChanged(true);
				paint();
			}
		});
		let from = -1;
		panel.addEventListener("dragstart", (event) => {
			from = Number((event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i ?? -1);
		});
		panel.addEventListener("dragover", (event) => {
			const row = (event.target as HTMLElement).closest<HTMLElement>(".korColumn");
			if (from < 0 || !row) return;
			event.preventDefault();
			panel.querySelectorAll(".korColumnOver").forEach((el) => el.classList.remove("korColumnOver"));
			row.classList.add("korColumnOver");
		});
		panel.addEventListener("drop", (event) => {
			event.preventDefault();
			const to = Number((event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i ?? -1);
			if (from >= 0 && to >= 0) reorder(from, to);
			from = -1;
		});
		panel.addEventListener("keydown", (event) => {
			if (event.key !== "Escape") return;
			event.preventDefault();
			event.stopPropagation();
			this.settings?.close();
			// Sütun menüsünden açıldıysa odak tabloya döner
			if (this.getDomRef()?.contains(anchor)) this.scroller()?.focus({ preventScroll: true });
			else anchor.focus();
		});
		this.settings = new Float(anchor, panel, () => (this.settings = undefined), false);
		panel.querySelector<HTMLElement>("[data-toggle]")?.focus();
	}

	/* Bağlama: satır öğesi üretilmez, bağlamlar doğrudan çizilir */
	updateRows(): void {
		this.hits = undefined;
		this.load();
		// Geç gelen veri açık düzenlemeyi bozmasın
		if (this.editor) {
			this.stale = true;
			return;
		}
		this.repaint();
		if (this.wantAll) this.takeAll();
	}
	refreshRows(): void {
		this.load();
	}
	protected load(): void {
		const binding = this.getBinding("rows") as Binding | undefined;
		if (!binding) {
			this.contexts = [];
			this.total = 0;
			return;
		}
		const length = binding.getLength();
		// Bilinmeyen uzunlukta (OData ilk istek) bir sayfa istenir
		const span = this.span();
		const first = Math.max(0, span.first - 40);
		const size = span.last - span.first + 80;
		const list = (binding as unknown as { getContexts(start: number, length: number, threshold: number): Context[] }).getContexts(first, size, 100);
		this.contexts = [];
		list.forEach((context, i) => {
			// V4 autoExpandSelect'in geçici bağlamı (-2) satır değildir
			if (!context || context.getPath().endsWith("/-2")) return;
			this.contexts[first + i] = context;
			const key = this.rowKey(context);
			if (this.picked?.has(key)) this.picked.set(key, context);
		});
		this.total = binding.getLength() || length;
	}
	/** Bağlamadan satır dilimi; TreeGrid düzleştirilmiş listeden verir */
	protected fetch(start: number, length: number): Context[] {
		const binding = this.getBinding("rows") as unknown as { getContexts(start: number, length: number): Context[] } | undefined;
		return binding ? binding.getContexts(start, length) : [];
	}
	protected context(row: number): Context | undefined {
		return this.contexts[row];
	}

	/* Ölçüler */
	private scroller(): HTMLElement | null {
		return this.getDomRef("scroll") as HTMLElement | null;
	}
	private rowHeight(): number {
		const root = this.getDomRef();
		return root ? parseFloat(getComputedStyle(root).getPropertyValue("--kor-row")) || 44 : 44;
	}
	private checks(): number {
		return this.getSelectionMode() === "Multi" ? CHECK : 0;
	}
	protected span(): { first: number; last: number } {
		const s = this.scroller();
		const h = this.rowHeight();
		const top = s?.scrollTop ?? 0;
		return { first: Math.max(0, Math.floor(top / h) - 4), last: Math.ceil((top + (s?.clientHeight ?? 600)) / h) + 4 };
	}
	private measure(): void {
		const s = this.scroller();
		if (!s) return;
		const cols = this.cols();
		const base = cols.map((c) => this.userWidths.get(c.getId()) ?? c.getWidth());
		const free = Math.max(0, s.clientWidth - this.checks() - base.reduce((a, b) => a + b, 0));
		const grows = cols.map((c) => (this.userWidths.has(c.getId()) ? 0 : c.getGrow()));
		const sum = grows.reduce((a, b) => a + b, 0);
		this.widths = base.map((w, i) => (sum ? w + (free * grows[i]) / sum : w));
	}

	/* Çizim */
	onAfterRendering(): void {
		this.drawn.clear();
		// Arama çubuğu eski DOM'la gitti
		this.finder = undefined;
		this.editor?.close?.();
		this.editor = undefined;
		const s = this.scroller() as HTMLElement;
		s.onscroll = () => {
			if (this.frame) return;
			this.frame = requestAnimationFrame(() => {
				this.frame = 0;
				const span = this.span();
				if (!this.context(span.first) || !this.context(Math.min(span.last, this.total - 1))) this.load();
				this.paint();
			});
		};
		this.observer?.disconnect();
		this.observer = new ResizeObserver(() => this.repaint());
		this.observer.observe(s);
		this.repaint();
	}
	protected repaint(): void {
		if (!this.scroller()) return;
		if (this.active.row >= this.total) this.active = this.anchor = { row: Math.max(0, this.total - 1), col: this.active.col };
		this.hits = undefined;
		this.measure();
		this.load();
		this.drawn.forEach((el) => el.remove());
		this.drawn.clear();
		this.editor?.close?.();
		this.editor = undefined;
		this.paintHead();
		this.paint();
	}
	private pinStyle(i: number): string {
		const cols = this.cols();
		if (!cols.slice(0, i + 1).every((c) => c.getPinned())) return "";
		return `position:sticky;inset-inline-start:${this.checks() + this.widths.slice(0, i).reduce((a, b) => a + b, 0)}px;z-index:2;`;
	}
	private numeric(c: Column): boolean {
		return c.getType() === "number" || c.getType() === "currency";
	}
	private paintHead(): void {
		const head = this.getDomRef("head") as HTMLElement;
		const cols = this.cols();
		const width = this.checks() + this.widths.reduce((a, b) => a + b, 0);
		(this.getDomRef("canvas") as HTMLElement).style.width = `${width}px`;
		const all = this.total > 0 && this.picked.size >= this.total;
		head.innerHTML =
			(this.checks() ? `<div class="korCell korCellCheck" role="columnheader" style="width:${CHECK}px;position:sticky;inset-inline-start:0;z-index:3"><button type="button" tabindex="-1" class="korGridCheck${all ? " korOn" : this.picked.size ? " korSome" : ""}" role="checkbox" aria-checked="${all ? "true" : this.picked.size ? "mixed" : "false"}" data-all="1" aria-label="${esc(message("SELECT_ALL"))}">${iconHtml(all || !this.picked.size ? "check" : "minus")}</button></div>` : "") +
			cols
				.map((c, i) => {
					const on = this.sortPath === c.getPath();
					const sort = on ? (this.sortDesc ? "descending" : "ascending") : "none";
					return `<div class="korCell${this.numeric(c) ? " korCellNum" : ""}${c.getPinned() ? "" : " korCellMove"}" role="columnheader" aria-colindex="${i + 1}" aria-sort="${sort}" style="width:${this.widths[i]}px;${this.pinStyle(i)}">${c.getSortable() ? `<button type="button" tabindex="-1" class="korSort${on ? " korOn" : ""}" data-sort="${i}"><span>${esc(c.getLabel())}</span>${iconHtml(on && this.sortDesc ? "arrow-down" : "arrow-up")}</button>` : `<span class="korSort">${esc(c.getLabel())}</span>`}<span class="korGrip" data-grip="${i}"></span></div>`;
				})
				.join("");
	}
	private text(c: Column, context: Context): string {
		const value = context.getProperty(c.getPath()) as unknown;
		const format = c.getFormatter() as unknown as ((value: unknown, context: Context) => string) | undefined;
		if (format) return String(format(value, context) ?? "");
		if (value === null || value === undefined) return "";
		switch (c.getType()) {
			case "number":
			case "currency":
				return num(Number(value), c.getDecimals());
			case "date":
				return dayText(value);
			case "progress":
				return pct(Number(value));
			case "spark":
				return "";
			default:
				return String(value);
		}
	}
	protected cellHtml(c: Column, context: Context): string {
		const value = context.getProperty(c.getPath()) as unknown;
		const text = this.text(c, context);
		switch (c.getType()) {
			case "link":
				return `<button type="button" tabindex="-1" class="korCellLink" data-open="1">${esc(text)}${iconHtml("arrow-up-right")}</button>`;
			case "currency": {
				const unit = c.getUnitPath() ? context.getProperty(c.getUnitPath()) : "";
				return `<span class="korNum">${esc(text)}</span><span class="korCellUnit">${esc(unit)}</span>`;
			}
			case "status": {
				const state = c.getStatePath() ? (context.getProperty(c.getStatePath()) as string) : ((c.getStates() as Record<string, string>)?.[String(value)] ?? "none");
				return statusHtml(text, state);
			}
			case "progress":
				return `<span class="korMeter"><i style="width:${Math.max(0, Math.min(100, Number(value) || 0))}%"></i></span><span class="korNum">${esc(text)}</span>`;
			case "person":
				return `${faceHtml(text)}<span class="korEllipsis">${esc(text)}</span>`;
			case "spark":
				return sparkHtml(value as number[], 84, 24);
			default:
				return `<span class="korEllipsis${this.numeric(c) ? " korNum" : ""}">${esc(text)}</span>`;
		}
	}
	private rowKey(context: Context): string {
		return context.getPath();
	}
	protected rowEl(row: number, context: Context): HTMLElement {
		const el = document.createElement("div");
		el.className = "korRow";
		el.setAttribute("role", "row");
		el.setAttribute("aria-rowindex", String(row + 2));
		el.style.transform = `translateY(${row * this.rowHeight()}px)`;
		const on = this.picked.has(this.rowKey(context));
		el.innerHTML =
			(this.checks() ? `<div class="korCell korCellCheck" role="gridcell" style="width:${CHECK}px;position:sticky;inset-inline-start:0;z-index:2"><button type="button" tabindex="-1" class="korGridCheck" role="checkbox" data-pick="${row}" aria-label="${esc(message("SELECT_ROW"))}">${iconHtml("check")}</button></div>` : "") +
			this.cols()
				.map((c, i) => `<div class="korCell${this.numeric(c) ? " korCellNum" : ""}${c.getEditable() ? " korCellEdit" : ""}" id="${this.getId()}-${row}-${i}" role="gridcell" aria-colindex="${i + 1}" ${c.getEditable() ? "" : 'aria-readonly="true"'} data-row="${row}" data-col="${i}" style="width:${this.widths[i]}px;${this.pinStyle(i)}">${this.cellHtml(c, context)}</div>`)
				.join("");
		this.markPicked(el, on);
		return el;
	}
	private markPicked(el: HTMLElement, on: boolean): void {
		el.classList.toggle("korRowOn", on);
		el.setAttribute("aria-selected", String(on));
		const check = el.querySelector(".korGridCheck");
		check?.classList.toggle("korOn", on);
		check?.setAttribute("aria-checked", String(on));
	}
	protected paint(): void {
		const body = this.getDomRef("body") as HTMLElement | null;
		if (!body) return;
		const h = this.rowHeight();
		body.style.height = `${this.total * h}px`;
		const span = this.span();
		const last = Math.min(span.last, this.total - 1);
		this.drawn.forEach((el, row) => {
			if (row < span.first || row > last) {
				if (this.editor?.cell.row === row) this.commit(true);
				el.remove();
				this.drawn.delete(row);
			}
		});
		for (let row = span.first; row <= last; row++) {
			const context = this.context(row);
			if (this.drawn.has(row)) continue;
			const el = context ? this.rowEl(row, context) : this.waitRow(row);
			this.drawn.set(row, el);
			body.appendChild(el);
		}
		(this.getDomRef("none") as HTMLElement).hidden = this.total > 0;
		this.scroller()?.setAttribute("aria-rowcount", String(this.total + 1));
		this.marks();
	}
	/** Henüz gelmemiş satırın iskeleti */
	private waitRow(row: number): HTMLElement {
		const el = document.createElement("div");
		el.className = "korRow korRowWait";
		el.setAttribute("role", "row");
		el.setAttribute("aria-rowindex", String(row + 2));
		el.setAttribute("aria-busy", "true");
		el.style.transform = `translateY(${row * this.rowHeight()}px)`;
		el.innerHTML = (this.checks() ? `<div class="korCell" style="width:${CHECK}px"></div>` : "") + this.widths.map((w, i) => `<div class="korCell" role="gridcell" style="width:${w}px"><i class="korBone" style="width:${45 + ((row * 7 + i * 13) % 40)}%;height:11px"></i></div>`).join("");
		return el;
	}
	private range(): { r0: number; r1: number; c0: number; c1: number } {
		return { r0: Math.min(this.active.row, this.anchor.row), r1: Math.max(this.active.row, this.anchor.row), c0: Math.min(this.active.col, this.anchor.col), c1: Math.max(this.active.col, this.anchor.col) };
	}
	protected marks(): void {
		const r = this.range();
		const many = r.r0 !== r.r1 || r.c0 !== r.c1;
		this.drawn.forEach((el, row) => {
			const cells = el.querySelectorAll<HTMLElement>("[data-col]");
			cells.forEach((cell, col) => {
				const inside = many && row >= r.r0 && row <= r.r1 && col >= r.c0 && col <= r.c1;
				cell.classList.toggle("korCellIn", inside);
				cell.classList.toggle("korCellActive", row === this.active.row && col === this.active.col);
			});
		});
		this.scroller()?.setAttribute("aria-activedescendant", this.drawn.has(this.active.row) ? `${this.getId()}-${this.active.row}-${this.active.col}` : "");
		this.paintFoot();
	}
	/** Aralıktaki satır bağlamları; `undefined` ise henüz tümü gelmedi (istek atılmıştır) */
	private rangeContexts(): Context[] | undefined {
		const r = this.range();
		const size = r.r1 - r.r0 + 1;
		if (!this.total) return [];
		const full = (list: Context[]) => {
			for (let i = 0; i < size; i++) if (!list[i]) return false;
			return true;
		};
		const near = this.contexts.slice(r.r0, r.r1 + 1);
		if (near.length === size && full(near)) return near;
		const list = this.fetch(r.r0, size);
		return full(list) ? list : undefined;
	}
	private paintFoot(): void {
		const foot = this.getDomRef("foot");
		if (!foot) return;
		const r = this.range();
		const bits = [`<span>${esc(message("ROWS", [num(this.total)]))}</span>`];
		if (this.picked.size) bits.push(`<span class="korFootOn">${esc(message("SELECTED", [num(this.picked.size)]))}</span>`);
		const count = (r.r1 - r.r0 + 1) * (r.c1 - r.c0 + 1);
		if (count > 1) {
			const cols = this.cols().slice(r.c0, r.c1 + 1).filter((c) => this.numeric(c) || c.getType() === "progress");
			const rows = cols.length ? this.rangeContexts() : [];
			if (!rows) bits.push(`<span class="korFootWait">${iconHtml("refresh-cw")}${esc(message("LOADING"))}</span>`);
			const values = (rows ?? []).flatMap((ctx) => cols.map((c) => Number(ctx.getProperty(c.getPath())))).filter(Number.isFinite);
			bits.push('<span class="korFootGap"></span>', `<span>${esc(message("CELLS", [num(count)]))}</span>`);
			if (values.length > 1) {
				const sum = values.reduce((a, b) => a + b, 0);
				const line = (key: string, v: number) => `<span>${esc(message(key))} <b>${esc(num(v, 2))}</b></span>`;
				bits.push(line("SUM", sum), line("AVG", sum / values.length), line("MIN", values.reduce((a, b) => Math.min(a, b))), line("MAX", values.reduce((a, b) => Math.max(a, b))));
			}
		}
		foot.innerHTML = bits.join("");
	}

	/* Etkileşim */
	protected cellOf(target: HTMLElement): Cell | undefined {
		const el = target.closest<HTMLElement>("[data-col]");
		return el && this.getDomRef()?.contains(el) ? { row: Number(el.dataset.row), col: Number(el.dataset.col) } : undefined;
	}
	private pointerDown(event: PointerEvent): void {
		const target = event.target as HTMLElement;
		this.menu?.float.close();
		const grip = target.closest<HTMLElement>("[data-grip]");
		if (grip) {
			this.resize(event, Number(grip.dataset.grip));
			return;
		}
		const header = target.closest<HTMLElement>(".korGridHead [aria-colindex]");
		if (header && event.button === 0 && event.pointerType !== "touch") {
			this.dragColumn(event, Number(header.getAttribute("aria-colindex")) - 1);
			return;
		}
		if (target.closest(".korCellEditor") || event.button !== 0) return;
		const cell = this.cellOf(target);
		if (!cell) return;
		this.commit(false);
		if (target.closest("[data-open]") || event.pointerType === "touch") {
			this.move(cell, event.shiftKey);
			return;
		}
		event.preventDefault();
		this.scroller()?.focus({ preventScroll: true });
		this.move(cell, event.shiftKey);
		const drag = (e: PointerEvent) => {
			const under = document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null;
			const to = under && this.cellOf(under);
			if (to && (to.row !== this.active.row || to.col !== this.active.col)) this.move(to, true);
		};
		const up = () => {
			window.removeEventListener("pointermove", drag);
			window.removeEventListener("pointerup", up);
		};
		window.addEventListener("pointermove", drag);
		window.addEventListener("pointerup", up);
	}
	private resize(event: PointerEvent, col: number): void {
		event.preventDefault();
		const from = this.widths[col];
		const id = this.cols()[col].getId();
		const sign = isRtl() ? -1 : 1;
		const drag = (e: PointerEvent) => {
			this.userWidths.set(id, Math.max(64, from + sign * (e.clientX - event.clientX)));
			this.repaint();
		};
		const up = () => {
			window.removeEventListener("pointermove", drag);
			window.removeEventListener("pointerup", up);
			this.fireStateChange();
		};
		window.addEventListener("pointermove", drag);
		window.addEventListener("pointerup", up);
	}
	/** Baştaki sabit sütun sayısı; sürüklenen sütun bunların önüne geçemez */
	private pins(): number {
		const at = this.cols().findIndex((c) => !c.getPinned());
		return at < 0 ? this.cols().length : at;
	}
	/**
	 * Görünen `from` sütununu görünen `to` sütununun önüne taşır (`to` = sayı ise sona).
	 * Gizli sütunlar yerinde kalır; etkin hücre kendi sütununu izler.
	 */
	private moveColumn(from: number, to: number): boolean {
		const cols = this.cols();
		const moving = cols[from];
		to = Math.max(this.pins(), Math.min(cols.length, to));
		if (!moving || moving.getPinned() || to === from || to === from + 1) return false;
		const followed = cols[this.active.col];
		const list = this.ordered().filter((c) => c !== moving);
		const before = cols[to];
		list.splice(before ? list.indexOf(before) : list.indexOf(cols[cols.length - 1]) + 1, 0, moving);
		this.order = list.map((c) => this.columnKey(c));
		const now = this.cols();
		this.active = { row: this.active.row, col: Math.max(0, now.indexOf(followed)) };
		this.columnsChanged(true);
		this.say(message("COLUMN_MOVED", [moving.getLabel(), now.indexOf(moving) + 1, now.length]));
		return true;
	}
	/** Ekran okuyucuya kısa bilgi */
	private say(text: string): void {
		const live = this.getDomRef("say");
		if (live) live.textContent = text;
	}
	/** Başlığı sürükleyip bırakarak sütun taşıma (SAP GUI ALV gibi); Escape iptal eder */
	private dragColumn(event: PointerEvent, from: number): void {
		const column = this.cols()[from];
		const head = this.getDomRef("head") as HTMLElement;
		const s = this.scroller() as HTMLElement;
		if (!column || column.getPinned()) return;
		const start = event.clientX;
		const grab = start - (head.querySelector<HTMLElement>(`[aria-colindex="${from + 1}"]`) as HTMLElement).getBoundingClientRect().left;
		let x = start;
		let to = -1;
		let frame = 0;
		let ghost: HTMLElement | undefined;
		let mark: HTMLElement | undefined;
		const headers = () => [...head.querySelectorAll<HTMLElement>("[aria-colindex]")];
		const place = () => {
			const cells = headers();
			const rtl = isRtl();
			const at = cells.findIndex((c) => {
				const r = c.getBoundingClientRect();
				return rtl ? x > r.left + r.width / 2 : x < r.left + r.width / 2;
			});
			to = Math.max(this.pins(), at < 0 ? cells.length : at);
			const box = head.getBoundingClientRect();
			const ref = cells[Math.min(to, cells.length - 1)].getBoundingClientRect();
			const lead = to < cells.length;
			const edge = lead === !rtl ? ref.left : ref.right;
			mark!.style.left = `${edge - box.left - 1}px`;
			mark!.hidden = to === from || to === from + 1;
			ghost!.style.left = `${x - grab}px`;
			ghost!.style.top = `${box.bottom - 12}px`;
		};
		// Kenara yaklaşınca yatay kaydırır
		const tick = () => {
			const r = s.getBoundingClientRect();
			const step = x < r.left + 40 ? -14 : x > r.right - 40 ? 14 : 0;
			if (step) {
				s.scrollLeft += step;
				place();
			}
			frame = requestAnimationFrame(tick);
		};
		const begin = () => {
			this.commit(false);
			const root = this.getDomRef() as HTMLElement;
			root.classList.add("korGridMoving");
			head.querySelector(`[aria-colindex="${from + 1}"]`)?.classList.add("korColDrag");
			(this.getDomRef("body") as HTMLElement).querySelectorAll(`[data-col="${from}"]`).forEach((el) => el.classList.add("korColDrag"));
			mark = document.createElement("div");
			mark.className = "korGridMark";
			mark.style.height = `${s.clientHeight - 8}px`;
			head.appendChild(mark);
			ghost = document.createElement("div");
			ghost.className = "korGridGhost";
			ghost.style.zIndex = String(nextZ());
			ghost.style.width = `${Math.min(220, this.widths[from])}px`;
			ghost.innerHTML = `${iconHtml("grip-vertical")}<span>${esc(column.getLabel())}</span>`;
			staticArea().appendChild(ghost);
			place();
			frame = requestAnimationFrame(tick);
		};
		const end = (drop: boolean) => {
			window.removeEventListener("pointermove", drag);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("keydown", key, true);
			if (!ghost) return;
			cancelAnimationFrame(frame);
			ghost.remove();
			mark?.remove();
			this.getDomRef()?.classList.remove("korGridMoving");
			this.dragged = true;
			window.setTimeout(() => (this.dragged = false));
			if (!drop || !this.moveColumn(from, to)) this.repaint();
			this.scroller()?.focus({ preventScroll: true });
		};
		const drag = (e: PointerEvent) => {
			x = e.clientX;
			if (!ghost && Math.abs(x - start) > 5) begin();
			if (ghost) {
				e.preventDefault();
				place();
			}
		};
		const up = () => end(true);
		const key = (e: KeyboardEvent) => {
			if (e.key !== "Escape") return;
			e.preventDefault();
			e.stopPropagation();
			end(false);
		};
		window.addEventListener("pointermove", drag);
		window.addEventListener("pointerup", up);
		window.addEventListener("keydown", key, true);
	}
	/** İçeriğe göre genişlik: başlık ve çizili satırlar ölçülür */
	private fitColumn(col: number): void {
		const column = this.cols()[col];
		const root = this.getDomRef();
		if (!column || !root) return;
		// Kopya, aynı yerde ama görünmeden ve satır kaydırmadan ölçülür
		const natural = (cell: HTMLElement) => {
			const copy = cell.cloneNode(true) as HTMLElement;
			copy.removeAttribute("id");
			copy.style.cssText = "position:absolute;visibility:hidden;width:max-content;white-space:nowrap;";
			cell.parentElement!.appendChild(copy);
			const width = copy.getBoundingClientRect().width;
			copy.remove();
			return width;
		};
		const cells = [root.querySelector<HTMLElement>(`.korGridHead [aria-colindex="${col + 1}"]`), ...root.querySelectorAll<HTMLElement>(`.korGridBody [data-col="${col}"]`)].filter(Boolean) as HTMLElement[];
		const width = Math.max(64, Math.min(640, Math.ceil(Math.max(...cells.map(natural))) + 2));
		this.userWidths.set(column.getId(), width);
		this.repaint();
		this.fireStateChange();
	}
	private contextMenu(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		const header = target.closest<HTMLElement>(".korGridHead [aria-colindex]");
		// Klavyeden (Menü tuşu, Shift+F10) gelen istek tablonun kendisine düşer
		if (header) this.openMenu(Number(header.getAttribute("aria-colindex")) - 1);
		else if (target === this.scroller() && this.total) this.openMenu(this.active.col);
		else return;
		event.preventDefault();
	}
	/** Sütun menüsü: sıralama, en uygun genişlik, taşıma, gizleme, sütun ayarı */
	private openMenu(col: number): void {
		if (this.menu?.col === col) return;
		this.menu?.float.close();
		const cols = this.cols();
		const column = cols[col];
		const anchor = this.getDomRef("head")?.querySelector<HTMLElement>(`[aria-colindex="${col + 1}"]`);
		if (!column || !anchor) return;
		this.commit(false);
		const rtl = isRtl();
		const mod = isMac() ? "⌘" : "Ctrl+";
		const sortable = column.getSortable() && !!this.getBinding("rows");
		const on = this.sortPath === column.getPath();
		const back = column.getPinned() || col <= this.pins();
		const ahead = column.getPinned() || col >= cols.length - 1;
		type Item = { key: string; icon: string; text: string; off?: boolean; checked?: boolean; hint?: string };
		const items: Item[] = [
			...(sortable ? [{ key: "asc", icon: "arrow-up", text: "SORT_ASC", checked: on && !this.sortDesc }, { key: "desc", icon: "arrow-down", text: "SORT_DESC", checked: on && this.sortDesc }] : []),
			...(sortable && on ? [{ key: "unsort", icon: "x", text: "SORT_CLEAR" }] : []),
			{ key: "fit", icon: "move-horizontal", text: "FIT_WIDTH" },
			{ key: "left", icon: "arrow-left", text: "MOVE_LEFT", off: rtl ? ahead : back, hint: `${mod}←` },
			{ key: "right", icon: "arrow-right", text: "MOVE_RIGHT", off: rtl ? back : ahead, hint: `${mod}→` },
			{ key: "hide", icon: "eye-off", text: "HIDE_COLUMN", off: column.getPinned() || cols.length === 1 },
			{ key: "columns", icon: "columns-3", text: "COLUMNS" }
		];
		const el = document.createElement("div");
		el.className = "korMenu korGridMenu";
		el.setAttribute("role", "menu");
		el.setAttribute("aria-label", message("COLUMN_MENU", [column.getLabel()]));
		el.innerHTML = `<div class="korMenuHead">${esc(column.getLabel())}</div>${items
			.map((item) => {
				const role = item.checked === undefined ? "menuitem" : `menuitemradio" aria-checked="${item.checked}`;
				return `<button type="button" role="${role}" tabindex="-1" class="korMenuItem" data-key="${item.key}"${item.off ? " disabled" : ""}>${iconHtml(item.icon)}<span>${esc(message(item.text))}</span>${item.hint ? `<kbd class="korKbd">${esc(item.hint)}</kbd>` : ""}</button>`;
			})
			.join("")}`;
		const buttons = [...el.querySelectorAll<HTMLButtonElement>("button:not(:disabled)")];
		const close = () => {
			this.menu?.float.close();
			this.scroller()?.focus({ preventScroll: true });
		};
		el.addEventListener("click", (event) => {
			const key = (event.target as HTMLElement).closest<HTMLButtonElement>("button:not(:disabled)")?.dataset.key;
			if (!key) return;
			close();
			const binding = this.getBinding("rows") as Binding | undefined;
			if (key === "asc" || key === "desc") this.sort(column, key === "desc");
			else if (key === "unsort") {
				this.sortPath = "";
				this.sortDesc = false;
				binding?.sort([] as never);
				this.fireStateChange();
			} else if (key === "fit") this.fitColumn(col);
			else if (key === "left" || key === "right") {
				if (this.moveColumn(col, (key === "right") !== rtl ? col + 2 : col - 1)) this.move(this.active, false);
			} else if (key === "hide") {
				this.hidden.add(this.columnKey(column));
				this.columnsChanged(true);
			} else if (key === "columns") this.openSettings(this.getDomRef("head")?.querySelector<HTMLElement>(`[aria-colindex="${Math.min(col, this.cols().length - 1) + 1}"]`) ?? this.scroller()!);
		});
		el.addEventListener("keydown", (event) => {
			const at = buttons.indexOf(document.activeElement as HTMLButtonElement);
			const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
			if (step) {
				event.preventDefault();
				buttons[(at + step + buttons.length) % buttons.length].focus();
			} else if (event.key === "Home" || event.key === "End") {
				event.preventDefault();
				buttons[event.key === "Home" ? 0 : buttons.length - 1].focus();
			} else if (event.key === "Escape" || event.key === "Tab") {
				event.preventDefault();
				event.stopPropagation();
				close();
			}
		});
		this.menu = { float: new Float(anchor, el, () => (this.menu = undefined), false), col };
		buttons[0]?.focus();
	}

	/* Arama (SAP GUI: Ctrl+F bul, Ctrl+G sonrakini bul) */
	private openFind(step = 0): void {
		const root = this.getDomRef() as HTMLElement | null;
		if (!root) return;
		if (!this.finder) {
			const el = document.createElement("div");
			el.className = "korGridFind";
			el.setAttribute("role", "search");
			el.innerHTML = `${iconHtml("search")}<input class="korInput" type="text" spellcheck="false" autocomplete="off" aria-label="${esc(message("FIND"))}" placeholder="${esc(message("FIND"))}…"><span class="korGridFindCount" aria-live="polite"></span><button type="button" class="korCalOpen" data-find="-1" aria-label="${esc(message("FIND_PREV"))}">${iconHtml("chevron-up")}</button><button type="button" class="korCalOpen" data-find="1" aria-label="${esc(message("FIND_NEXT"))}">${iconHtml("chevron-down")}</button><button type="button" class="korCalOpen" data-find="0" aria-label="${esc(message("CLOSE"))}">${iconHtml("x")}</button>`;
			const input = el.querySelector("input") as HTMLInputElement;
			input.value = this.findText;
			this.finder = { el, input, count: el.querySelector(".korGridFindCount") as HTMLElement };
			input.addEventListener("input", () => this.find(0));
			input.addEventListener("keydown", (event) => {
				const mod = event.ctrlKey || event.metaKey;
				const key = event.key.toLowerCase();
				if (event.key === "Enter" || (mod && key === "g") || event.key === "F3") {
					event.preventDefault();
					this.find(event.shiftKey ? -1 : 1);
				} else if (event.key === "Escape") {
					event.preventDefault();
					event.stopPropagation();
					this.closeFind();
				} else if (mod && key === "f") {
					event.preventDefault();
					input.select();
				}
			});
			el.addEventListener("click", (event) => {
				const dir = (event.target as HTMLElement).closest<HTMLElement>("[data-find]")?.dataset.find;
				if (dir === "0") this.closeFind();
				else if (dir) {
					this.find(Number(dir));
					input.focus();
				}
			});
			root.appendChild(el);
			root.classList.add("korGridFinding");
		}
		this.finder.input.focus();
		this.finder.input.select();
		if (this.finder.input.value) this.find(step);
	}
	private closeFind(): void {
		this.finder?.el.remove();
		this.finder = undefined;
		this.getDomRef()?.classList.remove("korGridFinding");
		this.scroller()?.focus({ preventScroll: true });
	}
	/** Eşleşen hücreler, satır sırasıyla; sunucudan gelmemiş satırlar atlanır */
	private matches(query: string): { list: Cell[]; partial: boolean } {
		if (this.hits?.query === query) return this.hits;
		const cols = this.cols();
		const rows = this.fetch(0, this.total);
		const list: Cell[] = [];
		let partial = false;
		for (let row = 0; row < this.total; row++) {
			const context = rows[row];
			if (!context) {
				partial = true;
				continue;
			}
			cols.forEach((c, col) => {
				if (fold(this.text(c, context)).includes(query)) list.push({ row, col });
			});
		}
		this.hits = { query, list, partial };
		return this.hits;
	}
	/** 0: etkin hücreden başlar, 1: sonraki, -1: önceki eşleşme; sona gelince başa döner */
	private find(dir: number): void {
		const finder = this.finder;
		if (!finder) return;
		this.findText = finder.input.value;
		const query = fold(this.findText.trim());
		finder.input.removeAttribute("aria-invalid");
		finder.count.classList.remove("korGridFindNone");
		if (!query) {
			finder.count.textContent = "";
			return;
		}
		const { list, partial } = this.matches(query);
		if (!list.length) {
			finder.input.setAttribute("aria-invalid", "true");
			finder.count.classList.add("korGridFindNone");
			finder.count.textContent = message("FIND_NONE");
			return;
		}
		const cols = this.cols().length;
		const here = this.active.row * cols + this.active.col;
		const at = (c: Cell) => c.row * cols + c.col;
		let i = -1;
		if (dir < 0) for (let k = list.length - 1; k >= 0 && i < 0; k--) i = at(list[k]) < here ? k : -1;
		else i = list.findIndex((c) => (dir ? at(c) > here : at(c) >= here));
		if (i < 0) i = dir < 0 ? list.length - 1 : 0;
		this.move(list[i], false);
		finder.count.textContent = `${message("FIND_COUNT", [num(i + 1), num(list.length)])}${partial ? ` · ${message("FIND_LOADED")}` : ""}`;
	}

	private click(event: MouseEvent): void {
		const target = event.target as HTMLElement;
		if (this.dragged) {
			this.dragged = false;
			return;
		}
		const sort = target.closest<HTMLElement>("[data-sort]");
		if (sort) this.sort(this.cols()[Number(sort.dataset.sort)]);
		else if (target.closest("[data-all]")) this.pickAll();
		else if (target.closest("[data-pick]")) this.pick(Number(target.closest<HTMLElement>("[data-pick]")!.dataset.pick));
		else {
			const cell = this.cellOf(target);
			if (cell && (target.closest("[data-open]") || ((event as PointerEvent).pointerType === "touch" && !this.cols()[cell.col].getEditable()))) this.press(cell.row);
		}
	}
	protected press(row: number): void {
		const context = this.context(row);
		if (context) this.fireRowPress({ context });
	}
	/** Başlığa basış yönü çevirir; menüden yön açıkça verilir */
	private sort(column: Column, desc?: boolean): void {
		const binding = this.getBinding("rows") as Binding | undefined;
		if (!binding) return;
		if (desc !== undefined) this.sortDesc = desc;
		else this.sortDesc = this.sortPath === column.getPath() ? !this.sortDesc : false;
		this.sortPath = column.getPath();
		binding.sort(new Sorter(this.sortPath, this.sortDesc));
		this.fireStateChange();
	}
	private pick(row: number): void {
		const context = this.context(row);
		if (!context) return;
		const key = this.rowKey(context);
		if (!this.picked.delete(key)) this.picked.set(key, context);
		const el = this.drawn.get(row);
		if (el) this.markPicked(el, this.picked.has(key));
		this.pickedChanged();
	}
	private pickAll(): void {
		if (this.picked.size >= this.total) {
			this.picked.clear();
			this.markAll();
		} else this.takeAll();
	}
	/** Tümünü seçer; sunucudan gelmeyen satırlar gelince tamamlanır */
	private takeAll(): void {
		const list = this.fetch(0, this.total);
		this.wantAll = false;
		for (let i = 0; i < this.total; i++) {
			if (!list[i]) {
				this.wantAll = true;
				return;
			}
		}
		list.forEach((c) => this.picked.set(this.rowKey(c), c));
		this.markAll();
	}
	private markAll(): void {
		this.drawn.forEach((el, row) => {
			const context = this.context(row);
			if (context) this.markPicked(el, this.picked.has(this.rowKey(context)));
		});
		this.pickedChanged();
	}
	private pickedChanged(): void {
		this.paintHead();
		this.paintFoot();
		this.fireSelectionChange({ contexts: this.getSelectedContexts() });
	}
	/** Seçili satırların bağlamları, seçim sırasıyla */
	getSelectedContexts(): Context[] {
		// V4 süzme/sıralamadan sonra eski bağlamı yok eder; yok edileni verme
		this.picked.forEach((context, key) => {
			const v4 = context as unknown as { getBinding?(): unknown };
			if (v4.getBinding && !v4.getBinding()) this.picked.delete(key);
		});
		return [...this.picked.values()];
	}
	/** Satır seçimini kaldırır */
	clearSelection(): void {
		this.wantAll = false;
		this.picked.clear();
		this.drawn.forEach((el) => this.markPicked(el, false));
		if (this.getDomRef()) this.pickedChanged();
	}
	protected move(to: Cell, extend: boolean): void {
		this.active = { row: Math.max(0, Math.min(this.total - 1, to.row)), col: Math.max(0, Math.min(this.cols().length - 1, to.col)) };
		if (!extend) this.anchor = this.active;
		const s = this.scroller();
		if (s) {
			const h = this.rowHeight();
			const head = (this.getDomRef("head") as HTMLElement).offsetHeight;
			const y = this.active.row * h;
			if (y < s.scrollTop) s.scrollTop = y;
			else if (y + h > s.scrollTop + s.clientHeight - head) s.scrollTop = y + h - s.clientHeight + head;
			const pins = this.cols().findIndex((c) => !c.getPinned());
			const fixed = this.checks() + this.widths.slice(0, Math.max(0, pins)).reduce((a, b) => a + b, 0);
			if (this.active.col >= pins && pins >= 0) {
				const x = this.checks() + this.widths.slice(0, this.active.col).reduce((a, b) => a + b, 0);
				const sign = isRtl() ? -1 : 1;
				const left = Math.abs(s.scrollLeft);
				if (x - fixed < left) s.scrollLeft = sign * (x - fixed);
				else if (x + this.widths[this.active.col] > left + s.clientWidth) s.scrollLeft = sign * (x + this.widths[this.active.col] - s.clientWidth);
			}
			if (!this.context(this.active.row)) this.load();
			this.paint();
		}
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		if (this.editor || event.target !== this.scroller() || !this.total) return;
		const { row, col } = this.active;
		const mod = event.ctrlKey || event.metaKey;
		const page = Math.max(1, Math.floor((this.scroller()!.clientHeight - 40) / this.rowHeight()) - 1);
		const side = isRtl() ? -1 : 1;
		const lastCol = this.cols().length - 1;
		const moves: Record<string, Cell> = {
			ArrowDown: { row: mod ? this.total - 1 : row + 1, col },
			ArrowUp: { row: mod ? 0 : row - 1, col },
			ArrowRight: { row, col: col + side },
			ArrowLeft: { row, col: col - side },
			PageDown: { row: row + page, col },
			PageUp: { row: row - page, col },
			Home: { row: mod ? 0 : row, col: 0 },
			End: { row: mod ? this.total - 1 : row, col: lastCol }
		};
		const key = event.key.toLowerCase();
		if (mod && !event.shiftKey && !event.altKey && (event.key === "ArrowLeft" || event.key === "ArrowRight")) {
			// Ctrl+← / Ctrl+→: etkin sütunu taşır (UI5 tablo ve Kor Board ile aynı)
			event.preventDefault();
			const ahead = (event.key === "ArrowRight") === (side > 0);
			if (this.moveColumn(col, ahead ? col + 2 : col - 1)) this.move(this.active, false);
		} else if (moves[event.key]) {
			event.preventDefault();
			this.move(moves[event.key], event.shiftKey);
		} else if (mod && !event.altKey && key === "f") {
			event.preventDefault();
			this.openFind();
		} else if (mod && !event.altKey && key === "g") {
			event.preventDefault();
			this.openFind(event.shiftKey ? -1 : 1);
		} else if (event.key === "F10" && event.shiftKey) {
			event.preventDefault();
			this.openMenu(col);
		} else if (event.key === "Enter" || event.key === "F2") {
			event.preventDefault();
			if (!this.edit(this.active)) this.press(row);
		} else if (event.key === " " && this.checks()) {
			event.preventDefault();
			this.pick(row);
		} else if (mod && event.key.toLowerCase() === "a") {
			event.preventDefault();
			this.anchor = { row: 0, col: 0 };
			this.active = { row: this.total - 1, col: lastCol };
			this.marks();
		} else if (event.key === "Escape") {
			this.anchor = this.active;
			this.marks();
		} else if (event.key.length === 1 && !mod && !event.altKey && this.edit(this.active, event.key)) event.preventDefault();
	}
	private edit(cell: Cell, typed?: string): boolean {
		const column = this.cols()[cell.col];
		const context = this.context(cell.row);
		const el = this.drawn.get(cell.row)?.querySelector<HTMLElement>(`[data-col="${cell.col}"]`);
		if (!column?.getEditable() || !context || !el) return false;
		this.commit(false);
		const value = context.getProperty(column.getPath()) as unknown;
		const options = column.getOptions() as string[] | undefined;
		let input: HTMLInputElement | HTMLSelectElement;
		if (options) {
			input = document.createElement("select");
			input.innerHTML = options.map((o) => `<option${o === value ? " selected" : ""}>${esc(o)}</option>`).join("");
		} else {
			input = document.createElement("input");
			if (column.getType() === "date") {
				input.value = typed ?? showDate(value);
			} else input.value = typed ?? (column.getType() === "progress" ? String(value ?? "") : this.text(column, context));
		}
		input.className = "korCellEditor";
		input.setAttribute("aria-label", column.getLabel());
		el.classList.add("korCellEditing");
		el.replaceChildren(input);
		this.editor = { cell, input };
		input.focus();
		if (column.getType() === "date") {
			const text = input as HTMLInputElement;
			const date = toDate(value);
			const calendar = new Calendar({ id: `${this.getId()}-date`, start: date, onPick: (picked) => {
				text.value = isoDate(picked);
				this.commit(false);
				this.scroller()?.focus({ preventScroll: true });
			} });
			const float = new Float(el, calendar.element, undefined, false);
			this.editor.close = () => float.close();
			text.addEventListener("input", () => {
				calendar.active = false;
				const typedDate = readDate(text.value);
				if (typedDate) calendar.follow(typedDate);
			});
			text.addEventListener("keydown", (event) => {
				if (calendar.key(event)) {
					event.preventDefault();
					event.stopImmediatePropagation();
				}
			});
		}
		if (!typed && input instanceof HTMLInputElement && input.type === "text") input.select();
		input.addEventListener("keydown", (raw) => {
			const event = raw as KeyboardEvent;
			event.stopPropagation();
			if (event.key === "Escape") {
				event.preventDefault();
				this.cancel();
			} else if (event.key === "Enter" || event.key === "Tab") {
				event.preventDefault();
				this.commit(false);
				this.move(event.key === "Enter" ? { row: cell.row + 1, col: cell.col } : { row: cell.row, col: cell.col + (event.shiftKey ? -1 : 1) }, false);
				this.scroller()?.focus({ preventScroll: true });
			}
		});
		input.addEventListener("blur", () => this.commit(false));
		return true;
	}
	private cancel(): void {
		const editor = this.editor;
		this.editor = undefined;
		editor?.close?.();
		if (editor) this.settle(editor.cell.row);
		this.scroller()?.focus({ preventScroll: true });
	}
	private settle(row: number): void {
		if (this.stale) {
			this.stale = false;
			this.repaint();
		} else this.redraw(row);
	}
	private redraw(row: number): void {
		const old = this.drawn.get(row);
		const context = this.context(row);
		if (!old || !context) return;
		const el = this.rowEl(row, context);
		old.replaceWith(el);
		this.drawn.set(row, el);
		this.marks();
	}
	private commit(leaving: boolean): void {
		const editor = this.editor;
		if (!editor) return;
		this.editor = undefined;
		editor.close?.();
		this.write(editor.cell, editor.input.value);
		if (!leaving) this.settle(editor.cell.row);
	}
	private write(cell: Cell, text: string): boolean {
		const column = this.cols()[cell.col];
		const context = this.context(cell.row);
		if (!column?.getEditable() || !context) return false;
		const path = column.getPath();
		const oldValue = context.getProperty(path) as unknown;
		let value: unknown = text;
		if (this.numeric(column) || column.getType() === "progress") {
			const n = text.trim() === "" ? NaN : parseNum(text);
			if (!Number.isFinite(n)) return false;
			// Edm.Decimal / Int64 metin olarak taşınır
			value = this.textNumber(column, oldValue) ? String(n) : n;
		}
		const options = column.getOptions() as string[] | undefined;
		if (options && !options.includes(text)) return false;
		if (column.getType() === "date") {
			const date = readDate(text);
			if (!date) return false;
			if (toDate(oldValue)?.getTime() === date.getTime()) return true;
			value = dateValue(date, oldValue, context.getModel());
		}
		if (value === oldValue) return true;
		const model = context.getModel() as unknown as { setProperty?(path: string, value: unknown, context: Context): void };
		const v4 = context as unknown as { setProperty?(path: string, value: unknown): Promise<void>; resetChanges?(): unknown; getBinding?(): { resetChanges?(): unknown } };
		if (v4.setProperty) {
			v4.setProperty(path, value)?.catch?.((error: Error & { canceled?: boolean }) => {
				if (error.canceled) return;
				// Sunucu reddetti: değer geri alınır ve kullanıcıya söylenir
				if (v4.resetChanges) void v4.resetChanges();
				else void v4.getBinding?.()?.resetChanges?.();
				Toast.show(message("SAVE_FAILED"), { text: error.message, state: "danger" });
				window.setTimeout(() => this.repaint());
			});
		} else model.setProperty?.(path, value, context);
		this.fireCellChange({ context, path, value, oldValue });
		return true;
	}
	private textNumber(column: Column, old: unknown): boolean {
		const sample = old ?? this.contexts.find((c) => c && c.getProperty(column.getPath()) != null)?.getProperty(column.getPath());
		return typeof sample === "string";
	}
	private copy(event: ClipboardEvent): void {
		if (this.editor || !this.total || event.target !== this.scroller()) return;
		const r = this.range();
		const cols = this.cols().slice(r.c0, r.c1 + 1);
		event.preventDefault();
		const rows = this.rangeContexts();
		if (!rows) {
			Toast.show(message("COPY_WAIT"), { state: "wait", duration: 3000 });
			return;
		}
		const text = rows.map((ctx) => cols.map((c) => this.text(c, ctx)).join("\t")).join("\n");
		event.clipboardData?.setData("text/plain", text);
		Toast.show(message("COPIED", [num((r.r1 - r.r0 + 1) * cols.length)]), { state: "info", duration: 1800 });
	}
	private paste(event: ClipboardEvent): void {
		if (this.editor || !this.total || event.target !== this.scroller()) return;
		event.preventDefault();
		const r = this.range();
		const lines = (event.clipboardData?.getData("text/plain") ?? "").replace(/\r?\n$/, "").split(/\r?\n/);
		let count = 0;
		lines.forEach((line, i) => line.split("\t").forEach((text, j) => {
			if (this.write({ row: r.r0 + i, col: r.c0 + j }, text)) count++;
		}));
		this.repaint();
		Toast.show(message("PASTED", [num(count)]), { state: count ? "success" : "wait", duration: 2200 });
	}
	static renderer = gridRenderer;
}
