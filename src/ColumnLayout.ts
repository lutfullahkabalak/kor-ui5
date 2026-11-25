import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, renderIcon } from "./util";
import "./library";

/**
 * Liste, kayıt ve ayrıntı yan yana; dar yerde yalnız en derin sütun görünür.
 *
 * @namespace kor.ui
 */
export default class ColumnLayout extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ColumnLayoutSettings);
	constructor(id?: string, settings?: $ColumnLayoutSettings);
	constructor(id?: string, settings?: $ColumnLayoutSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Açık sütun sayısı, 1-3 */
			columns: { type: "int", defaultValue: 1, bindable: "bindable" },
			/** Son sütun tüm alanı kaplar */
			full: { type: "boolean", defaultValue: false, bindable: "bindable" },
			/** Yükseklik */
			height: { type: "string", defaultValue: "100%" },
			/** Liste genişliği, piksel */
			listWidth: { type: "int", defaultValue: 340 },
			/** Geri, genişlet ve kapat düğmeleri */
			navigation: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** İlk sütun */
			list: { type: "sap.ui.core.Control", multiple: true, singularName: "listItem" },
			/** İkinci sütun */
			record: { type: "sap.ui.core.Control", multiple: true, singularName: "recordItem" },
			/** Üçüncü sütun */
			detail: { type: "sap.ui.core.Control", multiple: true, singularName: "detailItem" }
		},
		events: {
			/** Son sütun kapanıyor; preventDefault durdurur */
			close: { allowPreventDefault: true, parameters: { columns: { type: "int" } } }
		}
	};
	private observer?: ResizeObserver;

	private count(): number {
		return Math.max(1, Math.min(3, this.getColumns()));
	}
	onclick(event: Press): void {
		const button = (event.target as HTMLElement).closest<HTMLElement>("[data-col]");
		if (!button || button.dataset.of !== this.getId()) return;
		if (button.dataset.col === "full") {
			this.setFull(!this.getFull());
			return;
		}
		const columns = this.count() - 1;
		if (!this.fireClose({ columns })) return;
		this.setFull(false);
		this.setColumns(columns);
	}
	private fit(): void {
		const root = this.getDomRef() as HTMLElement | null;
		if (!root) return;
		const width = root.clientWidth;
		// Genişliğe göre kaç sütun yan yana sığar
		root.dataset.fit = String(width < 700 ? 1 : width < 1080 ? 2 : 3);
		this.hide();
	}
	private hide(): void {
		const root = this.getDomRef() as HTMLElement;
		const fit = this.getFull() ? 1 : Number(root.dataset.fit ?? 3);
		const n = this.count();
		[...root.children].forEach((el, i) => ((el as HTMLElement).hidden = i >= n || i < n - fit));
		// Tek sütun görünüyorsa son sütunda kapat yerine geri oku
		root.classList.toggle("korColsOne", Number(root.dataset.fit) === 1);
	}
	onAfterRendering(): void {
		this.observer?.disconnect();
		this.observer = new ResizeObserver(() => this.fit());
		this.observer.observe(this.getDomRef() as Element);
		this.fit();
	}
	exit(): void {
		this.observer?.disconnect();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: ColumnLayout) {
			const n = c.count();
			rm.openStart("div", c).class("korCols").style("height", c.getHeight()).style("--kor-list", `${c.getListWidth()}px`);
			if (c.getFull()) rm.class("korColsFull");
			rm.openEnd();
			([c.getList(), c.getRecord(), c.getDetail()] as Control[][]).forEach((items, i) => {
				rm.openStart("section", `${c.getId()}-c${i}`).class("korCol").class(`korCol${i}`);
				if (i === n - 1) rm.class("korColLast");
				rm.openEnd();
				if (i && i === n - 1 && c.getNavigation()) {
					rm.openStart("div").class("korColNav").openEnd();
					const button = (action: string, icon: string, label: string, cls: string) => {
						rm.openStart("button", `${c.getId()}-${cls}`).attr("type", "button").class("korBtn").class("korBtn-ghost").class("korBtnIcon").class(cls).attr("data-col", action).attr("data-of", c.getId()).attr("aria-label", label).attr("data-kor-tip", label).openEnd();
						renderIcon(rm, icon);
						rm.close("button");
					};
					button("close", "arrow-left", message("BACK"), "korColBack");
					rm.openStart("span").class("korWizardGap").openEnd().close("span");
					button("full", c.getFull() ? "minimize-2" : "maximize-2", message(c.getFull() ? "SHRINK" : "ENLARGE"), "korColFull");
					button("close", "x", message("CLOSE"), "korColClose");
					rm.close("div");
				}
				rm.openStart("div").class("korColBody").openEnd();
				items.forEach((item) => rm.renderControl(item));
				rm.close("div").close("section");
			});
			rm.close("div");
		}
	};
}
