import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { isRtl } from "./util";
import "./library";

/**
 * Kayan başparmaklı tek seçim.
 *
 * @namespace kor.ui
 */
export default class Segmented extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $SegmentedSettings);
	constructor(id?: string, settings?: $SegmentedSettings);
	constructor(id?: string, settings?: $SegmentedSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Seçili anahtar */
			selectedKey: { type: "string", defaultValue: "" },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Seçenekler */
			items: { type: "sap.ui.core.Item", multiple: true, singularName: "item" }
		},
		events: {
			/** Seçim değişti */
			change: { parameters: { key: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const key = (event.target as HTMLElement).closest<HTMLElement>("[data-key]")?.dataset.key;
		if (key !== undefined) this.pick(key);
	}
	onkeydown(event: KeyboardEvent): void {
		const step = { ArrowRight: isRtl() ? -1 : 1, ArrowLeft: isRtl() ? 1 : -1 }[event.key];
		if (!step) return;
		event.preventDefault();
		const keys = this.getItems().map((item) => item.getKey());
		this.pick(keys[(Math.max(0, keys.indexOf(this.getSelectedKey())) + step + keys.length) % keys.length]);
		this.getDomRef()?.querySelector<HTMLElement>('[aria-checked="true"]')?.focus();
	}
	private pick(key: string): void {
		if (key === this.getSelectedKey()) return;
		this.setProperty("selectedKey", key, true);
		this.sync();
		this.fireChange({ key });
	}
	setSelectedKey(key: string): this {
		this.setProperty("selectedKey", key, !!this.getDomRef());
		if (this.getDomRef()) this.sync();
		return this;
	}
	private sync(): void {
		const root = this.getDomRef() as HTMLElement;
		const buttons = [...root.querySelectorAll<HTMLElement>("button")];
		const at = Math.max(0, this.getItems().findIndex((item) => item.getKey() === this.getSelectedKey()));
		buttons.forEach((button, i) => {
			button.setAttribute("aria-checked", String(i === at));
			button.tabIndex = i === at ? 0 : -1;
		});
		const button = buttons[at];
		if (button) {
			root.style.setProperty("--kor-x", `${button.offsetLeft}px`);
			root.style.setProperty("--kor-w", `${button.offsetWidth}px`);
		}
	}
	private observer?: ResizeObserver;
	onAfterRendering(): void {
		this.observer?.disconnect();
		this.observer = new ResizeObserver(() => this.getDomRef() && this.sync());
		this.observer.observe(this.getDomRef() as Element);
		this.sync();
	}
	exit(): void {
		this.observer?.disconnect();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Segmented) {
			rm.openStart("div", c).class("korSeg").attr("role", "radiogroup");
			if (c.getLabel()) rm.attr("aria-label", c.getLabel());
			rm.openEnd();
			rm.openStart("span").class("korSegThumb").attr("aria-hidden", "true").openEnd().close("span");
			c.getItems().forEach((item) => {
				rm.openStart("button", item).attr("type", "button").attr("role", "radio").attr("data-key", item.getKey()).openEnd().text(item.getText()).close("button");
			});
			rm.close("div");
		}
	};
}
