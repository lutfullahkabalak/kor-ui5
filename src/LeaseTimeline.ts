import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type LeaseEvent from "./LeaseEvent";
import type { Press } from "./util";
import { dayText, message, renderIcon, renderStatus, stateKey, toDate } from "./util";
import "./library";

const kindIcons: Record<string, string> = { increase: "trending-up", renewal: "repeat", option: "git-branch", termination: "ban", purchase: "key", payment: "banknote", note: "pencil" };
const DAY = 864e5;
const day = (d: Date) => Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY;

/**
 * Kira sözleşmesinin ömrü tek şeritte: başlangıç, artışlar, opsiyonlar, bildirim süreleri ve bitiş.
 * Yaklaşan bildirim son günleri uyarı olarak görünür.
 *
 * @namespace kor.ui
 */
export default class LeaseTimeline extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $LeaseTimelineSettings);
	constructor(id?: string, settings?: $LeaseTimelineSettings);
	constructor(id?: string, settings?: $LeaseTimelineSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "events",
		properties: {
			/** Başlangıç: Date veya yyyy-MM-dd */
			start: { type: "any" },
			/** Bitiş */
			end: { type: "any" },
			/** Bugün; boşsa sistem tarihi */
			today: { type: "any" },
			/** Bildirim son gününe veya bitişe bu kadar gün kala uyarır */
			noticeDays: { type: "int", defaultValue: 60 },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Olaylar */
			events: { type: "kor.ui.LeaseEvent", multiple: true, singularName: "event" }
		},
		events: {
			/** Olaya basıldı */
			eventPress: { parameters: { key: { type: "string" } } }
		}
	};
	private now(): number {
		return day(toDate(this.getToday()) ?? new Date());
	}
	/** Olayın durumu ve metni. */
	getEventState(event: LeaseEvent): { state: string; text: string } {
		const today = this.now();
		const at = toDate(event.getDate());
		const until = at ? day(at) - today : 0;
		const deadline = toDate(event.getDeadline());
		const given = event.getState() ? stateKey(event.getState()) : "";
		if (given === "success") return { state: "success", text: message("LEASE_DONE") };
		if (given === "danger") return { state: "danger", text: message("LEASE_MISSED") };
		if (until < 0) return { state: "none", text: message("LEASE_PAST") };
		if (deadline) {
			const left = day(deadline) - today;
			if (left < 0) return { state: "danger", text: message("LEASE_NOTICE_PAST") };
			if (left <= this.getNoticeDays()) return { state: "wait", text: message("LEASE_NOTICE_LEFT", [left]) };
			return { state: "info", text: message("LEASE_NOTICE_BY", [dayText(deadline)]) };
		}
		return { state: "info", text: until === 0 ? message("TODAY") : message("LEASE_IN_DAYS", [until]) };
	}
	private sorted(): LeaseEvent[] {
		const time = (e: LeaseEvent) => toDate(e.getDate())?.getTime() ?? 0;
		return [...this.getEvents()].sort((a, b) => time(a) - time(b));
	}
	onclick(event: Press): void {
		const id = (event.target as HTMLElement).closest<HTMLElement>("[data-ev]")?.dataset.ev;
		const item = id && this.getEvents().find((e) => e.getId() === id);
		if (item) this.fireEventPress({ key: item.getKey() });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: LeaseTimeline) {
			const start = toDate(c.getStart());
			const end = toDate(c.getEnd());
			const today = c.now();
			const from = start ? day(start) : today;
			const to = end ? day(end) : from + 365;
			const span = Math.max(1, to - from);
			const at = (d: Date | undefined) => Math.min(100, Math.max(0, d ? ((day(d) - from) / span) * 100 : 0));
			const elapsed = Math.min(100, Math.max(0, ((today - from) / span) * 100));
			const left = to - today;
			const months = start && end ? (end.getFullYear() - start.getFullYear()) * 12 + end.getMonth() - start.getMonth() : 0;
			const events = c.sorted();
			const next = events.find((e) => (toDate(e.getDate()) ? day(toDate(e.getDate())!) >= today : false));
			const live = c.hasListeners("eventPress");
			rm.openStart("section", c).class("korLease").attr("aria-label", c.getLabel() || message("LEASE")).openEnd();
			rm.openStart("header").openEnd();
			const fact = (name: string, value: string) => rm.openStart("div").openEnd().openStart("span").openEnd().text(name).close("span").openStart("b").class("korNum").openEnd().text(value).close("b").close("div");
			fact(message("LEASE_START"), dayText(start));
			fact(message("LEASE_END"), dayText(end));
			fact(message("LEASE_TERM"), months ? message("LEASE_MONTHS", [months]) : "—");
			rm.openStart("div").class("korLeaseLeft").openEnd();
			if (left < 0) renderStatus(rm, message("LEASE_ENDED"), "none");
			else if (left <= c.getNoticeDays()) renderStatus(rm, message("LEASE_ENDS_IN", [left]), "wait");
			else renderStatus(rm, message("LEASE_ENDS_IN", [left]), "info");
			rm.close("div");
			rm.close("header");
			// Şerit: geçen süre, bugün, olaylar ve yıl çizgileri
			rm.openStart("div").class("korLeaseTrack").attr("role", "img").attr("aria-label", message("LEASE_ELAPSED", [Math.round(elapsed)])).openEnd();
			rm.openStart("i").class("korLeaseFill").style("width", `${elapsed}%`).openEnd().close("i");
			if (start && end) {
				for (let y = start.getFullYear() + 1; y <= end.getFullYear(); y++) {
					const pos = at(new Date(y, 0, 1));
					if (pos > 2 && pos < 98) rm.openStart("span").class("korLeaseYear").style("inset-inline-start", `${pos}%`).openEnd().text(String(y)).close("span");
				}
			}
			// Aynı yere düşen olaylar üst üste binmez, yukarı doğru dizilir
			const seen = new Map<number, number>();
			events.forEach((event) => {
				const { state } = c.getEventState(event);
				const pos = Math.round(at(toDate(event.getDate())) * 2);
				const stack = seen.get(pos) ?? 0;
				seen.set(pos, stack + 1);
				rm.openStart("span").class("korLeaseDot").class(`korState-${state}`).style("inset-inline-start", `${at(toDate(event.getDate()))}%`).style("--kor-stack", String(stack));
				if (live) rm.attr("data-ev", event.getId());
				rm.openEnd();
				renderIcon(rm, kindIcons[event.getKind()] ?? "circle-dot");
				rm.close("span");
			});
			if (today >= from && today <= to) rm.openStart("span").class("korLeaseToday").style("inset-inline-start", `${elapsed}%`).openEnd().openStart("small").openEnd().text(message("TODAY")).close("small").close("span");
			rm.close("div");
			rm.openStart("ol").class("korLeaseList").openEnd();
			events.forEach((event) => {
				const { state, text } = c.getEventState(event);
				rm.openStart("li", event).class(`korState-${state}`);
				if (event === next) rm.class("korLeaseNext").attr("aria-current", "step");
				if (state === "none") rm.class("korLeaseGone");
				rm.openEnd();
				const tag = live ? "button" : "div";
				rm.openStart(tag).class("korLeaseRow");
				if (live) rm.attr("type", "button").attr("data-ev", event.getId());
				rm.openEnd();
				rm.openStart("span").class("korLeaseKind").attr("aria-hidden", "true").openEnd();
				renderIcon(rm, kindIcons[event.getKind()] ?? "circle-dot");
				rm.close("span");
				rm.openStart("span").class("korLeaseDate").class("korNum").openEnd().text(dayText(event.getDate())).close("span");
				rm.openStart("span").class("korLeaseText").openEnd();
				rm.openStart("b").openEnd().text(event.getTitle() || message(`LEASE_KIND_${event.getKind().toUpperCase()}`)).close("b");
				if (event.getText()) rm.openStart("span").openEnd().text(event.getText()).close("span");
				rm.close("span");
				rm.openStart("span").class("korLeaseEnd").openEnd();
				renderStatus(rm, text, state);
				rm.close("span");
				rm.close(tag).close("li");
			});
			rm.close("ol").close("section");
		}
	};
}
