import Control from "sap/ui/core/Control";
import type RenderManager from "sap/ui/core/RenderManager";
import type FlowNode from "./FlowNode";
import type { Press } from "./util";
import { compact, message, reducedMotion } from "./util";
import "./library";

type Box = { x: number; y: number; h: number; node: FlowNode };
type Ribbon = { x0: number; x1: number; y0: number; y1: number; w: number; value: number; state: string; source: string; target: string };
type Spark = { r: Ribbon; t: number; o: number; v: number; s: number };
const BAR = 6;

/**
 * Canlı süreç nehri: kayıtlar duraklar arasında miktarınca akar, darboğaz yavaşlar.
 *
 * @namespace kor.ui
 */
export default class Flow extends Control {
	// Aşağıdaki üç satır ts-interface-generator için gereklidir
	constructor(id?: string | $FlowSettings);
	constructor(id?: string, settings?: $FlowSettings);
	constructor(id?: string, settings?: $FlowSettings) {
		super(id, settings);
	}

	static readonly metadata = {
		library: "kor.ui",
		defaultAggregation: "nodes",
		properties: {
			/** Yükseklik, piksel */
			height: { type: "int", defaultValue: 340 },
			/** Birim */
			unit: { type: "string", defaultValue: "" },
			/** Seçili durak */
			selectedKey: { type: "string", defaultValue: "", bindable: "bindable" },
			/** Parçacıklar aksın */
			live: { type: "boolean", defaultValue: true },
			/** Erişilebilir ad */
			label: { type: "string", defaultValue: "" }
		},
		aggregations: {
			/** Duraklar */
			nodes: { type: "kor.ui.FlowNode", multiple: true, singularName: "node" },
			/** Akışlar */
			links: { type: "kor.ui.FlowLink", multiple: true, singularName: "link" }
		},
		events: {
			/** Durak seçildi; boş anahtar seçim kalktı demektir */
			select: { parameters: { key: { type: "string" } } }
		}
	};
	private boxes: Box[] = [];
	private ribbons: Ribbon[] = [];
	private sparks: Spark[] = [];
	private observer?: ResizeObserver;
	private sight?: IntersectionObserver;
	private seen = true;
	private frame = 0;
	private hover = "";
	private last = 0;
	/** Tema değişti; alanlar init()'ten sonra atandığı için dinleyici nesnenin kendisidir */
	handleEvent(): void {
		this.paintRibbons();
	}

