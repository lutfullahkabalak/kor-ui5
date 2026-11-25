import type ResourceBundle from "sap/base/i18n/ResourceBundle";
import Core from "sap/ui/core/Core";
import IconPool from "sap/ui/core/IconPool";
import DateFormat from "sap/ui/core/format/DateFormat";
import NumberFormat from "sap/ui/core/format/NumberFormat";
import type RenderManager from "sap/ui/core/RenderManager";
import Popup from "sap/ui/core/Popup";
import { icons } from "./icons";

export type Press = { target: EventTarget | null; originalEvent: Event };

export function message(key: string, args?: unknown[]): string {
	return (Core.getLibraryResourceBundle("kor.ui") as ResourceBundle).getText(key, args as string[]) as string;
}

const formats = new Map<string, NumberFormat>();
export function num(value: number, decimals = 0): string {
	const key = `${Core.getConfiguration().getLanguageTag()}|${decimals}`;
	if (!formats.has(key)) formats.set(key, NumberFormat.getFloatInstance({ decimals, groupingEnabled: true }));
	return formats.get(key)!.format(value);
}
/** Yüzde, yerel biçimde: tr %8,4, en 8.4% */
export function pct(value: number, decimals = 0): string {
	return NumberFormat.getPercentInstance({ decimals, groupingEnabled: true }).format(value / 100);
}
export function parseNum(text: string): number {
	return NumberFormat.getFloatInstance().parse(text.replace(/%/g, "").trim()) as number;
}
export function compact(value: number): string {
	return NumberFormat.getFloatInstance({ style: "short", maxFractionDigits: 1 } as never).format(value);
}
export function dateText(value: unknown, pattern = "d MMM"): string {
	const date = toDate(value);
	return date ? (DateFormat.getDateInstance({ pattern }).format(date) as string) : "";
}
/** Kısa tarih, yerel sırayla: tr 02.03.2026, en 03/02/2026 */
export function dayText(value: unknown): string {
	const date = toDate(value);
	return date ? (DateFormat.getDateInstance({ format: "yMMdd" }).format(date) as string) : "";
}
/** OData V2 Edm.DateTime günü UTC gece yarısıyla taşır */
const utcDay = (d: Date): boolean => d.getTime() % 86400000 === 0 && d.getTimezoneOffset() !== 0;
/** Gün (saatsiz) döndürür. Date, zaman damgası veya "yyyy-MM-dd" kabul eder */
export function toDate(value: unknown): Date | undefined {
	if (!value) return undefined;
	if (typeof value === "string") {
		const [y, m, d] = value.slice(0, 10).split("-").map(Number);
		return new Date(y, m - 1, d);
	}
	const date = value instanceof Date ? value : new Date(value as number);
	return utcDay(date) ? new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()) : new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
