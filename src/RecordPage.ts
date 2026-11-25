import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { reducedMotion, renderStatus } from "./util";
import "./library";

/**
 * Kayıt sayfası: başlık, özet, işlemler ve kaydırdıkça izleyen bölüm çubuğu.
 *
 * @namespace kor.ui
 */
export default class RecordPage extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $RecordPageSettings);
	constructor(id?: string, settings?: $RecordPageSettings);
	constructor(id?: string, settings?: $RecordPageSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "sections",
		properties: {
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Alt başlık */
			subtitle: { type: "string", defaultValue: "" },
			/** Durum metni */
			statusText: { type: "string", defaultValue: "" },
			/** Durum; boşsa gösterilmez */
			state: { type: "string", defaultValue: "" },
			/** Yükseklik; sayfa kendi içinde kayar */
			height: { type: "string", defaultValue: "100%" }
		},
		aggregations: {
			/** Kırıntı yolu yeri */
			breadcrumbs: { type: "sap.ui.core.Control", multiple: true, singularName: "breadcrumb" },
			/** Başlık işlemleri */
			actions: { type: "sap.ui.core.Control", multiple: true, singularName: "action" },
			/** Başlık altı özet */
			summary: { type: "sap.ui.core.Control", multiple: true, singularName: "summaryItem" },
			/** Bölümler */
			sections: { type: "kor.ui.RecordSection", multiple: true, singularName: "section" }
		},
		events: {
			/** Görünen bölüm değişti */
			sectionChange: { parameters: { key: { type: "string" } } }
		}
	};
	private at = 0;
	private lock = 0;

	private parts(): HTMLElement[] {
		return this.getSections().map((section) => section.getDomRef() as HTMLElement).filter(Boolean);
	}
	private mark(i: number): void {
		if (i === this.at) return;
		this.at = i;
		this.getDomRef("nav")?.querySelectorAll<HTMLElement>("[data-sec]").forEach((button, k) => {
			if (k === i) button.setAttribute("aria-current", "true");
			else button.removeAttribute("aria-current");
		});
		const nav = this.getDomRef("nav") as HTMLElement | null;
		const button = nav?.children[i] as HTMLElement | undefined;
		if (nav && button) nav.scrollTo({ left: button.offsetLeft - nav.clientWidth / 2 + button.offsetWidth / 2 });
		this.fireSectionChange({ key: this.getSections()[i]?.getKey() ?? "" });
	}
	private offset(): number {
		return (this.getDomRef("bar") as HTMLElement).offsetHeight;
	}
	handleEvent(): void {
		const root = this.getDomRef() as HTMLElement | null;
		if (!root) return;
		root.classList.toggle("korRecordStuck", root.scrollTop > 8);
		if (Date.now() < this.lock) return;
		const line = root.getBoundingClientRect().top + this.offset() + 24;
		const parts = this.parts();
		let i = 0;
		parts.forEach((part, k) => part.getBoundingClientRect().top <= line && (i = k));
		// Sayfa dibinde kısa son bölüm de seçilebilsin
		if (root.scrollTop > 0 && root.scrollTop + root.clientHeight >= root.scrollHeight - 2) i = parts.length - 1;
		this.mark(i);
	}
	/** Verilen anahtarlı bölüme kaydırır. */
	scrollToSection(key: string): void {
		const i = this.getSections().findIndex((section) => section.getKey() === key);
		const part = this.parts()[i];
		const root = this.getDomRef() as HTMLElement | null;
		if (!part || !root) return;
		// Kayma sürerken ara bölümler işaretlenmesin
		this.lock = Date.now() + 700;
		this.mark(i);
		root.scrollTo({ top: root.scrollTop + part.getBoundingClientRect().top - root.getBoundingClientRect().top - this.offset() - 8, behavior: reducedMotion() ? "auto" : "smooth" });
	}
	onclick(event: Press): void {
		const button = (event.target as HTMLElement).closest<HTMLElement>("[data-sec]");
		if (!button || button.dataset.of !== this.getId()) return;
		this.scrollToSection(this.getSections()[Number(button.dataset.sec)].getKey());
	}
	onBeforeRendering(): void {
		this.getDomRef()?.removeEventListener("scroll", this);
	}
	onAfterRendering(): void {
		this.getDomRef()?.addEventListener("scroll", this, { passive: true });
	}
	exit(): void {
		this.getDomRef()?.removeEventListener("scroll", this);
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: RecordPage) {
			const id = c.getId();
			const sections = c.getSections();
			rm.openStart("article", c).class("korRecord").style("height", c.getHeight()).attr("aria-labelledby", `${id}-t`).openEnd();
			if (c.getBreadcrumbs().length) {
				rm.openStart("div").class("korRecordTrail").openEnd();
				c.getBreadcrumbs().forEach((item) => rm.renderControl(item));
				rm.close("div");
			}
			rm.openStart("div", `${id}-bar`).class("korRecordBar").openEnd();
			rm.openStart("header").class("korRecordHead").openEnd();
			rm.openStart("div").class("korRecordTitles").openEnd();
			rm.openStart("h1", `${id}-t`).openEnd().text(c.getTitle()).close("h1");
			if (c.getState()) renderStatus(rm, c.getStatusText(), c.getState());
			if (c.getSubtitle()) rm.openStart("p").openEnd().text(c.getSubtitle()).close("p");
			rm.close("div");
			rm.openStart("div").class("korRecordActions").openEnd();
			c.getActions().forEach((item) => rm.renderControl(item));
			rm.close("div").close("header");
			if (sections.length > 1) {
				rm.openStart("nav", `${id}-nav`).class("korRecordNav").attr("aria-labelledby", `${id}-t`).openEnd();
				sections.forEach((section, i) => {
					rm.openStart("button", `${section.getId()}-n`).attr("type", "button").attr("data-sec", i).attr("data-of", id);
					if (i === c.at) rm.attr("aria-current", "true");
					rm.openEnd().text(section.getTitle()).close("button");
				});
				rm.close("nav");
			}
			rm.close("div");
			if (c.getSummary().length) {
				rm.openStart("div").class("korRecordSummary").openEnd();
				c.getSummary().forEach((item) => rm.renderControl(item));
				rm.close("div");
			}
			sections.forEach((section) => {
				rm.openStart("section", section).class("korRecordSection").attr("aria-labelledby", `${section.getId()}-t`).openEnd();
				rm.openStart("header").openEnd().openStart("h2", `${section.getId()}-t`).openEnd().text(section.getTitle()).close("h2");
				if (section.getText()) rm.openStart("p").openEnd().text(section.getText()).close("p");
				rm.close("header");
				section.getContent().forEach((item) => rm.renderControl(item));
				rm.close("section");
			});
			rm.close("article");
		}
	};
}
