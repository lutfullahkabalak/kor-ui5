import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { isRtl, message, num, renderIcon } from "./util";
import "./library";

type PivotRow = { name: string; path: string[]; list: Record<string, unknown>[]; values: (number | null)[]; total: number | null };

/**
 * Özet tablo: satır ve sütun alanlarına göre toplar, dalları açılır. Veri tarayıcıda işlenir.
 *
 * @namespace kor.ui
 */
export default class Pivot extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $PivotSettings);
	constructor(id?: string, settings?: $PivotSettings);
	constructor(id?: string, settings?: $PivotSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Kayıt dizisi */
			data: { type: "any", defaultValue: null, bindable: "bindable" },
			/** Satır alanları, dıştan içe */
			rows: { type: "string[]", defaultValue: [] },
			/** Sütun alanı */
			column: { type: "string", defaultValue: "" },
			/** Toplanacak alan */
			value: { type: "string", defaultValue: "" },
			/** sum, count, avg, min veya max */
			aggregate: { type: "string", defaultValue: "sum" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** İlk sütun başlığı */
			rowLabel: { type: "string", defaultValue: "" },
			/** Başta açık düzey; 1 yalnız ilk düzey görünür */
			expandedLevels: { type: "int", defaultValue: 1 },
			/** Yükseklik; boşsa içerik kadar */
			height: { type: "string", defaultValue: "" }
		},
		events: {
			/** Hücreye basıldı; alan ve değer çiftleri */
			cellPress: { parameters: { filters: { type: "object" }, value: { type: "any" } } }
		}
	};
	private state = new Map<string, boolean>();
	private sort?: { column: string | null; desc: boolean };
	private shownRows: PivotRow[] = [];
	private shownColumns: string[] = [];

	private records(): Record<string, unknown>[] {
		const data = this.getData() as unknown;
		return Array.isArray(data) ? (data as Record<string, unknown>[]) : [];
	}
	private reduce(list: Record<string, unknown>[]): number | null {
		if (this.getAggregate() === "count") return list.length || null;
		const field = this.getValue();
		// OData Edm.Decimal metin gelir
		const values = list.map((row) => row[field]).filter((v) => v !== null && v !== undefined && v !== "").map(Number).filter((v) => !Number.isNaN(v));
		if (!values.length) return null;
		const sum = values.reduce((a, b) => a + b, 0);
		switch (this.getAggregate()) {
			case "avg": return sum / values.length;
			case "min": return values.reduce((a, b) => Math.min(a, b));
			case "max": return values.reduce((a, b) => Math.max(a, b));
			default: return sum;
		}
	}
	private split(list: Record<string, unknown>[], field: string): Map<string, Record<string, unknown>[]> {
		const out = new Map<string, Record<string, unknown>[]>();
		list.forEach((row) => {
			const key = String(row[field] ?? "");
			const found = out.get(key);
			if (found) found.push(row);
			else out.set(key, [row]);
		});
		return out;
	}
	private make(name: string, path: string[], list: Record<string, unknown>[]): PivotRow {
		const byColumn = this.getColumn() ? this.split(list, this.getColumn()) : new Map<string, Record<string, unknown>[]>();
		return { name, path, list, values: this.shownColumns.map((column) => this.reduce(byColumn.get(column) ?? [])), total: this.reduce(list) };
	}
	private build(): PivotRow {
		const data = this.records();
		this.shownColumns = this.getColumn() ? [...this.split(data, this.getColumn()).keys()].sort((a, b) => a.localeCompare(b, undefined, { numeric: true })) : [];
		this.shownRows = [];
		const fields = this.getRows();
		const walk = (list: Record<string, unknown>[], path: string[]) => {
			const field = fields[path.length];
			if (!field) return;
			const rows = [...this.split(list, field)].map(([name, part]) => this.make(name, [...path, name], part));
			rows.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true }));
			if (this.sort) {
				const { column, desc } = this.sort;
				const i = column === null ? -1 : this.shownColumns.indexOf(column);
				const of = (row: PivotRow) => (i < 0 ? row.total : row.values[i]);
				rows.sort((a, b) => {
					const [x, y] = [of(a), of(b)];
					// Boş hücreler hep sonda
					if (x === null || y === null) return (x === null ? 1 : 0) - (y === null ? 1 : 0);
					return desc ? y - x : x - y;
				});
			}
			rows.forEach((row) => {
				this.shownRows.push(row);
				if (row.path.length < fields.length && this.opened(row.path)) walk(row.list, row.path);
			});
		};
		walk(data, []);
		return this.make(message("TOTAL"), [], data);
	}
	private opened(path: string[]): boolean {
		return this.state.get(JSON.stringify(path)) ?? path.length < this.getExpandedLevels();
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const twist = target.closest<HTMLElement>("[data-twist]")?.dataset.twist;
		const order = target.closest<HTMLElement>("[data-sort]")?.dataset.sort;
		const cell = target.closest<HTMLElement>("[data-cell]")?.dataset.cell;
		if (twist !== undefined) {
			const { path } = this.shownRows[Number(twist)];
			this.state.set(JSON.stringify(path), !this.opened(path));
			this.invalidate();
		} else if (order !== undefined) {
			const column = order === "" ? null : this.shownColumns[Number(order)];
			const same = this.sort && this.sort.column === column;
			// Önce azalan, sonra artan, sonra ad sırası
			this.sort = !same ? { column, desc: true } : this.sort!.desc ? { column, desc: false } : undefined;
			this.invalidate();
		} else if (cell !== undefined) {
			const [r, k] = cell.split("|").map(Number);
			const row = this.shownRows[r];
			const filters: Record<string, string> = {};
			row?.path.forEach((value, i) => (filters[this.getRows()[i]] = value));
			if (k >= 0) filters[this.getColumn()] = this.shownColumns[k];
			this.fireCellPress({ filters, value: row ? (k >= 0 ? row.values[k] : row.total) : this.make("", [], this.records()).total });
		}
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Pivot) {
			const sum = c.build();
			const live = c.hasListeners("cellPress");
			const none = c.shownRows.length === 0;
			const head = (text: string, key: string, on: boolean) => {
				rm.openStart("th").attr("scope", "col").class("korCellNum").attr("aria-sort", on ? (c.sort!.desc ? "descending" : "ascending") : "none").openEnd();
				rm.openStart("button", `${c.getId()}-s${key}`).attr("type", "button").class("korSort").attr("data-sort", key).openEnd().text(text || "–");
				if (on) renderIcon(rm, c.sort!.desc ? "arrow-down" : "arrow-up");
				rm.close("button").close("th");
			};
			const cell = (value: number | null, r: number, k: number, cls = "") => {
				rm.openStart("td").class("korCellNum").class("korNum");
				if (cls) rm.class(cls);
				rm.openEnd();
				const text = value === null ? "" : num(value, c.getAggregate() === "count" ? 0 : c.getDecimals());
				if (live && value !== null) rm.openStart("button").attr("type", "button").attr("data-cell", `${r}|${k}`).openEnd().text(text).close("button");
				else rm.text(text);
				rm.close("td");
			};
			const line = (row: PivotRow, r: number) => {
				row.values.forEach((value, k) => cell(value, r, k));
				cell(row.total, r, -1, "korPivotSum");
			};
			rm.openStart("div", c).class("korPivot").attr("tabindex", "0").attr("role", "region").attr("aria-label", c.getLabel() || message("PIVOT"));
			if (c.getHeight()) rm.style("max-height", c.getHeight());
			rm.openEnd().openStart("table").openEnd();
			rm.openStart("thead").openEnd().openStart("tr").openEnd();
			rm.openStart("th").attr("scope", "col").openEnd().text(c.getRowLabel());
			if (c.getUnit()) rm.openStart("span").class("korUnit").openEnd().text(` ${c.getUnit()}`).close("span");
			rm.close("th");
			c.shownColumns.forEach((column, k) => head(column, String(k), c.sort?.column === column));
			head(message("TOTAL"), "", !!c.sort && c.sort.column === null);
			rm.close("tr").close("thead").openStart("tbody").openEnd();
			if (none) rm.openStart("tr").openEnd().openStart("td").attr("colspan", c.shownColumns.length + 2).class("korMenuNone").openEnd().text(message("NO_DATA")).close("td").close("tr");
			c.shownRows.forEach((row, r) => {
				const branch = row.path.length < c.getRows().length;
				const open = branch && c.opened(row.path);
				rm.openStart("tr").class(`korPivot${Math.min(3, row.path.length)}`);
				if (branch) rm.class("korPivotBranch");
				rm.openEnd();
				rm.openStart("th").attr("scope", "row").style("--kor-level", String(row.path.length - 1)).openEnd();
				if (branch) {
					rm.openStart("button").attr("type", "button").class("korTwist").attr("data-twist", r).attr("aria-expanded", String(open)).attr("aria-label", `${message(open ? "COLLAPSE" : "EXPAND")}: ${row.name}`).openEnd();
					renderIcon(rm, open ? "chevron-down" : isRtl() ? "chevron-left" : "chevron-right");
					rm.close("button");
				} else rm.openStart("span").class("korTwist0").openEnd().close("span");
				rm.openStart("span").openEnd().text(row.name || "–").close("span").close("th");
				line(row, r);
				rm.close("tr");
			});
			rm.close("tbody");
			if (!none) {
				rm.openStart("tfoot").openEnd().openStart("tr").openEnd().openStart("th").attr("scope", "row").openEnd().text(message("TOTAL")).close("th");
				line(sum, -1);
				rm.close("tr").close("tfoot");
			}
			rm.close("table").close("div");
		}
	};
}
