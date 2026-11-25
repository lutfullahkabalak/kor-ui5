import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type Crumb from "./Crumb";
import type { Press } from "./util";
import { Float, esc, message, renderIcon, safeHref } from "./util";
import "./library";

/**
 * Kırıntı yolu. Yer darsa ortadaki adımlar menüye toplanır.
 *
 * @namespace kor.ui
 */
export default class Breadcrumbs extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $BreadcrumbsSettings);
	constructor(id?: string, settings?: $BreadcrumbsSettings);
	constructor(id?: string, settings?: $BreadcrumbsSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "items",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Adımlar; sonuncusu bulunulan yerdir */
			items: { type: "kor.ui.Crumb", multiple: true, singularName: "item" }
		},
		events: {
			/** Adım seçildi; preventDefault adresi açmaz */
			select: { allowPreventDefault: true, parameters: { key: { type: "string" } } }
		}
	};
	private observer?: ResizeObserver;
	private float?: Float;

	private choose(item: Crumb, event: Event | { preventDefault(): void }): void {
		if (!this.fireSelect({ key: item.getKey() })) event.preventDefault();
	}
	onclick(event: Press & { preventDefault(): void }): void {
		const target = event.target as HTMLElement;
		const i = target.closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.choose(this.getItems()[Number(i)], event);
		else if (target.closest("[data-more]")) this.more(target.closest("[data-more]") as HTMLElement);
	}
	private more(button: HTMLElement): void {
		if (this.float) {
			this.float.close();
			return;
		}
		const hidden = this.getItems().map((item, i) => ({ item, i })).filter(({ i }) => this.getDomRef(`s${i}`)?.hasAttribute("hidden"));
		const menu = document.createElement("div");
		menu.className = "korMenu";
		menu.innerHTML = hidden.map(({ item, i }) => {
			const href = safeHref(item.getHref());
			return href ? `<a class="korMenuItem" href="${esc(href)}" data-i="${i}"><span>${esc(item.getText())}</span></a>` : `<button type="button" class="korMenuItem" data-i="${i}"><span>${esc(item.getText())}</span></button>`;
		}).join("");
		const close = () => {
			this.float?.close();
			button.focus();
		};
		menu.addEventListener("click", (event) => {
			const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
			if (i === undefined) return;
			this.choose(this.getItems()[Number(i)], event);
			close();
		});
		menu.addEventListener("keydown", (event) => {
			const links = [...menu.querySelectorAll<HTMLElement>("[data-i]")];
			const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
			if (step) {
				event.preventDefault();
				links[(links.indexOf(document.activeElement as HTMLElement) + step + links.length) % links.length].focus();
			} else if (event.key === "Escape" || event.key === "Tab") {
				event.preventDefault();
				event.stopPropagation();
				close();
			}
		});
		button.setAttribute("aria-expanded", "true");
		this.float = new Float(button, menu, () => {
			this.float = undefined;
			button.setAttribute("aria-expanded", "false");
		}, false);
		menu.querySelector<HTMLElement>("[data-i]")?.focus();
	}
	private fit(): void {
		const root = this.getDomRef() as HTMLElement | null;
		if (!root) return;
		const steps = [...root.querySelectorAll<HTMLElement>("li[id]")];
		const more = this.getDomRef("more") as HTMLElement;
		steps.forEach((step) => (step.hidden = false));
		more.hidden = true;
		// İlk ve son adım kalır, aradakiler soldan başlayarak toplanır
		for (let i = 1; i < steps.length - 1 && root.scrollWidth > root.clientWidth + 1; i++) {
			more.hidden = false;
			steps[i].hidden = true;
		}
	}
	onAfterRendering(): void {
		this.observer?.disconnect();
		this.observer = new ResizeObserver(() => this.fit());
		this.observer.observe(this.getDomRef() as Element);
		this.fit();
	}
	exit(): void {
		this.observer?.disconnect();
		this.float?.close();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Breadcrumbs) {
			const items = c.getItems();
			rm.openStart("nav", c).class("korCrumbs").attr("aria-label", c.getLabel() || message("BREADCRUMBS")).openEnd();
			rm.openStart("ol").openEnd();
			items.forEach((item, i) => {
				if (i === 1) {
					rm.openStart("li").class("korCrumbMore").attr("id", `${c.getId()}-more`).attr("hidden", "hidden").openEnd();
					rm.openStart("button").attr("type", "button").attr("data-more", "1").attr("aria-expanded", "false").attr("aria-label", message("MORE")).openEnd();
					renderIcon(rm, "ellipsis");
					rm.close("button");
					renderIcon(rm, "chevron-right", "korCrumbSep");
					rm.close("li");
				}
				const last = i === items.length - 1;
				const href = safeHref(item.getHref());
				rm.openStart("li", `${c.getId()}-s${i}`).openEnd();
				if (last) rm.openStart("span").class("korCrumbHere").attr("aria-current", "page").openEnd().text(item.getText()).close("span");
				else {
					if (href) rm.openStart("a").attr("href", href);
					else rm.openStart("button").attr("type", "button");
					rm.attr("data-i", i).openEnd().text(item.getText()).close(href ? "a" : "button");
					renderIcon(rm, "chevron-right", "korCrumbSep");
				}
				rm.close("li");
			});
			rm.close("ol").close("nav");
		}
	};
}
