import type Event from "sap/ui/base/Event";
import Controller from "sap/ui/core/mvc/Controller";
import Filter from "sap/ui/model/Filter";
import FilterOperator from "sap/ui/model/FilterOperator";
import JSONModel from "sap/ui/model/json/JSONModel";
import ResourceModel from "sap/ui/model/resource/ResourceModel";
import type Context from "sap/ui/model/Context";
import type ListBinding from "sap/ui/model/ListBinding";
import type Board from "kor/ui/Board";
import type CommandPalette from "kor/ui/CommandPalette";
import type DataGrid from "kor/ui/DataGrid";
import type FilterBar from "kor/ui/FilterBar";
import Confirm from "kor/ui/Confirm";
import type Form from "kor/ui/Form";
import type HoldButton from "kor/ui/HoldButton";
import type Popover from "kor/ui/Popover";
import type Stack from "kor/ui/Stack";
import Theme from "kor/ui/Theme";
import type TreeGrid from "kor/ui/TreeGrid";
import Toast from "kor/ui/Toast";
import { num } from "kor/ui/util";
import { model as data, periods, stageStatus } from "./data";
import type { Order } from "./data";
import { bundle, language, t } from "./i18n";

// Olay parametreleri 1.108 tiplerinde genel kayıttır
const params = (event: Event): unknown => event.getParameters();
const pages = new Set(["akis", "siparis", "pano", "plan", "maliyet", "bilesen"]);

