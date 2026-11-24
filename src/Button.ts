import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type MenuItem from "./MenuItem";
import { Float, esc, iconHtml, renderIcon } from "./util";
import "./Tooltip";
import "./library";

/**
 * Düğme. `menuItems` verilirse menü açar.
 *
 * @namespace kor.ui
 */
export default class Button extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ButtonSettings);
	constructor(id?: string, settings?: $ButtonSettings);
	constructor(id?: string, settings?: $ButtonSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "menuItems",
		properties: {
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Simge */
			icon: { type: "string", defaultValue: "" },
			/** primary, accent, neutral, ghost veya danger */
			kind: { type: "string", defaultValue: "neutral" },
			/** Kısayol gösterimi */
			hint: { type: "string", defaultValue: "" },
			/** Simge düğmesinin adı ve ipucu */
			label: { type: "string", defaultValue: "" },
			/** İşlem sürüyor */
			loading: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true },
			/** Kapsayıcıyı doldurur */
			wide: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Menü satırları */
			menuItems: { type: "kor.ui.MenuItem", multiple: true, singularName: "menuItem" }
		},
		events: {
			/** Basıldı */
			press: {},
			/** Menü satırı seçildi */
			menuSelect: { parameters: { key: { type: "string" } } }
		}
	};
	private float?: Float;

	getFocusDomRef(): Element {
		return this.getDomRef() as Element;
	}
	onclick(): void {
		if (!this.getEnabled() || this.getLoading()) return;
		if (this.getMenuItems().length) this.toggleMenu();
		else this.firePress();
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.key === "ArrowDown" && this.getMenuItems().length && !this.float) {
			event.preventDefault();
			this.toggleMenu();
		}
	}
	private toggleMenu(): void {
		if (this.float) {
			this.float.close();
			return;
		}
		const root = this.getDomRef() as HTMLElement;
		const menu = document.createElement("div");
		menu.className = "korMenu";
		menu.setAttribute("role", "menu");
		menu.innerHTML = this.getMenuItems().map((item, i) => `<button type="button" role="menuitem" tabindex="-1" data-i="${i}" class="korMenuItem${item.getDanger() ? " korMenuDanger" : ""}">${iconHtml(item.getIcon())}<span>${esc(item.getText())}</span></button>`).join("");
		const buttons = [...menu.querySelectorAll<HTMLElement>("button")];
		const close = () => {
			this.float?.close();
			root.focus();
		};
		menu.addEventListener("click", (event) => {
			const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
			if (i === undefined) return;
			const item = this.getMenuItems()[Number(i)];
			close();
			this.fireMenuSelect({ key: item.getKey() });
		});
		menu.addEventListener("keydown", (event) => {
			const at = buttons.indexOf(document.activeElement as HTMLElement);
			const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
			if (step) {
				event.preventDefault();
				buttons[(at + step + buttons.length) % buttons.length].focus();
			} else if (event.key === "Escape" || event.key === "Tab") {
				event.preventDefault();
				event.stopPropagation();
				close();
			}
		});
		root.setAttribute("aria-expanded", "true");
		this.float = new Float(root, menu, () => {
			this.float = undefined;
			root.setAttribute("aria-expanded", "false");
		}, false);
		buttons[0]?.focus();
	}
	exit(): void {
		this.float?.close();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Button) {
			const text = c.getText();
			const name = c.getLabel() || text;
			rm.openStart("button", c).attr("type", "button").class("korBtn").class(`korBtn-${c.getKind()}`);
			if (!text) rm.class("korBtnIcon").attr("aria-label", name);
			if (c.getLabel() && c.getLabel() !== text) rm.attr("data-kor-tip", c.getLabel());
			if (c.getWide()) rm.class("korBtnWide");
			if (c.getLoading()) rm.class("korBtnLoading").attr("aria-busy", "true");
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			if (c.getMenuItems().length) rm.attr("aria-haspopup", "menu").attr("aria-expanded", "false");
			rm.openEnd();
			renderIcon(rm, c.getLoading() ? "refresh-cw" : c.getIcon());
			if (text) rm.openStart("span").class("korBtnText").openEnd().text(text).close("span");
			if (c.getHint()) rm.openStart("kbd").class("korKbd").openEnd().text(c.getHint()).close("kbd");
			if (c.getMenuItems().length && text) renderIcon(rm, "chevron-down", "korBtnChevron");
			rm.close("button");
		}
	};
}
