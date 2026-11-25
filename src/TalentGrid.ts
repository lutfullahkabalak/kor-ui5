import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { isRtl, message, num, renderFace } from "./util";
import "./library";

/**
 * Yetenek matrisi (9 kutu): performans ve potansiyele göre kişiler.
 *
 * @namespace kor.ui
 */
export default class TalentGrid extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $TalentGridSettings);
	constructor(id?: string, settings?: $TalentGridSettings);
	constructor(id?: string, settings?: $TalentGridSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "people",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" },
			/** Yatay eksen; boşsa performans */
			xLabel: { type: "string", defaultValue: "" },
			/** Dikey eksen; boşsa potansiyel */
			yLabel: { type: "string", defaultValue: "" },
			/** Dokuz kutunun adı; sol üstten satır satır */
			titles: { type: "string[]", defaultValue: [] }
		},
		aggregations: {
			/** Kişiler */
			people: { type: "kor.ui.TalentPerson", multiple: true, singularName: "person" }
		},
		events: {
			/** Kişiye basıldı */
			press: { parameters: { key: { type: "string" } } },
			/** Ctrl ve ok tuşuyla taşındı */
			move: { parameters: { key: { type: "string" }, performance: { type: "int" }, potential: { type: "int" } } }
		}
	};
	private moved = "";

	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i !== undefined) this.firePress({ key: this.getPeople()[Number(i)].getKey() });
	}
	onkeydown(event: KeyboardEvent): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		const side = isRtl() ? -1 : 1;
		const step = { ArrowRight: [side, 0], ArrowLeft: [-side, 0], ArrowUp: [0, 1], ArrowDown: [0, -1] }[event.key];
		if (i === undefined || !step || !(event.ctrlKey || event.metaKey)) return;
		event.preventDefault();
		const person = this.getPeople()[Number(i)];
		const clamp = (n: number) => Math.max(1, Math.min(3, n));
		const performance = clamp(person.getPerformance() + step[0]);
		const potential = clamp(person.getPotential() + step[1]);
		if (performance === person.getPerformance() && potential === person.getPotential()) return;
		person.setPerformance(performance);
		person.setPotential(potential);
		this.moved = person.getId();
		this.fireMove({ key: person.getKey(), performance, potential });
	}
	onAfterRendering(): void {
		if (this.moved) document.getElementById(this.moved)?.focus();
		this.moved = "";
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: TalentGrid) {
			const people = c.getPeople();
			const titles = c.getTitles();
			const names = message("TALENT_BOXES").split("~");
			rm.openStart("section", c).class("korTalent").attr("aria-label", c.getLabel() || message("TALENT")).openEnd();
			rm.openStart("span").class("korTalentY").attr("aria-hidden", "true").openEnd().text(c.getYLabel() || message("POTENTIAL")).close("span");
			rm.openStart("div").class("korTalentGrid").openEnd();
			for (let y = 3; y >= 1; y--) for (let x = 1; x <= 3; x++) {
				const n = (3 - y) * 3 + x - 1;
				const list = people.filter((p) => Math.max(1, Math.min(3, p.getPerformance())) === x && Math.max(1, Math.min(3, p.getPotential())) === y);
				rm.openStart("div").class("korTalentBox").attr("role", "group").style("--kor-part", `${(x + y - 2) * 4 + 2}%`).attr("aria-label", `${titles[n] || names[n]}, ${c.getXLabel() || message("PERFORMANCE")} ${x}, ${c.getYLabel() || message("POTENTIAL")} ${y}`).openEnd();
				rm.openStart("header").openEnd().openStart("span").openEnd().text(titles[n] || names[n]).close("span").openStart("b").class("korNum").openEnd().text(num(list.length)).close("b").close("header");
				rm.openStart("div").openEnd();
				list.forEach((p) => {
					rm.openStart("button", p).attr("type", "button").attr("data-i", people.indexOf(p)).attr("title", p.getRole()).attr("aria-keyshortcuts", "Control+ArrowUp Control+ArrowDown Control+ArrowLeft Control+ArrowRight").openEnd();
					renderFace(rm, p.getName());
					rm.openStart("span").openEnd().text(p.getName()).close("span").close("button");
				});
				rm.close("div").close("div");
			}
			rm.close("div");
			rm.openStart("span").class("korTalentX").attr("aria-hidden", "true").openEnd().text(c.getXLabel() || message("PERFORMANCE")).close("span").close("section");
		}
	};
}
