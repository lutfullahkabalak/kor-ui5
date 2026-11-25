import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, num, renderIcon } from "./util";
import "./library";

/**
 * İzin bakiyesi: kullanılan, planlanan, onay bekleyen ve kalan günler tek tek görünür.
 *
 * @namespace kor.ui
 */
export default class LeaveBalance extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $LeaveBalanceSettings);
	constructor(id?: string, settings?: $LeaveBalanceSettings);
	constructor(id?: string, settings?: $LeaveBalanceSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** İzin türü */
			title: { type: "string", defaultValue: "" },
			/** Simge */
			icon: { type: "string", defaultValue: "palmtree" },
			/** Toplam hak, gün */
			total: { type: "float", defaultValue: 0 },
			/** Kullanılan */
			used: { type: "float", defaultValue: 0 },
			/** Onaylı, ileride */
			planned: { type: "float", defaultValue: 0 },
			/** Onay bekleyen */
			pending: { type: "float", defaultValue: 0 },
			/** Son kullanım notu */
			expires: { type: "string", defaultValue: "" }
		},
		events: {
			/** Karta basıldı */
			press: {}
		}
	};
	onclick(event: Press): void {
		if ((event.target as HTMLElement).closest("[data-press]")) this.firePress();
	}
	/** Kalan gün; aşılırsa eksi. */
	getRemaining(): number {
		return this.getTotal() - this.getUsed() - this.getPlanned() - this.getPending();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: LeaveBalance) {
			const days = (value: number) => num(value, value % 1 ? 1 : 0);
			const left = c.getRemaining();
			const live = c.hasListeners("press");
			const parts = [["used", "USED", c.getUsed()], ["planned", "PLANNED", c.getPlanned()], ["pending", "PENDING", c.getPending()]] as [string, string, number][];
			rm.openStart("article", c).class("korTile").class("korLeave");
			if (live) rm.class("korTileLive");
			if (left < 0) rm.class("korLeaveOver");
			rm.openEnd();
			rm.openStart("header").class("korTileHead").openEnd().openStart("span").class("korTileIcon").openEnd();
			renderIcon(rm, c.getIcon());
			rm.close("span").openStart("div").class("korTileTitles").openEnd().openStart("h3").openEnd();
			if (live) rm.openStart("button", `${c.getId()}-b`).attr("type", "button").attr("data-press", "1").openEnd().text(c.getTitle()).close("button");
			else rm.text(c.getTitle());
			rm.close("h3");
			if (c.getExpires()) rm.openStart("p").openEnd().text(c.getExpires()).close("p");
			rm.close("div").openStart("span").class("korLeaveLeft").class("korNum").openEnd().openStart("b").openEnd().text(days(left)).close("b").openStart("span").openEnd().text(message(left < 0 ? "DAYS_OVER" : "DAYS_LEFT")).close("span").close("span").close("header");
			// Her gün bir kare; 60 günden uzun haklarda oranlı çubuk
			const squares = Math.ceil(Math.max(c.getTotal(), c.getTotal() - left));
			if (squares <= 60) {
				rm.openStart("div").class("korLeaveDays").attr("aria-hidden", "true").openEnd();
				for (let i = 0; i < squares; i++) {
					let sum = 0;
					// Karenin ortası hangi dilime düşüyorsa o renktir; yarım günler karışmasın
					const found = parts.find(([, , value]) => (sum += value) > i + 0.49);
					rm.openStart("i").class(`korLeave-${found ? found[0] : "left"}`);
					if (i >= c.getTotal()) rm.class("korLeaveExtra");
					rm.openEnd().close("i");
				}
				rm.close("div");
			} else {
				rm.openStart("div").class("korLeaveBar").attr("aria-hidden", "true").openEnd();
				parts.forEach(([key, , value]) => rm.openStart("i").class(`korLeave-${key}`).style("width", `${(value / squares) * 100}%`).openEnd().close("i"));
				rm.close("div");
			}
			rm.openStart("dl").class("korLeaveKey").openEnd();
			parts.forEach(([key, name, value]) => rm.openStart("div").openEnd().openStart("dt").openEnd().openStart("i").class(`korLeave-${key}`).attr("aria-hidden", "true").openEnd().close("i").text(message(name)).close("dt").openStart("dd").class("korNum").openEnd().text(days(value)).close("dd").close("div"));
			rm.openStart("div").openEnd().openStart("dt").openEnd().text(message("TOTAL")).close("dt").openStart("dd").class("korNum").openEnd().text(days(c.getTotal())).close("dd").close("div");
			rm.close("dl").close("article");
		}
	};
}
