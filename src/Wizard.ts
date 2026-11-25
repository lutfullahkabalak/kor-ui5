import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon } from "./util";
import "./library";

/**
 * Adım adım giriş. İleri basınca adımdaki formlar doğrulanır.
 *
 * @namespace kor.ui
 */
export default class Wizard extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $WizardSettings);
	constructor(id?: string, settings?: $WizardSettings);
	constructor(id?: string, settings?: $WizardSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "steps",
		properties: {
			/** Bulunulan adım, 0'dan başlar */
			current: { type: "int", defaultValue: 0, bindable: "bindable" },
			/** Son düğmenin metni */
			finishText: { type: "string", defaultValue: "" },
			/** İşlem sürüyor */
			working: { type: "boolean", defaultValue: false, bindable: "bindable" }
		},
		aggregations: {
			/** Adımlar */
			steps: { type: "kor.ui.WizardStep", multiple: true, singularName: "step" }
		},
		events: {
			/** Adım değişiyor; preventDefault durdurur */
			stepChange: { allowPreventDefault: true, parameters: { from: { type: "int" }, to: { type: "int" } } },
			/** Son adım onaylandı */
			finish: {},
			/** Vazgeçildi; dinlenmezse düğme çıkmaz */
			cancel: {}
		}
	};
	private top = 0;

	private index(): number {
		return Math.max(0, Math.min(this.getCurrent(), this.getSteps().length - 1));
	}
	/** Bulunulan adımdaki formları doğrular. */
	validate(): boolean {
		const step = this.getSteps()[this.index()];
		if (!step) return true;
		const forms = step.findAggregatedObjects(true, (object: object) => typeof (object as { validate?: unknown }).validate === "function") as unknown as { validate(): boolean | undefined }[];
		// Hepsi doğrulanır, ilk hatada durulmaz
		return forms.map((form) => form.validate() !== false).every(Boolean) && step.getValid();
	}
	/** Verilen adıma geçer; ileri gidişte aradaki adım doğrulanır. */
	goTo(to: number): boolean {
		const from = this.index();
		if (to === from || to < 0 || to >= this.getSteps().length) return false;
		if (to > from && !this.validate()) return false;
		if (!this.fireStepChange({ from, to })) return false;
		this.top = Math.max(this.top, to);
		this.setCurrent(to);
		window.setTimeout(() => (this.getDomRef("head") as HTMLElement | null)?.focus({ preventScroll: false }));
		return true;
	}
	onclick(event: Press): void {
		const target = (event.target as HTMLElement).closest<HTMLElement>("[data-wiz]");
		if (!target || target.dataset.of !== this.getId() || this.getWorking()) return;
		const at = this.index();
		const action = target.dataset.wiz;
		if (action === "cancel") this.fireCancel();
		else if (action === "back") this.goTo(at - 1);
		else if (action !== "next") this.goTo(Number(action));
		else if (at < this.getSteps().length - 1) this.goTo(at + 1);
		else if (this.validate()) this.fireFinish();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Wizard) {
			const id = c.getId();
			const steps = c.getSteps();
			const at = c.index();
			c.top = Math.max(c.top, at);
			const step = steps[at];
			rm.openStart("section", c).class("korWizard").openEnd();
			rm.openStart("ol").class("korWizardSteps").attr("aria-label", message("STEPS")).openEnd();
			steps.forEach((item, i) => {
				rm.openStart("li", item);
				if (i === at) rm.class("korWizardOn");
				if (i < c.top || (i === c.top && i < at)) rm.class("korWizardDone");
				rm.openEnd();
				rm.openStart("button").attr("type", "button").attr("data-wiz", i).attr("data-of", id);
				if (i === at) rm.attr("aria-current", "step");
				// Yalnız görülmüş adımlara dönülür
				if (i > c.top) rm.attr("disabled", "disabled");
				rm.openEnd();
				rm.openStart("span").class("korWizardMark").class("korNum").openEnd();
				if (i < c.top && i !== at) renderIcon(rm, "check");
				else rm.text(String(i + 1));
				rm.close("span").openStart("span").class("korWizardName").openEnd().text(item.getTitle()).close("span").close("button").close("li");
			});
			rm.close("ol");
			rm.openStart("div").class("korWizardBody").openEnd();
			if (step) {
				rm.openStart("header").openEnd();
				rm.openStart("p").class("korWizardCount").openEnd().text(message("STEP_OF", [at + 1, steps.length])).close("p");
				rm.openStart("h2", `${id}-head`).attr("tabindex", "-1").openEnd().text(step.getTitle()).close("h2");
				if (step.getText()) rm.openStart("p").openEnd().text(step.getText()).close("p");
				rm.close("header");
				step.getContent().forEach((item) => rm.renderControl(item));
			}
			rm.close("div");
			const button = (action: string, kind: string, text: string, off = false) => {
				rm.openStart("button", `${id}-${action}`).attr("type", "button").class("korBtn").class(`korBtn-${kind}`).attr("data-wiz", action).attr("data-of", id);
				if (off) rm.attr("disabled", "disabled");
				rm.openEnd().text(text).close("button");
			};
			rm.openStart("footer").class("korWizardFoot").openEnd();
			if (c.hasListeners("cancel")) button("cancel", "ghost", message("CANCEL"), c.getWorking());
			rm.openStart("span").class("korWizardGap").openEnd().close("span");
			if (at > 0) button("back", "neutral", message("BACK"), c.getWorking());
			if (step) button("next", at === steps.length - 1 ? "accent" : "primary", at === steps.length - 1 ? c.getFinishText() || message("FINISH") : step.getNextText() || message("NEXT"), c.getWorking());
			rm.close("footer").close("section");
		}
	};
}
