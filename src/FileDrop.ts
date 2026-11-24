import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type { Press } from "./util";
import { message, num, pct, renderIcon } from "./util";
import "./library";

/**
 * Dosya bırakma alanı ve listesi. Yüklemeyi uygulama yapar; durum `files` öğelerinden okunur.
 *
 * @namespace kor.ui
 */
export default class FileDrop extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FileDropSettings);
	constructor(id?: string, settings?: $FileDropSettings);
	constructor(id?: string, settings?: $FileDropSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "files",
		properties: {
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Açıklama */
			help: { type: "string", defaultValue: "" },
			/** Kabul edilen türler: ".pdf,image/*" */
			accept: { type: "string", defaultValue: "" },
			/** En büyük boyut, MB; 0 sınırsız */
			maxSize: { type: "float", defaultValue: 0 },
			/** Birden çok dosya */
			multiple: { type: "boolean", defaultValue: true },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		aggregations: {
			/** Dosyalar */
			files: { type: "kor.ui.FileItem", multiple: true, singularName: "file" }
		},
		events: {
			/** Uygun dosyalar seçildi (File dizisi) */
			add: { parameters: { files: { type: "object" } } },
			/** Dosya kaldırılmak istendi */
			remove: { parameters: { item: { type: "kor.ui.FileItem" } } },
			/** Hatalı yükleme yeniden denenmek istendi */
			retry: { parameters: { item: { type: "kor.ui.FileItem" } } }
		}
	};
	private refused = "";
	private depth = 0;

	init(): void {
		const raw = (event: unknown) => (event as { originalEvent: DragEvent }).originalEvent;
		const over = (on: boolean) => this.getDomRef()?.classList.toggle("korDropOver", on);
		this.attachBrowserEvent("dragenter", (e: unknown) => {
			raw(e).preventDefault();
			this.depth++;
			if (this.getEnabled()) over(true);
		});
		this.attachBrowserEvent("dragleave", () => {
			if (--this.depth <= 0) over(false);
		});
		this.attachBrowserEvent("dragover", (e: unknown) => raw(e).preventDefault());
		this.attachBrowserEvent("drop", (e: unknown) => {
			raw(e).preventDefault();
			this.depth = 0;
			over(false);
			this.take([...(raw(e).dataTransfer?.files ?? [])]);
		});
	}
	getFocusDomRef(): Element {
		return (this.getDomRef("pick") ?? this.getDomRef()) as Element;
	}
	private fits(file: File): boolean {
		const rules = this.getAccept().split(",").map((r) => r.trim().toLowerCase()).filter(Boolean);
		const name = file.name.toLowerCase();
		return !rules.length || rules.some((r) => (r.startsWith(".") ? name.endsWith(r) : r.endsWith("/*") ? file.type.startsWith(r.slice(0, -1)) : file.type === r));
	}
	private take(list: File[]): void {
		if (!this.getEnabled() || !list.length) return;
		const files = this.getMultiple() ? list : list.slice(0, 1);
		const max = this.getMaxSize() * 1048576;
		const wrong = files.filter((f) => !this.fits(f));
		const big = files.filter((f) => this.fits(f) && max > 0 && f.size > max);
		const good = files.filter((f) => !wrong.includes(f) && !big.includes(f));
		this.refused = [wrong.length ? message("FILE_TYPE", [wrong.map((f) => f.name).join(", ")]) : "", big.length ? message("FILE_SIZE", [big.map((f) => f.name).join(", "), num(this.getMaxSize())]) : ""].filter(Boolean).join(" ");
		this.invalidate();
		if (good.length) this.fireAdd({ files: good });
	}
	onclick(event: Press): void {
		const target = event.target as HTMLElement;
		const at = (name: string) => target.closest<HTMLElement>(`[data-${name}]`)?.dataset[name];
		const remove = at("remove");
		const retry = at("retry");
		if (remove !== undefined) this.fireRemove({ item: this.getFiles()[Number(remove)] });
		else if (retry !== undefined) this.fireRetry({ item: this.getFiles()[Number(retry)] });
		else if (target.closest(".korDropZone") && this.getEnabled()) (this.getDomRef("in") as unknown as HTMLInputElement).click();
	}
	onchange(event: Press): void {
		const input = event.target as HTMLInputElement;
		const list = [...(input.files ?? [])];
		input.value = "";
		this.take(list);
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: FileDrop) {
			const id = c.getId();
			rm.openStart("div", c).class("korField").class("korDrop");
			if (c.refused) rm.class("korFieldError");
			rm.openEnd();
			if (c.getLabel()) rm.openStart("span").class("korLabel").openEnd().text(c.getLabel()).close("span");
			rm.openStart("button", `${id}-pick`).attr("type", "button").class("korDropZone").attr("aria-label", [c.getLabel(), message("FILE_PICK"), c.getHelp()].filter(Boolean).join(". "));
			if (!c.getEnabled()) rm.attr("disabled", "disabled");
			rm.openEnd();
			renderIcon(rm, "upload");
			rm.openStart("span").openEnd().openStart("b").openEnd().text(message("FILE_PICK")).close("b").text(` ${message("FILE_DROP")}`).close("span");
			if (c.getHelp()) rm.openStart("span").class("korNote").openEnd().text(c.getHelp()).close("span");
			rm.close("button");
			rm.voidStart("input", `${id}-in`).attr("type", "file").attr("tabindex", "-1").attr("aria-hidden", "true").class("korSr");
			if (c.getMultiple()) rm.attr("multiple", "multiple");
			if (c.getAccept()) rm.attr("accept", c.getAccept());
			rm.voidEnd();
			rm.openStart("div").class("korNote").attr("role", "alert").openEnd().text(c.refused).close("div");
			if (c.getFiles().length) {
				rm.openStart("ul").class("korFiles").openEnd();
				c.getFiles().forEach((file, i) => {
					const error = file.getError();
					const busy = !error && file.getProgress() < 100;
					rm.openStart("li", file).class("korFile");
					if (error) rm.class("korFileBad");
					rm.openEnd();
					rm.openStart("span").class("korFileMark").openEnd();
					renderIcon(rm, error ? "circle-alert" : busy ? "file-text" : "check");
					rm.close("span");
					rm.openStart("span").class("korFileBody").openEnd();
					rm.openStart("span").class("korEllipsis").openEnd().text(file.getName()).close("span");
					rm.openStart("span").class("korFileInfo").openEnd().text(error || `${num(file.getSize() / 1024)} KB${busy ? `, ${pct(file.getProgress())}` : ""}`).close("span");
					if (busy) rm.openStart("span").class("korMeter").attr("role", "progressbar").attr("aria-valuenow", Math.round(file.getProgress())).attr("aria-label", file.getName()).openEnd().openStart("i").style("width", `${file.getProgress()}%`).openEnd().close("i").close("span");
					rm.close("span");
					const button = (name: string, icon: string, label: string) => {
						rm.openStart("button").attr("type", "button").class("korCalOpen").attr(`data-${name}`, i).attr("aria-label", `${label}: ${file.getName()}`).openEnd();
						renderIcon(rm, icon);
						rm.close("button");
					};
					if (error) button("retry", "refresh-cw", message("RETRY"));
					button("remove", "x", message("REMOVE"));
					rm.close("li");
				});
				rm.close("ul");
			}
			rm.close("div");
		}
	};
}
