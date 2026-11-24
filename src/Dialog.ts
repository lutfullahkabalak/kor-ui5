import Control from "sap/ui/core/Control";
import Popup from "sap/ui/core/Popup";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon } from "./util";
import "./library";

let openCount = 0;
/** Örtü rengi yalnızca Kor penceresi açıkken değişir */
const modal = (step: number): void => {
	openCount += step;
	document.documentElement.classList.toggle("korModal", openCount > 0);
};
const FOCUSABLE = 'button:not([disabled]):not([tabindex="-1"]), input:not([disabled]), textarea:not([disabled]), select:not([disabled]), a[href], [tabindex="0"]';

/**
 * Modal pencere. Görünümün `dependents` bölümüne konur; `open` ile açılıp kapanır.
 *
 * @namespace kor.ui
 */
export default class Dialog extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DialogSettings);
	constructor(id?: string, settings?: $DialogSettings);
	constructor(id?: string, settings?: $DialogSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Açık */
			open: { type: "boolean", defaultValue: false, bindable: "bindable" },
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Alt başlık */
			subtitle: { type: "string", defaultValue: "" },
			/** Genişlik, piksel */
			width: { type: "int", defaultValue: 560 },
			/** Esc ve çarpı ile kapanabilir */
			dismissable: { type: "boolean", defaultValue: true },
			/** Geri dönüşü zor işlem */
			danger: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" },
			/** Alt düğmeler */
			footer: { type: "sap.ui.core.Control", multiple: true, singularName: "footerItem" }
		},
		events: {
			/** Kullanıcı kapattı; `preventDefault` açık tutar */
			close: { allowPreventDefault: true }
		}
	};
	private popup?: Popup;

	setOpen(open: boolean): this {
		const was = this.getOpen();
		this.setProperty("open", open, true);
		if (this.getOpen() !== was) {
			modal(this.getOpen() ? 1 : -1);
			if (this.getOpen()) this.show();
			else this.popup?.close(0);
		}
		return this;
	}
	private show(): void {
		if (!this.popup) {
			this.popup = new Popup(this as never, true, false, false);
			this.popup.setAnimations(((_: unknown, __: unknown, done: () => void) => done()) as never, ((_: unknown, __: unknown, done: () => void) => done()) as never);
			this.popup.attachOpened(() => this.focusFirst());
		}
		this.popup.open(0, "center center" as never, "center center" as never, window as never, "0 0", "fit");
	}
	private items(): HTMLElement[] {
		return [...(this.getDomRef() as HTMLElement).querySelectorAll<HTMLElement>(FOCUSABLE)].filter((el) => el.getClientRects().length);
	}
	private focusFirst(): void {
		const body = this.getDomRef("body");
		const first = body && this.items().find((el) => body.contains(el));
		(first ?? (this.getDomRef("title") as HTMLElement)).focus();
	}
	private shut(): void {
		if (this.fireEvent("close", {}, true)) this.setOpen(false);
	}
	onclick(event: Press): void {
		if ((event.target as HTMLElement).closest("[data-close]")) this.shut();
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		if (event.key === "Escape" && !event.defaultPrevented) {
			event.preventDefault();
			event.stopPropagation();
			raw.stopPropagation();
			if (this.getDismissable()) this.shut();
		} else if (event.key === "Tab") {
			// Odak pencere içinde döner
			const list = this.items();
			const at = list.indexOf(document.activeElement as HTMLElement);
			const edge = event.shiftKey ? at <= 0 : at === list.length - 1;
			if (edge) {
				event.preventDefault();
				list[event.shiftKey ? list.length - 1 : 0]?.focus();
			}
		}
	}
	exit(): void {
		if (this.getOpen()) modal(-1);
		this.popup?.close(0);
		this.popup?.destroy();
		// Bağımlı olarak yok edilince UI5 DOM'u bırakır
		this.getDomRef()?.remove();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Dialog) {
			const id = c.getId();
			rm.openStart("section", c).class("korDialog").attr("role", c.getDanger() ? "alertdialog" : "dialog").attr("aria-modal", "true").attr("aria-labelledby", `${id}-title`).style("width", `min(${c.getWidth()}px, calc(100vw - 24px))`);
			if (c.getDanger()) rm.class("korDialogDanger").attr("aria-describedby", `${id}-body`);
			rm.openEnd();
			// Dış öğenin konum ve görünürlüğü Popup'ındır; düzen içtedir
			rm.openStart("div").class("korDialogBox").openEnd();
			rm.openStart("header").class("korDialogHead").openEnd();
			if (c.getDanger()) {
				rm.openStart("span").class("korDialogMark").openEnd();
				renderIcon(rm, "triangle-alert");
				rm.close("span");
			}
			rm.openStart("div").class("korSheetTitles").openEnd();
			rm.openStart("h2", `${id}-title`).attr("tabindex", "-1").openEnd().text(c.getTitle()).close("h2");
			if (c.getSubtitle()) rm.openStart("div").class("korNote").openEnd().text(c.getSubtitle()).close("div");
			rm.close("div");
			if (c.getDismissable()) {
				rm.openStart("button").attr("type", "button").attr("data-close", "1").class("korBtn").class("korBtn-ghost").class("korBtnIcon").attr("aria-label", message("CLOSE")).openEnd();
				renderIcon(rm, "x");
				rm.close("button");
			}
			rm.close("header");
			rm.openStart("div", `${id}-body`).class("korDialogBody").openEnd();
			c.getContent().forEach((item) => rm.renderControl(item));
			rm.close("div");
			if (c.getFooter().length) {
				rm.openStart("footer").class("korDialogFoot").openEnd();
				c.getFooter().forEach((item) => rm.renderControl(item));
				rm.close("footer");
			}
			rm.close("div").close("section");
		}
	};
}
