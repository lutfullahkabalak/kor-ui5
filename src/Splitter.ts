import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { isRtl, message } from "./util";
import "./library";

/**
 * Aradaki çizgiden genişliği ayarlanan iki bölme.
 *
 * @namespace kor.ui
 */
export default class Splitter extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $SplitterSettings);
	constructor(id?: string, settings?: $SplitterSettings);
	constructor(id?: string, settings?: $SplitterSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** İlk bölmenin yüzdesi */
			position: { type: "float", defaultValue: 50, bindable: "bindable" },
			/** Bölmelerin en az boyu, piksel */
			min: { type: "int", defaultValue: 160 },
			/** Bölmeler alt alta */
			vertical: { type: "boolean", defaultValue: false },
			/** Yükseklik */
			height: { type: "string", defaultValue: "100%" },
			/** Ayırıcının erişilebilir adı */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** İlk bölme */
			start: { type: "sap.ui.core.Control", multiple: true, singularName: "startItem" },
			/** İkinci bölme */
			end: { type: "sap.ui.core.Control", multiple: true, singularName: "endItem" }
		},
		events: {
			/** Boyut değişti */
			resize: { parameters: { position: { type: "float" } } }
		}
	};
	private before?: number;

	init(): void {
		this.attachBrowserEvent("pointerdown", (raw: unknown) => {
			const event = (raw as { originalEvent: PointerEvent }).originalEvent;
			const bar = this.getDomRef("bar") as HTMLElement | null;
			if (!bar?.contains(event.target as Node) || event.button) return;
			event.preventDefault();
			bar.focus();
			bar.setPointerCapture(event.pointerId);
			const from = this.getPosition();
			const move = (e: PointerEvent) => {
				const rect = (this.getDomRef() as HTMLElement).getBoundingClientRect();
				const part = this.getVertical() ? (e.clientY - rect.top) / rect.height : (e.clientX - rect.left) / rect.width;
				this.put((!this.getVertical() && isRtl() ? 1 - part : part) * 100);
			};
			const up = () => {
				bar.removeEventListener("pointermove", move);
				bar.removeEventListener("pointerup", up);
				bar.removeEventListener("pointercancel", up);
				if (from !== this.getPosition()) this.fireResize({ position: this.getPosition() });
			};
			bar.addEventListener("pointermove", move);
			bar.addEventListener("pointerup", up);
			bar.addEventListener("pointercancel", up);
		});
		this.attachBrowserEvent("dblclick", (raw: unknown) => {
			if (this.getDomRef("bar")?.contains((raw as { target: Node }).target)) this.collapse();
		});
	}
	private put(value: number): void {
		const root = this.getDomRef() as HTMLElement;
		const size = (this.getVertical() ? root.clientHeight : root.clientWidth) || 1;
		const edge = Math.min(50, (this.getMin() / size) * 100);
		this.set(Math.max(edge, Math.min(100 - edge, value)));
	}
	private set(value: number): void {
		const next = Math.round(value * 100) / 100;
		this.setProperty("position", next, true);
		(this.getDomRef() as HTMLElement).style.setProperty("--kor-at", `${next}%`);
		this.getDomRef("bar")?.setAttribute("aria-valuenow", String(Math.round(next)));
	}
	private collapse(): void {
		if (this.getPosition() > 0) {
			this.before = this.getPosition();
			this.set(0);
		} else this.set(this.before ?? 50);
		this.fireResize({ position: this.getPosition() });
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.target !== this.getDomRef("bar")) return;
		const side = this.getVertical() ? 0 : isRtl() ? -2 : 2;
		const row = this.getVertical() ? 2 : 0;
		const at = this.getPosition();
		if (event.key === "Enter") {
			event.preventDefault();
			this.collapse();
			return;
		}
		const to = { ArrowRight: at + side, ArrowLeft: at - side, ArrowDown: at + row, ArrowUp: at - row, Home: 0, End: 100 }[event.key];
		if (to === undefined || to === at) return;
		event.preventDefault();
		this.put(to);
		this.fireResize({ position: this.getPosition() });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Splitter) {
			rm.openStart("div", c).class("korSplit").style("height", c.getHeight()).style("--kor-at", `${c.getPosition()}%`);
			if (c.getVertical()) rm.class("korSplitRows");
			rm.openEnd();
			rm.openStart("div").class("korSplitStart").attr("id", `${c.getId()}-start`).openEnd();
			c.getStart().forEach((item) => rm.renderControl(item));
			rm.close("div");
			rm.openStart("div", `${c.getId()}-bar`).class("korSplitBar").attr("role", "separator").attr("tabindex", "0").attr("aria-orientation", c.getVertical() ? "horizontal" : "vertical").attr("aria-label", c.getLabel() || message("RESIZE")).attr("aria-controls", `${c.getId()}-start`).attr("aria-valuemin", "0").attr("aria-valuemax", "100").attr("aria-valuenow", Math.round(c.getPosition())).openEnd().close("div");
			rm.openStart("div").class("korSplitEnd").openEnd();
			c.getEnd().forEach((item) => rm.renderControl(item));
			rm.close("div").close("div");
		}
	};
}
