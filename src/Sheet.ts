import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon } from "./util";
import "./library";

/**
 * Yandan açılan kayıt paneli. Arkadaki sayfa çalışmaya devam eder (kip engellemez).
 *
 * @namespace kor.ui
 */
export default class Sheet extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $SheetSettings);
	constructor(id?: string, settings?: $SheetSettings);
	constructor(id?: string, settings?: $SheetSettings) {
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
			width: { type: "int", defaultValue: 480 }
		},
		aggregations: {
			/** Başlık düğmeleri */
			actions: { type: "sap.ui.core.Control", multiple: true, singularName: "action" },
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" },
			/** Alt çubuk */
			footer: { type: "sap.ui.core.Control", multiple: true, singularName: "footerItem" }
		},
		events: {
			/** Kapandı */
			close: {}
		}
	};
	private back?: HTMLElement;
	private was = false;

	onAfterRendering(): void {
		const open = this.getOpen();
		if (open && !this.was) {
			this.back = document.activeElement as HTMLElement;
			(this.getDomRef("title") as HTMLElement | null)?.focus({ preventScroll: true });
		} else if (!open && this.was && this.back?.isConnected) this.back.focus({ preventScroll: true });
		this.was = open;
	}
	private shut(): void {
		this.setOpen(false);
		this.fireClose();
	}
	onclick(event: Press): void {
		if ((event.target as HTMLElement).closest("[data-close]")) this.shut();
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.key === "Escape" && !event.defaultPrevented) {
			event.stopPropagation();
			this.shut();
		}
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Sheet) {
			rm.openStart("section", c).class("korSheet").attr("role", "dialog").attr("aria-labelledby", `${c.getId()}-title`).style("--kor-sheet", `${c.getWidth()}px`);
			if (c.getOpen()) rm.class("korSheetOpen");
			else rm.attr("inert", "");
			rm.openEnd();
			rm.openStart("header").class("korSheetHead").openEnd();
			rm.openStart("div").class("korSheetTitles").openEnd();
			rm.openStart("h2", `${c.getId()}-title`).attr("tabindex", "-1").openEnd().text(c.getTitle()).close("h2");
			if (c.getSubtitle()) rm.openStart("div").class("korNote").openEnd().text(c.getSubtitle()).close("div");
			rm.close("div");
			c.getActions().forEach((action) => rm.renderControl(action));
			rm.openStart("button").attr("type", "button").attr("data-close", "1").class("korBtn").class("korBtn-ghost").class("korBtnIcon").attr("aria-label", message("CLOSE")).openEnd();
			renderIcon(rm, "x");
			rm.close("button").close("header");
			rm.openStart("div").class("korSheetBody").openEnd();
			c.getContent().forEach((item) => rm.renderControl(item));
			rm.close("div");
			if (c.getFooter().length) {
				rm.openStart("footer").class("korSheetFoot").openEnd();
				c.getFooter().forEach((item) => rm.renderControl(item));
				rm.close("footer");
			}
			rm.close("section");
		}
	};
}
