import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type ListItem from "./ListItem";
import type { Press } from "./util";
import { message, renderFace, renderIcon, renderStatus } from "./util";
import "./library";

/**
 * Kişi, belge veya kayıt listesi; tek veya çok seçimli olabilir.
 *
 * @namespace kor.ui
 */
export default class List extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ListSettings);
	constructor(id?: string, settings?: $ListSettings);
	constructor(id?: string, settings?: $ListSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** none, single veya multi */
			mode: { type: "string", defaultValue: "none" },
			/** Seçili anahtarlar */
			selectedKeys: { type: "string[]", defaultValue: [], bindable: "bindable" },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Boş liste metni */
			noData: { type: "string", defaultValue: "" },
			/** Satır arası çizgi */
			divided: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Satırlar */
			items: { type: "kor.ui.ListItem", multiple: true, singularName: "item" }
		},
		events: {
			/** Satıra basıldı */
			press: { parameters: { key: { type: "string" }, item: { type: "object" } } },
			/** Seçim değişti */
			selectionChange: { parameters: { keys: { type: "string[]" }, key: { type: "string" } } }
		}
	};
	private at = 0;

	private rows(): HTMLElement[] {
		return [...((this.getDomRef() as HTMLElement | null)?.querySelectorAll<HTMLElement>("[data-i]") ?? [])];
	}
	private go(i: number): void {
		const item = this.getItems()[i];
		if (!item?.getEnabled()) return;
		const key = item.getKey();
		const mode = this.getMode();
		if (mode !== "none") {
			const old = this.getSelectedKeys();
			const keys = mode === "single" ? [key] : old.includes(key) ? old.filter((k) => k !== key) : [...old, key];
			if (keys.join("\n") !== old.join("\n")) {
				this.setSelectedKeys(keys);
				this.fireSelectionChange({ keys, key });
			}
		}
		this.firePress({ key, item });
	}
	onclick(event: Press): void {
		const row = (event.target as HTMLElement).closest<HTMLElement>("[data-i]");
		if (row?.dataset.of !== this.getId()) return;
		this.at = Number(row.dataset.i);
		this.rows().forEach((el) => (el.tabIndex = el === row ? 0 : -1));
		this.go(this.at);
	}
	onkeydown(event: KeyboardEvent): void {
		const row = (event.target as HTMLElement).closest<HTMLElement>("[data-i]");
		if (row?.dataset.of !== this.getId()) return;
		const rows = this.rows();
		const at = rows.indexOf(row);
		const to = { ArrowDown: at + 1, ArrowUp: at - 1, Home: 0, End: rows.length - 1 }[event.key];
		if (to !== undefined) {
			event.preventDefault();
			const next = rows[Math.max(0, Math.min(rows.length - 1, to))];
			rows.forEach((el) => (el.tabIndex = el === next ? 0 : -1));
			this.at = Number(next.dataset.i);
			next.focus();
		} else if ((event.key === "Enter" || event.key === " ") && row.tagName !== "BUTTON") {
			event.preventDefault();
			this.go(Number(row.dataset.i));
		}
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: List) {
			const items = c.getItems();
			const pick = c.getMode() !== "none";
			const keys = c.getSelectedKeys();
			const live = c.hasListeners("press");
			const at = Math.min(c.at, Math.max(0, items.length - 1));
			rm.openStart("div", c).class("korListing").attr("role", pick && items.length ? "listbox" : items.length ? "list" : "group");
			if (c.getDivided()) rm.class("korListingLines");
			rm.attr("aria-label", c.getLabel() || message("LIST"));
			if (c.getMode() === "multi") rm.attr("aria-multiselectable", "true");
			rm.openEnd();
			if (!items.length) rm.openStart("div").class("korMenuNone").openEnd().text(c.getNoData() || message("NO_DATA")).close("div");
			let group = "";
			items.forEach((item: ListItem, i) => {
				if (item.getGroup() !== group) {
					group = item.getGroup();
					if (group) rm.openStart("div").class("korListGroup").attr("role", "presentation").openEnd().text(group).close("div");
				}
				const on = keys.includes(item.getKey());
				rm.openStart("div", item).attr("role", pick ? "presentation" : "listitem").class("korListSlot").openEnd();
				const tag = !pick && live ? "button" : "div";
				rm.openStart(tag, `${item.getId()}-r`).class("korListRow");
				if (pick || live) rm.class("korListLive").attr("data-i", i).attr("data-of", c.getId()).attr("tabindex", i === at ? "0" : "-1");
				if (tag === "button") rm.attr("type", "button");
				if (pick) rm.attr("role", "option").attr("aria-selected", String(on));
				if (on && pick) rm.class("korListOn");
				if (!item.getEnabled()) rm.class("korListOff").attr("aria-disabled", "true");
				rm.openEnd();
				if (c.getMode() === "multi") {
					rm.openStart("span").class("korGridCheck").class("korListCheck").attr("aria-hidden", "true").openEnd();
					if (on) renderIcon(rm, "check");
					rm.close("span");
				}
				if (item.getPerson()) renderFace(rm, item.getPerson());
				else if (item.getIcon()) {
					rm.openStart("span").class("korListIcon").openEnd();
					renderIcon(rm, item.getIcon());
					rm.close("span");
				}
				rm.openStart("span").class("korListMain").openEnd();
				rm.openStart("span").class("korListTitle").openEnd().text(item.getTitle()).close("span");
				if (item.getText()) rm.openStart("span").class("korListText").openEnd().text(item.getText()).close("span");
				rm.close("span");
				rm.openStart("span").class("korListEnd").openEnd();
				if (item.getMeta()) rm.openStart("span").class("korListMeta").class("korNum").openEnd().text(item.getMeta()).close("span");
				if (item.getState()) renderStatus(rm, item.getStatusText(), item.getState());
				rm.close("span");
				if (c.getMode() === "single" && on) renderIcon(rm, "check", "korListTick");
				else if (!pick && live) renderIcon(rm, "chevron-right", "korListGo");
				rm.close(tag).close("div");
			});
			rm.close("div");
		}
	};
}
