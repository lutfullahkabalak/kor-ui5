import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { message, renderIcon } from "./util";
import "./library";

/**
 * Basılı tutarak onay: geri dönüşü zor işlemde yanlış tıklamayı önler.
 * Basılı tutamayanlar (ekran okuyucu, anahtar erişimi, Enter) iki kez basar.
 *
 * @namespace kor.ui
 */
export default class HoldButton extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $HoldButtonSettings);
	constructor(id?: string, settings?: $HoldButtonSettings);
	constructor(id?: string, settings?: $HoldButtonSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Metin */
			text: { type: "string", defaultValue: "" },
			/** Onaydan sonraki metin */
			doneText: { type: "string", defaultValue: "" },
			/** Simge */
			icon: { type: "string", defaultValue: "check" },
			/** Süre, milisaniye */
			duration: { type: "int", defaultValue: 900 },
			/** Onaylandı */
			done: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Süre doldu, onaylandı */
			confirm: {}
		}
	};
	private timer = 0;
	private armed = false;

	init(): void {
		this.attachBrowserEvent("pointerdown", (event: unknown) => {
			const pointer = (event as { originalEvent: PointerEvent }).originalEvent;
			if (pointer.button === 0) this.start();
		});
		["pointerup", "pointerleave", "pointercancel"].forEach((name) => this.attachBrowserEvent(name, () => this.stop()));
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.key === " ") {
			event.preventDefault();
			if (!event.repeat && !(event as unknown as { originalEvent: KeyboardEvent }).originalEvent.repeat) this.start();
		}
	}
	onkeyup(event: KeyboardEvent): void {
		if (event.key === " ") {
			event.preventDefault();
			this.stop();
		}
	}
	onfocusout(): void {
		this.stop();
		if (this.armed) {
			this.armed = false;
			this.invalidate();
		}
	}
	onclick(event: { originalEvent?: MouseEvent }): void {
		// detail 0: klavye veya yardımcı teknoloji basışı
		if (this.getDone() || !this.getEnabled() || (event.originalEvent?.detail ?? 0) > 0) return;
		if (this.armed) this.finish();
		else {
			this.armed = true;
			this.invalidate();
		}
	}
	private start(): void {
		if (this.getDone() || !this.getEnabled() || this.timer) return;
		const root = this.getDomRef() as HTMLElement;
		root.style.setProperty("--kor-hold", `${this.getDuration()}ms`);
		root.classList.add("korHoldOn");
		this.timer = window.setTimeout(() => this.finish(), this.getDuration());
	}
	private stop(): void {
		window.clearTimeout(this.timer);
		this.timer = 0;
		this.getDomRef()?.classList.remove("korHoldOn");
	}
	private finish(): void {
		this.stop();
		this.armed = false;
		this.setDone(true);
		this.fireConfirm();
	}
	exit(): void {
		window.clearTimeout(this.timer);
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: HoldButton) {
			const done = c.getDone();
			const text = done ? c.getDoneText() || message("HOLD_DONE") : c.armed ? message("HOLD_AGAIN") : c.getText();
			rm.openStart("button", c).attr("type", "button").class("korHold").attr("aria-live", "polite");
			if (done) rm.class("korHoldDone").attr("aria-disabled", "true");
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.openEnd();
			// İki katman: dolgu ilerledikçe yazı da tam o çizgide renk değiştirir
			(["korHoldText", "korHoldFill"] as const).forEach((cls) => {
				rm.openStart("span").class(cls);
				if (cls === "korHoldFill") rm.attr("aria-hidden", "true");
				rm.openEnd();
				renderIcon(rm, done ? "check-check" : c.getIcon());
				rm.openStart("span").openEnd().text(text).close("span").close("span");
			});
			rm.close("button");
		}
	};
}