	init(): void {
		window.addEventListener("kor:theme", this);
		this.attachBrowserEvent("mouseover", (event: unknown) => {
			const key = ((event as Press).target as HTMLElement).closest<HTMLElement>("[data-key]")?.dataset.key ?? "";
			if (key !== this.hover) {
				this.hover = key;
				this.paintRibbons();
			}
		});
		this.attachBrowserEvent("mouseleave", () => {
			this.hover = "";
			this.paintRibbons();
		});
	}
	onclick(event: Press): void {
		const key = (event.target as HTMLElement).closest<HTMLElement>("[data-key]")?.dataset.key;
		if (key === undefined) return;
		const next = key === this.getSelectedKey() ? "" : key;
		this.setSelectedKey(next);
		this.fireSelect({ key: next });
	}
	onBeforeRendering(): void {
		this.stop();
	}
	onAfterRendering(): void {
		this.observer?.disconnect();
		this.sight?.disconnect();
		this.observer = new ResizeObserver(() => this.layout());
		this.observer.observe(this.getDomRef("stage") as Element);
		this.sight = new IntersectionObserver(([entry]) => {
			this.seen = entry.isIntersecting;
			this.start();
		});
		this.sight.observe(this.getDomRef() as Element);
	}
	exit(): void {
		window.removeEventListener("kor:theme", this);
		this.observer?.disconnect();
		this.sight?.disconnect();
		this.stop();
	}
	private layout(): void {
		const stage = this.getDomRef("stage") as HTMLElement | null;
		if (!stage) return;
		const width = stage.clientWidth;
		const height = this.getHeight();
		const nodes = this.getNodes();
		const links = this.getLinks();
		const columns = Math.max(0, ...nodes.map((n) => n.getColumn())) + 1;
		// Her durağın yazısı çubuğunun üstünde durur
		const label = 64;
		const gap = label + 14;
		const bottom = 10;
		const byColumn = Array.from({ length: columns }, (_, i) => nodes.filter((n) => n.getColumn() === i));
		const k = Math.max(0, Math.min(...byColumn.filter((c) => c.length).map((c) => (height - label - bottom - gap * (c.length - 1)) / (c.reduce((sum, n) => sum + n.getValue(), 0) || 1))));
		const tail = 132;
		this.boxes = [];
		byColumn.forEach((list, i) => {
			// Sütunlar hafif aşağı kayarak akar; sığmayan sütun ortalanmaz
			const free = height - label - bottom - gap * (list.length - 1) - list.reduce((sum, n) => sum + Math.max(3, n.getValue() * k), 0);
			let y = label + Math.max(0, free) * (list.length > 1 ? 0.5 : 0.42);
			list.forEach((node) => {
				const h = Math.max(3, node.getValue() * k);
				this.boxes.push({ x: columns > 1 ? (i / (columns - 1)) * (width - tail) : 0, y, h, node });
				y += h + gap;
			});
		});
		const box = new Map(this.boxes.map((b) => [b.node.getKey(), b]));
		const out = new Map<string, number>();
		const inn = new Map<string, number>();
		this.ribbons = links.flatMap((link) => {
			const a = box.get(link.getSource());
			const b = box.get(link.getTarget());
			if (!a || !b) return [];
			const w = Math.max(1.5, link.getValue() * k);
			const y0 = a.y + (out.get(link.getSource()) ?? 0) + w / 2;
			const y1 = b.y + (inn.get(link.getTarget()) ?? 0) + w / 2;
			out.set(link.getSource(), (out.get(link.getSource()) ?? 0) + w);
			inn.set(link.getTarget(), (inn.get(link.getTarget()) ?? 0) + w);
			return [{ x0: a.x + BAR, x1: b.x, y0, y1, w, value: link.getValue(), state: b.node.getState(), source: link.getSource(), target: link.getTarget() }];
		});
		const total = this.ribbons.reduce((sum, r) => sum + r.w * (r.x1 - r.x0), 0) || 1;
		const budget = Math.min(1100, width * 0.9);
		this.sparks = this.ribbons.flatMap((r) =>
			Array.from({ length: Math.max(3, Math.round((budget * r.w * (r.x1 - r.x0)) / total)) }, () => ({
				r, t: Math.random(), o: (Math.random() + Math.random() - 1) * 0.92, v: (r.state === "wait" ? 0.045 : 0.1) * (0.6 + Math.random() * 0.8), s: 0.6 + Math.random() ** 2 * 1.9
			}))
		);
		const dpr = Math.min(2, window.devicePixelRatio || 1);
		(["band", "spark"] as const).forEach((name) => {
			const canvas = this.getDomRef(name) as HTMLCanvasElement;
			canvas.width = width * dpr;
			canvas.height = height * dpr;
			canvas.getContext("2d")!.setTransform(dpr, 0, 0, dpr, 0, 0);
		});
		this.boxes.forEach((b) => {
			const el = stage.querySelector<HTMLElement>(`[data-key="${CSS.escape(b.node.getKey())}"]`);
			if (!el) return;
			el.style.transform = `translate(${b.x}px, ${b.y}px)`;
			el.style.setProperty("--kor-h", `${b.h}px`);
			el.style.maxWidth = `${columns > 1 ? (width - tail) / (columns - 1) - 10 : width}px`;
		});
		this.paintRibbons();
		this.start();
	}
	private focusKey(): string {
		return this.hover || this.getSelectedKey();
	}
	private lit(r: Ribbon): boolean {
		const key = this.focusKey();
		return !key || r.source === key || r.target === key;
	}
	private colors(): Record<string, string> {
		const style = getComputedStyle(this.getDomRef() as Element);
		return { flow: style.getPropertyValue("--kor-accent").trim() || "#FF5A1F", wait: "#F2B705", danger: "#FF3D6E" };
	}
	private color(r: Ribbon, colors: Record<string, string>): string {
		return colors[r.state] ?? colors.flow;
	}
	private at(r: Ribbon, t: number, o: number): [number, number] {
		const u = 1 - t;
		const mid = (r.x0 + r.x1) / 2;
		const x = u * u * u * r.x0 + 3 * u * u * t * mid + 3 * u * t * t * mid + t * t * t * r.x1;
		const y = (u * u * u + 3 * u * u * t) * r.y0 + (3 * u * t * t + t * t * t) * r.y1;
		return [x, y + (o * r.w) / 2];
	}
	private paintRibbons(): void {
		const canvas = this.getDomRef("band") as HTMLCanvasElement | null;
		const g = canvas?.getContext("2d");
		if (!canvas || !g) return;
		const colors = this.colors();
		g.clearRect(0, 0, canvas.width, canvas.height);
		this.ribbons.forEach((r) => {
			const color = this.color(r, colors);
			const mid = (r.x0 + r.x1) / 2;
			const h = r.w / 2;
			const grad = g.createLinearGradient(r.x0, 0, r.x1, 0);
			const mix = (c: string, a: number) => `color-mix(in srgb, ${c} ${a}%, transparent)`;
			grad.addColorStop(0, mix(colors.flow, 62));
			grad.addColorStop(0.45, mix(color, 20));
			grad.addColorStop(1, mix(color, 50));
			g.globalAlpha = this.lit(r) ? (this.focusKey() ? 1 : 0.72) : 0.14;
			g.fillStyle = grad;
			g.beginPath();
			g.moveTo(r.x0, r.y0 - h);
			g.bezierCurveTo(mid, r.y0 - h, mid, r.y1 - h, r.x1, r.y1 - h);
			g.lineTo(r.x1, r.y1 + h);
			g.bezierCurveTo(mid, r.y1 + h, mid, r.y0 + h, r.x0, r.y0 + h);
			g.fill();
		});
		g.globalAlpha = 1;
		if (!this.moving()) this.paintSparks(0);
	}
	private moving(): boolean {
		return this.getLive() && !reducedMotion();
	}
	private paintSparks(dt: number): void {
		const canvas = this.getDomRef("spark") as HTMLCanvasElement | null;
		const g = canvas?.getContext("2d");
		if (!canvas || !g) return;
		const colors = this.colors();
		g.clearRect(0, 0, canvas.width, canvas.height);
		g.globalCompositeOperation = "lighter";
		g.lineCap = "round";
		for (const p of this.sparks) {
			p.t += p.v * dt;
			if (p.t > 1) {
				p.t -= 1;
				p.o = (Math.random() + Math.random() - 1) * 0.92;
			}
			const [x, y] = this.at(p.r, p.t, p.o);
			const hot = p.s > 2.1;
			const [bx, by] = this.at(p.r, Math.max(0, p.t - p.v * 0.16), p.o);
			g.globalAlpha = (this.lit(p.r) ? 0.95 : 0.12) * Math.min(1, p.t * 10, (1 - p.t) * 10);
			g.strokeStyle = hot ? "#FFE3D1" : this.color(p.r, colors);
			g.lineWidth = p.s;
			g.beginPath();
			g.moveTo(bx, by);
			g.lineTo(x, y);
			g.stroke();
		}
		g.globalAlpha = 1;
	}
	private start(): void {
		if (this.frame || !this.seen || !this.moving() || !this.getDomRef()) return;
		this.last = performance.now();
		const tick = (now: number) => {
			if (!this.seen || !this.getDomRef()) {
				this.frame = 0;
				return;
			}
			this.paintSparks(Math.min(0.05, (now - this.last) / 1000));
			this.last = now;
			this.frame = requestAnimationFrame(tick);
		};
		this.frame = requestAnimationFrame(tick);
	}
	private stop(): void {
		cancelAnimationFrame(this.frame);
		this.frame = 0;
	}
	static renderer = {
		apiVersion: 2 as const,
		render(rm: RenderManager, c: Flow) {
			const id = c.getId();
			rm.openStart("div", c).class("korFlow").attr("role", "group").attr("aria-label", c.getLabel() || message("PIPELINE")).openEnd();
			rm.openStart("div", `${id}-stage`).class("korFlowStage").style("height", `${c.getHeight()}px`).openEnd();
			(["band", "spark"] as const).forEach((name) => rm.openStart("canvas", `${id}-${name}`).attr("aria-hidden", "true").openEnd().close("canvas"));
			c.getNodes().forEach((node) => {
				const on = node.getKey() === c.getSelectedKey();
				rm.openStart("button", node).attr("type", "button").class("korFlowNode").class(`korFlow-${node.getState()}`).attr("data-key", node.getKey()).attr("aria-pressed", String(on));
				if (on) rm.class("korFlowOn");
				rm.openEnd();
				rm.openStart("span").class("korFlowText").openEnd();
				rm.openStart("span").class("korFlowLabel").openEnd().text(node.getLabel()).close("span");
				rm.openStart("span").class("korFlowValue").openEnd().text(`${compact(node.getValue())} ${c.getUnit()}`).close("span");
				if (node.getNote()) rm.openStart("span").class("korFlowNote").openEnd().text(node.getNote()).close("span");
				rm.close("span");
				rm.openStart("span").class("korFlowBar").openEnd().close("span");
				rm.close("button");
			});
			rm.close("div").close("div");
		}
	};
}
