import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, num, pct, renderIcon, renderStatus } from "./util";
import "./library";

/**
 * Rampa panosu: yanaşan araçlar, doluluk ve bekleyen sıra. Sıradaki aracı, sonra boş rampayı seçerek yanaştırılır.
 *
 * @namespace kor.ui
 */
export default class DockBoard extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DockBoardSettings);
	constructor(id?: string, settings?: $DockBoardSettings);
	constructor(id?: string, settings?: $DockBoardSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "docks",
		properties: {
			/** Başlık */
			title: { type: "string", defaultValue: "" },
			/** Sırada seçili araç */
			selectedTruck: { type: "string", defaultValue: "", bindable: "bindable" }
		},
		aggregations: {
			/** Rampalar */
			docks: { type: "kor.ui.Dock", multiple: true, singularName: "dock" },
			/** Bekleyen araçlar */
			queue: { type: "kor.ui.DockTruck", multiple: true, singularName: "truck" }
		},
		events: {
			/** Rampaya basıldı */
			dockPress: { parameters: { key: { type: "string" } } },
			/** Araç rampaya verildi; veriyi uygulama günceller */
			assign: { parameters: { truck: { type: "string" }, dock: { type: "string" } } }
		}
	};
	onclick(event: Press): void {
		const target = (event.target as HTMLElement).closest<HTMLElement>("[data-truck], [data-dock]");
		if (!target) return;
		if (target.dataset.truck !== undefined) {
			const key = this.getQueue()[Number(target.dataset.truck)].getKey();
			this.setSelectedTruck(key === this.getSelectedTruck() ? "" : key);
			return;
		}
		const dock = this.getDocks()[Number(target.dataset.dock)];
		const truck = this.getQueue().find((item) => item.getKey() === this.getSelectedTruck());
		if (truck && this.free(dock)) {
			this.setSelectedTruck("");
			this.fireAssign({ truck: truck.getKey(), dock: dock.getKey() });
		} else this.fireDockPress({ key: dock.getKey() });
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.key === "Escape" && this.getSelectedTruck()) {
			event.stopPropagation();
			this.setSelectedTruck("");
		}
	}
	private free(dock: { getPlate(): string; getState(): string }): boolean {
		return !dock.getPlate() && dock.getState() !== "closed";
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: DockBoard) {
			const docks = c.getDocks();
			const queue = c.getQueue();
			const free = docks.filter((dock) => c.free(dock)).length;
			const picked = queue.some((item) => item.getKey() === c.getSelectedTruck() && item.getKey());
			rm.openStart("section", c).class("korDocks").attr("aria-label", c.getTitle() || message("DOCKS"));
			if (picked) rm.class("korDocksPick");
			rm.openEnd();
			rm.openStart("header").openEnd().openStart("h3").openEnd().text(c.getTitle() || message("DOCKS")).close("h3");
			rm.openStart("span").class("korNum").attr("role", "status").openEnd().text(picked ? message("PICK_DOCK", [queue.find((item) => item.getKey() === c.getSelectedTruck())!.getPlate()]) : message("DOCKS_FREE", [num(free), num(docks.length)])).close("span").close("header");
			rm.openStart("ul").class("korDockRow").openEnd();
			docks.forEach((dock, i) => {
				const state = dock.getState();
				const isFree = c.free(dock);
				const closed = state === "closed";
				const key = closed ? "none" : isFree ? "success" : { waiting: "wait", problem: "danger" }[state] ?? "info";
				const text = dock.getStatusText() || message(closed ? "DOCK_CLOSED" : isFree ? "DOCK_FREE" : state === "waiting" ? "DOCK_WAITING" : state === "problem" ? "DOCK_PROBLEM" : state === "unloading" ? "DOCK_UNLOADING" : "DOCK_LOADING");
				rm.openStart("li", dock).class(`korState-${key}`).openEnd();
				rm.openStart("button", `${dock.getId()}-b`).attr("type", "button").class("korDock").attr("data-dock", i);
				if (isFree) rm.class("korDockFree");
				if (closed) rm.class("korDockClosed");
				if (picked && !isFree) rm.attr("disabled", "disabled");
				rm.openEnd();
				rm.openStart("span").class("korDockHead").openEnd();
				rm.openStart("b").class("korNum").openEnd().text(dock.getName()).close("b");
				renderStatus(rm, text, key);
				rm.close("span");
				rm.openStart("span").class("korDockBay").attr("aria-hidden", "true").openEnd();
				if (closed) renderIcon(rm, "ban");
				else if (!isFree) {
					// Üstten görünen kasa: dolduran/boşaltan ilerleme
					rm.openStart("span").class("korDockTrailer").class(state === "unloading" ? "korDockOut" : "korDockIn").style("--kor-part", String(Math.max(0, Math.min(100, dock.getProgress())) / 100)).openEnd().openStart("i").openEnd().close("i").close("span").openStart("span").class("korDockCab").openEnd().close("span");
				} else renderIcon(rm, "arrow-down");
				rm.close("span");
				rm.openStart("span").class("korDockFoot").openEnd();
				if (dock.getPlate()) {
					rm.openStart("span").class("korPlate").openEnd().text(dock.getPlate()).close("span");
					if (state === "loading" || state === "unloading") rm.openStart("span").class("korNum").openEnd().text(pct(dock.getProgress())).close("span");
				}
				if (dock.getText()) rm.openStart("span").class("korDockText").openEnd().text(dock.getText()).close("span");
				rm.close("span").close("button").close("li");
			});
			rm.close("ul");
			rm.openStart("div").class("korDockQueue").openEnd();
			rm.openStart("h4").openEnd().text(message("QUEUE", [num(queue.length)])).close("h4");
			if (queue.length) rm.openStart("ul").openEnd();
			queue.forEach((truck, i) => {
				const on = truck.getKey() === c.getSelectedTruck() && !!truck.getKey();
				rm.openStart("li", truck).openEnd();
				rm.openStart("button", `${truck.getId()}-b`).attr("type", "button").class("korDockTruck").attr("data-truck", i).attr("aria-pressed", String(on)).openEnd();
				renderIcon(rm, "truck");
				rm.openStart("span").class("korPlate").openEnd().text(truck.getPlate()).close("span");
				rm.openStart("span").class("korDockText").openEnd().text(truck.getText()).close("span");
				if (truck.getTime()) rm.openStart("span").class("korNum").openEnd().text(truck.getTime()).close("span");
				rm.close("button").close("li");
			});
			if (queue.length) rm.close("ul");
			else rm.openStart("p").openEnd().text(message("QUEUE_EMPTY")).close("p");
			rm.close("div").close("section");
		}
	};
}
