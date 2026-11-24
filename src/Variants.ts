import Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import type RenderManager from "sap/ui/core/RenderManager";
import Confirm from "./Confirm";
import { Float, esc, iconHtml, message, renderIcon } from "./util";
import "./library";

export type Variant = { key: string; name: string; state: Record<string, unknown>; isDefault?: boolean; shared?: boolean; locked?: boolean };
type Target = Control & { getState(): unknown; setState(state: unknown): void; attachEvent(name: string, fn: () => void, listener: object): void; detachEvent(name: string, fn: () => void, listener: object): void };
const STANDARD = "standard";

/**
 * Görünüm kaydı (variant): bağlı tablo ve süzgecin durumunu adla saklar, geri yükler.
 * `storageKey` verilirse tarayıcıda tutar; sunucuda tutmak için `variants` bağlanır ve `change` dinlenir.
 *
 * @namespace kor.ui
 */
export default class Variants extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $VariantsSettings);
	constructor(id?: string, settings?: $VariantsSettings);
	constructor(id?: string, settings?: $VariantsSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Kayıtlı görünümler dizisi */
			variants: { type: "object", defaultValue: null, bindable: "bindable" },
			/** Seçili görünüm */
			selectedKey: { type: "string", defaultValue: "standard", bindable: "bindable" },
			/** Standart görünümün adı */
			standardText: { type: "string", defaultValue: "" },
			/** Tarayıcıda saklama adı; boşsa saklamaz */
			storageKey: { type: "string", defaultValue: "" },
			/** Herkesle paylaşma seçeneği */
			shareable: { type: "boolean", defaultValue: false },
			/** Başlık olarak büyük yazı */
			title: { type: "boolean", defaultValue: false }
		},
		associations: {
			/** Durumu saklanan kontroller (DataGrid, TreeGrid, FilterBar veya getState/setState sunan) */
			targets: { type: "sap.ui.core.Control", multiple: true, singularName: "target" }
		},
		events: {
			/** Liste değişti (kaydet, sil, ad, varsayılan) */
			change: { parameters: { variants: { type: "object" } } },
			/** Görünüm uygulandı */
			select: { parameters: { key: { type: "string" } } }
		}
	};
	private float?: Float;
	private standard?: Record<string, unknown>;
	private saved = "";
	private dirty = false;
	private busy = false;
	private mode: "list" | "save" | "manage" = "list";
	private wired: Target[] = [];

	private list(): Variant[] {
		return (this.getVariants() as Variant[] | null) ?? [];
	}
	private parts(): [string, Target][] {
		return (this.getTargets() as string[]).flatMap((id) => {
			const control = Core.byId(id) as Target | undefined;
			return control?.getState ? [[this.name(id), control] as [string, Target]] : [];
		});
	}
	/** Görünüm kimliği uygulamadan uygulamaya değişir; son parça sabittir */
	private name(id: string): string {
		return id.split("--").pop() as string;
	}
	private read(): Record<string, unknown> {
		return JSON.parse(JSON.stringify(Object.fromEntries(this.parts().map(([name, t]) => [name, t.getState()])))) as Record<string, unknown>;
	}
	private write(state: Record<string, unknown>): void {
		this.busy = true;
		this.parts().forEach(([name, t]) => t.setState((state[name] ?? this.standard?.[name] ?? {}) as never));
		this.busy = false;
		this.mark();
	}
	private mark(): void {
		this.saved = JSON.stringify(this.read());
		this.setDirty(false);
	}
	private setDirty(dirty: boolean): void {
		if (dirty === this.dirty) return;
		this.dirty = dirty;
		this.invalidate();
	}
	private onState(): void {
		if (!this.busy) this.setDirty(JSON.stringify(this.read()) !== this.saved);
	}
	onAfterRendering(): void {
		if (this.standard || !this.parts().length) return;
		this.standard = this.read();
		this.parts().forEach(([, t]) => {
			t.attachEvent("stateChange", this.onState, this);
			this.wired.push(t);
		});
		if (this.getStorageKey()) {
			try {
				const raw = localStorage.getItem(this.getStorageKey());
				if (raw) this.setVariants(JSON.parse(raw) as object);
			} catch {
				// Gizli pencere veya bozuk kayıt: standart görünümle sürer
			}
		}
		this.saved = JSON.stringify(this.standard);
		const first = this.list().find((v) => v.isDefault) ?? this.list().find((v) => v.key === this.getSelectedKey());
		if (first) this.apply(first.key);
	}
	/** Görünümü uygular */
	apply(key: string): void {
		const variant = this.list().find((v) => v.key === key);
		this.setSelectedKey(variant ? key : STANDARD);
		this.write(variant ? variant.state : (this.standard ?? {}));
		this.fireSelect({ key: this.getSelectedKey() });
	}
	private store(list: Variant[]): void {
		this.setVariants(list);
		if (this.getStorageKey()) {
			try {
				localStorage.setItem(this.getStorageKey(), JSON.stringify(list));
			} catch {
				// Saklanamazsa oturum boyunca geçerli kalır
			}
		}
		this.fireChange({ variants: list });
	}
	private current(): Variant | undefined {
		return this.list().find((v) => v.key === this.getSelectedKey());
	}
	/** Yeni görünüm olarak kaydeder */
	saveAs(name: string, options: { isDefault?: boolean; shared?: boolean } = {}): void {
		const key = `v${Date.now().toString(36)}${this.list().length}`;
		const others = this.list().map((v) => (options.isDefault ? { ...v, isDefault: false } : v));
		this.store([...others, { key, name: name.trim(), state: this.read(), ...options }]);
		this.setSelectedKey(key);
		this.mark();
		this.invalidate();
	}
	/** Seçili görünümün üstüne kaydeder */
	save(): void {
		const current = this.current();
		if (!current || current.locked) return;
		this.store(this.list().map((v) => (v === current ? { ...v, state: this.read() } : v)));
		this.mark();
	}

	/* Panel */
	onclick(): void {
		if (this.float) this.float.close();
		else this.openPanel();
	}
	onkeydown(event: KeyboardEvent): void {
		if (event.key === "ArrowDown" && !this.float) {
			event.preventDefault();
			this.openPanel();
		}
	}
	private openPanel(): void {
		const root = this.getDomRef() as HTMLElement;
		const panel = document.createElement("div");
		panel.className = "korMenu korVariants";
		panel.setAttribute("role", "dialog");
		panel.setAttribute("aria-label", message("VIEWS"));
		this.mode = "list";
		this.float = new Float(root, panel, () => {
			this.float = undefined;
			this.getDomRef()?.setAttribute("aria-expanded", "false");
		}, false);
		root.setAttribute("aria-expanded", "true");
		panel.addEventListener("click", (event) => void this.click(event.target as HTMLElement));
		panel.addEventListener("change", (event) => {
			const input = event.target as HTMLInputElement;
			const key = input.closest<HTMLElement>("[data-key]")?.dataset.key;
			if (input.matches("[data-rename]") && key && input.value.trim()) this.store(this.list().map((v) => (v.key === key ? { ...v, name: input.value.trim() } : v)));
			this.invalidate();
		});
		panel.addEventListener("keydown", (event) => {
			if (event.key === "Escape") {
				event.preventDefault();
				event.stopPropagation();
				this.float?.close();
				(this.getDomRef() as HTMLElement).focus();
			} else if (event.key === "Enter" && (event.target as HTMLElement).matches("[data-name]")) {
				event.preventDefault();
				this.saveNew();
			} else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
				const rows = [...panel.querySelectorAll<HTMLElement>("button.korMenuItem")];
				const at = rows.indexOf(document.activeElement as HTMLElement);
				if (at < 0) return;
				event.preventDefault();
				rows[(at + (event.key === "ArrowDown" ? 1 : -1) + rows.length) % rows.length].focus();
			}
		});
		this.paint();
	}
	private paint(): void {
		const panel = this.float!.element;
		const head = (text: string) => `<div class="korVariantHead"><button type="button" class="korCalOpen" data-go="list" aria-label="${esc(message("BACK"))}">${iconHtml("arrow-left")}</button><b>${esc(text)}</b></div>`;
		if (this.mode === "save") {
			panel.innerHTML = `${head(message("SAVE_AS"))}<div class="korVariantForm"><input class="korVariantName" data-name="1" maxlength="60" aria-label="${esc(message("VIEW_NAME"))}" placeholder="${esc(message("VIEW_NAME"))}">${["isDefault", ...(this.getShareable() ? ["shared"] : [])].map((k) => `<label class="korVariantCheck"><input type="checkbox" data-opt="${k}">${esc(message(k === "shared" ? "SHARE_ALL" : "MAKE_DEFAULT"))}</label>`).join("")}<button type="button" class="korBtn korBtn-primary korBtnWide" data-do="create">${esc(message("SAVE"))}</button></div>`;
			panel.querySelector<HTMLElement>("[data-name]")!.focus();
		} else if (this.mode === "manage") {
			panel.innerHTML = `${head(message("MANAGE"))}${this.list().map((v) => `<div class="korVariantRow" data-key="${esc(v.key)}"><button type="button" class="korCalOpen korStar${v.isDefault ? " korOn" : ""}" data-do="default" aria-pressed="${!!v.isDefault}" aria-label="${esc(`${message("MAKE_DEFAULT")}: ${v.name}`)}">${iconHtml("star")}</button><input class="korVariantName" data-rename="1" maxlength="60" value="${esc(v.name)}" aria-label="${esc(message("VIEW_NAME"))}"${v.locked ? " disabled" : ""}><button type="button" class="korCalOpen" data-do="delete" aria-label="${esc(`${message("REMOVE")}: ${v.name}`)}"${v.locked ? " disabled" : ""}>${iconHtml("trash-2")}</button></div>`).join("")}`;
			panel.querySelector<HTMLElement>("[data-do]")?.focus();
		} else {
			const rows: Variant[] = [{ key: STANDARD, name: this.getStandardText() || message("STANDARD"), state: {}, isDefault: !this.list().some((v) => v.isDefault) }, ...this.list()];
			const current = this.current();
			panel.innerHTML = `${rows.map((v) => { const on = v.key === (current?.key ?? STANDARD); return `<button type="button" class="korMenuItem${on ? " korVariantOn" : ""}" data-key="${esc(v.key)}" data-do="apply"${on ? ' aria-current="true"' : ""}>${iconHtml(on ? "check" : v.shared ? "users" : "")}${on || v.shared ? "" : '<span class="korVariantPad"></span>'}<span class="korMenuGrow">${esc(v.name)}</span>${v.isDefault ? iconHtml("star", "korStarOn") : ""}</button>`; }).join("")}<hr>${this.dirty ? `${current && !current.locked ? `<button type="button" class="korMenuItem" data-do="save">${iconHtml("save")}<span class="korMenuGrow">${esc(message("SAVE_OVER", [current.name]))}</span></button>` : ""}<button type="button" class="korMenuItem" data-do="reset">${iconHtml("undo-2")}<span class="korMenuGrow">${esc(message("DISCARD"))}</span></button>` : ""}<button type="button" class="korMenuItem" data-go="save">${iconHtml("plus")}<span class="korMenuGrow">${esc(message("SAVE_AS"))}</span></button>${this.list().length ? `<button type="button" class="korMenuItem" data-go="manage">${iconHtml("settings")}<span class="korMenuGrow">${esc(message("MANAGE"))}</span></button>` : ""}`;
			(panel.querySelector<HTMLElement>(".korVariantOn") ?? panel.querySelector<HTMLElement>("button"))?.focus();
		}
		this.float!.place();
	}
	private saveNew(): void {
		const panel = this.float!.element;
		const input = panel.querySelector<HTMLInputElement>("[data-name]")!;
		if (!input.value.trim()) {
			input.focus();
			input.classList.add("korBad");
			return;
		}
		const options = Object.fromEntries([...panel.querySelectorAll<HTMLInputElement>("[data-opt]")].map((el) => [el.dataset.opt, el.checked]));
		this.saveAs(input.value, options);
		this.float?.close();
		(this.getDomRef() as HTMLElement).focus();
	}
	private async click(target: HTMLElement): Promise<void> {
		const go = target.closest<HTMLElement>("[data-go]")?.dataset.go;
		const act = target.closest<HTMLElement>("[data-do]")?.dataset.do;
		const key = target.closest<HTMLElement>("[data-key]")?.dataset.key ?? "";
		const variant = this.list().find((v) => v.key === key);
		const finish = () => {
			this.float?.close();
			(this.getDomRef() as HTMLElement).focus();
		};
		if (go) {
			this.mode = go as "list";
			this.paint();
		} else if (act === "create") this.saveNew();
		else if (act === "apply") {
			finish();
			this.apply(key);
		} else if (act === "save") {
			finish();
			this.save();
		} else if (act === "reset") {
			finish();
			this.apply(this.getSelectedKey());
		} else if (act === "default" && variant) {
			this.store(this.list().map((v) => ({ ...v, isDefault: v.key === key ? !v.isDefault : false })));
			this.paint();
		} else if (act === "delete" && variant) {
			finish();
			if (!(await Confirm.ask({ title: message("DELETE_VIEW", [variant.name]), confirmText: message("REMOVE"), danger: true }))) return;
			const was = this.getSelectedKey() === key;
			this.store(this.list().filter((v) => v.key !== key));
			if (was) this.apply(STANDARD);
		}
	}
	exit(): void {
		this.float?.close();
		this.wired.forEach((t) => t.detachEvent("stateChange", this.onState, this));
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Variants) {
			const name = c.current()?.name ?? (c.getStandardText() || message("STANDARD"));
			rm.openStart("button", c).attr("type", "button").class("korVariant").attr("aria-haspopup", "dialog").attr("aria-expanded", "false");
			if (c.getTitle()) rm.class("korVariantTitle");
			rm.openEnd();
			rm.openStart("span").class("korVariantText").openEnd().text(name).close("span");
			if (c.dirty) rm.openStart("span").class("korVariantDirty").attr("role", "img").attr("aria-label", message("UNSAVED")).attr("data-kor-tip", message("UNSAVED")).openEnd().close("span");
			renderIcon(rm, "chevron-down");
			rm.close("button");
		}
	};
}