/** Günü modelin beklediği biçime çevirir: V2'de UTC Date, eski değer Date ise aynı düzen, değilse yyyy-MM-dd */
export function dateValue(day: Date, old: unknown, model?: unknown): Date | string {
	const v2 = (model as { isA?(name: string): boolean } | undefined)?.isA?.("sap.ui.model.odata.v2.ODataModel");
	if (v2 || (old instanceof Date && utcDay(old))) return new Date(Date.UTC(day.getFullYear(), day.getMonth(), day.getDate()));
	return old instanceof Date ? day : isoDate(day);
}
export function isoDate(date: Date): string {
	return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

/** Arama için: büyük-küçük ve aksan farkını kaldırır, uzunluğu korur ("İstanbul" → "istanbul"). Tarayıcı diline bağlı değildir. */
export function fold(text: string): string {
	return [...text].map((c) => (c === "ı" ? "i" : c.normalize("NFD")[0].toLowerCase().padEnd(c.length))).join("");
}
export function esc(text: unknown): string {
	return String(text ?? "").replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
}

export function initials(name: string): string {
	const parts = name.trim().split(/\s+/);
	return `${parts[0]?.[0] ?? ""}${parts.length > 1 ? parts[parts.length - 1][0] : ""}`;
}
/** İsimden hep aynı tonu üretir (1-6) */
export function tone(name: string): number {
	let hash = 0;
	for (const c of name) hash = (hash * 31 + c.charCodeAt(0)) >>> 0;
	return (hash % 6) + 1;
}

function sapIcon(name: string): { content: string; fontFamily: string } | undefined {
	return IconPool.getIconInfo(name, undefined, "sync") as unknown as { content: string; fontFamily: string } | undefined;
}
/** Kor simgesi ("truck") veya UI5 simgesi ("sap-icon://add") çizer */
export function renderIcon(rm: RenderManager, name: string, cls = ""): void {
	if (!name) return;
	if (name.startsWith("sap-icon:")) {
		const info = sapIcon(name);
		rm.openStart("span").class("korIcon").class("korIconFont").attr("aria-hidden", "true");
		if (cls) rm.class(cls);
		if (info) rm.style("font-family", `'${info.fontFamily}'`);
		rm.openEnd().text(info?.content ?? "").close("span");
		return;
	}
	rm.openStart("svg").class("korIcon").attr("viewBox", "0 0 24 24").attr("aria-hidden", "true").attr("focusable", "false");
	if (cls) rm.class(cls);
	rm.openEnd();
	(icons[name] ?? []).forEach(([tag, attrs]) => {
		rm.openStart(tag);
		Object.entries(attrs).forEach(([key, value]) => rm.attr(key, value));
		rm.openEnd().close(tag);
	});
	rm.close("svg");
}
export function iconHtml(name: string, cls = ""): string {
	if (!name) return "";
	if (name.startsWith("sap-icon:")) {
		const info = sapIcon(name);
		return info ? `<span class="korIcon korIconFont ${cls}" aria-hidden="true" style="font-family:'${esc(info.fontFamily)}'">${esc(info.content)}</span>` : "";
	}
	const body = (icons[name] ?? []).map(([tag, attrs]) => `<${tag} ${Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(" ")}/>`).join("");
	return `<svg class="korIcon ${cls}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">${body}</svg>`;
}

export const reducedMotion = (): boolean => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
export const isMac = (): boolean => /Mac|iPhone|iPad/.test(navigator.platform);
export const isRtl = (): boolean => document.documentElement.dir === "rtl";
export const staticArea = (): HTMLElement => Core.getStaticAreaRef() as unknown as HTMLElement;
export const nextZ = (): number => (Popup as unknown as { getNextZIndex(): number }).getNextZIndex();

export const stateIcons: Record<string, string> = { success: "check", wait: "clock", danger: "x", info: "circle-dot", none: "circle-dashed" };
// UI5 MessageType / ValueState adları da kabul edilir
const ui5States: Record<string, string> = { Success: "success", Warning: "wait", Error: "danger", Information: "info" };
export const stateKey = (state: string): string => ui5States[state] ?? (stateIcons[state] ? state : "none");
export function statusHtml(text: string, state: string): string {
	const key = stateKey(state);
	return `<span class="korStatus korState-${key}"><span class="korStatusGlyph">${iconHtml(stateIcons[key])}</span><span class="korStatusText">${esc(text)}</span></span>`;
}
export function renderStatus(rm: RenderManager, text: string, state: string): void {
	const key = stateKey(state);
	rm.openStart("span").class("korStatus").class(`korState-${key}`).openEnd().openStart("span").class("korStatusGlyph").openEnd();
	renderIcon(rm, stateIcons[key]);
	rm.close("span").openStart("span").class("korStatusText").openEnd().text(text || message(`STATE_${key.toUpperCase()}`)).close("span").close("span");
}
export function renderFace(rm: RenderManager, name: string): void {
	rm.openStart("span").class("korFace").class(`korTone${tone(name)}`).attr("aria-hidden", "true").openEnd().text(initials(name)).close("span");
}
/** Çalıştırılabilir adresleri (javascript:, data:) eler */
export function safeHref(href: string): string {
	if (!href) return "";
	try {
		return /^(https?|mailto|tel):$/.test(new URL(href, document.baseURI).protocol) ? href : "";
	} catch {
		return "";
	}
}
export function faceHtml(name: string): string {
	return `<span class="korFace korTone${tone(name)}" aria-hidden="true">${esc(initials(name))}</span>`;
}

export function linePath(points: [number, number][]): string {
	return points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)} ${y.toFixed(1)}`).join("");
}
/** Aşmayan (monoton) yumuşak eğri */
export function smoothPath(p: [number, number][]): string {
	if (p.length < 3) return linePath(p);
	const d = p.slice(1).map((q, i) => (q[1] - p[i][1]) / (q[0] - p[i][0] || 1));
	const m = p.map((_, i) => (i === 0 ? d[0] : i === p.length - 1 ? d[i - 1] : d[i - 1] * d[i] <= 0 ? 0 : (2 * d[i - 1] * d[i]) / (d[i - 1] + d[i])));
	return p.slice(1).reduce((path, q, i) => {
		const h = (q[0] - p[i][0]) / 3;
		return `${path}C${(p[i][0] + h).toFixed(1)} ${(p[i][1] + m[i] * h).toFixed(1)} ${(q[0] - h).toFixed(1)} ${(q[1] - m[i + 1] * h).toFixed(1)} ${q[0].toFixed(1)} ${q[1].toFixed(1)}`;
	}, `M${p[0][0].toFixed(1)} ${p[0][1].toFixed(1)}`);
}
export function sparkHtml(values: number[], width = 72, height = 22): string {
	if (!values || values.length < 2) return "";
	const min = Math.min(...values);
	const range = Math.max(...values) - min || 1;
	const points = values.map((v, i) => [2 + (i / (values.length - 1)) * (width - 6), height - 3 - ((v - min) / range) * (height - 6)] as [number, number]);
	const last = points[points.length - 1];
	return `<svg class="korSpark" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" aria-hidden="true"><path d="${smoothPath(points)}"/><circle cx="${last[0]}" cy="${last[1]}" r="2.5"/></svg>`;
}

