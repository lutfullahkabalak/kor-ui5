import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import DateField from "./DateField";
import TimeField from "./TimeField";
import { minutesOf, pad } from "./time";
import { isoDate, message, renderIcon, toDate } from "./util";
import "./library";

/**
 * Tarih ve saat alanı. Yerel saatle gösterir.
 *
 * @namespace kor.ui
 */
export default class DateTimeField extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $DateTimeFieldSettings);
	constructor(id?: string, settings?: $DateTimeFieldSettings);
	constructor(id?: string, settings?: $DateTimeFieldSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		properties: {
			/** Değer: Date veya ISO 8601 metni */
			value: { type: "any", defaultValue: null, bindable: "bindable" },
			/** Etiket */
			label: { type: "string", defaultValue: "" },
			/** Yardım metni */
			help: { type: "string", defaultValue: "" },
			/** Hata metni */
			error: { type: "string", defaultValue: "" },
			/** En erken gün */
			min: { type: "any" },
			/** En geç gün */
			max: { type: "any" },
			/** Saat listesindeki aralık, dakika */
			step: { type: "int", defaultValue: 30 },
			/** Yalnız gün seçilince kullanılacak saat, HH:mm */
			defaultTime: { type: "string", defaultValue: "" },
			/** Zorunlu */
			required: { type: "boolean", defaultValue: false },
			/** Kullanılabilir */
			enabled: { type: "boolean", defaultValue: true }
		},
		events: {
			/** Değer değişti */
			change: { parameters: { value: { type: "any" } } }
		}
	};
	private day!: DateField;
	private time!: TimeField;
	private known?: number | null;

	init(): void {
		const commit = () => this.commit();
		this.day = new DateField(`${this.getId()}-day`, { placeholder: message("DATE"), change: commit });
		this.time = new TimeField(`${this.getId()}-time`, { placeholder: message("TIME"), change: commit });
		this.addDependent(this.day);
		this.addDependent(this.time);
	}
	private moment(): Date | undefined {
		const value = this.getValue() as unknown;
		if (value === null || value === undefined || value === "") return undefined;
		const date = value instanceof Date ? value : new Date(value as string);
		return Number.isNaN(date.getTime()) ? undefined : date;
	}
	private commit(): void {
		const day = this.day.getValue() as string | null;
		if (!day) {
			// Gün silinince saat de silinir
			if (this.known !== null && this.known !== undefined) this.time.setValue(null);
			if (this.moment()) this.store(null);
			else this.invalidate();
			return;
		}
		if (!this.time.getValue() && this.getDefaultTime()) this.time.setValue(this.getDefaultTime());
		const minutes = minutesOf(this.time.getValue());
		if (minutes === undefined) {
			// Saatsiz gün yarım değerdir; modele eski an kalmasın
			if (this.moment()) this.store(null, true);
			else this.invalidate();
			return;
		}
		const date = toDate(day) as Date;
		date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
		this.store(date);
	}
	private store(date: Date | null, keep = false): void {
		const old = this.getValue() as unknown;
		const model = this.getBinding("value")?.getModel() as { isA?(name: string): boolean } | undefined;
		const asDate = old instanceof Date || model?.isA?.("sap.ui.model.odata.v2.ODataModel");
		// V4 DateTimeOffset saniyenin kesrini her zaman kabul etmez
		const value = date ? (asDate ? date : date.toISOString().replace(/\.000Z$/, "Z")) : null;
		this.known = date ? date.getTime() : keep ? null : undefined;
		this.setValue(value);
		this.fireChange({ value });
	}
	private feed(): void {
		const date = this.moment();
		const stamp = date ? date.getTime() : null;
		if (stamp !== this.known) {
			// Dışarıdan gelen değer; yarım giriş (yalnız gün) null ile silinmez
			if (date || this.known) {
				this.day.setValue(date ? isoDate(date) : null);
				this.time.setValue(date ? `${pad(date.getHours())}:${pad(date.getMinutes())}` : null);
			}
			this.known = stamp;
		}
		this.day.setMin(this.getMin()).setMax(this.getMax()).setEnabled(this.getEnabled());
		this.time.setStep(this.getStep()).setEnabled(this.getEnabled());
	}
	onBeforeRendering(): void {
		this.feed();
	}
	getFocusDomRef(): Element {
		return (this.day.getFocusDomRef() ?? this.getDomRef()) as Element;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: DateTimeField) {
			const id = c.getId();
			const half = !!c.day.getValue() !== !!c.time.getValue();
			const error = c.getError();
			const note = error || (half ? message(c.day.getValue() ? "TIME_MISSING" : "DATE_MISSING") : c.getHelp());
			rm.openStart("div", c).class("korField").attr("role", "group");
			if (c.getLabel()) rm.attr("aria-labelledby", `${id}-l`);
			if (note) rm.attr("aria-describedby", `${id}-note`);
			if (error) rm.class("korFieldError");
			rm.openEnd();
			if (c.getLabel()) {
				rm.openStart("span", `${id}-l`).class("korLabel").openEnd().text(c.getLabel());
				if (c.getRequired()) rm.openStart("span").class("korRequired").attr("aria-hidden", "true").openEnd().text("*").close("span");
				rm.close("span");
			}
			rm.openStart("div").class("korDateTime").openEnd();
			rm.renderControl(c.day);
			rm.renderControl(c.time);
			rm.close("div");
			if (note) {
				rm.openStart("div", `${id}-note`).class("korNote").openEnd();
				if (error) renderIcon(rm, "circle-alert");
				rm.text(note).close("div");
			}
			rm.close("div");
		}
	};
}
