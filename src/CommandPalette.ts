import Element from "sap/ui/core/Element";
import type Command from "./Command";
import { esc, fold, iconHtml, message, nextZ, staticArea } from "./util";
import "./library";

/**
 * Komut paleti. Görünümün `dependents` bölümüne konur; ⌘K / Ctrl+K ile açılır.
 *
 * @namespace kor.ui
 */
export default class CommandPalette extends Element {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $CommandPaletteSettings);
	constructor(id?: string, settings?: $CommandPaletteSettings);
	constructor(id?: string, settings?: $CommandPaletteSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "commands",
		properties: {
			/** ⌘K / Ctrl+K dinlensin */
			hotkey: { type: "boolean", defaultValue: true },
			/** Yer tutucu */
			placeholder: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Komutlar */
			commands: { type: "kor.ui.Command", multiple: true, singularName: "command" }
		},
		events: {
			/** Komut seçildi */
			run: { parameters: { key: { type: "string" } } }
		}
	};
	private layer?: HTMLElement;
	private hits: Command[] = [];
	private active = 0;
	private back?: HTMLElement;
	// Sınıf alanları init()'ten sonra atanır; bu yüzden dinleyici olarak nesnenin kendisi verilir
	handleEvent(event: KeyboardEvent): void {
		if (this.getHotkey() && event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey) && !event.shiftKey && !event.altKey) {
			event.preventDefault();
			if (this.layer) this.close();
			else this.open();
		}
	}
	init(): void {
		document.addEventListener("keydown", this);
	}
	exit(): void {
		document.removeEventListener("keydown", this);
		this.close();
	}
	/** Paletin açık olup olmadığını döndürür. */
	isOpen(): boolean {
		return !!this.layer;
	}
	/** Paleti açar ve odağı arama alanına taşır. */
	open(): void {
		if (this.layer) return;
		this.back = document.activeElement as HTMLElement;
		const layer = (this.layer = document.createElement("div"));
		layer.className = "korPalette";
		layer.style.zIndex = String(nextZ());
		layer.innerHTML = `<div class="korPaletteBox" role="dialog" aria-modal="true" aria-label="${esc(message("SEARCH_COMMANDS"))}"><div class="korPaletteHead">${iconHtml("search")}<input class="korPaletteInput" role="combobox" aria-expanded="true" aria-controls="${this.getId()}-list" autocomplete="off" spellcheck="false" placeholder="${esc(this.getPlaceholder() || message("SEARCH_COMMANDS"))}"><kbd class="korKbd">esc</kbd></div><div class="korPaletteList" role="listbox" id="${this.getId()}-list"></div></div>`;
		staticArea().appendChild(layer);
		const input = layer.querySelector("input") as HTMLInputElement;
		input.addEventListener("input", () => this.paint(input.value));
		layer.addEventListener("keydown", (event) => {
			const step = { ArrowDown: 1, ArrowUp: -1 }[event.key];
			if (step && this.hits.length) {
				event.preventDefault();
				this.active = (this.active + step + this.hits.length) % this.hits.length;
				this.mark();
			} else if (event.key === "Enter") {
				event.preventDefault();
				this.run(this.hits[this.active]);
			} else if (event.key === "Escape") {
				event.preventDefault();
				this.close();
			} else if (event.key === "Tab") event.preventDefault();
			event.stopPropagation();
			if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
				event.preventDefault();
				this.close();
			}
		});
		layer.addEventListener("pointerdown", (event) => {
			if (event.target === layer) this.close();
		});
		layer.addEventListener("click", (event) => {
			const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
			if (i !== undefined) this.run(this.hits[Number(i)]);
		});
		layer.addEventListener("pointermove", (event) => {
			const i = (event.target as HTMLElement).closest<HTMLElement>("[data-i]")?.dataset.i;
			if (i !== undefined && Number(i) !== this.active) {
				this.active = Number(i);
				this.mark();
			}
		});
		this.paint("");
		input.focus();
	}
	/** Paleti kapatır. */
	close(): void {
		if (!this.layer) return;
		this.layer.remove();
		this.layer = undefined;
		if (this.back?.isConnected) this.back.focus({ preventScroll: true });
	}
	private run(command?: Command): void {
		if (!command) return;
		this.close();
		command.firePress();
		this.fireRun({ key: command.getKey() });
	}
	/** Sırayla geçen harflerin puanı; -1 eşleşmedi */
	private score(text: string, query: string): number {
		const hay = fold(text);
		const at = hay.indexOf(query);
		if (at >= 0) return 1000 - at;
		let from = 0;
		let gap = 0;
		for (const c of query) {
			const i = hay.indexOf(c, from);
			if (i < 0) return -1;
			gap += i - from;
			from = i + 1;
		}
		return gap > query.length * 3 ? -1 : 500 - gap;
	}
	private paint(query: string): void {
		const q = fold(query.trim());
		const scored = this.getCommands()
			.map((command) => ({ command, score: q ? Math.max(this.score(command.getText(), q), this.score(`${command.getHint()} ${command.getKeywords()}`, q) - 200) : 0 }))
			.filter((hit) => hit.score >= 0);
		if (q) scored.sort((a, b) => b.score - a.score);
		this.hits = scored.map((hit) => hit.command);
		this.active = 0;
		let group = "";
		const list = this.layer!.querySelector(".korPaletteList") as HTMLElement;
		list.innerHTML =
			this.hits
				.map((command, i) => {
					const head = !q && command.getGroup() !== group ? `<div class="korPaletteGroup">${esc((group = command.getGroup()))}</div>` : "";
					return `${head}<div role="option" id="${this.getId()}-c${i}" data-i="${i}" class="korPaletteItem">${iconHtml(command.getIcon())}<span class="korPaletteText">${esc(command.getText())}</span><span class="korPaletteHint">${esc(command.getHint())}</span>${iconHtml("corner-down-left", "korPaletteGo")}</div>`;
				})
				.join("") || `<div class="korMenuNone">${esc(message("NO_RESULT"))}</div>`;
		this.mark();
	}
	private mark(): void {
		const list = this.layer!.querySelector(".korPaletteList") as HTMLElement;
		list.querySelectorAll<HTMLElement>("[data-i]").forEach((el, i) => {
			el.classList.toggle("korPaletteOn", i === this.active);
			el.setAttribute("aria-selected", String(i === this.active));
			if (i === this.active) el.scrollIntoView({ block: "nearest" });
		});
		this.layer!.querySelector("input")?.setAttribute("aria-activedescendant", this.hits.length ? `${this.getId()}-c${this.active}` : "");
	}
}
