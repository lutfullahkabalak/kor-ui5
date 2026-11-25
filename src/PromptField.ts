import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon } from "./util";
import "./library";

/**
 * Yapay zekâ istemi alanı: öneriler, gönderme ve durdurma. Yanıtı uygulama üretir.
 *
 * @namespace kor.ui
 */
export default class PromptField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $PromptFieldSettings);
	constructor(id?: string, settings?: $PromptFieldSettings);
	constructor(id?: string, settings?: $PromptFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "suggestions",
		properties: {
			/** Metin */
			value: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Yer tutucu */
			placeholder: { type: "string", defaultValue: "" },
			/** En çok karakter; 0 sınırsız */
			maxLength: { type: "int", defaultValue: 0 },
			/** Yanıt üretiliyor; gönder yerine durdur */
			working: { type: "boolean", defaultValue: false, bindable: "bindable" },
			/** Alt not, örneğin doğruluk uyarısı */
			note: { type: "string", defaultValue: "" },
			/** Gönderince alan boşalır */
			clearOnSubmit: { type: "boolean", defaultValue: true },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Hazır istemler; alan boşken görünür */
			suggestions: { type: "sap.ui.core.Item", multiple: true, singularName: "suggestion" }
		},
		events: {
			/** Gönderildi */
			submit: { parameters: { value: { type: "string" } } },
			/** Durdurma istendi */
			stop: {},
			/** Her tuşta */
			liveChange: { parameters: { value: { type: "string" } } }
		}
	};
	private input(): HTMLTextAreaElement {
		return this.getDomRef("in") as unknown as HTMLTextAreaElement;
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("in") ?? this.getDomRef()) as Element;
	}
	private sync(): void {
		const input = this.input();
		input.style.height = "auto";
		input.style.height = `${Math.min(input.scrollHeight, 200)}px`;
		const empty = !input.value.trim();
		const send = this.getDomRef("send") as unknown as HTMLButtonElement;
		send.disabled = !this.getEnabled() || (!this.getWorking() && (empty || this.over()));
		const hints = this.getDomRef("hints");
		if (hints) (hints as HTMLElement).hidden = !empty;
		const count = this.getDomRef("count");
		if (count) {
			count.textContent = `${input.value.length} / ${this.getMaxLength()}`;
			count.classList.toggle("korPromptOver", this.over());
		}
	}
	private over(): boolean {
		return this.getMaxLength() > 0 && this.input().value.length > this.getMaxLength();
	}
	onAfterRendering(): void {
		if (this.input().value !== this.getValue()) this.input().value = this.getValue();
		this.sync();
	}
	oninput(): void {
		this.setProperty("value", this.input().value, true);
		this.sync();
		this.fireLiveChange({ value: this.getValue() });
	}
	private send(): void {
		const value = this.input().value.trim();
		if (!value || this.getWorking() || !this.getEnabled() || this.over()) return;
		if (this.getClearOnSubmit()) {
			this.setProperty("value", "", true);
			this.input().value = "";
			this.sync();
		}
		this.fireSubmit({ value });
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const i = target.closest<HTMLElement>("[data-hint]")?.dataset.hint;
		if (i !== undefined) {
			this.setValue(this.getSuggestions()[Number(i)].getText());
			this.input().value = this.getValue();
			this.sync();
			this.input().focus();
		} else if (target.closest("[data-send]")) {
			if (this.getWorking()) this.fireStop();
			else this.send();
		}
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		// Birleşik harf yazımında (Japonca vb.) Enter gönderme değildir
		if (event.target === this.input() && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
			event.preventDefault();
			this.send();
		}
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: PromptField) {
			const id = c.getId();
			rm.openStart("div", c).class("korPrompt");
			if (c.getWorking()) rm.class("korPromptBusy").attr("aria-busy", "true");
			rm.openEnd();
			if (c.getSuggestions().length) {
				rm.openStart("div", `${id}-hints`).class("korPromptHints").attr("role", "group").attr("aria-label", message("EXAMPLES")).openEnd();
				c.getSuggestions().forEach((item, i) => {
					rm.openStart("button", item).attr("type", "button").attr("data-hint", i);
					if (!c.getEnabled()) rm.attr("disabled", "disabled");
					rm.openEnd().text(item.getText()).close("button");
				});
				rm.close("div");
			}
			rm.openStart("div").class("korPromptBox").openEnd();
			renderIcon(rm, "sparkles");
			rm.openStart("textarea", `${id}-in`).class("korPromptInput").attr("rows", "1").attr("placeholder", c.getPlaceholder() || message("PROMPT")).attr("aria-label", c.getLabel() || c.getPlaceholder() || message("PROMPT"));
			if (c.getNote()) rm.attr("aria-describedby", `${id}-note`);
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.openEnd().close("textarea");
			rm.openStart("button", `${id}-send`).attr("type", "button").class("korPromptSend").attr("data-send", "1").attr("aria-label", message(c.getWorking() ? "STOP" : "SEND")).openEnd();
			renderIcon(rm, c.getWorking() ? "square" : "arrow-up");
			rm.close("button").close("div");
			if (c.getNote() || c.getMaxLength()) {
				rm.openStart("div").class("korPromptFoot").openEnd();
				rm.openStart("span", `${id}-note`).openEnd().text(c.getNote()).close("span");
				if (c.getMaxLength()) rm.openStart("span", `${id}-count`).class("korNum").openEnd().close("span");
				rm.close("div");
			}
			rm.close("div");
		}
	};
}
