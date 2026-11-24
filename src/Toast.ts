import "./library";
import { esc, iconHtml, nextZ, staticArea, stateIcons, stateKey } from "./util";

export type ToastOptions = { text?: string; state?: string; duration?: number; actionText?: string; action?: () => void };

/**
 * Kısa bildirim; istenirse geri alma düğmesiyle.
 * `Toast.show("Sipariş onaylandı", { actionText: "Geri al", action: undo })`
 *
 * @namespace kor.ui
 */
const Toast = {
	show(title: string, options: ToastOptions = {}): void {
		let host = document.getElementById("kor-toasts");
		if (!host) {
			host = document.createElement("div");
			host.id = "kor-toasts";
			host.className = "korToasts";
			host.setAttribute("role", "status");
			staticArea().appendChild(host);
		}
		host.style.zIndex = String(nextZ());
		const key = stateKey(options.state ?? "success");
		const toast = document.createElement("div");
		toast.className = `korToast korState-${key}`;
		toast.innerHTML = `<span class="korStatusGlyph">${iconHtml(stateIcons[key])}</span><div class="korToastBody"><div>${esc(title)}</div>${options.text ? `<div class="korToastText">${esc(options.text)}</div>` : ""}</div>${options.actionText ? `<button type="button" class="korToastAction">${esc(options.actionText)}</button>` : ""}`;
		host.appendChild(toast);
		const close = () => {
			toast.classList.add("korToastOut");
			window.setTimeout(() => toast.remove(), 220);
		};
		let timer = window.setTimeout(close, options.duration ?? 5000);
		toast.addEventListener("pointerenter", () => window.clearTimeout(timer));
		toast.addEventListener("pointerleave", () => (timer = window.setTimeout(close, 2000)));
		toast.querySelector("button")?.addEventListener("click", () => {
			window.clearTimeout(timer);
			close();
			options.action?.();
		});
	}
};
export default Toast;
