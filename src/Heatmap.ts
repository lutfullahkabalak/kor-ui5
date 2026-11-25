import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type HeatCell from "./HeatCell";
import type { Press } from "./util";
import { isRtl, message, num } from "./util";
import "./library";

/**
 * Satır ve sütun kesişimindeki yoğunluğu renkle ve sayıyla gösterir.
 *
 * @namespace kor.ui
 */
export default class Heatmap extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $HeatmapSettings);
	constructor(id?: string, settings?: $HeatmapSettings);
	constructor(id?: string, settings?: $HeatmapSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "cells",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Satır sırası; boşsa veri sırası */
			rowOrder: { type: "string[]", defaultValue: [] },
			/** Sütun sırası; boşsa veri sırası */
			columnOrder: { type: "string[]", defaultValue: [] }
		},
		aggregations: {
			/** Hücreler */
			cells: { type: "kor.ui.HeatCell", multiple: true, singularName: "cell" }
		},
		events: {
			/** Hücreye basıldı */
			cellPress: { parameters: { row: { type: "string" }, column: { type: "string" }, value: { type: "float" } } }
		}
	};
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i === undefined) return;
		const cell = this.getCells()[Number(i)];
		this.fireCellPress({ row: cell.getRow(), column: cell.getColumn(), value: cell.getValue() });
	}
	onkeydown(event: KeyboardEvent): void {
		const button = (event.target as HTMLElement).closest<HTMLElement>("[data-i]");
		const side = isRtl() ? -1 : 1;
		const step = { ArrowRight: [0, side], ArrowLeft: [0, -side], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[event.key];
		if (!button || !step) return;
		event.preventDefault();
		let r = Number(button.dataset.r);
		let k = Number(button.dataset.c);
		const root = this.getDomRef() as HTMLElement;
		// Boş hücreler atlanır
		for (let n = 0; n < 200; n++) {
			r += step[0];
			k += step[1];
			const next = root.querySelector<HTMLElement>(`[data-r="${r}"][data-c="${k}"]`);
			if (!next) {
				if (!root.querySelector(`[data-slot="${r}-${k}"]`)) return;
				continue;
			}
			button.tabIndex = -1;
			next.tabIndex = 0;
			next.focus();
			return;
		}
	}
	private keys(order: string[], found: string[]): string[] {
		const seen = [...new Set(found)];
		return [...order.filter((k) => seen.includes(k)), ...seen.filter((k) => !order.includes(k))];
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Heatmap) {
			const cells = c.getCells();
			const rows = c.keys(c.getRowOrder(), cells.map((cell) => cell.getRow()));
			const columns = c.keys(c.getColumnOrder(), cells.map((cell) => cell.getColumn()));
			const values = cells.map((cell) => cell.getValue());
			const low = Math.min(...values);
			const high = Math.max(...values);
			const signed = low < 0;
			const reach = signed ? Math.max(Math.abs(low), Math.abs(high)) : high;
			// Eksi değer varsa sıfır ortadadır; yoksa en düşükten en yükseğe
			const part = (value: number) => (signed ? Math.abs(value) / (reach || 1) : high === low ? 0.5 : (value - low) / (high - low));
			const shown = (value: number) => num(value, c.getDecimals());
			const byPlace = new Map<string, [HeatCell, number]>(cells.map((cell, i) => [JSON.stringify([cell.getRow(), cell.getColumn()]), [cell, i]]));
			let focus = true;
			const live = c.hasListeners("cellPress");
			rm.openStart("div", c).class("korHeat").openEnd();
			if (!cells.length) rm.openStart("div").class("korMenuNone").openEnd().text(message("NO_DATA")).close("div");
			else {
				rm.openStart("div").class("korHeatScroll").openEnd();
				rm.openStart("table").attr("aria-label", c.getLabel() || message("HEATMAP")).openEnd();
				rm.openStart("thead").openEnd().openStart("tr").openEnd().openStart("td").openEnd().close("td");
				columns.forEach((name) => rm.openStart("th").attr("scope", "col").openEnd().text(name).close("th"));
				rm.close("tr").close("thead").openStart("tbody").openEnd();
				rows.forEach((row, r) => {
					rm.openStart("tr").openEnd().openStart("th").attr("scope", "row").openEnd().text(row).close("th");
					columns.forEach((column, k) => {
						const found = byPlace.get(JSON.stringify([row, column]));
						rm.openStart("td").attr("data-slot", `${r}-${k}`).openEnd();
						if (found) {
							const [cell, i] = found;
							const p = part(cell.getValue());
							const tag = live ? "button" : "span";
							rm.openStart(tag).class("korHeatCell").class(p > 0.62 ? "korHeatDeep" : "korHeatLight").class(cell.getValue() < 0 ? "korHeatMinus" : "korHeatPlus").style("--kor-part", `${Math.round(8 + p * 84)}%`);
							if (cell.getText()) rm.attr("title", cell.getText());
							if (live) {
								rm.attr("type", "button").attr("data-i", i).attr("data-r", r).attr("data-c", k).attr("tabindex", focus ? "0" : "-1").attr("aria-label", `${row}, ${column}: ${shown(cell.getValue())} ${c.getUnit()} ${cell.getText()}`.trim());
								focus = false;
							}
							rm.openEnd().text(shown(cell.getValue())).close(tag);
						}
						rm.close("td");
					});
					rm.close("tr");
				});
				rm.close("tbody").close("table").close("div");
				rm.openStart("div").class("korHeatKey").class("korNum").attr("aria-hidden", "true");
				if (signed) rm.class("korHeatSigned");
				rm.openEnd();
				rm.openStart("span").openEnd().text(shown(signed ? -reach : low)).close("span").openStart("i").openEnd().close("i").openStart("span").openEnd().text(`${shown(signed ? reach : high)} ${c.getUnit()}`.trim()).close("span").close("div");
			}
			rm.close("div");
		}
	};
}
