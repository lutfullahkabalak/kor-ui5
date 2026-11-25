import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type CompareRow from "./CompareRow";
import type { Press } from "./util";
import { message, num, renderIcon, renderStatus } from "./util";
import "./library";

/**
 * Teklif, sürüm veya kayıtları yan yana karşılaştırır; farkları işaretler.
 *
 * @namespace kor.ui
 */
export default class Compare extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CompareSettings);
	constructor(id?: string, settings?: $CompareSettings);
	constructor(id?: string, settings?: $CompareSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "rows",
		properties: {
			/** Yalnız farklı satırlar */
			onlyDifferences: { type: "boolean", defaultValue: false, bindable: "bindable" },
			/** Fark düğmesini göster */
			toggle: { type: "boolean", defaultValue: true },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Temel sütunun sırası; -1 temel yok */
			baseline: { type: "int", defaultValue: 0 }
		},
		aggregations: {
			/** Karşılaştırılanlar */
			columns: { type: "kor.ui.CompareColumn", multiple: true, singularName: "column" },
			/** Alanlar */
			rows: { type: "kor.ui.CompareRow", multiple: true, singularName: "row" }
		},
		events: {
			/** Sütun düğmesine basıldı */
			columnPress: { parameters: { key: { type: "string" } } }
		}
	};
	private values(row: CompareRow): unknown[] {
		const list = (row.getValues() as unknown as unknown[] | null) ?? [];
		return this.getColumns().map((_, i) => list[i] ?? "");
	}
	private base(values: unknown[]): string | undefined {
		const i = this.getBaseline();
		return i >= 0 && i < values.length ? String(values[i]) : undefined;
	}
	/** Bir satırın değerleri farklıysa true. */
	differs(row: CompareRow): boolean {
		return new Set(this.values(row).map(String)).size > 1;
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		if (target.closest("[data-diff]")) this.setOnlyDifferences(!this.getOnlyDifferences());
		const i = target.closest<HTMLElement>("[data-pick]")?.dataset.pick;
		if (i !== undefined) this.fireColumnPress({ key: this.getColumns()[Number(i)].getKey() });
	}
	private best(row: CompareRow, values: unknown[]): string | undefined {
		const numbers = values.filter((v) => v !== "").map(Number);
		if (!row.getBest() || numbers.length < 2 || numbers.some((n) => Number.isNaN(n)) || new Set(numbers).size < 2) return undefined;
		return String(row.getBest() === "max" ? Math.max(...numbers) : Math.min(...numbers));
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Compare) {
			const columns = c.getColumns();
			const rows = c.getRows();
			const diff = rows.filter((row) => c.differs(row));
			const shown = c.getOnlyDifferences() ? diff : rows;
			rm.openStart("div", c).class("korCompare").openEnd();
			if (c.getToggle()) {
				rm.openStart("button", `${c.getId()}-diff`).attr("type", "button").class("korCompareToggle").attr("data-diff", "1").attr("aria-pressed", String(c.getOnlyDifferences())).openEnd();
				rm.text(message("ONLY_DIFF")).openStart("span").class("korInboxCount").class("korNum").openEnd().text(`${diff.length} / ${rows.length}`).close("span").close("button");
			}
			rm.openStart("div").class("korCompareScroll").attr("tabindex", "0").attr("role", "region").attr("aria-label", c.getLabel() || message("COMPARE")).openEnd();
			rm.openStart("table").openEnd().openStart("thead").openEnd().openStart("tr").openEnd();
			rm.openStart("td").openEnd().close("td");
			columns.forEach((column, i) => {
				rm.openStart("th", column).attr("scope", "col");
				if (i === c.getBaseline()) rm.class("korCompareBase");
				rm.openEnd();
				rm.openStart("span").class("korCompareTitle").openEnd().text(column.getTitle()).close("span");
				if (column.getText()) rm.openStart("span").class("korCompareText").openEnd().text(column.getText()).close("span");
				if (column.getState()) renderStatus(rm, column.getStatusText(), column.getState());
				if (column.getActionText()) rm.openStart("button", `${column.getId()}-a`).attr("type", "button").class("korBtn").class("korBtn-neutral").attr("data-pick", i).attr("aria-label", `${column.getActionText()}: ${column.getTitle()}`).openEnd().text(column.getActionText()).close("button");
				rm.close("th");
			});
			rm.close("tr").close("thead").openStart("tbody").openEnd();
			let group = "";
			shown.forEach((row) => {
				if (row.getGroup() !== group) {
					group = row.getGroup();
					if (group) rm.openStart("tr").class("korCompareGroup").openEnd().openStart("th").attr("colspan", columns.length + 1).attr("scope", "colgroup").openEnd().text(group).close("th").close("tr");
				}
				const values = c.values(row);
				const base = c.base(values);
				const best = c.best(row, values);
				rm.openStart("tr", row).openEnd();
				rm.openStart("th").attr("scope", "row").openEnd().text(row.getLabel()).close("th");
				values.forEach((value, i) => {
					const other = base !== undefined && i !== c.getBaseline() && String(value) !== base;
					rm.openStart("td");
					if (other) rm.class("korCompareDiff");
					if (best !== undefined && String(Number(value)) === best && value !== "") rm.class("korCompareBest");
					rm.openEnd().openStart("span").openEnd();
					if (best !== undefined && value !== "" && String(Number(value)) === best) {
						renderIcon(rm, "check");
						rm.openStart("span").class("korSr").openEnd().text(`${message("BEST")}: `).close("span");
					}
					if (other) rm.openStart("span").class("korSr").openEnd().text(`${message("DIFFERENT")}: `).close("span");
					rm.text(value === "" ? "–" : typeof value === "number" ? num(value, row.getDecimals()) : String(value));
					if (value !== "" && row.getUnit()) rm.text(` ${row.getUnit()}`);
					rm.close("span").close("td");
				});
				rm.close("tr");
			});
			if (!shown.length) rm.openStart("tr").openEnd().openStart("td").attr("colspan", columns.length + 1).class("korMenuNone").openEnd().text(message(rows.length ? "NO_DIFF" : "NO_DATA")).close("td").close("tr");
			rm.close("tbody").close("table").close("div").close("div");
		}
	};
}
