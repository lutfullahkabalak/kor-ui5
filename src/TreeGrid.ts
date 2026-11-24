import type Context from "sap/ui/model/Context";
import type Column from "./Column";
import DataGrid from "./DataGrid";
import gridRenderer from "./gridRenderer";
import { esc, iconHtml, isRtl, message } from "./util";
import "./library";

type TreeBinding = {
	getRootContexts(start: number, length: number, threshold?: number): Context[];
	getNodeContexts(context: Context, start: number, length: number, threshold?: number): Context[];
	hasChildren(context: Context): boolean;
};
type Node = { context: Context; level: number; parent: string; open: boolean; branch: boolean };
const ALL = 100000;

/**
 * Ağaç tablo. `rows` bir UI5 ağaç bağlamasıdır: `rows="{path: '/nodes', parameters: {arrayNames: ['children']}}"`.
 * DataGrid'in tüm özellikleri geçerlidir.
 *
 * @namespace kor.ui
 */
export default class TreeGrid extends DataGrid {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TreeGridSettings);
	constructor(id?: string, settings?: $TreeGridSettings);
	constructor(id?: string, settings?: $TreeGridSettings) {
		super(id, settings);
	}

	static readonly metadata: object = {
		library: "kor.ui",
		properties: {
			/** İlk çizimde açık düzey sayısı */
			openLevels: { type: "int", defaultValue: 1 }
		},
		events: {
			/** Dal açıldı veya kapandı; açılırken alt kayıtlar yüklenebilir */
			toggle: { parameters: { context: { type: "object" }, open: { type: "boolean" } } }
		}
	};
	private open = new Set<string>();
	private nodes: Node[] = [];
	private started = false;
	private fresh = new Set<string>();

	gridRole(): string {
		return "treegrid";
	}
	isTreeBinding(name: string): boolean {
		return name === "rows";
	}
	private tree(): TreeBinding | undefined {
		return this.getBinding("rows") as unknown as TreeBinding | undefined;
	}
	private walk(visit: (context: Context, level: number) => void, deep: (context: Context, level: number) => boolean): void {
		const tree = this.tree();
		const step = (list: Context[], level: number) =>
			list.forEach((context) => {
				visit(context, level);
				if (tree!.hasChildren(context) && deep(context, level)) step(tree!.getNodeContexts(context, 0, ALL, 0), level + 1);
			});
		if (tree) step(tree.getRootContexts(0, ALL, 0), 0);
	}
	protected load(): void {
		// Kurucu içindeki bağlamada alanlar henüz atanmamıştır; çizimde yeniden yüklenir
		if (!this.open) return;
		const tree = this.tree();
		this.nodes = [];
		if (tree) {
			if (!this.started && tree.getRootContexts(0, 1, 0).length) {
				this.started = true;
				this.walk((context, level) => level < this.getOpenLevels() && this.open.add(context.getPath()), (_, level) => level < this.getOpenLevels());
			}
			const parents: string[] = [];
			this.walk((context, level) => {
				const path = context.getPath();
				parents[level] = path;
				const branch = tree.hasChildren(context);
				this.nodes.push({ context, level, parent: level ? parents[level - 1] : "", branch, open: branch && this.open.has(path) });
			}, (context) => this.open.has(context.getPath()));
		}
		this.contexts = this.nodes.map((n) => n.context);
		this.total = this.nodes.length;
	}
	protected fetch(start: number, length: number): Context[] {
		return this.contexts.slice(start, start + length);
	}
	protected cellHtml(column: Column, context: Context): string {
		const html = super.cellHtml(column, context);
		if (column !== this.cols()[0]) return html;
		const node = this.nodes.find((n) => n.context === context);
		if (!node) return html;
		return `<span class="korTreePad" style="width:${node.level * 22}px"></span>${node.branch ? `<button type="button" tabindex="-1" class="korTwist${node.open ? " korOn" : ""}" data-twist="1" aria-label="${esc(message(node.open ? "COLLAPSE" : "EXPAND"))}">${iconHtml("chevron-right")}</button>` : '<span class="korTwist0"></span>'}${html}`;
	}
	protected rowEl(row: number, context: Context): HTMLElement {
		const el = super.rowEl(row, context);
		const node = this.nodes[row];
		el.setAttribute("aria-level", String(node.level + 1));
		el.classList.add(`korLevel${Math.min(node.level, 3)}`);
		if (node.branch) {
			el.setAttribute("aria-expanded", String(node.open));
			el.classList.add("korBranch");
		}
		if (this.fresh.has(context.getPath())) el.classList.add("korRowFresh");
		return el;
	}
	/** Dalı açar veya kapatır */
	toggle(row: number, to?: boolean): void {
		const node = this.nodes[row];
		if (!node?.branch) return;
		const path = node.context.getPath();
		const open = to ?? !node.open;
		if (open === node.open) return;
		if (open) this.open.add(path);
		else this.open.delete(path);
		const before = new Set(this.nodes.map((n) => n.context.getPath()));
		this.fireToggle({ context: node.context, open });
		this.load();
		// Yalnızca yeni gelen satırlar canlanır
		this.fresh = open ? new Set(this.nodes.map((n) => n.context.getPath()).filter((p) => !before.has(p))) : new Set();
		this.repaint();
		this.fresh.clear();
	}
	/** Verilen düzeye kadar açar; 0 hepsini kapatır */
	expandToLevel(level: number): void {
		this.open.clear();
		this.started = true;
		this.walk((context, at) => at < level && this.open.add(context.getPath()), (_, at) => at < level);
		this.active = this.anchor = { row: 0, col: this.active.col };
		this.repaint();
	}
	onclick(event: { target: EventTarget | null }): void {
		const target = event.target as HTMLElement;
		if (!target.closest("[data-twist]")) return;
		const cell = this.cellOf(target);
		if (cell) this.toggle(cell.row);
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		const node = this.nodes[this.active.row];
		const right = event.key === (isRtl() ? "ArrowLeft" : "ArrowRight");
		const left = event.key === (isRtl() ? "ArrowRight" : "ArrowLeft");
		const inGrid = (event.target as HTMLElement).getAttribute("role") === "treegrid";
		if (node && inGrid && this.active.col === 0 && !event.shiftKey && !event.ctrlKey && !event.metaKey) {
			if (right && node.branch && !node.open) {
				event.preventDefault();
				this.toggle(this.active.row, true);
				return;
			}
			if (left && node.open) {
				event.preventDefault();
				this.toggle(this.active.row, false);
				return;
			}
			if (left && node.parent) {
				event.preventDefault();
				this.move({ row: this.nodes.findIndex((n) => n.context.getPath() === node.parent), col: 0 }, false);
				return;
			}
		}
		super.onkeydown(raw);
	}
	getState(): object {
		return { ...super.getState(), open: [...this.open].sort() };
	}
	setState(state: Parameters<DataGrid["setState"]>[0] & { open?: string[] }): void {
		if (state.open) {
			this.open = new Set(state.open);
			this.started = true;
		}
		super.setState(state);
	}
	static renderer = gridRenderer;
}
