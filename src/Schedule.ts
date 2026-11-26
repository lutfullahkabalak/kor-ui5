import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type ScheduleTask from "./ScheduleTask";
import type { Press } from "./util";
import { dateText, dateValue, isRtl, message, renderIcon, stateIcons, stateKey, toDate } from "./util";
import "./library";

const DAY = 86400000;
const LANE_PAD = 8;
const ROW = 46;
/** Yaz saati geçişlerinden etkilenmeyen gün numarası */
const dayNo = (value: unknown): number => {
	const d = toDate(value) ?? new Date();
	return Math.round(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / DAY);
};
const fromNo = (no: number): Date => {
	const d = new Date(no * DAY);
	return new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
};

/**
 * Plan tahtası: işler sürüklenir, uzatılır, başka kaynağa taşınır; çakışma anında görünür.
 *
 * @namespace kor.ui
 */
export default class Schedule extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $ScheduleSettings);
	constructor(id?: string, settings?: $ScheduleSettings);
	constructor(id?: string, settings?: $ScheduleSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "tasks",
		properties: {
			/** İlk gün: Date veya yyyy-MM-dd */
			start: { type: "any" },
			/** Gün sayısı */
			days: { type: "int", defaultValue: 28 },
			/** Bugün; boşsa sistem tarihi */
			today: { type: "any" },
			/** Gün genişliği, piksel */
			dayWidth: { type: "int", defaultValue: 44 },
			/** Değiştirilebilir */
			editable: { type: "boolean", defaultValue: true },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Kaynaklar */
			lanes: { type: "kor.ui.ScheduleLane", multiple: true, singularName: "lane" },
			/** İşler */
			tasks: { type: "kor.ui.ScheduleTask", multiple: true, singularName: "task" }
		},
		events: {
			/** İş taşındı; task.start, end ve lane güncellenmiştir */
			taskChange: { parameters: { task: { type: "kor.ui.ScheduleTask" }, conflict: { type: "boolean" } } },
			/** İş açıldı */
			taskPress: { parameters: { task: { type: "kor.ui.ScheduleTask" } } },
			/** Kaynağın boş gününe basıldı (yeni rezervasyon, yeni iş); date yerel gün */
			slotPress: { parameters: { lane: { type: "string" }, date: { type: "object" } } }
		}
	};
	private justDragged = false;
	private focusId = "";

	init(): void {
		this.attachBrowserEvent("pointerdown", (raw: unknown) => this.drag((raw as { originalEvent: PointerEvent }).originalEvent));
	}
	private taskOf(target: EventTarget | null): ScheduleTask | undefined {
		const id = (target as HTMLElement).closest<HTMLElement>(".korTask")?.id;
		return this.getTasks().find((t) => t.getId() === id);
	}
	private drag(event: PointerEvent): void {
		const task = this.taskOf(event.target);
		if (!task || !this.getEditable() || event.button !== 0 || event.pointerType === "touch") return;
		const el = document.getElementById(task.getId()) as HTMLElement;
		const mode = (event.target as HTMLElement).closest<HTMLElement>("[data-edge]")?.dataset.edge ?? "move";
		const width = this.getDayWidth();
		const sign = isRtl() ? -1 : 1;
		const w0 = el.offsetWidth;
		let moved = false;
		let days = 0;
		let lane = task.getLane();
		event.preventDefault();
		el.focus({ preventScroll: true });
		const tip = document.createElement("div");
		tip.className = "korTaskTip";
		const move = (e: PointerEvent) => {
			const dx = (e.clientX - event.clientX) * sign;
			if (!moved && Math.hypot(dx, e.clientY - event.clientY) < 4) return;
			if (!moved) {
				moved = true;
				el.classList.add("korTaskDrag");
				el.appendChild(tip);
			}
			const length = dayNo(task.getEnd()) - dayNo(task.getStart());
			days = Math.round(dx / width);
			if (mode === "end") days = Math.max(-length, days);
			if (mode === "start") days = Math.min(length, days);
			if (mode === "move") {
				el.style.transform = `translate(${dx * sign}px, ${e.clientY - event.clientY}px)`;
				const under = [...(this.getDomRef()?.querySelectorAll<HTMLElement>(".korPlanLane") ?? [])].find((l) => {
					const r = l.getBoundingClientRect();
					return e.clientY >= r.top && e.clientY <= r.bottom;
				});
				lane = under?.dataset.lane ?? task.getLane();
				this.getDomRef()?.querySelectorAll(".korPlanLane").forEach((l) => l.classList.toggle("korLaneOver", l === under));
			} else if (mode === "end") el.style.width = `${w0 + days * width}px`;
			else {
				el.style.width = `${w0 - days * width}px`;
				el.style.transform = `translateX(${days * width * sign}px)`;
			}
			const s = dayNo(task.getStart()) + (mode !== "end" ? days : 0);
			const f = dayNo(task.getEnd()) + (mode !== "start" ? days : 0);
			tip.textContent = `${dateText(fromNo(s))} – ${dateText(fromNo(f))}`;
		};
		const done = (drop: boolean) => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("pointercancel", cancel);
			window.removeEventListener("keydown", key, true);
			tip.remove();
			el.classList.remove("korTaskDrag");
			this.getDomRef()?.querySelectorAll(".korLaneOver").forEach((l) => l.classList.remove("korLaneOver"));
			if (!moved) return;
			this.justDragged = true;
			window.setTimeout(() => (this.justDragged = false));
			el.style.transform = "";
			el.style.width = `${w0}px`;
			if (drop) this.change(task, mode !== "end" ? days : 0, mode !== "start" ? days : 0, lane);
		};
		const up = () => done(true);
		const cancel = () => done(false);
		const key = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				done(false);
			}
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", cancel);
		window.addEventListener("keydown", key, true);
	}
	private change(task: ScheduleTask, ds: number, de: number, lane: string): void {
		if (!ds && !de && lane === task.getLane()) return;
		const put = (no: number) => dateValue(fromNo(no), task.getStart(), task.getBinding("start")?.getModel());
		const s = dayNo(task.getStart()) + ds;
		const f = dayNo(task.getEnd()) + de;
		if (f < s) return;
		task.setStart(put(s));
		task.setEnd(put(f));
		task.setLane(lane);
		this.focusId = task.getId();
		this.invalidate();
		this.fireTaskChange({ task, conflict: this.conflicts().has(task.getId()) });
	}
	/** Aynı kaynakta üst üste binen işler */
	private conflicts(): Set<string> {
		const out = new Set<string>();
		const tasks = this.getTasks();
		tasks.forEach((a, i) => tasks.slice(i + 1).forEach((b) => {
			if (a.getLane() === b.getLane() && dayNo(a.getStart()) <= dayNo(b.getEnd()) && dayNo(b.getStart()) <= dayNo(a.getEnd())) {
				out.add(a.getId());
				out.add(b.getId());
			}
		}));
		return out;
	}
	onclick(event: Press): void {
		const task = this.taskOf(event.target);
		if (task) {
			if (!this.justDragged) this.fireTaskPress({ task });
			return;
		}
		const track = (event.target as HTMLElement).closest<HTMLElement>(".korPlanTrack");
		const lane = track?.closest<HTMLElement>("[data-lane]")?.dataset.lane;
		const x = (event.originalEvent as MouseEvent | undefined)?.clientX;
		if (!track || lane === undefined || x === undefined) return;
		const box = track.getBoundingClientRect();
		const at = Math.floor((isRtl() ? box.right - x : x - box.left) / this.getDayWidth());
		if (at >= 0 && at < this.getDays()) this.fireSlotPress({ lane, date: fromNo(dayNo(this.getStart()) + at) });
	}
	onkeydown(raw: KeyboardEvent): void {
		const event = (raw as unknown as { originalEvent?: KeyboardEvent }).originalEvent ?? raw;
		const task = this.taskOf(event.target);
		if (!task) return;
		if (event.key === "Enter") {
			event.preventDefault();
			this.fireTaskPress({ task });
			return;
		}
		if (!this.getEditable()) return;
		const side = { ArrowRight: 1, ArrowLeft: -1 }[event.key];
		const vert = { ArrowDown: 1, ArrowUp: -1 }[event.key];
		if (side) {
			event.preventDefault();
			const d = side * (isRtl() ? -1 : 1);
			this.change(task, event.shiftKey ? 0 : d, d, task.getLane());
		} else if (vert) {
			event.preventDefault();
			const keys = this.getLanes().map((l) => l.getKey());
			const to = keys[keys.indexOf(task.getLane()) + vert];
			if (to) this.change(task, 0, 0, to);
		}
	}
	onAfterRendering(): void {
		if (!this.focusId) return;
		document.getElementById(this.focusId)?.focus({ preventScroll: true });
		this.focusId = "";
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Schedule) {
			const first = dayNo(c.getStart());
			const today = dayNo(c.getToday());
			const width = c.getDayWidth();
			const days = Array.from({ length: c.getDays() }, (_, i) => fromNo(first + i));
			const conflicts = c.conflicts();
			rm.openStart("div", c).class("korPlan").attr("role", "group").attr("aria-label", c.getLabel()).openEnd();
			rm.openStart("div").class("korPlanCanvas").style("--kor-days", String(days.length)).style("--kor-day", `${width}px`).openEnd();
			rm.openStart("div").class("korPlanHead").openEnd();
			rm.openStart("div").class("korPlanCorner").openEnd().close("div");
			days.forEach((d, i) => {
				rm.openStart("div").class("korPlanDay");
				if (d.getDay() === 0 || d.getDay() === 6) rm.class("korPlanOff");
				if (first + i === today) rm.class("korPlanToday").attr("aria-current", "date");
				rm.openEnd();
				rm.openStart("span").openEnd().text(i === 0 || d.getDate() === 1 ? dateText(d, "MMM") : dateText(d, "EEEEE")).close("span");
				rm.openStart("b").openEnd().text(String(d.getDate())).close("b");
				rm.close("div");
			});
			rm.close("div");
			if (today >= first && today < first + days.length) rm.openStart("div").class("korPlanNow").attr("aria-hidden", "true").style("--kor-at", String(today - first + 0.5)).openEnd().close("div");
			c.getLanes().forEach((lane) => {
				const tasks = c.getTasks().filter((t) => t.getLane() === lane.getKey()).sort((a, b) => dayNo(a.getStart()) - dayNo(b.getStart()));
				// Üst üste binen işler ayrı satıra iner
				const ends: number[] = [];
				const rows = tasks.map((t) => {
					let r = ends.findIndex((end) => end < dayNo(t.getStart()));
					if (r < 0) r = ends.length;
					ends[r] = dayNo(t.getEnd());
					return r;
				});
				rm.openStart("div", lane).class("korPlanLane").attr("data-lane", lane.getKey()).style("height", `${Math.max(1, ends.length) * ROW + LANE_PAD * 2}px`).openEnd();
				rm.openStart("div").class("korPlanName").openEnd();
				rm.openStart("b").openEnd().text(lane.getTitle()).close("b");
				rm.openStart("span").openEnd().text(lane.getText()).close("span");
				if (lane.getCapacity() >= 0) {
					rm.openStart("span").class("korMeter");
					if (lane.getCapacity() > 100) rm.class("korMeterOver");
					rm.openEnd().openStart("i").style("width", `${Math.min(100, lane.getCapacity())}%`).openEnd().close("i").close("span");
				}
				rm.close("div");
				rm.openStart("div").class("korPlanTrack").openEnd();
				tasks.forEach((t, i) => {
					const s = dayNo(t.getStart()) - first;
					const len = dayNo(t.getEnd()) - dayNo(t.getStart()) + 1;
					if (s + len <= 0 || s >= days.length) return;
					const key = stateKey(t.getState());
					const clash = conflicts.has(t.getId());
					rm.openStart("div", t).class("korTask").class(`korState-${key}`).attr("tabindex", "0").attr("role", "button").attr("aria-label", `${t.getTitle()}, ${lane.getTitle()}, ${dateText(t.getStart())} – ${dateText(t.getEnd())}, ${message(`STATE_${key.toUpperCase()}`)}${clash ? `, ${message("CONFLICT")}` : ""}`);
					if (clash) rm.class("korTaskClash");
					rm.style("inset-inline-start", `${s * width + 2}px`).style("width", `${len * width - 4}px`).style("top", `${LANE_PAD + rows[i] * ROW + 2}px`).openEnd();
					rm.openStart("span").class("korTaskFill").style("width", `${t.getProgress()}%`).openEnd().close("span");
					renderIcon(rm, clash ? "triangle-alert" : stateIcons[key]);
					rm.openStart("span").class("korTaskText").openEnd().openStart("b").openEnd().text(t.getTitle()).close("b");
					rm.openStart("span").openEnd().text(t.getText()).close("span").close("span");
					if (c.getEditable()) (["start", "end"] as const).forEach((edge) => rm.openStart("span").class("korTaskEdge").class(`korEdge-${edge}`).attr("data-edge", edge).openEnd().close("span"));
					rm.close("div");
				});
				rm.close("div").close("div");
			});
			rm.close("div").close("div");
		}
	};
}
