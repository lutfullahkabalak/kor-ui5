import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import DamageMark from "./DamageMark";
import type { Press } from "./util";
import { message, renderIcon, renderStatus } from "./util";
import "./library";

// Üstten görünüş, 160 x 320. [ad, x, y, genişlik, yükseklik, köşe]
const shapes: [string, number, number, number, number, number][] = [
	["frontBumper", 30, 4, 100, 18, 9],
	["hood", 32, 25, 96, 66, 8],
	["windshield", 36, 94, 88, 24, 6],
	["roof", 36, 121, 88, 74, 6],
	["rearWindow", 36, 198, 88, 20, 6],
	["trunk", 32, 221, 96, 70, 8],
	["rearBumper", 30, 295, 100, 20, 9],
	["frontLeftFender", 8, 30, 21, 70, 8],
	["frontLeftDoor", 8, 103, 21, 56, 4],
	["rearLeftDoor", 8, 162, 21, 56, 4],
	["rearLeftFender", 8, 221, 21, 70, 8],
	["frontRightFender", 131, 30, 21, 70, 8],
	["frontRightDoor", 131, 103, 21, 56, 4],
	["rearRightDoor", 131, 162, 21, 56, 4],
	["rearRightFender", 131, 221, 21, 70, 8]
];
const kinds = ["scratch", "dent", "broken", "missing", "other"];
const zoneKey = (zone: string) => `DMG_${zone.replace(/[A-Z]/g, (c) => `_${c}`).toUpperCase()}`;

/**
 * Araç teslim ve iade tutanağı için hasar haritası. Bölgeye basılıp hasar türü seçilir;
 * iadede bulunan ve teslimde olmayan hasar "yeni" diye ayrılır.
 *
 * @namespace kor.ui
 */
