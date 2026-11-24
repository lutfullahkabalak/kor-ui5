import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon } from "./util";
import "./library";

/**
 * Uygulama kabuğu: menü, üst çubuk ve içerik sahnesi. Dar ekranda menü çekmece olur.
 *
 * @namespace kor.ui
 */
export default class Shell extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ShellSettings);
	constructor(id?: string, settings?: $ShellSettings);
	constructor(id?: string, settings?: $ShellSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "content",
		properties: {
			/** Ürün adı */
			brand: { type: "string", defaultValue: "" },
			/** Üst çubuktaki başlık */
			title: { type: "string", defaultValue: "" },
			/** Seçili menü anahtarı */
			selectedKey: { type: "string", defaultValue: "" },
			/** Menü yalnız simge */
			collapsed: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Menü */
			items: { type: "kor.ui.NavItem", multiple: true, singularName: "item" },
			/** Üst çubuk sağı */
			actions: { type: "sap.ui.core.Control", multiple: true, singularName: "action" },
			/** Menünün altı */
			footer: { type: "sap.ui.core.Control", multiple: true, singularName: "footerItem" },
			/** İçerik */
			content: { type: "sap.ui.core.Control", multiple: true, singularName: "content" }
		},
		events: {
			/** Menüden seçildi */
			navigate: { parameters: { key: { type: "string" } } }
		}
	};
	private drawer = false;

	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const key = target.closest<HTMLElement>("[data-nav]")?.dataset.nav;
		if (key !== undefined) {
			this.setDrawer(false);
			this.setSelectedKey(key);
			this.fireNavigate({ key });
			(this.getDomRef("main") as HTMLElement | null)?.scrollTo({ top: 0 });
		} else if (target.closest("[data-toggle]")) {
			if (window.matchMedia("(max-width: 860px)").matches) this.setDrawer(!this.drawer);
			else this.setCollapsed(!this.getCollapsed());
		} else if (target.closest(".korShellVeil")) this.setDrawer(false);
	}
	onsapescape(): void {
		this.setDrawer(false);
	}
	private setDrawer(open: boolean): void {
		if (open === this.drawer) return;
		this.drawer = open;
		this.getDomRef()?.classList.toggle("korShellDrawer", open);
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Shell) {
			rm.openStart("div", c).class("korShell").class("kor");
			if (c.getCollapsed()) rm.class("korShellSlim");
			if (c.drawer) rm.class("korShellDrawer");
			rm.openEnd();
			rm.openStart("div").class("korShellVeil").openEnd().close("div");
			rm.openStart("aside").class("korRail").openEnd();
			rm.openStart("div").class("korBrand").openEnd();
			rm.openStart("span").class("korBrandMark").attr("aria-hidden", "true").openEnd().close("span");
			rm.openStart("span").class("korBrandText").openEnd().text(c.getBrand()).close("span").close("div");
			rm.openStart("nav").class("korNav").attr("aria-label", message("MAIN_NAV")).openEnd();
			let group = "";
			c.getItems().forEach((item) => {
				if (item.getGroup() && item.getGroup() !== group) {
					group = item.getGroup();
					rm.openStart("div").class("korNavGroup").openEnd().text(group).close("div");
				}
				const on = item.getKey() === c.getSelectedKey();
				rm.openStart("button", item).attr("type", "button").class("korNavItem").attr("data-nav", item.getKey()).attr("title", item.getText());
				if (on) rm.class("korNavOn").attr("aria-current", "page");
				rm.openEnd();
				renderIcon(rm, item.getIcon());
				rm.openStart("span").class("korNavText").openEnd().text(item.getText()).close("span");
				if (item.getCount()) rm.openStart("span").class("korNavCount").openEnd().text(item.getCount()).close("span");
				rm.close("button");
			});
			rm.close("nav");
			rm.openStart("div").class("korRailFoot").openEnd();
			c.getFooter().forEach((item) => rm.renderControl(item));
			rm.close("div").close("aside");
			rm.openStart("div").class("korStage0").openEnd();
			rm.openStart("header").class("korTop").openEnd();
			rm.openStart("button", `${c.getId()}-toggle`).attr("type", "button").class("korBtn").class("korBtn-ghost").class("korBtnIcon").attr("data-toggle", "1").attr("aria-label", message("OPEN_NAV")).openEnd();
			renderIcon(rm, "panel-left");
			rm.close("button");
			rm.openStart("div").class("korTopTitle").openEnd().text(c.getTitle()).close("div");
			rm.openStart("div").class("korTopActions").openEnd();
			c.getActions().forEach((action) => rm.renderControl(action));
			rm.close("div").close("header");
			rm.openStart("main", `${c.getId()}-main`).class("korMain").openEnd();
			c.getContent().forEach((item) => rm.renderControl(item));
			rm.close("main").close("div").close("div");
		}
	};
}
