import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type MatchEntry from "./MatchEntry";
import type { Press } from "./util";
import { dayText, message, num, renderIcon, renderStatus, toDate } from "./util";
import "./library";

type Group = { id: string; ours: MatchEntry[]; theirs: MatchEntry[]; auto: boolean; diff: number };

/**
 * İki taraflı mutabakat: bizim kayıtlarımız ile karşı tarafın ekstresi yan yana eşleştirilir.
 * Eşleşen gruplar aynı bantta durur, açık kalemler altta ayrılır, fark canlı hesaplanır.
 *
 * @namespace kor.ui
 */
export default class MatchGrid extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $MatchGridSettings);
	constructor(id?: string, settings?: $MatchGridSettings);
	constructor(id?: string, settings?: $MatchGridSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "entries",
		properties: {
			/** Para birimi */
			currency: { type: "string", defaultValue: "" },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 2 },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Bizim tarafın başlığı */
			oursTitle: { type: "string", defaultValue: "" },
			/** Karşı tarafın başlığı */
			theirsTitle: { type: "string", defaultValue: "" },
			/** all, open (açık kalemler) veya matched */
			filter: { type: "string", defaultValue: "all", bindable: "bindable" },
			/** Bu kadarlık fark eşleşmiş sayılır (yuvarlama, kuruş) */
			tolerance: { type: "float", defaultValue: 0 },
			/** Eşleştirme yapılabilir */
			editable: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Kayıtlar, iki taraf birlikte */
			entries: { type: "kor.ui.MatchEntry", multiple: true, singularName: "entry" }
		},
		events: {
			/** Eşleşme değişiyor: action match, unmatch veya auto. match ve unmatch preventDefault ile durur. */
			matchChange: { allowPreventDefault: true, parameters: { action: { type: "string" }, match: { type: "string" }, keys: { type: "string[]" }, difference: { type: "float" } } },
			/** Kayda çift tıklandı */
			entryPress: { parameters: { key: { type: "string" } } }
		}
	};
	private chosen = new Set<string>();
	private focusId = "";
	private lit = "";

	private amountOf(entry: MatchEntry): number {
		// OData Edm.Decimal metin gelir
		return Number(entry.getAmount()) || 0;
	}
	private money(value: number, sign = false): string {
		return `${value < 0 ? "−" : sign && value > 0 ? "+" : ""}${num(Math.abs(value), this.getDecimals())} ${this.getCurrency()}`.trim();
	}
	private sum(list: MatchEntry[]): number {
		return list.reduce((total, entry) => total + this.amountOf(entry), 0);
	}
	private close(value: number): boolean {
		return Math.abs(value) <= this.getTolerance() + 1e-9;
	}
	/** Eşleşen gruplar ve açık kalemler. */
	getGroups(): { groups: Group[]; ours: MatchEntry[]; theirs: MatchEntry[] } {
		const map = new Map<string, Group>();
		const ours: MatchEntry[] = [];
		const theirs: MatchEntry[] = [];
		const time = (e: MatchEntry) => toDate(e.getDate())?.getTime() ?? 0;
		for (const entry of this.getEntries()) {
			const side = entry.getSide() === "theirs" ? "theirs" : "ours";
			const id = entry.getMatch();
			if (!id) {
				(side === "ours" ? ours : theirs).push(entry);
				continue;
			}
			let group = map.get(id);
			if (!group) map.set(id, (group = { id, ours: [], theirs: [], auto: true, diff: 0 }));
			group[side].push(entry);
			group.auto &&= entry.getAuto();
		}
		const groups = [...map.values()];
		// Tek tarafı olan grup eşleşme değildir, açık kalemlere döner
		const real = groups.filter((g) => {
			if (g.ours.length && g.theirs.length) return true;
			ours.push(...g.ours);
			theirs.push(...g.theirs);
			return false;
		});
		real.forEach((g) => (g.diff = this.sum(g.ours) - this.sum(g.theirs)));
		const first = (g: Group) => Math.min(...[...g.ours, ...g.theirs].map(time));
		real.sort((a, b) => first(a) - first(b));
		ours.sort((a, b) => time(a) - time(b));
		theirs.sort((a, b) => time(a) - time(b));
		return { groups: real, ours, theirs };
	}
	/** Bizim bakiye, karşı taraf bakiyesi ve fark. */
	getTotals(): { ours: number; theirs: number; difference: number } {
		const entries = this.getEntries();
		const ours = this.sum(entries.filter((e) => e.getSide() !== "theirs"));
		const theirs = this.sum(entries.filter((e) => e.getSide() === "theirs"));
		return { ours, theirs, difference: ours - theirs };
	}
	private nextId(): string {
		const used = new Set(this.getEntries().map((e) => e.getMatch()));
		let i = 1;
		while (used.has(`M${i}`)) i++;
		return `M${i}`;
	}
	private selected(): MatchEntry[] {
		return this.getEntries().filter((e) => this.chosen.has(e.getId()));
	}
	/**
	 * Açık kalemleri tutara göre eşleştirir: önce aynı belge numarası, sonra en yakın tarih.
	 * Kurulan eşleşme sayısını döndürür.
	 */
	autoMatch(): number {
		const { ours, theirs } = this.getGroups();
		const day = (e: MatchEntry) => toDate(e.getDate())?.getTime() ?? 0;
		const left = [...theirs];
		const keys: string[] = [];
		let count = 0;
		for (const entry of ours) {
			const fits = left.filter((t) => this.close(this.amountOf(entry) - this.amountOf(t)));
			if (!fits.length) continue;
			const doc = entry.getDocument();
			const pick = fits.find((t) => doc && t.getDocument() === doc) ?? fits.sort((a, b) => Math.abs(day(a) - day(entry)) - Math.abs(day(b) - day(entry)))[0];
			left.splice(left.indexOf(pick), 1);
			const id = this.nextId();
			for (const e of [entry, pick]) {
				e.setMatch(id);
				e.setAuto(true);
				keys.push(e.getKey());
			}
			count++;
		}
		if (count) {
			this.chosen.clear();
			this.fireMatchChange({ action: "auto", match: "", keys, difference: 0 });
		}
		return count;
	}
	private act(action: string): void {
		const list = this.selected();
		if (action === "clear") {
			this.chosen.clear();
			this.invalidate();
			return;
		}
		if (action === "auto") {
			this.autoMatch();
			return;
		}
		if (!list.length) return;
		const keys = list.map((e) => e.getKey());
		if (action === "match") {
			const ours = list.filter((e) => e.getSide() !== "theirs");
			const theirs = list.filter((e) => e.getSide() === "theirs");
			if (!ours.length || !theirs.length) return;
			const id = this.nextId();
			const difference = this.sum(ours) - this.sum(theirs);
			if (!this.fireMatchChange({ action, match: id, keys, difference })) return;
			list.forEach((e) => {
				e.setMatch(id);
				e.setAuto(false);
			});
		} else if (action === "unmatch") {
			const id = list[0].getMatch();
			if (!this.fireMatchChange({ action, match: id, keys, difference: 0 })) return;
			list.forEach((e) => {
				e.setMatch("");
				e.setAuto(false);
			});
		}
		this.chosen.clear();
		this.invalidate();
	}
	private toggle(entry: MatchEntry): void {
		const id = entry.getMatch();
		const matched = id && this.getGroups().groups.some((g) => g.id === id);
		if (matched) {
			// Eşleşmiş kayda basmak tüm grubu seçer; açık seçimle karışmaz
			const group = this.getEntries().filter((e) => e.getMatch() === id);
			const on = !this.chosen.has(entry.getId());
			this.chosen.clear();
			if (on) group.forEach((e) => this.chosen.add(e.getId()));
		} else {
			// Açık seçime eşleşmiş kayıt karışmaz
			for (const e of this.selected()) if (e.getMatch()) this.chosen.delete(e.getId());
			if (this.chosen.has(entry.getId())) this.chosen.delete(entry.getId());
			else this.chosen.add(entry.getId());
		}
		this.focusId = entry.getId();
		this.invalidate();
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const filter = target.closest<HTMLElement>("[data-filter]")?.dataset.filter;
		const action = target.closest<HTMLElement>("[data-act]")?.dataset.act;
		const row = target.closest<HTMLElement>("[data-entry]");
		if (filter) {
			this.setFilter(filter);
			return;
		}
		if (action) {
			this.act(action);
			return;
		}
		if (row && this.getEditable()) {
			const entry = this.getEntries().find((e) => e.getId() === row.id);
			if (entry) this.toggle(entry);
		}
	}
	ondblclick(event: Press): void {
		const row = (event.target as HTMLElement).closest<HTMLElement>("[data-entry]");
		const entry = row && this.getEntries().find((e) => e.getId() === row.id);
		if (entry) this.fireEntryPress({ key: entry.getKey() });
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		if (event.key === "Escape" && this.chosen.size) {
			event.preventDefault();
			this.act("clear");
		}
	}
	onmouseover(event: Press): void {
		this.light((event.target as HTMLElement).closest<HTMLElement>("[data-group]")?.dataset.group ?? "");
	}
	onmouseout(): void {
		this.light("");
	}
	private light(group: string): void {
		this.lit = group;
		this.getDomRef()?.querySelectorAll<HTMLElement>(".korMatchBand").forEach((band) => band.classList.toggle("korMatchLit", band.dataset.group === group));
	}
	onAfterRendering(): void {
		if (!this.focusId) return;
		document.getElementById(this.focusId)?.focus();
		this.focusId = "";
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: MatchGrid) {
			const { groups, ours, theirs } = c.getGroups();
			const totals = c.getTotals();
			const filter = c.getFilter();
			const editable = c.getEditable();
			const oursTitle = c.getOursTitle() || message("MATCH_OURS");
			const theirsTitle = c.getTheirsTitle() || message("MATCH_THEIRS");
			const balanced = c.close(totals.difference);
			const open = ours.length + theirs.length;
			rm.openStart("section", c).class("korMatch").attr("aria-label", c.getLabel() || message("MATCH_GRID")).openEnd();
			// Özet: iki bakiye ve fark
			rm.openStart("header").class("korMatchHead").openEnd();
			([[oursTitle, totals.ours, ""], [theirsTitle, totals.theirs, ""], [message("MATCH_DIFF"), totals.difference, balanced ? "success" : "danger"]] as const).forEach(([name, value, state]) => {
				rm.openStart("div");
				if (state) rm.class(`korState-${state}`).class("korMatchDiff");
				rm.openEnd().openStart("span").openEnd().text(name).close("span");
				rm.openStart("b").class("korNum").openEnd().text(c.money(value, Boolean(state))).close("b");
				if (state) renderStatus(rm, message(balanced ? "MATCH_BALANCED" : "MATCH_UNBALANCED"), state);
				rm.close("div");
			});
			if (editable && ours.length && theirs.length) {
				rm.openStart("button").class("korBtn").class("korBtn-ghost").attr("type", "button").attr("data-act", "auto").openEnd();
				renderIcon(rm, "sparkles");
				rm.text(message("MATCH_AUTO")).close("button");
			}
			rm.close("header");
			rm.openStart("div").class("korStateTabs").class("korMatchTabs").attr("role", "group").openEnd();
			([["all", "ALL", groups.length + open], ["open", "MATCH_OPEN", open], ["matched", "MATCH_DONE", groups.length]] as const).forEach(([key, name, count]) => {
				rm.openStart("button", `${c.getId()}-${key}`).attr("type", "button").attr("data-filter", key).attr("aria-pressed", String(filter === key)).openEnd();
				rm.openStart("span").openEnd().text(message(name)).close("span").openStart("b").class("korNum").openEnd().text(String(count)).close("b").close("button");
			});
			rm.close("div");
			const row = (entry: MatchEntry) => {
				const on = c.chosen.has(entry.getId());
				const side = entry.getSide() === "theirs" ? theirsTitle : oursTitle;
				const name = [dayText(entry.getDate()), entry.getDocument(), entry.getText(), c.money(c.amountOf(entry))].filter(Boolean).join(", ");
				rm.openStart(editable ? "button" : "div", entry).class("korMatchRow").attr("data-entry", "1");
				if (on) rm.class("korMatchOn");
				if (editable) rm.attr("type", "button").attr("aria-pressed", String(on)).attr("aria-label", `${side}: ${name}`);
				rm.openEnd();
				rm.openStart("span").class("korMatchTick").attr("aria-hidden", "true").openEnd();
				if (on) renderIcon(rm, "check");
				rm.close("span");
				rm.openStart("span").class("korMatchDate").class("korNum").openEnd().text(dayText(entry.getDate())).close("span");
				rm.openStart("span").class("korMatchText").openEnd();
				if (entry.getDocument()) rm.openStart("b").openEnd().text(entry.getDocument()).close("b");
				rm.openStart("span").openEnd().text(entry.getText()).close("span").close("span");
				rm.openStart("span").class("korMatchSum").class("korNum").openEnd().text(c.money(c.amountOf(entry))).close("span");
				rm.close(editable ? "button" : "div");
			};
			const column = (list: MatchEntry[], title: string, cls: string) => {
				rm.openStart("div").class("korMatchCol").class(cls).attr("role", "group").attr("aria-label", title).openEnd();
				rm.openStart("span").class("korMatchSide").attr("aria-hidden", "true").openEnd().text(title).close("span");
				list.forEach(row);
				rm.close("div");
			};
			rm.openStart("div").class("korMatchBody").openEnd();
			if (filter !== "open" && groups.length) {
				rm.openStart("div").class("korMatchCols").class("korMatchLegend").attr("aria-hidden", "true").openEnd();
				rm.openStart("span").openEnd().text(oursTitle).close("span").openStart("span").openEnd().close("span").openStart("span").openEnd().text(theirsTitle).close("span");
				rm.close("div");
				rm.openStart("ol").class("korMatchGroups").openEnd();
				groups.forEach((group) => {
					const fine = c.close(group.diff);
					rm.openStart("li").class("korMatchBand").class("korMatchCols");
					if (group.id === c.lit) rm.class("korMatchLit");
					rm.attr("data-group", group.id).attr("aria-label", message("MATCH_GROUP", [group.id])).openEnd();
					column(group.ours, oursTitle, "korMatchOurs");
					rm.openStart("span").class("korMatchTag").class(`korState-${fine ? "success" : "wait"}`).openEnd();
					renderIcon(rm, fine ? "link" : "triangle-alert");
					rm.openStart("b").openEnd().text(group.id).close("b");
					rm.openStart("small").openEnd().text(fine ? message(group.auto ? "MATCH_AUTO_TAG" : "MATCH_MANUAL_TAG") : c.money(group.diff, true)).close("small");
					rm.close("span");
					column(group.theirs, theirsTitle, "korMatchTheirs");
					rm.close("li");
				});
				rm.close("ol");
			}
			if (filter !== "matched") {
				if (open) {
					rm.openStart("div").class("korMatchOpen").openEnd();
					rm.openStart("h4").openEnd().text(message("MATCH_OPEN_ITEMS")).close("h4");
					rm.openStart("div").class("korMatchCols").openEnd();
					rm.openStart("div").class("korMatchCol").class("korMatchOurs").openEnd();
					rm.openStart("div").class("korMatchColHead").openEnd().openStart("span").openEnd().text(message("MATCH_ONLY_OURS", [oursTitle])).close("span").openStart("b").class("korNum").openEnd().text(c.money(c.sum(ours))).close("b").close("div");
					ours.forEach(row);
					rm.close("div");
					rm.openStart("span").attr("aria-hidden", "true").openEnd().close("span");
					rm.openStart("div").class("korMatchCol").class("korMatchTheirs").openEnd();
					rm.openStart("div").class("korMatchColHead").openEnd().openStart("span").openEnd().text(message("MATCH_ONLY_THEIRS", [theirsTitle])).close("span").openStart("b").class("korNum").openEnd().text(c.money(c.sum(theirs))).close("b").close("div");
					theirs.forEach(row);
					rm.close("div");
					rm.close("div").close("div");
				} else {
					rm.openStart("p").class("korMatchNone").openEnd();
					renderIcon(rm, "check-check");
					rm.text(message("MATCH_NONE")).close("p");
				}
			}
			rm.close("div");
			// Seçim çubuğu
			const list = c.selected();
			rm.openStart("div", `${c.getId()}-bar`).class("korMatchBar").attr("role", "status").openEnd();
			if (list.length) {
				const so = list.filter((e) => e.getSide() !== "theirs");
				const st = list.filter((e) => e.getSide() === "theirs");
				const grouped = list.some((e) => e.getMatch()) && groups.some((g) => g.id === list[0].getMatch());
				const diff = c.sum(so) - c.sum(st);
				rm.openStart("span").openEnd().text(message("MATCH_SELECTED", [so.length, st.length])).close("span");
				rm.openStart("b").class("korNum").openEnd().text(`${message("MATCH_DIFF")}: ${c.money(diff, true)}`).close("b");
				rm.openStart("span").class("korMatchActs").openEnd();
				rm.openStart("button").class("korBtn").class("korBtn-ghost").attr("type", "button").attr("data-act", "clear").openEnd().text(message("MATCH_CLEAR")).close("button");
				if (grouped) {
					rm.openStart("button").class("korBtn").attr("type", "button").attr("data-act", "unmatch").openEnd();
					renderIcon(rm, "undo-2");
					rm.text(message("MATCH_UNDO")).close("button");
				} else {
					rm.openStart("button").class("korBtn").class("korBtn-primary").attr("type", "button").attr("data-act", "match");
					if (!so.length || !st.length) rm.attr("disabled", "disabled");
					rm.openEnd();
					renderIcon(rm, "link");
					rm.text(message("MATCH_DO")).close("button");
				}
				rm.close("span");
			}
			rm.close("div");
			rm.close("section");
		}
	};
}
