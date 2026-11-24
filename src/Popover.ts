import Control from "sap/ui/core/Control";
import Popup from "sap/ui/core/Popup";
import type RenderManager from "sap/ui/core/RenderManager";
import { isRtl } from "./util";
import "./library";

/**
 * Bir öğeye bağlı küçük katman. `dependents` bölümüne konur, `openBy(düğme)` ile açılır.
 *
 * @namespace kor.ui
 */
export default class Popover extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $PopoverSettings);
	constructor(id?: string, settings?: $PopoverSettings);
	constructor(id?: string, settings?: $PopoverSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Genişlik, piksel */
			width: { type: "int", defaultValue: 320 }
		},
		aggregations: {
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" },
			/** Alt düğmeler */
			footer: { type: "sap.ui.core.Control", multiple: true, singularName: "footerItem" }
		},
		events: {
			/** Kapandı */
			close: {}
		}
	};
	private popup?: Popup;
	private anchor?: HTMLElement;

	openBy(opener: Control | HTMLElement): void {
		const dom = (opener instanceof HTMLElement ? opener : opener.getDomRef()) as HTMLElement;
		if (this.isOpen() && this.anchor === dom) {
			this.close();
			return;
		}
		this.anchor = dom;
		if (!this.popup) {
			this.popup = new Popup(this as never, false, false, true);
			const now = (_: unknown, __: unknown, done: () => void) => done();
			this.popup.setAnimations(now as never, now as never);
			this.popup.attachOpened(() => (this.getDomRef() as unknown as HTMLElement).focus({ preventScroll: true }));
			this.popup.attachClosed(() => {
				this.anchor?.setAttribute("aria-expanded", "false");
				this.anchor = undefined;
				this.fireClose();
			});
		}
		// Açan düğmeye basmak "dışarı basmak" sayılmaz; ikinci basış kapatır
		(this.popup as unknown as { setAutoCloseAreas(areas: unknown[]): void }).setAutoCloseAreas([dom]);
		dom.setAttribute("aria-haspopup", "dialog");
		dom.setAttribute("aria-expanded", "true");
		const side = isRtl() ? "right" : "left";
		this.popup.open(0, `${side} top` as never, `${side} bottom` as never, dom as never, "0 6", "flipfit");
	}
	isOpen(): boolean {
		return !!this.popup?.isOpen();
	}
	close(): void {
		this.popup?.close(0);
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			event.preventDefault();
			event.stopPropagation();
			this.close();
		}
	}
	exit(): void {
		this.popup?.close(0);
		this.popup?.destroy();
		// Bağımlı olarak yok edilince UI5 DOM'u bırakır
		this.getDomRef()?.remove();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Popover) {
			rm.openStart("section", c).class("korPopover").attr("role", "dialog").attr("tabindex", "-1").style("width", `min(${c.getWidth()}px, calc(100vw - 16px))`);
			if (c.getTitle()) rm.attr("aria-labelledby", `${c.getId()}-title`);
			rm.openEnd();
			if (c.getTitle()) rm.openStart("h3", `${c.getId()}-title`).openEnd().text(c.getTitle()).close("h3");
			rm.openStart("div").class("korPopoverBody").openEnd();
			c.getContent().forEach((item) => rm.renderControl(item));
			rm.close("div");
			if (c.getFooter().length) {
				rm.openStart("footer").class("korPopoverFoot").openEnd();
				c.getFooter().forEach((item) => rm.renderControl(item));
				rm.close("footer");
			}
			rm.close("section");
		}
	};
}
