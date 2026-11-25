import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { amount, compact, esc, isRtl, message, num, pct } from "./util";
import "./library";

type Bar = { series: number; from: number; to: number; end: boolean };
type Geo = { start: number; band: number; count: number };

let canvas: CanvasRenderingContext2D | null = null;
function wide(text: string): number {
	canvas = canvas ?? document.createElement("canvas").getContext("2d");
	canvas!.font = "500 12px Kor, Archivo, system-ui, sans-serif";
	return canvas!.measureText(text).width * 1.05;
}
function fit(text: string, room: number): string {
	if (wide(text) <= room) return text;
	let cut = text;
	while (cut && wide(`${cut}…`) > room) cut = cut.slice(0, -1);
	return `${cut.trimEnd()}…`;
}

/**
 * Sınıfları çubuklarla karşılaştırır: dikey veya yatay; yan yana, yığılmış ya da yüzde. Fareyle veya ok tuşlarıyla okunur.
 *
 * @namespace kor.ui
 */
export default class BarChart extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $BarChartSettings);
	constructor(id?: string, settings?: $BarChartSettings);
	constructor(id?: string, settings?: $BarChartSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "series",
		properties: {
			/** Sınıf adları */
			labels: { type: "object" },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Çubuklar yatay */
			horizontal: { type: "boolean", defaultValue: false },
			/** none (yan yana), stacked veya full (yüzde) */
			stack: { type: "string", defaultValue: "none" },
			/** Yükseklik, piksel. 0 ise dikeyde 260, yatayda satır sayısına göre */
			height: { type: "int", defaultValue: 0 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Değerleri çubuk ucuna yazar; yığında toplamı. Sığmayan yazılmaz */
			showValues: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Seriler (en çok 6); Series.kind kullanılmaz */
			series: { type: "kor.ui.Series", multiple: true, singularName: "serie" }
		},
		events: {
			/** Çubuğa basıldı. Klavyeden veya çubuklar arasından basınca seriesIndex -1 olur */
			barPress: { parameters: { index: { type: "int" }, label: { type: "string" }, seriesIndex: { type: "int" } } }
		}
	};
	private observer?: ResizeObserver;
	private geo?: Geo;
	private at = -1;

	init(): void {
		this.attachBrowserEvent("pointermove", (raw: unknown) => this.show(this.index((raw as { originalEvent: PointerEvent }).originalEvent)));
		this.attachBrowserEvent("pointerleave", () => this.show(-1));
	}
	private index(event: { clientX: number; clientY: number }): number {
		const plot = this.getDomRef("plot");
		if (!plot || !this.geo) return -1;
		const box = plot.getBoundingClientRect();
		const { start, band, count } = this.geo;
		const x = isRtl() ? box.right - event.clientX : event.clientX - box.left;
		const i = Math.floor(((this.getHorizontal() ? event.clientY - box.top : x) - start) / band);
		return event.clientY < box.top || i < 0 || i >= count ? -1 : i;
	}
	onclick(event: Press): void {
		const raw = event.originalEvent as MouseEvent;
		const i = this.index(raw);
		const bar = (event.target as Element).closest<SVGElement>("[data-s]");
		if (i >= 0) this.press(i, bar ? Number(bar.dataset.s) : -1);
	}
	private press(i: number, series: number): void {
		this.fireBarPress({ index: i, label: String(((this.getLabels() as string[]) ?? [])[i] ?? ""), seriesIndex: series });
	}
	onfocusout(): void {
		this.show(-1);
	}
	onkeydown(event: KeyboardEvent): void {
		if (!this.geo?.count) return;
		const last = this.geo.count - 1;
		if (event.key === "Enter" && this.at >= 0 && this.hasListeners("barPress")) {
			event.preventDefault();
			this.press(this.at, -1);
			return;
		}
		const way = isRtl() ? -1 : 1;
		const step = (this.getHorizontal() ? { ArrowDown: 1, ArrowUp: -1 } : { ArrowRight: way, ArrowLeft: -way } as Record<string, number>)[event.key as "ArrowDown"];
		const edge = { Home: 0, End: last }[event.key];
		if (!step && edge === undefined) return;
		event.preventDefault();
		this.show(edge ?? Math.max(0, Math.min(last, this.at < 0 ? (step > 0 ? 0 : last) : this.at + step)));
	}
	private count(): number {
		return Math.max(((this.getLabels() as string[]) ?? []).length, ...this.getSeries().map((s) => ((s.getValues() as unknown[]) ?? []).length), 0);
	}
	private value(series: number, i: number): number | null {
		const raw = ((this.getSeries()[series].getValues() as unknown[]) ?? [])[i];
		return raw === null || raw === undefined || raw === "" ? null : amount(raw);
	}
	/** Bir sınıftaki çubukların başladığı ve bittiği yer. Yığında artılar ve eksiler ayrı toplanır. */
	getBars(i: number): Bar[] {
		const values = this.getSeries().map((_, s) => this.value(s, i));
		const stack = this.getStack();
		const sum = stack === "full" ? values.reduce<number>((t, v) => t + Math.abs(v ?? 0), 0) / 100 || 1 : 1;
		let up = 0;
		let down = 0;
		const bars: Bar[] = [];
		values.forEach((raw, series) => {
			if (raw === null) return;
			const value = raw / sum;
			if (stack !== "stacked" && stack !== "full") return void bars.push({ series, from: 0, to: value, end: true });
			if (!value) return;
			const from = value > 0 ? up : down;
			if (value > 0) up += value;
			else down += value;
			bars.push({ series, from, to: from + value, end: false });
		});
		// Yalnızca yığının uçları yuvarlanır
		for (const sign of [1, -1]) {
			const side = bars.filter((b) => Math.sign(b.to - b.from) === sign);
			if (side.length) side[side.length - 1].end = true;
		}
		return bars;
	}
	private shown(value: number): string {
		return num(value, this.getDecimals());
	}
	private show(i: number): void {
		const tip = this.getDomRef("tip") as HTMLElement | null;
		const plot = this.getDomRef("plot") as HTMLElement | null;
		if (!tip || !plot || !this.geo || i === this.at) return;
		this.at = i;
		plot.querySelectorAll<SVGElement>("[data-c]").forEach((el) => el.classList.toggle("korDim", i >= 0 && Number(el.dataset.c) !== i));
		tip.hidden = i < 0;
		if (i < 0) return;
		const full = this.getStack() === "full";
		const bars = this.getBars(i);
		tip.innerHTML = `<div class="korTipHead">${esc(((this.getLabels() as string[]) ?? [])[i])}</div>${this.getSeries().map((s, n) => {
			const value = this.value(n, i);
			const bar = bars.find((b) => b.series === n);
			const text = value === null ? "–" : `${this.shown(value)} ${this.getUnit()}${full && bar ? ` · ${pct(bar.to - bar.from)}` : ""}`;
			return `<div class="korTipRow"><span class="korKey korKey${n + 1}"></span><span>${esc(s.getName())}</span><b>${esc(text)}</b></div>`;
		}).join("")}`;
		const { start, band } = this.geo;
		if (this.getHorizontal()) {
			const y = start + band * (i + 1);
			const up = y + tip.offsetHeight > plot.clientHeight && start + band * i > tip.offsetHeight;
			tip.style.transform = `translate(${Math.max(0, (plot.clientWidth - tip.offsetWidth) / 2)}px, ${up ? start + band * i - tip.offsetHeight : y}px)`;
			return;
		}
		const mid = start + band * (i + 0.5);
		const x = isRtl() ? plot.clientWidth - mid : mid;
		const gap = band / 2 + 4;
		const left = x + gap + tip.offsetWidth > plot.clientWidth ? x - gap - tip.offsetWidth : x + gap;
		tip.style.transform = `translate(${Math.max(0, Math.min(left, plot.clientWidth - tip.offsetWidth))}px, 8px)`;
	}
	onAfterRendering(): void {
		this.observer?.disconnect();
		const plot = this.getDomRef("plot");
		if (!plot) return;
		this.observer = new ResizeObserver(() => this.draw());
		this.observer.observe(plot);
	}
	exit(): void {
		this.observer?.disconnect();
	}
	private draw(): void {
		const svg = this.getDomRef("svg");
		const plot = this.getDomRef("plot");
		if (!svg || !plot) return;
		const width = plot.clientWidth;
		const height = plot.clientHeight;
		const flat = this.getHorizontal();
		const rtl = isRtl();
		const full = this.getStack() === "full";
		const stacked = full || this.getStack() === "stacked";
		const labels = ((this.getLabels() as string[]) ?? []).map((l) => String(l ?? ""));
		const count = this.count();
		const all = Array.from({ length: count }, (_, i) => this.getBars(i));
		let low = Math.min(0, ...all.flat().map((b) => b.to));
		let high = Math.max(0, ...all.flat().map((b) => b.to));
		if (low === high) high = 1;
		// Yuvarlak eksen adımı
		const wanted = flat ? Math.max(2, Math.min(5, Math.floor(width / 110))) : 5;
		const rough = (high - low) / wanted;
		const mag = 10 ** Math.floor(Math.log10(rough));
		const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= rough * 0.999) ?? 10 * mag;
		low = Math.floor(low / step + 1e-9) * step;
		if (full) low = Math.max(-100, low);
		high = full ? Math.min(100, Math.ceil(high / step - 1e-9) * step) : Math.ceil(high / step - 1e-9) * step;
		if (low > -1e-9) low = 0;
		const ticks: number[] = [];
		for (let t = low; t <= high + step / 1e6; t += step) ticks.push(Math.abs(t) < step / 1e6 ? 0 : Number(t.toPrecision(10)));
		const tickText = (t: number) => (full ? pct(t) : compact(t));

		// Değer etiketleri
		const tags = this.getShowValues() && !full ? all.map((bars) => {
			if (!stacked) return bars.map((b) => ({ at: b.to, text: this.shown(b.to), series: b.series }));
			const end = Math.max(0, ...bars.map((b) => b.to));
			return bars.length ? [{ at: end, text: this.shown(bars.reduce((s, b) => s + b.to - b.from, 0)), series: -1 }] : [];
		}) : [];
		const room = tags.length ? (flat ? Math.max(0, ...tags.flat().map((t) => wide(t.text))) + 8 : 18) : 0;

		const names = Math.min(Math.max(0, ...labels.map(wide)), width * 0.36);
		const left = flat ? names + 12 : Math.max(0, ...ticks.map((t) => wide(tickText(t)))) + 12;
		const bottom = 26;
		const a = flat ? { from: left + (low < 0 ? room : 0), to: width - 8 - Math.max(room, wide(tickText(high)) / 2) } : { from: height - bottom - (low < 0 ? room : 0), to: 8 + room };
		const pos = (v: number) => a.from + ((v - low) / (high - low)) * (a.to - a.from);
		const start = flat ? 0 : left;
		const band = Math.max(1, (flat ? height - bottom : width - left) / Math.max(1, count));
		this.geo = { start, band, count };
		this.at = -1;
		// Sağdan sola yazımda yatay eksen aynalanır
		const px = (x: number) => (rtl ? width - x : x);
		const point = (along: number, cross: number) => (flat ? `${px(along).toFixed(1)} ${cross.toFixed(1)}` : `${px(cross).toFixed(1)} ${along.toFixed(1)}`);
		const text = (x: number, y: number, value: string, anchor: "start" | "middle" | "end", cls = "korAxis", extra = "") => `<text class="${cls}" x="${px(x).toFixed(1)}" y="${y.toFixed(1)}" text-anchor="${anchor === "middle" || !rtl ? anchor : anchor === "end" ? "start" : "end"}"${extra}>${esc(value)}</text>`;

		let out = "";
		ticks.forEach((t) => {
			const p = pos(t);
			const cls = t === 0 ? "korGridLine korZeroLine" : "korGridLine";
			out += flat
				? `<line class="${cls}" x1="${px(p)}" x2="${px(p)}" y1="0" y2="${height - bottom}"/>${text(p, height - 6, tickText(t), "middle")}`
				: `<line class="${cls}" x1="${px(left)}" x2="${px(width)}" y1="${p}" y2="${p}"/>${text(left - 10, p + 4, tickText(t), "end")}`;
		});
		const every = flat ? 1 : Math.max(1, Math.ceil((Math.min(Math.max(0, ...labels.map(wide)), 72) + 10) / band));
		const slots = stacked ? 1 : Math.max(1, this.getSeries().length);
		const thick = Math.max(2, Math.min(24, (band * 0.7) / slots - (slots > 1 ? 2 : 0)));
		const group = thick * slots + (slots - 1) * 2;
		all.forEach((bars, i) => {
			const begin = start + band * i + (band - group) / 2;
			const mid = start + band * (i + 0.5);
			if (flat) out += text(names, mid + 4, fit(labels[i] ?? "", names + 1), "end", "korAxis korBarName");
			else if (i % every === 0) out += text(mid, height - 6, fit(labels[i] ?? "", band * every - 6), "middle");
			bars.forEach((b) => {
				const c = begin + (stacked ? 0 : b.series * (thick + 2));
				const sign = Math.sign(pos(b.to) - pos(b.from)) || 1;
				// Yığındaki parçalar arasında 2 piksel boşluk
				const from = b.from === 0 ? pos(0) : pos(b.from) + sign * 2;
				const end = pos(b.to);
				const size = (end - from) * sign;
				if (size <= 0) {
					// Sıfır değeri ince çizgi olarak görünür, sığmayan parça çizilmez
					if (b.from === 0 && !stacked) out += `<path class="korCol korInk${b.series + 1}" data-c="${i}" data-s="${b.series}" d="M${point(from - 1, c)}L${point(from + 1, c)}L${point(from + 1, c + thick)}L${point(from - 1, c + thick)}Z"/>`;
					return;
				}
				const r = b.end ? Math.min(4, size, thick / 2) : 0;
				out += `<path class="korCol korInk${b.series + 1}${this.hasListeners("barPress") ? " korLive" : ""}" data-c="${i}" data-s="${b.series}" d="M${point(from, c)}L${point(end - sign * r, c)}Q${point(end, c)} ${point(end, c + r)}L${point(end, c + thick - r)}Q${point(end, c + thick)} ${point(end - sign * r, c + thick)}L${point(from, c + thick)}Z"/>`;
			});
			(tags[i] ?? []).forEach((tag) => {
				const c = begin + (tag.series > 0 ? tag.series * (thick + 2) : 0) + thick / 2;
				const minus = tag.at < 0;
				const p = pos(tag.at);
				if (flat) {
					if (thick >= 10) out += text(p + (minus ? -6 : 6), c + 4, tag.text, minus ? "end" : "start", "korColTag", ` data-c="${i}"`);
				} else if (wide(tag.text) <= (slots > 1 ? thick + 2 : band)) out += text(c, p + (minus ? 15 : -6), tag.text, "middle", "korColTag", ` data-c="${i}"`);
			});
		});
		svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
		svg.innerHTML = out;
		(this.getDomRef("tip") as HTMLElement).hidden = true;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: BarChart) {
			const id = c.getId();
			const series = c.getSeries();
			const count = c.count();
			const labels = (c.getLabels() as string[]) ?? [];
			rm.openStart("div", c).class("korTrend").class("korBars").attr("role", "figure").attr("aria-label", c.getLabel() || message("BAR_CHART"));
			if (count && series.length) rm.attr("tabindex", "0");
			rm.openEnd();
			if (!count || !series.length) {
				rm.openStart("div").class("korMenuNone").openEnd().text(message("NO_DATA")).close("div").close("div");
				return;
			}
			if (series.length > 1) {
				rm.openStart("div").class("korLegend").openEnd();
				series.forEach((s, i) => rm.openStart("span").openEnd().openStart("span").class("korKey").class(`korKey${i + 1}`).openEnd().close("span").text(s.getName()).close("span"));
				rm.close("div");
			}
			const row = c.getStack() === "none" ? Math.max(40, series.length * 18 + 14) : 40;
			const height = c.getHeight() || (c.getHorizontal() ? count * row + 26 : 260);
			rm.openStart("div", `${id}-plot`).class("korPlot").style("height", `${height}px`).openEnd();
			rm.openStart("svg", `${id}-svg`).attr("aria-hidden", "true").openEnd().close("svg");
			rm.openStart("div", `${id}-tip`).class("korTip").attr("aria-live", "polite").attr("hidden", "hidden").openEnd().close("div");
			rm.close("div");
			if (c.getUnit()) rm.openStart("div").class("korNote").openEnd().text(c.getUnit()).close("div");
			// Ekran okuyucu için tablo karşılığı
			rm.openStart("table").class("korSr").openEnd().openStart("tbody").openEnd();
			for (let i = 0; i < count; i++) {
				rm.openStart("tr").openEnd().openStart("th").openEnd().text(String(labels[i] ?? "")).close("th");
				series.forEach((s, n) => {
					const value = c.value(n, i);
					rm.openStart("td").openEnd().text(`${s.getName()}: ${value === null ? "–" : c.shown(value)} ${c.getUnit()}`).close("td");
				});
				rm.close("tr");
			}
			rm.close("tbody").close("table").close("div");
		}
	};
}
