import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type ReconCell from "./ReconCell";
import type ReconRow from "./ReconRow";
import type { Press } from "./util";
import { compact, dateText, message, num, renderIcon, stateIcons } from "./util";
import "./library";

export type ReconState = "success" | "danger" | "wait" | "none";

/**
 * Cari × dönem mutabakat matrisi (BA/BS gibi aylık bildirim mutabakatı).
 * Her hücre belge adedi ve tutarı karşılaştırır: tutuyor, tutmuyor, yanıt yok veya eşik altı.
 *
 * @namespace kor.ui
 */
export default class ReconMatrix extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ReconMatrixSettings);
	constructor(id?: string, settings?: $ReconMatrixSettings);
	constructor(id?: string, settings?: $ReconMatrixSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "rows",
		properties: {
			/** Dönemler, sırayla; yyyy-MM verilirse ay adı yazılır */
			periods: { type: "string[]", defaultValue: [] },
			/** Para birimi */
			currency: { type: "string", defaultValue: "" },
			/** Bu kadarlık tutar farkı tutuyor sayılır */
			tolerance: { type: "float", defaultValue: 0 },
			/** İki tutar da bunun altındaysa hücre eşik altıdır; 0 kapalı */
			threshold: { type: "float", defaultValue: 0 },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Satır başlığı sütununun adı */
			rowTitle: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Cariler */
			rows: { type: "kor.ui.ReconRow", multiple: true, singularName: "row" }
		},
		events: {
			/** Hücreye basıldı */
			cellPress: { parameters: { row: { type: "string" }, period: { type: "string" } } }
		}
	};
	private focusKey = "";

	/** Hücrenin durumu. */
	stateOf(cell: ReconCell | undefined): ReconState {
		if (!cell) return "none";
		const ours = Number(cell.getOurAmount()) || 0;
		const raw = cell.getTheirAmount() as unknown;
		const answered = raw !== null && raw !== undefined && raw !== "" && cell.getTheirCount() >= 0;
		const theirs = Number(raw) || 0;
		const limit = this.getThreshold();
		if (limit > 0 && Math.abs(ours) < limit && (!answered || Math.abs(theirs) < limit)) return "none";
		if (!answered) return "wait";
		return Math.abs(ours - theirs) <= this.getTolerance() + 1e-9 && cell.getOurCount() === cell.getTheirCount() ? "success" : "danger";
	}
	private cellOf(row: ReconRow, period: string): ReconCell | undefined {
		return row.getCells().find((cell) => cell.getPeriod() === period);
	}
	private periodText(key: string): string {
		return /^\d{4}-\d{2}$/.test(key) ? dateText(`${key}-01`, "MMM yy") : key;
	}
	/** Durumlara göre hücre sayısı. */
	getSummary(): Record<ReconState, number> {
		const out: Record<ReconState, number> = { success: 0, danger: 0, wait: 0, none: 0 };
		for (const row of this.getRows()) for (const p of this.getPeriods()) out[this.stateOf(this.cellOf(row, p))]++;
		return out;
	}
	private cells(): HTMLElement[] {
		return [...(this.getDomRef()?.querySelectorAll<HTMLElement>("[data-r]") ?? [])];
	}
	onclick(event: Press): void {
		const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-r]");
		if (!cell) return;
		const row = this.getRows()[Number(cell.dataset.r)];
		const period = this.getPeriods()[Number(cell.dataset.p)];
		this.move(cell);
		this.fireCellPress({ row: row.getKey(), period });
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		const cell = (event.target as HTMLElement).closest<HTMLElement>("[data-r]");
		if (!cell) return;
		const rtl = getComputedStyle(cell).direction === "rtl" ? -1 : 1;
		const step = { ArrowRight: [0, rtl], ArrowLeft: [0, -rtl], ArrowDown: [1, 0], ArrowUp: [-1, 0] }[event.key];
		let r = Number(cell.dataset.r);
		let p = Number(cell.dataset.p);
		if (step) {
			r += step[0];
			p += step[1];
		} else if (event.key === "Home") p = 0;
		else if (event.key === "End") p = this.getPeriods().length - 1;
		else return;
		const next = this.cells().find((el) => Number(el.dataset.r) === r && Number(el.dataset.p) === p);
		event.preventDefault();
		if (next) this.move(next).focus();
	}
	private move(cell: HTMLElement): HTMLElement {
		this.cells().forEach((el) => el.setAttribute("tabindex", el === cell ? "0" : "-1"));
		this.focusKey = `${cell.dataset.r}:${cell.dataset.p}`;
		return cell;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: ReconMatrix) {
			const periods = c.getPeriods();
			const rows = c.getRows();
			const labels: Record<ReconState, string> = { success: message("RECON_OK"), danger: message("RECON_DIFF"), wait: message("RECON_WAIT"), none: message("RECON_BELOW") };
			const glyph: Record<ReconState, string> = { ...stateIcons, none: "minus" } as Record<ReconState, string>;
			const focus = c.focusKey || "0:0";
			const sum = c.getSummary();
			rm.openStart("section", c).class("korRecon").attr("aria-label", c.getLabel() || message("RECON_MATRIX")).openEnd();
			rm.openStart("div").class("korLegend").class("korReconLegend").openEnd();
			(["success", "danger", "wait", "none"] as const).forEach((state) => {
				rm.openStart("span").class(`korState-${state}`).openEnd();
				rm.openStart("span").class("korStatusGlyph").attr("aria-hidden", "true").openEnd();
				renderIcon(rm, glyph[state]);
				rm.close("span").text(`${labels[state]} `).openStart("b").class("korNum").openEnd().text(String(sum[state])).close("b").close("span");
			});
			rm.close("div");
			rm.openStart("div").class("korReconScroll").openEnd();
			rm.openStart("table").attr("role", "grid").attr("aria-label", c.getLabel() || message("RECON_MATRIX")).openEnd();
			rm.openStart("thead").openEnd().openStart("tr").openEnd();
			rm.openStart("th").attr("scope", "col").openEnd().text(c.getRowTitle() || message("RECON_PARTY")).close("th");
			periods.forEach((p) => rm.openStart("th").attr("scope", "col").openEnd().text(c.periodText(p)).close("th"));
			rm.openStart("th").attr("scope", "col").class("korReconEnd").openEnd().text(message("RECON_RESULT")).close("th");
			rm.close("tr").close("thead").openStart("tbody").openEnd();
			rows.forEach((row, r) => {
				let good = 0;
				let counted = 0;
				rm.openStart("tr", row).openEnd();
				rm.openStart("th").attr("scope", "row").openEnd().openStart("b").openEnd().text(row.getTitle()).close("b");
				if (row.getText()) rm.openStart("span").openEnd().text(row.getText()).close("span");
				rm.close("th");
				periods.forEach((period, p) => {
					const cell = c.cellOf(row, period);
					const state = c.stateOf(cell);
					if (state !== "none") counted++;
					if (state === "success") good++;
					const ours = Number(cell?.getOurAmount()) || 0;
					const theirs = Number(cell?.getTheirAmount()) || 0;
					let shown = "";
					if (cell && state === "danger") shown = (ours - theirs < 0 ? "−" : "+") + compact(Math.abs(ours - theirs));
					else if (cell && state === "success") shown = String(cell.getOurCount());
					const detail = cell
						? `${message("MATCH_OURS")} ${cell.getOurCount()} / ${num(ours, 0)} ${c.getCurrency()}` + (state === "wait" ? "" : `, ${message("MATCH_THEIRS")} ${Math.max(0, cell.getTheirCount())} / ${num(theirs, 0)} ${c.getCurrency()}`)
						: "";
					rm.openStart("td").attr("role", "gridcell").openEnd();
					rm.openStart("button").attr("type", "button").class("korReconCell").class(`korState-${state}`).attr("data-r", r).attr("data-p", p);
					rm.attr("tabindex", focus === `${r}:${p}` ? "0" : "-1");
					rm.attr("aria-label", `${row.getTitle()}, ${c.periodText(period)}: ${cell?.getStatusText() || labels[state]}${detail ? `. ${detail}` : ""}`);
					rm.openEnd();
					rm.openStart("span").class("korStatusGlyph").attr("aria-hidden", "true").openEnd();
					renderIcon(rm, glyph[state]);
					rm.close("span");
					if (shown) rm.openStart("span").class("korNum").attr("aria-hidden", "true").openEnd().text(shown).close("span");
					rm.close("button").close("td");
				});
				rm.openStart("td").class("korReconEnd").openEnd();
				rm.openStart("span").class("korNum").openEnd().text(counted ? `${good}/${counted}` : "—").close("span");
				rm.openStart("span").class("korProgressTrack").attr("aria-hidden", "true").style("--kor-part", String(counted ? good / counted : 0)).openEnd().openStart("i").openEnd().close("i").close("span");
				rm.close("td").close("tr");
			});
			rm.close("tbody").close("table").close("div").close("section");
		}
	};
}
