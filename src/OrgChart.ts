import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type OrgPerson from "./OrgPerson";
import type { Press } from "./util";
import { isRtl, message, num, renderFace, renderIcon, renderStatus } from "./util";
import "./library";

/**
 * Organizasyon şeması: dallar açılır, boş kadro ve ekip sayısı görünür.
 *
 * @namespace kor.ui
 */
export default class OrgChart extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $OrgChartSettings);
	constructor(id?: string, settings?: $OrgChartSettings);
	constructor(id?: string, settings?: $OrgChartSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "people",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Seçili kişi */
			selectedKey: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Başta açık düzey */
			expandedLevels: { type: "int", defaultValue: 2 }
		},
		aggregations: {
			/** Düz liste; şema `managerKey` ile kurulur */
			people: { type: "kor.ui.OrgPerson", multiple: true, singularName: "person" }
		},
		events: {
			/** Kişiye basıldı */
			press: { parameters: { key: { type: "string" } } }
		}
	};
	private state = new Map<string, boolean>();

	private kids(): Map<string, OrgPerson[]> {
		const keys = new Set(this.getPeople().map((p) => p.getKey()));
		const out = new Map<string, OrgPerson[]>();
		this.getPeople().forEach((p) => {
			// Yöneticisi listede olmayan köktür
			const up = keys.has(p.getManagerKey()) && p.getManagerKey() !== p.getKey() ? p.getManagerKey() : "";
			out.set(up, [...(out.get(up) ?? []), p]);
		});
		return out;
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const fold = target.closest<HTMLElement>("[data-fold]");
		const card = target.closest<HTMLElement>("[data-p]");
		if (fold) {
			this.state.set(fold.dataset.fold as string, fold.getAttribute("aria-expanded") !== "true");
			this.invalidate();
		} else if (card) {
			const key = this.getPeople()[Number(card.dataset.p)].getKey();
			this.setSelectedKey(key);
			this.firePress({ key });
		}
	}
	onkeydown(event: KeyboardEvent): void {
		const card = (event.target as HTMLElement).closest<HTMLElement>("[data-p]");
		if (!card) return;
		const li = card.closest("li") as HTMLElement;
		const side = isRtl() ? -1 : 1;
		const near = (step: number) => (step > 0 ? li.nextElementSibling : li.previousElementSibling);
		const to = ({ ArrowRight: () => near(side), ArrowLeft: () => near(-side), ArrowDown: () => li.querySelector(":scope > ul > li"), ArrowUp: () => li.parentElement?.closest("li") } as Record<string, () => Element | null | undefined>)[event.key]?.();
		if (!to) return;
		event.preventDefault();
		to.querySelector<HTMLElement>("[data-p]")?.focus();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: OrgChart) {
			const kids = c.kids();
			const people = c.getPeople();
			const seen = new Set<string>();
			const size = (key: string, path: string[] = []): number => (kids.get(key) ?? []).reduce((sum, p) => sum + (path.includes(p.getKey()) ? 0 : (p.getVacant() ? 0 : 1) + size(p.getKey(), [...path, p.getKey()])), 0);
			const draw = (list: OrgPerson[], level: number) => {
				rm.openStart("ul").openEnd();
				list.forEach((p) => {
					// Döngülü veri sonsuz çizilmesin
					if (seen.has(p.getId())) return;
					seen.add(p.getId());
					const under = kids.get(p.getKey()) ?? [];
					const open = c.state.get(p.getKey()) ?? level < c.getExpandedLevels();
					const on = !!c.getSelectedKey() && p.getKey() === c.getSelectedKey();
					rm.openStart("li", p).openEnd();
					rm.openStart("div").class("korOrgCell").openEnd();
					rm.openStart("button", `${p.getId()}-b`).attr("type", "button").class("korOrgCard").attr("data-p", people.indexOf(p)).attr("aria-pressed", String(on));
					if (p.getVacant()) rm.class("korOrgVacant");
					rm.openEnd();
					if (p.getVacant()) {
						rm.openStart("span").class("korFace").attr("aria-hidden", "true").openEnd();
						renderIcon(rm, "plus");
						rm.close("span");
					} else renderFace(rm, p.getName());
					rm.openStart("span").class("korOrgText").openEnd().openStart("b").openEnd().text(p.getVacant() ? message("VACANT") : p.getName()).close("b").openStart("span").openEnd().text(p.getRole()).close("span").close("span");
					if (p.getState()) renderStatus(rm, p.getStatusText(), p.getState());
					rm.close("button");
					if (under.length) {
						rm.openStart("button", `${p.getId()}-f`).attr("type", "button").class("korOrgFold").class("korNum").attr("data-fold", p.getKey()).attr("aria-expanded", String(open)).attr("aria-label", `${message(open ? "COLLAPSE" : "EXPAND")}: ${p.getName() || p.getRole()}, ${size(p.getKey(), [p.getKey()])}`).openEnd().text(num(size(p.getKey(), [p.getKey()])));
						renderIcon(rm, open ? "minus" : "plus");
						rm.close("button");
					}
					rm.close("div");
					if (under.length && open) draw(under, level + 1);
					rm.close("li");
				});
				rm.close("ul");
			};
			rm.openStart("section", c).class("korOrg").attr("aria-label", c.getLabel() || message("ORG_CHART")).openEnd();
			const roots = kids.get("") ?? [];
			if (roots.length) draw(roots, 1);
			else rm.openStart("div").class("korMenuNone").openEnd().text(message("NO_DATA")).close("div");
			rm.close("section");
		}
	};
}