/** Bir öğeye tutunan yüzen katman. Dışına basınca ve sayfa kayınca kapanır. */
export class Float {
	private readonly off: (() => void)[] = [];
	constructor(
		readonly anchor: HTMLElement,
		readonly element: HTMLElement,
		private readonly onClose?: () => void,
		private readonly match = true
	) {
		element.classList.add("korFloat");
		// UI5 modal pencereleri bu katmanı kendi parçası saysın
		element.setAttribute("data-sap-ui-integration-popup-content", "true");
		element.style.zIndex = String(nextZ());
		staticArea().appendChild(element);
		this.place();
		const outside = (event: Event) => {
			const target = event.target as Node;
			if (!element.contains(target) && !anchor.contains(target)) this.close();
		};
		const scroll = (event: Event) => {
			if (!element.contains(event.target as Node)) this.place();
		};
		document.addEventListener("pointerdown", outside, true);
		document.addEventListener("scroll", scroll, true);
		window.addEventListener("resize", scroll);
		this.off.push(
			() => document.removeEventListener("pointerdown", outside, true),
			() => document.removeEventListener("scroll", scroll, true),
			() => window.removeEventListener("resize", scroll)
		);
	}
	place(): void {
		const rect = this.anchor.getBoundingClientRect();
		const style = this.element.style;
		if (this.match) style.minWidth = `${rect.width}px`;
		const { offsetHeight: height, offsetWidth: width } = this.element;
		const up = rect.bottom + height + 8 > window.innerHeight && rect.top > height + 8;
		const x = isRtl() ? rect.right - width : rect.left;
		style.left = `${Math.max(8, Math.min(x, window.innerWidth - width - 8))}px`;
		style.top = `${up ? rect.top - height - 6 : Math.min(rect.bottom + 6, Math.max(8, window.innerHeight - height - 8))}px`;
	}
	close(): void {
		if (!this.off.length) return;
		this.off.splice(0).forEach((fn) => fn());
		this.element.remove();
		this.onClose?.();
	}
}
