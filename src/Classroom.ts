import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { isRtl, message, num, renderFace, renderIcon } from "./util";
import "./library";

/**
 * Sınıf oturma planı ve yoklama: öğrenciye bastıkça geldi, geç, gelmedi.
 *
 * @namespace kor.ui
 */
export default class Classroom extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ClassroomSettings);
	constructor(id?: string, settings?: $ClassroomSettings);
	constructor(id?: string, settings?: $ClassroomSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "students",
		properties: {
			/** Sınıf */
			title: { type: "string", defaultValue: "" },
			/** Yan yana sıra */
			columns: { type: "int", defaultValue: 6 },
			/** Tahta yazısı */
			board: { type: "string", defaultValue: "" },
			/** Yalnız gösterim */
			readOnly: { type: "boolean", defaultValue: false }
		},
		aggregations: {
			/** Öğrenciler, önden arkaya */
			students: { type: "kor.ui.Student", multiple: true, singularName: "student" }
		},
		events: {
			/** Yoklama değişti */
			change: { parameters: { key: { type: "string" }, state: { type: "string" } } }
		}
	};
	private at = 0;

	onclick(event: Press): void {
		const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
		if (i === undefined || this.getReadOnly()) return;
		this.at = Number(i);
		const student = this.getStudents()[this.at];
		const order = ["present", "late", "absent"];
		const state = order[(order.indexOf(student.getState()) + 1) % 3];
		student.setState(state);
		this.fireChange({ key: student.getKey(), state });
	}
	onkeydown(event: KeyboardEvent): void {
		const button = (event.target as HTMLElement).closest<HTMLElement>("[data-i]");
		const side = isRtl() ? -1 : 1;
		const step = { ArrowRight: side, ArrowLeft: -side, ArrowDown: this.getColumns(), ArrowUp: -this.getColumns() }[event.key];
		if (!button || !step) return;
		event.preventDefault();
		const buttons = [...(this.getDomRef() as HTMLElement).querySelectorAll<HTMLElement>("[data-i]")];
		const to = buttons[Number(button.dataset.i) + step];
		if (!to) return;
		this.at = Number(to.dataset.i);
		buttons.forEach((el) => (el.tabIndex = el === to ? 0 : -1));
		to.focus();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Classroom) {
			const students = c.getStudents();
			const count = (state: string) => students.filter((s) => s.getState() === state).length;
			const still = c.getReadOnly();
			rm.openStart("section", c).class("korClass").attr("aria-label", c.getTitle() || message("CLASSROOM")).style("--kor-cols", String(Math.max(1, c.getColumns()))).openEnd();
			rm.openStart("header").openEnd().openStart("h3").openEnd().text(c.getTitle()).close("h3");
			rm.openStart("span").class("korNum").attr("role", "status").openEnd();
			([["present", "PRESENT", "success"], ["late", "LATE_IN", "wait"], ["absent", "ABSENT", "danger"]] as const).forEach(([state, name, key]) => rm.openStart("span").class(`korState-${key}`).openEnd().openStart("i").openEnd().close("i").text(`${message(name)} ${num(count(state))}`).close("span"));
			rm.close("span").close("header");
			rm.openStart("div").class("korClassBoard").openEnd().text(c.getBoard()).close("div");
			rm.openStart("ul").openEnd();
			students.forEach((student, i) => {
				const state = student.getState();
				const key = { present: "success", late: "wait", absent: "danger" }[state] ?? "none";
				const text = message(state === "present" ? "PRESENT" : state === "late" ? "LATE_IN" : state === "absent" ? "ABSENT" : "NOT_TAKEN");
				rm.openStart("li", student).class(`korState-${key}`).openEnd();
				const tag = still ? "div" : "button";
				rm.openStart(tag, `${student.getId()}-b`).class("korSeat").class(`korSeat-${key}`);
				if (!still) rm.attr("type", "button").attr("data-i", i).attr("tabindex", i === Math.min(c.at, students.length - 1) ? "0" : "-1").attr("aria-label", `${student.getName()}, ${text}`);
				rm.openEnd();
				renderFace(rm, student.getName());
				rm.openStart("span").class("korSeatName").openEnd().text(student.getName()).close("span");
				rm.openStart("span").class("korSeatState").openEnd();
				renderIcon(rm, { success: "check", wait: "clock", danger: "x", none: "circle-dashed" }[key] as string);
				rm.text(text).close("span").close(tag).close("li");
			});
			rm.close("ul").close("section");
		}
	};
}
