import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { isRtl, renderIcon, stateKey } from "./util";
import "./library";

/**
 * Sekmeler. Yalnızca seçili sekmenin içeriği çizilir.
 *
 * @namespace kor.ui
 */
export default class Tabs extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TabsSettings);
	constructor(id?: string, settings?: $TabsSettings);
	constructor(id?: string, settings?: $TabsSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Seçili anahtar; boşsa ilk sekme */
			selectedKey: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Sekmeler */
			items: { type: "kor.ui.Tab", multiple: true, singularName: "item" }
		},
		events: {
			/** Sekme değişti */
			change: { parameters: { key: { type: "string" } } }
		}
	};
	private observer?: ResizeObserver;

	private at(): number {
		return Math.max(0, this.getItems().findIndex((item) => item.getKey() === this.getSelectedKey()));
	}
	private pick(i: number): void {
		const key = this.getItems()[i].getKey();
		if (i === this.at()) return;
		this.setSelectedKey(key);
		this.fireChange({ key });
	}
	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-tab]")?.dataset.tab;
		if (i !== undefined) this.pick(Number(i));
	}
	onkeydown(event: KeyboardEvent): void {
		if (!(event.target as HTMLElement).closest('[role="tab"]')) return;
		const count = this.getItems().length;
		const side = isRtl() ? -1 : 1;
		const to = { ArrowRight: this.at() + side, ArrowLeft: this.at() - side, Home: 0, End: count - 1 }[event.key];
		if (to === undefined) return;
		event.preventDefault();
		const next = (to + count) % count;
		this.pick(next);
		window.setTimeout(() => this.getDomRef()?.querySelectorAll<HTMLElement>('[role="tab"]')[next]?.focus());
	}
	onAfterRendering(): void {
		const list = this.getDomRef("list") as HTMLElement;
		const sync = () => {
			const tab = list.querySelector<HTMLElement>('[aria-selected="true"]');
			if (!tab) return;
			list.style.setProperty("--kor-x", `${tab.offsetLeft}px`);
			list.style.setProperty("--kor-w", `${tab.offsetWidth}px`);
		};
		this.observer?.disconnect();
		this.observer = new ResizeObserver(sync);
		this.observer.observe(list);
		sync();
		const tab = list.querySelector<HTMLElement>('[aria-selected="true"]');
		if (tab) list.scrollTo({ left: tab.offsetLeft - list.clientWidth / 2 + tab.offsetWidth / 2 });
	}
	exit(): void {
		this.observer?.disconnect();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Tabs) {
			const at = c.at();
			const id = c.getId();
			rm.openStart("div", c).class("korTabs").openEnd();
			rm.openStart("div", `${id}-list`).class("korTabList").attr("role", "tablist");
			if (c.getLabel()) rm.attr("aria-label", c.getLabel());
			rm.openEnd();
			c.getItems().forEach((item, i) => {
				rm.openStart("button", item).attr("type", "button").class("korTab").attr("role", "tab").attr("data-tab", i).attr("aria-selected", String(i === at)).attr("aria-controls", `${id}-panel`).attr("tabindex", i === at ? "0" : "-1").openEnd();
				renderIcon(rm, item.getIcon());
				rm.openStart("span").openEnd().text(item.getText()).close("span");
				if (item.getCount()) rm.openStart("span").class("korTabCount").class(`korState-${stateKey(item.getState())}`).openEnd().text(item.getCount()).close("span");
				rm.close("button");
			});
			rm.openStart("span").class("korTabLine").attr("aria-hidden", "true").openEnd().close("span");
			rm.close("div");
			const current = c.getItems()[at];
			rm.openStart("div", `${id}-panel`).class("korTabPanel").attr("role", "tabpanel");
			if (current) rm.attr("aria-labelledby", current.getId());
			rm.openEnd();
			current?.getContent().forEach((item) => rm.renderControl(item));
			rm.close("div").close("div");
		}
	};
}