/** @namespace kor.ui.demo */
export default class Main extends Controller {
	private json(): JSONModel {
		return this.getView()!.getModel() as JSONModel;
	}
	onInit(): void {
		const json = new JSONModel(data);
		json.setSizeLimit(20000);
		this.getView()!.setModel(json);
		this.getView()!.setModel(new ResourceModel({ bundle }), "i18n");
		json.setProperty("/look/mode", Theme.get().mode);
		json.setProperty("/ids/tax", this.byId("tax")!.getId());
		const hash = location.hash.slice(1);
		if (pages.has(hash)) this.go(hash);
	}
	private go(page: string): void {
		this.json().setProperty("/page", page);
		this.json().setProperty("/sheet", false);
		history.replaceState(null, "", `#${page}`);
	}
	onNavigate(event: Event): void {
		this.go((params(event) as { key: string }).key);
	}
	onLanguage(event: Event): void {
		const { key } = params(event) as { key: string };
		if (key === language) return;
		const url = new URL(location.href);
		url.searchParams.set("lang", key);
		url.searchParams.set("mode", Theme.get().mode);
		location.assign(url);
	}
	onDocs(): void {
		const docs = language === "tr" ? "/tr/" : "/";
		const integrated = location.pathname === "/demo/" || location.pathname === "/demo/index.html";
		location.assign(integrated ? docs : `https://korui5.abapnews.com${docs}`);
	}
	onPalette(): void {
		(this.byId("palette") as CommandPalette).open();
	}
	onCommand(event: Event): void {
		const key = (params(event) as { key: string }).key;
		if (pages.has(key)) this.go(key);
		else if (key === "theme") this.onMode();
		else if (key === "look") this.onLook();
		else if (key === "rtl") document.documentElement.dir = document.documentElement.dir === "rtl" ? "ltr" : "rtl";
		else if (key === "blocked") {
			this.go("siparis");
			const bar = this.byId("filter") as FilterBar;
			bar.clear();
			bar.addToken("status", "EQ", t("blocked"));
		} else if (key === "big") {
			this.go("siparis");
			const bar = this.byId("filter") as FilterBar;
			bar.clear();
			bar.addToken("amount", "GT", 500000);
		}
	}
	onMode(): void {
		const mode = Theme.isDark() ? "light" : "dark";
		Theme.set({ mode });
		this.json().setProperty("/look/mode", mode);
	}
	onLook(): void {
		this.json().setProperty("/lookSheet", true);
	}
	onLookChange(): void {
		const look = this.json().getProperty("/look") as { mode: "light"; density: "cozy"; radius: number };
		Theme.set({ ...look });
		(this.byId("grid") as DataGrid).invalidate();
	}
	onRadius(event: Event): void {
		Theme.set({ radius: (params(event) as { value: number }).value });
	}
	onAccent(event: Event): void {
		Theme.set({ accent: (event.getSource() as unknown as { data(key: string): string }).data("accent") });
	}
	onPeriod(event: Event): void {
		const p = periods[(params(event) as { key: string }).key];
		this.json().setProperty("/flow", p.flow);
		this.json().setProperty("/cash", p.cash);
		this.json().setProperty("/delta", p.delta);
	}
	onStage(event: Event): void {
		const key = (params(event) as { key: string }).key;
		const node = (this.json().getProperty("/flow/nodes") as { key: string; label: string }[]).find((n) => n.key === key);
		this.json().setProperty("/stageTitle", node ? t("stepOrders", node.label) : t("latestOrders"));
		((this.byId("stageGrid") as DataGrid).getBinding("rows") as ListBinding).filter(node ? [new Filter("status", FilterOperator.EQ, stageStatus[key])] : []);
	}
	onDecide(event: Event): void {
		const button = event.getSource() as HoldButton;
		const at = this.json().getProperty("/decision") as number;
		Toast.show(t("decisionSaved"), { text: data.decisions[at].firm, actionText: t("undo"), action: () => this.showDecision(at) });
		window.setTimeout(() => {
			button.setDone(false);
			this.showDecision(at + 1);
		}, 700);
	}
	onSkip(): void {
		this.showDecision((this.json().getProperty("/decision") as number) + 1);
	}
	onRestart(): void {
		this.showDecision(0);
	}
	private showDecision(at: number): void {
		this.json().setProperty("/decision", at);
		const card = this.byId("decision") as Stack;
		if (data.decisions[at]) card.bindElement(`/decisions/${at}`);
		const dom = card.getDomRef() as HTMLElement | null;
		if (dom) {
			dom.classList.remove("dDecision");
			void dom.offsetWidth;
			dom.classList.add("dDecision");
		}
	}
	decisionText(at: number): string {
		return `${num(at + 1)} / ${num(data.decisions.length)}`;
	}
	decisionOpen(at: number): boolean {
		return at < data.decisions.length;
	}
	money(value: number): string {
		return num(value ?? 0, 2);
	}
	onFilter(event: Event): void {
		((this.byId("grid") as DataGrid).getBinding("rows") as ListBinding).filter((params(event) as { filters: Filter[] }).filters);
	}
	onRow(event: Event): void {
		const context = (params(event) as { context: Context }).context;
		this.json().setProperty("/order", context.getObject());
		this.json().setProperty("/sheet", true);
	}
	onSheetClose(): void {
		this.json().setProperty("/sheet", false);
	}
	onPicked(event: Event): void {
		const count = (params(event) as { contexts: Context[] }).contexts.length;
		this.json().setProperty("/picked", count);
		this.json().setProperty("/pickedText", t(count === 1 ? "orderSelected" : "ordersSelected", num(count)));
	}
	onBulkClear(): void {
		(this.byId("grid") as DataGrid).clearSelection();
	}
	onBulk(): void {
		const contexts = (this.byId("grid") as DataGrid).getSelectedContexts();
		const before = contexts.map((c) => c.getProperty("status") as string);
		contexts.forEach((c) => this.json().setProperty("status", t("pending"), c, true));
		this.json().refresh(true);
		this.onBulkClear();
		Toast.show(t(contexts.length === 1 ? "oneOrderSent" : "ordersSent", num(contexts.length)), { actionText: t("undo"), action: () => {
			contexts.forEach((c, i) => this.json().setProperty("status", before[i], c, true));
			this.json().refresh(true);
		} });
	}
	onCell(event: Event): void {
		const { path, oldValue, context } = params(event) as { path: string; oldValue: unknown; context: Context };
		Toast.show(t("changeSaved"), { actionText: t("undo"), duration: 3000, action: () => {
			this.json().setProperty(path, oldValue, context);
			(this.byId("grid") as DataGrid).invalidate();
		} });
	}
	onCardMove(event: Event): void {
		const { card, to } = params(event) as { card: { getTitle(): string; setState(s: string): void }; to: string };
		const column = data.columns.find((c) => c.key === to)!;
		card.setState(column.state);
		(this.byId("board") as Board).invalidate();
	}
	onTaskChange(event: Event): void {
		const { task, conflict } = params(event) as { task: { getTitle(): string }; conflict: boolean };
		if (conflict) Toast.show(t("taskConflict", task.getTitle()), { state: "danger" });
	}
	onMenu(event: Event): void {
		const { key } = params(event) as { key: string };
		Toast.show(t("menuSelected", t(key)), { state: "info" });
	}
	onToast(): void {
		Toast.show(t("invoiceSent"), { text: `Poyraz Otomotiv, ${num(486200, 2)} TRY`, actionText: t("undo") });
	}
	onHoldReset(): void {
		(this.byId("holdSample") as HoldButton).setDone(false);
	}
	onColumns(event: Event): void {
		(this.byId("grid") as DataGrid).openSettings(event.getSource() as never);
	}
	onTreeColumns(event: Event): void {
		(this.byId("tree") as TreeGrid).openSettings(event.getSource() as never);
	}
	onLevel(event: Event): void {
		(this.byId("tree") as TreeGrid).expandToLevel(Number((params(event) as { key: string }).key));
	}
	onNew(): void {
		this.json().setProperty("/draft", { firm: "", firmId: "", item: "", qty: 1, amount: 12500, due: null, tags: [], ship: "kara" });
		this.json().setProperty("/newOpen", true);
	}
	onNewCancel(): void {
		this.json().setProperty("/newOpen", false);
	}
	onNewSave(): void {
		if (!(this.byId("newForm") as Form).validate()) return;
		const draft = this.json().getProperty("/draft") as Order;
		const id = String(4510001 + (this.json().getProperty("/orders") as Order[]).length - 10000);
		this.json().setProperty("/orders", [{ ...draft, id, status: t("draft"), currency: "TRY", progress: 0, owner: "Elif Aydın", trend: [1, 1], note: "" }, ...(this.json().getProperty("/orders") as Order[])]);
		this.json().setProperty("/newOpen", false);
		Toast.show(t("orderCreated", id), { text: draft.firm });
	}
	onValidate(): void {
		if ((this.byId("sampleForm") as Form).validate()) Toast.show(t("formComplete"));
	}
	async onAsk(): Promise<void> {
		if (await Confirm.ask({ title: t("approveQuestion"), text: t("approveHelp"), confirmText: t("send") })) Toast.show(t("sentForApproval"));
	}
	async onAskDanger(): Promise<void> {
		if (await Confirm.ask({ title: t("deleteOctober"), text: t("deleteOctoberHelp", num(1284)), confirmText: t("deletePeriod"), danger: true, type: t("octoberCode") })) Toast.show(t("periodDeleted"), { state: "danger" });
	}
	async onOrderMenu(event: Event): Promise<void> {
		const key = (params(event) as { key: string }).key;
		if (key !== "cancelOrder") {
			this.onMenu(event);
			return;
		}
		const id = this.json().getProperty("/order/id") as string;
		if (await Confirm.ask({ title: t("cancelQuestion", id), text: t("cancelHelp"), confirmText: t("cancelOrder"), danger: true })) {
			this.json().setProperty("/sheet", false);
			Toast.show(t("orderCancelled", id), { state: "danger" });
		}
	}
	onPopover(event: Event): void {
		(this.byId("popover") as Popover).openBy(event.getSource() as never);
	}
	onPopoverClose(): void {
		(this.byId("popover") as Popover).close();
	}
	onMessage(event: Event): void {
		const { item } = params(event) as { item: { getTarget(): string } };
		if (!item.getTarget()) return;
		this.json().setProperty("/gallery", "giris");
		window.setTimeout(() => {
			this.byId("tax")!.getDomRef()!.scrollIntoView({ block: "center" });
			(this.byId("tax") as unknown as { focus(): void }).focus();
		}, 200);
	}
	/** Demo: yükleme yerine zamanlayıcı */
	private upload(key: string): void {
		const step = () => {
			const files = this.json().getProperty("/files") as { key: string; progress: number }[];
			const at = files.findIndex((f) => f.key === key);
			if (at < 0) return;
			const progress = Math.min(100, files[at].progress + 9 + Math.random() * 14);
			this.json().setProperty(`/files/${at}/progress`, progress);
			if (progress < 100) window.setTimeout(step, 160);
		};
		step();
	}
	onFiles(event: Event): void {
		const added = (params(event) as { files: File[] }).files.map((f) => ({ key: `${f.name}${Date.now()}`, name: f.name, size: f.size, progress: 0, error: "" }));
		this.json().setProperty("/files", [...(this.json().getProperty("/files") as object[]), ...added]);
		added.forEach((f) => this.upload(f.key));
	}
	onFileRemove(event: Event): void {
		const key = (params(event) as { item: { getKey(): string } }).item.getKey();
		this.json().setProperty("/files", (this.json().getProperty("/files") as { key: string }[]).filter((f) => f.key !== key));
	}
	onFileRetry(event: Event): void {
		const key = (params(event) as { item: { getKey(): string } }).item.getKey();
		const at = (this.json().getProperty("/files") as { key: string }[]).findIndex((f) => f.key === key);
		this.json().setProperty(`/files/${at}/error`, "");
		this.json().setProperty(`/files/${at}/progress`, 0);
		this.upload(key);
	}
}
