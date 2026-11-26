import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon } from "./util";
import "./library";

/**
 * İmza alanı (teslim tutanağı, onay). Değer 400 x 120 alanda SVG yolu olarak saklanır; hukuki e-imza değildir.
 *
 * @namespace kor.ui
 */
export default class SignaturePad extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $SignaturePadSettings);
	constructor(id?: string, settings?: $SignaturePadSettings);
	constructor(id?: string, settings?: $SignaturePadSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Başlık */
			label: { type: "string", defaultValue: "" },
			/** İmzalayanın adı; çizginin altında yazılır */
			signer: { type: "string", defaultValue: "" },
			/** SVG yol verisi (400 x 120) */
			value: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Çizilebilir */
			editable: { type: "boolean", defaultValue: true },
			/** Zorunlu */
			required: { type: "boolean", defaultValue: false },
			/** Hata metni */
			error: { type: "string", defaultValue: "" }
		},
		events: {
			/** Çizgi bitti veya imza silindi */
			change: { parameters: { value: { type: "string" } } }
		}
	};
	private stroke = "";

	init(): void {
		this.attachBrowserEvent("pointerdown", (raw: unknown) => this.draw((raw as { originalEvent: PointerEvent }).originalEvent));
	}
	private draw(event: PointerEvent): void {
		const sheet = (event.target as Element).closest<SVGSVGElement>(".korSignSheet");
		if (!sheet || !this.getEditable() || event.button !== 0) return;
		event.preventDefault();
		const box = sheet.getBoundingClientRect();
		const point = (e: PointerEvent) => `${(((e.clientX - box.left) / box.width) * 400).toFixed(1)} ${(((e.clientY - box.top) / box.height) * 120).toFixed(1)}`;
		const ink = sheet.querySelector(".korSignInk");
		this.stroke = `M${point(event)}`;
		const move = (e: PointerEvent) => {
			this.stroke += ` L${point(e)}`;
			ink?.setAttribute("d", `${this.getValue()} ${this.stroke}`.trim());
		};
		const up = (e: PointerEvent) => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", up);
			// Tek dokunuş imza sayılmaz; iptal edilen çizgi silinir
			const next = e.type === "pointerup" && this.stroke.includes("L") ? `${this.getValue()} ${this.stroke}`.trim() : this.getValue();
			this.stroke = "";
			if (next !== this.getValue()) this.update(next);
			else ink?.setAttribute("d", this.getValue());
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", up);
	}
	onclick(event: Press): void {
		if ((event.target as HTMLElement).closest("[data-clear]")) this.clear();
	}
	/** İmzayı siler */
	clear(): this {
		this.update("");
		return this;
	}
	/** İmza var mı */
	isSigned(): boolean {
		return Boolean(this.getValue());
	}
	private update(value: string): void {
		this.setValue(value);
		this.fireChange({ value });
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: SignaturePad) {
			const id = c.getId();
			const value = c.getValue();
			const note = c.getError();
			rm.openStart("div", c).class("korField").class("korSign");
			if (note) rm.class("korFieldError");
			if (!c.getEditable()) rm.class("korSignDone");
			rm.openEnd();
			if (c.getLabel()) {
				rm.openStart("span", `${id}-lb`).class("korLabel").openEnd().text(c.getLabel());
				if (c.getRequired()) rm.openStart("span").class("korRequired").attr("aria-hidden", "true").openEnd().text("*").close("span");
				rm.close("span");
			}
			rm.openStart("div").class("korSignBox").openEnd();
			rm.openStart("svg").class("korSignSheet").attr("viewBox", "0 0 400 120").attr("preserveAspectRatio", "none").attr("role", "img");
			rm.attr("aria-label", `${c.getLabel() || message("SIGNATURE")}: ${message(value ? "SIGNED" : "NOT_SIGNED")}`);
			if (note) rm.attr("aria-describedby", `${id}-note`);
			rm.openEnd();
			rm.openStart("path").class("korSignLine").attr("d", "M20 96 H380").openEnd().close("path");
			rm.openStart("path").class("korSignInk").attr("d", value).openEnd().close("path");
			rm.close("svg");
			if (!value && c.getEditable()) rm.openStart("span").class("korSignHint").attr("aria-hidden", "true").openEnd().text(message("SIGN_HERE")).close("span");
			rm.close("div");
			rm.openStart("div").class("korSignFoot").openEnd();
			rm.openStart("span").openEnd().text(c.getSigner()).close("span");
			if (value && c.getEditable()) {
				rm.openStart("button").class("korBtn").class("korBtn-ghost").attr("type", "button").attr("data-clear", "1").openEnd();
				renderIcon(rm, "undo-2");
				rm.text(message("CLEAR")).close("button");
			}
			rm.close("div");
			if (note) {
				rm.openStart("div", `${id}-note`).class("korNote").openEnd();
				renderIcon(rm, "circle-alert");
				rm.text(note).close("div");
			}
			rm.close("div");
		}
	};
}