export default class DamageMap extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DamageMapSettings);
	constructor(id?: string, settings?: $DamageMapSettings);
	constructor(id?: string, settings?: $DamageMapSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "marks",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Eklenen hasarın aşaması: handover veya return */
			stage: { type: "string", defaultValue: "handover" },
			/** Hasar eklenip silinebilir */
			editable: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Hasarlar */
			marks: { type: "kor.ui.DamageMark", multiple: true, singularName: "mark" }
		},
		events: {
			/** Hasar ekleniyor veya siliniyor; preventDefault durdurur */
			change: { allowPreventDefault: true, parameters: { action: { type: "string" }, zone: { type: "string" }, kind: { type: "string" }, key: { type: "string" } } },
			/** Bölgeye basıldı */
			zonePress: { parameters: { zone: { type: "string" } } }
		}
	};
	/** Bölge adları */
	static readonly zones = shapes.map((s) => s[0]);
	private zone = "";
	private focusZone = "";

	/** İadede bulunan, teslimde aynı bölgede olmayan hasarlar. */
	getNewMarks(): DamageMark[] {
		const before = new Set(this.getMarks().filter((m) => m.getStage() !== "return").map((m) => m.getZone()));
		return this.getMarks().filter((m) => m.getStage() === "return" && !before.has(m.getZone()));
	}
	private add(kind: string): void {
		const zone = this.zone;
		const used = new Set(this.getMarks().map((m) => m.getKey()));
		let i = 1;
		while (used.has(`d${i}`)) i++;
		const key = `d${i}`;
		if (!this.fireChange({ action: "add", zone, kind, key })) return;
		this.addMark(new DamageMark({ key, zone, kind, stage: this.getStage() === "return" ? "return" : "handover" }));
		this.focusZone = zone;
		this.zone = "";
	}
	private remove(mark: DamageMark): void {
		if (!this.fireChange({ action: "remove", zone: mark.getZone(), kind: mark.getKind(), key: mark.getKey() })) return;
		this.removeMark(mark);
		mark.destroy();
	}
	private pick(zone: string): void {
		this.fireZonePress({ zone });
		if (!this.getEditable()) return;
		this.zone = this.zone === zone ? "" : zone;
		this.focusZone = this.zone ? "" : zone;
		this.invalidate();
	}
	onclick(event: Press): void {
		const target = event.target as Element;
		const zone = target.closest<SVGElement>("[data-zone]")?.dataset.zone;
		const kind = target.closest<HTMLElement>("[data-kind]")?.dataset.kind;
		const drop = target.closest<HTMLElement>("[data-drop]")?.dataset.drop;
		if (zone) this.pick(zone);
		else if (kind) this.add(kind);
		else if (target.closest("[data-close]")) {
			this.focusZone = this.zone;
			this.zone = "";
			this.invalidate();
		} else if (drop) {
			const mark = this.getMarks().find((m) => m.getId() === drop);
			if (mark) this.remove(mark);
		}
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		const zone = (event.target as Element).closest<SVGElement>("[data-zone]")?.dataset.zone;
		if (zone && (event.key === "Enter" || event.key === " ")) {
			event.preventDefault();
			this.pick(zone);
		} else if (event.key === "Escape" && this.zone) {
			event.preventDefault();
			this.focusZone = this.zone;
			this.zone = "";
			this.invalidate();
		}
	}
	onAfterRendering(): void {
		const dom = this.getDomRef();
		if (this.zone) dom?.querySelector<HTMLElement>("[data-kind]")?.focus();
		else if (this.focusZone) dom?.querySelector<SVGElement>(`[data-zone="${this.focusZone}"]`)?.focus();
		this.focusZone = "";
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: DamageMap) {
			const marks = c.getMarks();
			const fresh = new Set(c.getNewMarks());
			const editable = c.getEditable();
			const byZone = new Map<string, DamageMark[]>();
			marks.forEach((m) => byZone.set(m.getZone(), [...(byZone.get(m.getZone()) ?? []), m]));
			const stateOf = (m: DamageMark) => (fresh.has(m) ? "danger" : m.getStage() === "return" ? "none" : "wait");
			rm.openStart("section", c).class("korDmg").attr("aria-label", c.getLabel() || message("DMG_MAP")).openEnd();
			rm.openStart("div").class("korDmgCar").openEnd();
			rm.openStart("svg").attr("viewBox", "0 0 160 320").attr("role", "group").attr("aria-label", message("DMG_ZONES")).attr("focusable", "false").openEnd();
			// Gövde ve tekerlekler
			rm.openStart("rect").class("korDmgBody").attr("x", 6).attr("y", 2).attr("width", 148).attr("height", 316).attr("rx", 34).openEnd().close("rect");
			[[2, 44], [150, 44], [2, 238], [150, 238]].forEach(([x, y]) => rm.openStart("rect").class("korDmgWheel").attr("x", x).attr("y", y).attr("width", 8).attr("height", 40).attr("rx", 3).openEnd().close("rect"));
			shapes.forEach(([name, x, y, w, h, r]) => {
				const list = byZone.get(name) ?? [];
				const glass = ["windshield", "rearWindow"].includes(name);
				rm.openStart("rect").class("korDmgZone");
				if (glass) rm.class("korDmgGlass");
				if (list.length) rm.class(`korState-${list.some((m) => fresh.has(m)) ? "danger" : "wait"}`).class("korDmgHit");
				if (c.zone === name) rm.class("korDmgOn");
				rm.attr("x", x).attr("y", y).attr("width", w).attr("height", h).attr("rx", r).attr("data-zone", name);
				rm.attr("role", "button").attr("tabindex", "0").attr("aria-label", `${message(zoneKey(name))}${list.length ? `: ${message("DMG_COUNT", [list.length])}` : ""}`);
				if (c.zone === name) rm.attr("aria-expanded", "true");
				rm.openEnd().close("rect");
				list.forEach((m, i) => {
					const cx = x + w / 2 + (i - (list.length - 1) / 2) * 13;
					rm.openStart("g").class("korDmgPin").class(`korState-${stateOf(m)}`).attr("aria-hidden", "true").openEnd();
					rm.openStart("circle").attr("cx", cx).attr("cy", y + h / 2).attr("r", 6).openEnd().close("circle");
					rm.openStart("text").attr("x", cx).attr("y", y + h / 2 + 3.2).openEnd().text(String(marks.indexOf(m) + 1)).close("text");
					rm.close("g");
				});
			});
			rm.close("svg").close("div");
			rm.openStart("div").class("korDmgSide").openEnd();
			const before = marks.filter((m) => m.getStage() !== "return").length;
			rm.openStart("div").class("korDmgSum").openEnd();
			renderStatus(rm, message("DMG_AT_HANDOVER", [before]), "wait");
			renderStatus(rm, message("DMG_AT_RETURN", [marks.length - before]), "none");
			if (fresh.size) renderStatus(rm, message("DMG_NEW", [fresh.size]), "danger");
			rm.close("div");
			if (c.zone) {
				rm.openStart("div", `${c.getId()}-pick`).class("korDmgPick").attr("role", "group").attr("aria-label", message(zoneKey(c.zone))).openEnd();
				rm.openStart("div").class("korDmgPickHead").openEnd().openStart("b").openEnd().text(message(zoneKey(c.zone))).close("b");
				rm.openStart("button").class("korBtn").class("korBtn-ghost").class("korBtnIcon").attr("type", "button").attr("data-close", "1").attr("aria-label", message("CLOSE")).openEnd();
				renderIcon(rm, "x");
				rm.close("button").close("div");
				rm.openStart("div").class("korChips").openEnd();
				kinds.forEach((kind) => rm.openStart("button").attr("type", "button").attr("data-kind", kind).openEnd().text(message(`DMG_KIND_${kind.toUpperCase()}`)).close("button"));
				rm.close("div").close("div");
			} else if (editable) {
				rm.openStart("p").class("korNote").openEnd().text(message("DMG_HINT")).close("p");
			}
			rm.openStart("ol").class("korDmgList").openEnd();
			marks.forEach((m, i) => {
				const state = stateOf(m);
				rm.openStart("li", m).class(`korState-${state}`).openEnd();
				rm.openStart("span").class("korDmgNo").class("korNum").openEnd().text(String(i + 1)).close("span");
				rm.openStart("span").class("korDmgText").openEnd();
				rm.openStart("b").openEnd().text(`${message(zoneKey(m.getZone()))} · ${message(`DMG_KIND_${(kinds.includes(m.getKind()) ? m.getKind() : "other").toUpperCase()}`)}`).close("b");
				rm.openStart("span").openEnd().text([message(m.getStage() === "return" ? "DMG_RETURN" : "DMG_HANDOVER"), m.getNote()].filter(Boolean).join(" · ")).close("span");
				rm.close("span");
				if (fresh.has(m)) renderStatus(rm, message("DMG_NEW_ONE"), "danger");
				const own = (m.getStage() === "return") === (c.getStage() === "return");
				if (editable && own) {
					rm.openStart("button").class("korBtn").class("korBtn-ghost").class("korBtnIcon").attr("type", "button").attr("data-drop", m.getId()).attr("aria-label", message("DMG_REMOVE", [i + 1])).openEnd();
					renderIcon(rm, "trash-2");
					rm.close("button");
				}
				rm.close("li");
			});
			rm.close("ol").close("div").close("section");
		}
	};
}
