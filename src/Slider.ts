import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import { isRtl, message, num } from "./util";
import "./library";

/**
 * Kaydırıcı; `range` ile aralık seçer.
 *
 * @namespace kor.ui
 */
export default class Slider extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $SliderSettings);
	constructor(id?: string, settings?: $SliderSettings);
	constructor(id?: string, settings?: $SliderSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Değer veya aralığın başı */
			value: { type: "float", defaultValue: 0, bindable: "bindable" },
			/** Aralığın sonu */
			to: { type: "float", defaultValue: 100, bindable: "bindable" },
			/** Aralık seçimi */
			range: { type: "boolean", defaultValue: false },
			/** En az */
			min: { type: "float", defaultValue: 0 },
			/** En çok */
			max: { type: "float", defaultValue: 100 },
			/** Adım */
			step: { type: "float", defaultValue: 1 },
			/** Ondalık */
			decimals: { type: "int", defaultValue: 0 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Yardım metni */
			help: { type: "string", defaultValue: "" },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Değer kesinleşti */
			change: { parameters: { value: { type: "float" }, to: { type: "float" } } },
			/** Sürüklerken */
			liveChange: { parameters: { value: { type: "float" }, to: { type: "float" } } }
		}
	};
	private drag?: "value" | "to";

	init(): void {
		this.attachBrowserEvent("pointerdown", (raw: unknown) => {
			const event = (raw as { originalEvent: PointerEvent }).originalEvent;
			const track = this.getDomRef("track") as HTMLElement | null;
			if (!track?.contains(event.target as Node) || !this.getEnabled() || event.button) return;
			event.preventDefault();
			const at = this.read(event.clientX);
			const before = `${this.getValue()}|${this.getTo()}`;
			const { lo, hi } = this.bounds();
			const thumb = (event.target as HTMLElement).closest<HTMLElement>("[data-thumb]")?.dataset.thumb as "value" | "to" | undefined;
			this.drag = !this.getRange() ? "value" : lo === hi ? (at < lo ? "value" : at > hi ? "to" : thumb ?? "to") : thumb ?? (Math.abs(at - lo) <= Math.abs(at - hi) ? "value" : "to");
			(this.getDomRef(this.drag) as HTMLElement).focus();
			track.setPointerCapture(event.pointerId);
			if (!thumb) this.put(this.drag, at);
			const move = (e: PointerEvent) => this.put(this.drag!, this.read(e.clientX));
			const up = () => {
				track.removeEventListener("pointermove", move);
				track.removeEventListener("pointerup", up);
				track.removeEventListener("pointercancel", up);
				this.drag = undefined;
				if (before !== `${this.getValue()}|${this.getTo()}`) this.done();
			};
			track.addEventListener("pointermove", move);
			track.addEventListener("pointerup", up);
			track.addEventListener("pointercancel", up);
		});
	}
	private bounds(): { lo: number; hi: number } {
		const clamp = (v: number) => Math.max(this.getMin(), Math.min(this.getMax(), v));
		const lo = clamp(this.getValue());
		return { lo, hi: Math.max(lo, clamp(this.getTo())) };
	}
	private read(x: number): number {
		const rect = (this.getDomRef("track") as HTMLElement).getBoundingClientRect();
		const part = (x - rect.left) / (rect.width || 1);
		return this.getMin() + (isRtl() ? 1 - part : part) * (this.getMax() - this.getMin());
	}
	private put(which: "value" | "to", raw: number): void {
		const step = this.getStep() || 1;
		const { lo, hi } = this.bounds();
		const from = which === "to" ? lo : this.getMin();
		const until = this.getRange() && which === "value" ? hi : this.getMax();
		const scale = 10 ** Math.max(this.getDecimals(), 6);
		const snapped = Math.round((this.getMin() + Math.round((raw - this.getMin()) / step) * step) * scale) / scale;
		const next = Math.max(from, Math.min(until, snapped));
		if (next === this.getProperty(which)) return;
		this.setProperty(which, next, true);
		this.sync();
		this.fireLiveChange({ value: this.getValue(), to: this.getTo() });
	}
	private done(): void {
		this.fireChange({ value: this.getValue(), to: this.getTo() });
	}
	private shown(value: number): string {
		return num(value, this.getDecimals()) + (this.getUnit() ? ` ${this.getUnit()}` : "");
	}
	private sync(): void {
		const root = this.getDomRef() as HTMLElement;
		const { lo, hi } = this.bounds();
		const size = this.getMax() - this.getMin() || 1;
		root.style.setProperty("--kor-a", String(this.getRange() ? (lo - this.getMin()) / size : 0));
		root.style.setProperty("--kor-b", String(((this.getRange() ? hi : lo) - this.getMin()) / size));
		(["value", "to"] as const).forEach((which) => {
			const thumb = this.getDomRef(which);
			if (!thumb) return;
			const value = which === "value" ? lo : hi;
			thumb.setAttribute("aria-valuenow", String(value));
			thumb.setAttribute("aria-valuetext", this.shown(value));
			thumb.setAttribute("aria-valuemin", String(which === "to" ? lo : this.getMin()));
			thumb.setAttribute("aria-valuemax", String(which === "value" && this.getRange() ? hi : this.getMax()));
		});
		(this.getDomRef("out") as HTMLElement).textContent = this.getRange() ? `${this.shown(lo)} – ${this.shown(hi)}` : this.shown(lo);
	}
	onAfterRendering(): void {
		this.sync();
	}
	onkeydown(event: KeyboardEvent): void {
		const which = (event.target as HTMLElement).dataset.thumb as "value" | "to" | undefined;
		if (!which || !this.getEnabled()) return;
		const side = (isRtl() ? -1 : 1) * this.getStep();
		const { lo, hi } = this.bounds();
		const at = which === "value" ? lo : hi;
		const step = this.getStep();
		const to = { ArrowRight: at + side, ArrowLeft: at - side, ArrowUp: at + step, ArrowDown: at - step, PageUp: at + step * 10, PageDown: at - step * 10, Home: this.getMin(), End: this.getMax() }[event.key];
		if (to === undefined) return;
		event.preventDefault();
		const before = this.getProperty(which) as number;
		this.put(which, to);
		if (before !== this.getProperty(which)) this.done();
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("value") ?? this.getDomRef()) as Element;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Slider) {
			const id = c.getId();
			const name = c.getLabel() || message("VALUE");
			rm.openStart("div", c).class("korField").class("korSlider");
			if (!c.getEnabled()) rm.class("korSliderOff");
			rm.openEnd();
			rm.openStart("div").class("korSliderHead").openEnd();
			rm.openStart("span").class("korLabel").openEnd().text(c.getLabel()).close("span");
			rm.openStart("output", `${id}-out`).class("korNum").openEnd().close("output").close("div");
			rm.openStart("div", `${id}-track`).class("korSliderTrack").openEnd();
			rm.openStart("span").class("korSliderFill").openEnd().close("span");
			(c.getRange() ? ["value", "to"] : ["value"]).forEach((which) => {
				rm.openStart("span", `${id}-${which}`).class("korThumb").class(`korThumb-${c.getRange() && which === "value" ? "a" : "b"}`).attr("role", "slider").attr("data-thumb", which).attr("tabindex", c.getEnabled() ? "0" : "-1");
				rm.attr("aria-label", c.getRange() ? `${name}: ${message(which === "value" ? "FROM" : "UNTIL")}` : name);
				if (!c.getEnabled()) rm.attr("aria-disabled", "true");
				if (c.getHelp()) rm.attr("aria-describedby", `${id}-note`);
				rm.openEnd().close("span");
			});
			rm.close("div");
			if (c.getHelp()) rm.openStart("div", `${id}-note`).class("korNote").openEnd().text(c.getHelp()).close("div");
			rm.close("div");
		}
	};
}
