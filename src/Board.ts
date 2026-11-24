import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type BoardCard from "./BoardCard";
import type { Press } from "./util";
import { initials, isRtl, message, reducedMotion, renderIcon, stateIcons, stateKey, tone } from "./util";
import Toast from "./Toast";
import "./library";

/**
 * İş panosu: kartlar sürüklenir veya Ctrl + ok ile taşınır. Sütun sınırı aşılınca uyarır.
 *
 * @namespace kor.ui
 */
export default class Board extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $BoardSettings);
	constructor(id?: string, settings?: $BoardSettings);
	constructor(id?: string, settings?: $BoardSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "cards",
		properties: {
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Sütunlar */
			columns: { type: "kor.ui.BoardColumn", multiple: true, singularName: "column" },
			/** Kartlar */
			cards: { type: "kor.ui.BoardCard", multiple: true, singularName: "card" }
		},
		events: {
			/** Kart taşındı; card.column güncellenmiştir */
			cardMove: { parameters: { card: { type: "kor.ui.BoardCard" }, from: { type: "string" }, to: { type: "string" } } },
			/** Kart açıldı */
			cardPress: { parameters: { card: { type: "kor.ui.BoardCard" } } }
		}
	};
	private rects = new Map<string, DOMRect>();
	private justDragged = false;

	init(): void {
		this.attachBrowserEvent("pointerdown", (raw: unknown) => this.drag((raw as { originalEvent: PointerEvent }).originalEvent));
	}
	private cardOf(target: EventTarget | null): BoardCard | undefined {
		const id = (target as HTMLElement).closest<HTMLElement>(".korCard")?.id;
		return this.getCards().find((card) => card.getId() === id);
	}
	private drag(event: PointerEvent): void {
		const card = this.cardOf(event.target);
		if (!card || event.button !== 0 || event.pointerType === "touch") return;
		const source = document.getElementById(card.getId()) as HTMLElement;
		const rect = source.getBoundingClientRect();
		let ghost: HTMLElement | undefined;
		let over: HTMLElement | undefined;
		let lastX = event.clientX;
		let tilt = 0;
		const move = (e: PointerEvent) => {
			if (!ghost) {
				if (Math.hypot(e.clientX - event.clientX, e.clientY - event.clientY) < 5) return;
				ghost = source.cloneNode(true) as HTMLElement;
				ghost.removeAttribute("id");
				ghost.classList.add("korCardGhost");
				ghost.style.width = `${rect.width}px`;
				document.body.appendChild(ghost);
				source.classList.add("korCardFrom");
				document.body.classList.add("korDragging");
			}
			tilt = tilt * 0.8 + Math.max(-9, Math.min(9, (e.clientX - lastX) * 0.9)) * 0.2;
			lastX = e.clientX;
			ghost.style.transform = `translate(${rect.left + e.clientX - event.clientX}px, ${rect.top + e.clientY - event.clientY}px) rotate(${tilt}deg) scale(1.03)`;
			const next = (document.elementFromPoint(e.clientX, e.clientY) as HTMLElement | null)?.closest<HTMLElement>(`#${CSS.escape(this.getId())} .korLane`) ?? undefined;
			if (next !== over) {
				over?.classList.remove("korLaneOver");
				next?.classList.add("korLaneOver");
				over = next;
			}
		};
		const finish = (drop: boolean) => {
			window.removeEventListener("pointermove", move);
			window.removeEventListener("pointerup", up);
			window.removeEventListener("keydown", key, true);
			window.removeEventListener("pointercancel", cancel);
			over?.classList.remove("korLaneOver");
			source.classList.remove("korCardFrom");
			document.body.classList.remove("korDragging");
			if (!ghost) return;
			this.justDragged = true;
			window.setTimeout(() => (this.justDragged = false));
			const at = ghost.getBoundingClientRect();
			ghost.remove();
			if (drop && over?.dataset.column && over.dataset.column !== card.getColumn()) {
				this.remember();
				this.rects.set(card.getId(), at);
				this.moveTo(card, over.dataset.column);
			}
		};
		const up = () => finish(true);
		const cancel = () => finish(false);
		const key = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				e.stopPropagation();
				finish(false);
			}
		};
		window.addEventListener("pointermove", move);
		window.addEventListener("pointerup", up);
		window.addEventListener("pointercancel", cancel);
		window.addEventListener("keydown", key, true);
	}
	private remember(): void {
		this.rects.clear();
		this.getDomRef()?.querySelectorAll<HTMLElement>(".korCard").forEach((el) => this.rects.set(el.id, el.getBoundingClientRect()));
	}
	private moveTo(card: BoardCard, to: string): void {
		const from = card.getColumn();
		card.setColumn(to);
		this.invalidate();
		const column = this.getColumns().find((c) => c.getKey() === to);
		const count = this.getCards().filter((c) => c.getColumn() === to).length;
		if (column?.getLimit() && count > column.getLimit()) Toast.show(column.getTitle(), { text: message("WIP", [column.getLimit()]), state: "wait" });
		this.fireCardMove({ card, from, to });
	}
	onclick(event: Press): void {
		const card = this.cardOf(event.target);
		if (card && !this.justDragged) this.fireCardPress({ card });
	}
	onkeydown(event: KeyboardEvent): void {
		const card = this.cardOf(event.target);
		if (!card) return;
		if (event.key === "Enter" || event.key === " ") {
			event.preventDefault();
			this.fireCardPress({ card });
			return;
		}
		const step = ({ ArrowRight: 1, ArrowLeft: -1 }[event.key] ?? 0) * (isRtl() ? -1 : 1);
		if (step && (event.ctrlKey || event.metaKey)) {
			event.preventDefault();
			const keys = this.getColumns().map((c) => c.getKey());
			const to = keys[keys.indexOf(card.getColumn()) + step];
			if (!to) return;
			this.remember();
			this.moveTo(card, to);
			const live = this.getDomRef("live");
			if (live) live.textContent = message("MOVED", [card.getTitle(), this.getColumns().find((c) => c.getKey() === to)!.getTitle()]);
			window.setTimeout(() => document.getElementById(card.getId())?.focus());
		}
	}
	onAfterRendering(): void {
		if (reducedMotion()) return;
		this.getDomRef()?.querySelectorAll<HTMLElement>(".korCard").forEach((el) => {
			const from = this.rects.get(el.id);
			if (!from) return;
			const to = el.getBoundingClientRect();
			const dx = from.left - to.left;
			const dy = from.top - to.top;
			if (dx || dy) el.animate([{ transform: `translate(${dx}px, ${dy}px)` }, { transform: "none" }], { duration: 380, easing: "cubic-bezier(.2,.9,.25,1.08)" });
		});
		this.rects.clear();
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Board) {
			rm.openStart("div", c).class("korBoard").attr("role", "group").attr("aria-label", c.getLabel()).openEnd();
			rm.openStart("div", `${c.getId()}-live`).class("korSr").attr("aria-live", "polite").openEnd().close("div");
			rm.openStart("div", `${c.getId()}-hint`).class("korSr").openEnd().text(message("DROP_HINT")).close("div");
			c.getColumns().forEach((column) => {
				const cards = c.getCards().filter((card) => card.getColumn() === column.getKey());
				const limit = column.getLimit();
				rm.openStart("section", column).class("korLane").attr("data-column", column.getKey()).attr("aria-label", column.getTitle());
				if (limit && cards.length > limit) rm.class("korLaneFull");
				rm.openEnd();
				rm.openStart("header").class("korLaneHead").class(`korState-${stateKey(column.getState())}`).openEnd();
				rm.openStart("span").class("korStatusGlyph").openEnd();
				renderIcon(rm, stateIcons[stateKey(column.getState())]);
				rm.close("span");
				rm.openStart("h3").openEnd().text(column.getTitle()).close("h3");
				rm.openStart("span").class("korLaneCount").openEnd().text(limit ? `${cards.length} / ${limit}` : String(cards.length)).close("span");
				rm.close("header");
				rm.openStart("div").class("korLaneBody").openEnd();
				cards.forEach((card) => {
					rm.openStart("article", card).class("korCard").class(`korState-${stateKey(card.getState())}`).attr("tabindex", "0").attr("role", "button").attr("aria-describedby", `${c.getId()}-hint`).openEnd();
					if (card.getTag()) rm.openStart("div").class("korCardTag").openEnd().text(card.getTag()).close("div");
					rm.openStart("div").class("korCardTitle").openEnd().text(card.getTitle()).close("div");
					if (card.getText()) rm.openStart("div").class("korCardText").openEnd().text(card.getText()).close("div");
					rm.openStart("div").class("korCardFoot").openEnd();
					rm.openStart("span").class("korCardMeta").openEnd().text(card.getMeta()).close("span");
					if (card.getPerson()) rm.openStart("span").class("korFace").class(`korTone${tone(card.getPerson())}`).attr("title", card.getPerson()).openEnd().text(initials(card.getPerson())).close("span");
					rm.close("div").close("article");
				});
				rm.openStart("div").class("korLaneDrop").openEnd().close("div");
				rm.close("div").close("section");
			});
			rm.close("div");
		}
	};
}
