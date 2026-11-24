import Core from "sap/ui/core/Core";
import Element from "sap/ui/core/Element";
import { esc, nextZ, staticArea } from "./util";
import "./library";

/**
 * İpucu. Herhangi bir kontrolün `dependents` bölümüne konur; fareyle ve odakla çıkar, Esc ile kapanır.
 *
 * @namespace kor.ui
 */
export default class Tooltip extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TooltipSettings);
	constructor(id?: string, settings?: $TooltipSettings);
	constructor(id?: string, settings?: $TooltipSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Kısayol gösterimi */
			hint: { type: "string", defaultValue: "" }
		}
	};
}

// Tek dinleyici yeter: ipucu, basılan öğeden yukarı doğru aranır
let shown: { tip: HTMLElement; anchor: HTMLElement } | undefined;
let timer = 0;
function find(target: EventTarget | null): { anchor: HTMLElement; text: string; hint: string } | undefined {
	if (!(target instanceof HTMLElement || target instanceof SVGElement)) return undefined;
	const tipped = target.closest<HTMLElement>("[data-kor-tip]");
	if (tipped) return { anchor: tipped, text: tipped.dataset.korTip ?? "", hint: tipped.dataset.korHint ?? "" };
	for (let el = target.closest<HTMLElement>("[data-sap-ui]"); el; el = el.parentElement?.closest<HTMLElement>("[data-sap-ui]") ?? null) {
		const tip = (Core.byId(el.id) as Element | undefined)?.getDependents().find((d) => d instanceof Tooltip) as Tooltip | undefined;
		if (tip) return { anchor: el, text: tip.getText(), hint: tip.getHint() };
	}
	return undefined;
}
function hide(): void {
	window.clearTimeout(timer);
	if (!shown) return;
	shown.anchor.removeAttribute("aria-describedby");
	shown.tip.remove();
	shown = undefined;
}
function show(found: { anchor: HTMLElement; text: string; hint: string }): void {
	hide();
	if (!found.text || !found.anchor.isConnected) return;
	const tip = document.createElement("div");
	tip.className = "korTooltip";
	tip.id = "kor-tooltip";
	tip.setAttribute("role", "tooltip");
	tip.style.zIndex = String(nextZ());
	tip.innerHTML = `${esc(found.text)}${found.hint ? `<kbd class="korKbd">${esc(found.hint)}</kbd>` : ""}`;
	staticArea().appendChild(tip);
	const a = found.anchor.getBoundingClientRect();
	const below = a.top < tip.offsetHeight + 12;
	tip.style.left = `${Math.max(8, Math.min(a.left + a.width / 2 - tip.offsetWidth / 2, window.innerWidth - tip.offsetWidth - 8))}px`;
	tip.style.top = `${below ? a.bottom + 8 : a.top - tip.offsetHeight - 8}px`;
	// Adı zaten ipucuyla aynıysa ekran okuyucu iki kez okumasın
	if (found.anchor.getAttribute("aria-label") !== found.text) found.anchor.setAttribute("aria-describedby", tip.id);
	shown = { tip, anchor: found.anchor };
}
document.addEventListener("pointerover", (event) => {
	if (event.pointerType === "touch") return;
	if (shown?.tip.contains(event.target as Node)) {
		window.clearTimeout(timer);
		return;
	}
	const found = find(event.target);
	if (found && found.anchor === shown?.anchor) {
		window.clearTimeout(timer);
		return;
	}
	window.clearTimeout(timer);
	timer = window.setTimeout(() => (found ? show(found) : hide()), found && !shown ? 450 : 120);
});
document.addEventListener("focusin", (event) => {
	const found = (event.target as HTMLElement).matches?.(":focus-visible") ? find(event.target) : undefined;
	if (found) show(found);
	else hide();
});
document.addEventListener("focusout", hide);
document.addEventListener("pointerdown", hide, true);
document.addEventListener("scroll", hide, true);
document.addEventListener("keydown", (event) => {
	if (event.key === "Escape") hide();
});
