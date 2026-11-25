import Core from "sap/ui/core/Core";
import DateFormat from "sap/ui/core/format/DateFormat";
import { message } from "./util";

export const pad = (n: number): string => String(n).padStart(2, "0");

/** Gün içindeki dakika. "HH:mm[:ss]" veya V2 Edm.Time kabul eder */
export function minutesOf(value: unknown): number | undefined {
	const ms = (value as { ms?: number } | null)?.ms;
	if (typeof ms === "number") return Math.floor(ms / 60000);
	const parts = /^(\d{1,2}):(\d{2})/.exec(String(value ?? ""));
	return parts && Number(parts[1]) < 24 && Number(parts[2]) < 60 ? Number(parts[1]) * 60 + Number(parts[2]) : undefined;
}
export function showTime(minutes?: number): string {
	return minutes === undefined ? "" : (DateFormat.getTimeInstance({ style: "short" }).format(new Date(2000, 0, 1, 0, minutes)) as string);
}
/** "9", "930", "9.30", "9:30 pm", "şimdi", "+30" (dakika); anlamazsa undefined */
export function readTime(text: string): number | undefined {
	const raw = text.trim().toLocaleLowerCase(Core.getConfiguration().getLanguageTag()).replace(/[  ]/g, " ");
	if (!raw) return undefined;
	const date = new Date();
	const now = date.getHours() * 60 + date.getMinutes();
	if (message("TIME_WORDS").split(",").includes(raw)) return now;
	const step = /^([+-])\s*(\d{1,3})$/.exec(raw);
	if (step) return (((now + Number(step[1] + step[2])) % 1440) + 1440) % 1440;
	const parts = /^(\d{1,2})(?:\s*[:.\s]\s*(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.|öö|ös)?$/.exec(raw) ?? /^(\d{1,2})(\d{2})\s*(am|pm)?$/.exec(raw);
	if (!parts) return undefined;
	let hour = Number(parts[1]);
	const minute = Number(parts[2] ?? 0);
	if (parts[3]) {
		if (hour < 1 || hour > 12) return undefined;
		hour = (hour % 12) + (/^p|ös/.test(parts[3]) ? 12 : 0);
	}
	return hour < 24 && minute < 60 ? hour * 60 + minute : undefined;
}
/** Dakikayı modelin beklediği biçime çevirir */
export function timeValue(minutes: number, old: unknown, model?: unknown): unknown {
	const is = (name: string) => (model as { isA?(name: string): boolean } | undefined)?.isA?.(name);
	if (is("sap.ui.model.odata.v2.ODataModel") || typeof (old as { ms?: number } | null)?.ms === "number") return { __edmType: "Edm.Time", ms: minutes * 60000 };
	const text = `${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`;
	return is("sap.ui.model.odata.v4.ODataModel") || /^\d{1,2}:\d{2}:\d{2}/.test(String(old ?? "")) ? `${text}:00` : text;
}
