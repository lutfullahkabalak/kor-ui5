import { dayText, parseNum, pct } from "kor/ui/util";
import LookupField from "kor/ui/LookupField";
import TreeGrid from "kor/ui/TreeGrid";
import Variants from "kor/ui/Variants";
import Confirm from "kor/ui/Confirm";
import Dialog from "kor/ui/Dialog";
import FileDrop from "kor/ui/FileDrop";
import Form from "kor/ui/Form";
import FormSection from "kor/ui/FormSection";
import Message from "kor/ui/Message";
import MessageItem from "kor/ui/MessageItem";
import MessageList from "kor/ui/MessageList";
import MultiSelect from "kor/ui/MultiSelect";
import Popover from "kor/ui/Popover";
import RadioGroup from "kor/ui/RadioGroup";
import RadioItem from "kor/ui/RadioItem";
import Skeleton from "kor/ui/Skeleton";
import Tab from "kor/ui/Tab";
import Tabs from "kor/ui/Tabs";
import Text from "kor/ui/Text";
import Tooltip from "kor/ui/Tooltip";
import Board from "kor/ui/Board";
import BoardCard from "kor/ui/BoardCard";
import BoardColumn from "kor/ui/BoardColumn";
import Button from "kor/ui/Button";
import Check from "kor/ui/Check";
import Column from "kor/ui/Column";
import Command from "kor/ui/Command";
import CommandPalette from "kor/ui/CommandPalette";
import DataGrid from "kor/ui/DataGrid";
import FilterBar from "kor/ui/FilterBar";
import FilterField from "kor/ui/FilterField";
import DateField from "kor/ui/DateField";
import DateRangeField from "kor/ui/DateRangeField";
import { readDate } from "kor/ui/Calendar";
import Flow from "kor/ui/Flow";
import FlowLink from "kor/ui/FlowLink";
import FlowNode from "kor/ui/FlowNode";
import HoldButton from "kor/ui/HoldButton";
import MenuItem from "kor/ui/MenuItem";
import NumberField from "kor/ui/NumberField";
import Schedule from "kor/ui/Schedule";
import ScheduleLane from "kor/ui/ScheduleLane";
import ScheduleTask from "kor/ui/ScheduleTask";
import Segmented from "kor/ui/Segmented";
import SelectField from "kor/ui/SelectField";
import Series from "kor/ui/Series";
import Sheet from "kor/ui/Sheet";
import TextField from "kor/ui/TextField";
import Theme from "kor/ui/Theme";
import Toast from "kor/ui/Toast";
import Trend from "kor/ui/Trend";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import Item from "sap/ui/core/Item";
import type ListBinding from "sap/ui/model/ListBinding";
import type Filter from "sap/ui/model/Filter";
import JSONModel from "sap/ui/model/json/JSONModel";

let current: Control[] = [];
function show<T extends Control>(control: T): HTMLElement {
	current.push(control);
	control.placeAt("qunit-fixture");
	Core.applyChanges();
	return control.getDomRef() as HTMLElement;
}
const all = (root: ParentNode, selector: string) => [...root.querySelectorAll<HTMLElement>(selector)];
const one = (root: ParentNode, selector: string) => root.querySelector<HTMLElement>(selector)!;
const key = (target: HTMLElement, name: string, more: KeyboardEventInit = {}) => target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...more }));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const type = (input: HTMLInputElement, text: string) => {
	input.focus();
	input.value = text;
	input.dispatchEvent(new Event("input", { bubbles: true }));
};
type Row = { id: string; amount: number };
function grid(count: number, rest: object = {}): { grid: DataGrid; dom: HTMLElement; model: JSONModel } {
	const model = new JSONModel({ rows: Array.from({ length: count }, (_, i) => ({ id: `S${i}`, amount: i + 1 })) });
	model.setSizeLimit(count);
	const control = new DataGrid({ height: "400px", selectionMode: "Multi", columns: [new Column({ label: "No", path: "id", type: "link" }), new Column({ label: "Tutar", path: "amount", type: "number", editable: true })], ...rest } as never);
	control.setModel(model);
	control.bindAggregation("rows", { path: "/rows" } as never);
	const dom = show(control);
	return { grid: control, dom, model };
}

QUnit.module("Kor", {
	afterEach: () => {
		current.forEach((c) => c.destroy());
		current = [];
		document.querySelectorAll(".korFloat, .korToast, .korPalette").forEach((el) => el.remove());
	}
});

QUnit.test("Button: basma, devre dışı, simge adı, menü", (assert) => {
	let pressed = 0;
	let chosen = "";
	const button = new Button({ icon: "x", label: "Kapat", press: () => pressed++ });
	const dom = show(button);
	dom.click();
	button.setEnabled(false);
	Core.applyChanges();
	dom.click();
	assert.strictEqual(pressed, 1);
	assert.strictEqual(dom.getAttribute("aria-label"), "Kapat");
	const menu = new Button({ text: "İşlem", menuSelect: (e: { getParameters(): object }) => (chosen = (e.getParameters() as { key: string }).key) } as never);
	menu.addMenuItem(new MenuItem({ key: "a", text: "A" }));
	const root = show(menu);
	root.click();
	assert.strictEqual(root.getAttribute("aria-expanded"), "true");
	one(document, ".korMenu button").click();
	assert.strictEqual(chosen, "a");
	assert.strictEqual(document.querySelector(".korMenu"), null);
});

QUnit.test("HoldButton: erken bırakma onaylamaz, süre dolunca onaylar, klavye iki basış ister", async (assert) => {
	let done = 0;
	const hold = new HoldButton({ text: "Gönder", duration: 60, confirm: () => done++ });
	const dom = show(hold);
	const pointer = (name: string) => dom.dispatchEvent(new PointerEvent(name, { bubbles: true, button: 0 }));
	pointer("pointerdown");
	await wait(15);
	pointer("pointerup");
	await wait(90);
	assert.strictEqual(done, 0);
	pointer("pointerdown");
	await wait(120);
	assert.strictEqual(done, 1);
	assert.ok(hold.getDone());
	hold.setDone(false);
	Core.applyChanges();
	dom.click();
	assert.strictEqual(done, 1);
	dom.click();
	assert.strictEqual(done, 2);
});

QUnit.test("Alanlar modele yazar, sınırı uygular", (assert) => {
	const model = new JSONModel({ text: "a", n: 5 });
	const text = new TextField({ label: "Ad", value: "{/text}" });
	const n = new NumberField({ value: "{/n}", min: 0, max: 6 } as never);
	text.setModel(model);
	n.setModel(model);
	const t = one(show(text), "input") as HTMLInputElement;
	t.value = "b";
	t.dispatchEvent(new Event("change", { bubbles: true }));
	assert.strictEqual(model.getProperty("/text"), "b");
	const i = one(show(n), "input") as HTMLInputElement;
	key(i, "ArrowUp");
	key(i, "ArrowUp");
	assert.strictEqual(model.getProperty("/n"), 6);
	i.value = "1,5";
	i.dispatchEvent(new Event("change", { bubbles: true }));
	assert.strictEqual(model.getProperty("/n"), 2, "ondalık 0: yuvarlanır");
	model.setProperty("/text", "c");
	Core.applyChanges();
	assert.strictEqual((one(text.getDomRef() as HTMLElement, "input") as HTMLInputElement).value, "c");
});

QUnit.test("SelectField yazınca süzer, Enter seçer", (assert) => {
	const select = new SelectField({ items: [new Item({ key: "1", text: "Ada" }), new Item({ key: "2", text: "Deniz" })] });
	const input = one(show(select), "input") as HTMLInputElement;
	type(input, "den");
	assert.strictEqual(all(document, ".korList [role=option]").length, 1);
	key(input, "Enter");
	assert.strictEqual(select.getSelectedKey(), "2");
	assert.strictEqual(input.value, "Deniz");
});

QUnit.test("Segmented ve Check", (assert) => {
	const seg = new Segmented({ selectedKey: "a", items: [new Item({ key: "a", text: "A" }), new Item({ key: "b", text: "B" })] });
	key(one(show(seg), "button"), "ArrowRight");
	assert.strictEqual(seg.getSelectedKey(), "b");
	const check = new Check({ text: "Tamam" });
	show(check).click();
	assert.ok(check.getSelected());
});

QUnit.test("DataGrid: 10.000 satırda yalnızca görünenler çizilir", (assert) => {
	const { dom } = grid(10000);
	assert.ok(all(dom, ".korRow").length < 40, String(all(dom, ".korRow").length));
	assert.strictEqual(one(dom, "[role=grid]").getAttribute("aria-rowcount"), "10001");
});

QUnit.test("DataGrid: klavye aralığı, toplam, düzenleme, seçim, sıralama", (assert) => {
	let changed: unknown;
	const { grid: control, dom, model } = grid(50, { cellChange: (e: { getParameters(): { value: unknown } }) => (changed = e.getParameters().value) });
	const scroll = one(dom, "[role=grid]");
	scroll.focus();
	key(scroll, "ArrowRight");
	key(scroll, "ArrowDown", { shiftKey: true });
	key(scroll, "ArrowDown", { shiftKey: true });
	assert.ok(one(dom, ".korGridFoot").textContent!.includes("6,00"), one(dom, ".korGridFoot").textContent!);
	key(scroll, "F2");
	const input = one(dom, "input.korCellEditor") as HTMLInputElement;
	input.value = "1.250,5";
	key(input, "Enter");
	assert.strictEqual(model.getProperty("/rows/2/amount"), 1250.5);
	assert.strictEqual(changed, 1250.5);
	all(dom, "[data-pick]")[1].click();
	assert.strictEqual((control.getSelectedContexts()[0].getObject() as Row).id, "S1");
	one(dom, '[data-sort="1"]').click();
	one(dom, '[data-sort="1"]').click();
	assert.strictEqual(one(dom, '[data-row="0"][data-col="0"]').textContent, "S2");
	assert.strictEqual((control.getSelectedContexts()[0].getObject() as Row).id, "S1", "seçim satırla gider");
});

QUnit.test("DataGrid: hatalı sayı yazılmaz, Excel'den yapıştırılır", (assert) => {
	const { dom, model } = grid(5);
	const scroll = one(dom, "[role=grid]");
	scroll.focus();
	key(scroll, "ArrowRight");
	key(scroll, "7");
	const input = one(dom, "input.korCellEditor") as HTMLInputElement;
	input.value = "abc";
	key(input, "Enter");
	assert.strictEqual(model.getProperty("/rows/0/amount"), 1);
	const data = new DataTransfer();
	data.setData("text/plain", "10\n20\n");
	scroll.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
	assert.strictEqual(model.getProperty("/rows/1/amount"), 10);
	assert.strictEqual(model.getProperty("/rows/2/amount"), 20);
});

QUnit.test("DataGrid: HTML metin olarak yazılır", (assert) => {
	const { dom, model } = grid(2);
	model.setProperty("/rows/0/id", "<img src=x onerror=alert(1)>");
	assert.strictEqual(dom.querySelector("img"), null);
});

QUnit.test("FilterBar: yazılanı yorumlar, Filter üretir", (assert) => {
	let filters: Filter[] = [];
	const bar = new FilterBar({ fields: [new FilterField({ label: "Tutar", path: "amount", type: "number" }), new FilterField({ label: "Durum", path: "id", type: "option", options: ["S1", "S2"] })], change: (e: { getParameters(): object }) => (filters = (e.getParameters() as { filters: Filter[] }).filters) } as never);
	const dom = show(bar);
	type(one(dom, "input") as HTMLInputElement, ">1,5 bin");
	key(one(dom, "input"), "Enter");
	Core.applyChanges();
	assert.strictEqual(filters.length, 1);
	assert.ok(one(dom, ".korToken").textContent!.includes("1.500"));
	bar.clear();
	bar.addToken("id", "EQ", "S1");
	bar.addToken("id", "EQ", "S2");
	const { grid: control } = grid(10);
	(control.getBinding("rows") as ListBinding).filter(filters);
	assert.strictEqual((control.getBinding("rows") as ListBinding).getLength(), 2, "aynı alan VEYA");
});

QUnit.test("Board: Ctrl+ok taşır ve modele yazar", (assert) => {
	let moved = "";
	const board = new Board({ columns: [new BoardColumn({ key: "a", title: "A" }), new BoardColumn({ key: "b", title: "B", limit: 1 })], cards: [new BoardCard({ key: "1", column: "a", title: "İş" })], cardMove: (e: { getParameters(): object }) => (moved = (e.getParameters() as { to: string }).to) } as never);
	const dom = show(board);
	key(one(dom, ".korCard"), "ArrowRight", { ctrlKey: true });
	Core.applyChanges();
	assert.strictEqual(moved, "b");
	assert.ok(one(dom, '[data-column="b"] .korCard'));
});

QUnit.test("Schedule: taşıma, uzatma, çakışma; yaz saati günü kaydırmaz", (assert) => {
	let clash = false;
	const task = new ScheduleTask({ key: "1", lane: "x", title: "Bir", start: "2026-03-28", end: "2026-03-30" } as never);
	const plan = new Schedule({ start: "2026-03-20", today: "2026-03-29", lanes: [new ScheduleLane({ key: "x", title: "X" }), new ScheduleLane({ key: "y", title: "Y" })], tasks: [task, new ScheduleTask({ key: "2", lane: "y", title: "İki", start: "2026-03-29", end: "2026-04-02" } as never)], taskChange: (e: { getParameters(): object }) => (clash = (e.getParameters() as { conflict: boolean }).conflict) } as never);
	const dom = show(plan);
	const el = () => one(dom, `#${task.getId()}`);
	key(el(), "ArrowRight");
	assert.strictEqual(task.getStart(), "2026-03-29");
	assert.strictEqual(task.getEnd(), "2026-03-31");
	key(el(), "ArrowRight", { shiftKey: true });
	assert.strictEqual(task.getEnd(), "2026-04-01");
	key(el(), "ArrowDown");
	Core.applyChanges();
	assert.ok(clash);
	assert.strictEqual(all(dom, ".korTaskClash").length, 2);
});

QUnit.test("Flow: düğme olarak duraklar, seçim açılıp kapanır", (assert) => {
	const flow = new Flow({ nodes: [new FlowNode({ key: "a", label: "A", value: 10 }), new FlowNode({ key: "b", label: "B", column: 1, value: 8 })], links: [new FlowLink({ source: "a", target: "b", value: 8 })] });
	const dom = show(flow);
	one(dom, "[data-key=b]").click();
	assert.strictEqual(flow.getSelectedKey(), "b");
	one(dom, "[data-key=b]").click();
	assert.strictEqual(flow.getSelectedKey(), "");
});

QUnit.test("CommandPalette: kısayol açar, arar, çalıştırır, kapanır", (assert) => {
	let run = "";
	const palette = new CommandPalette({ commands: [new Command({ key: "a", text: "Siparişler" }), new Command({ key: "b", text: "Görünüm" })], run: (e: { getParameters(): object }) => (run = (e.getParameters() as { key: string }).key) } as never);
	key(document.body, "k", { ctrlKey: true });
	assert.ok(palette.isOpen());
	const input = one(document, ".korPaletteInput") as HTMLInputElement;
	type(input, "grnm");
	key(input, "Enter");
	assert.strictEqual(run, "b");
	assert.notOk(palette.isOpen());
	palette.destroy();
	key(document.body, "k", { ctrlKey: true });
	assert.strictEqual(document.querySelector(".korPalette"), null, "yok edilince dinleyici kalkar");
});

QUnit.test("Sheet: kapalıyken erişilmez, Esc kapatır", (assert) => {
	const sheet = new Sheet({ title: "Kayıt" });
	const dom = show(sheet);
	assert.ok(dom.hasAttribute("inert"));
	sheet.setOpen(true);
	Core.applyChanges();
	assert.notOk(dom.hasAttribute("inert"));
	key(one(dom, "h2"), "Escape");
	assert.notOk(sheet.getOpen());
});

QUnit.test("Trend: tablo karşılığı ve ok tuşu", async (assert) => {
	const trend = new Trend({ label: "T", labels: ["Oca", "Şub"], series: [new Series({ name: "Satış", values: [1, 2] })] } as never);
	const dom = show(trend);
	await wait(80);
	assert.strictEqual(all(dom, "table td").length, 2);
	key(dom, "ArrowRight");
	assert.ok(one(dom, ".korTip").textContent!.includes("Oca"));
});

QUnit.test("Theme ve Toast", (assert) => {
	Theme.set({ accent: "#101010", mode: "dark" });
	assert.strictEqual(document.documentElement.dataset.korMode, "dark");
	assert.strictEqual(document.documentElement.style.getPropertyValue("--kor-on-accent"), "#FFFFFF");
	assert.throws(() => Theme.set({ accent: "kirmizi" }));
	Theme.set({ accent: "#FF5A1F", mode: "light" });
	let undone = false;
	Toast.show("Tamam", { actionText: "Geri al", action: () => (undone = true) });
	one(document, ".korToastAction").click();
	assert.ok(undone);
});

QUnit.test("DateField: yazı, sınır, klavye, işaret, Date değeri", (assert) => {
	const model = new JSONModel({ d: "2026-01-31" });
	const field = new DateField({ value: "{/d}", min: "2026-01-01", workdays: true, marks: { "2026-02-02": "Sayım" } } as never);
	field.setModel(model);
	const input = one(show(field), "input") as HTMLInputElement;
	assert.ok(input.value.includes("2026"), input.value);
	input.focus();
	key(input, "ArrowDown");
	assert.ok(one(document, ".korCal .korDayOn").id.endsWith("2026-01-31"));
	key(input, "PageDown");
	assert.ok(input.getAttribute("aria-activedescendant")!.endsWith("2026-02-28"), "ay sonu taşmaz");
	assert.ok(one(document, ".korDayNote").getAttribute("aria-label")!.includes("Sayım"));
	key(input, "ArrowUp");
	key(input, "ArrowLeft");
	key(input, "Enter");
	Core.applyChanges();
	assert.strictEqual(model.getProperty("/d"), "2026-02-20");
	assert.strictEqual(document.querySelector(".korCal"), null);
	const write = (text: string) => {
		const el = one(field.getDomRef() as HTMLElement, "input") as HTMLInputElement;
		el.value = text;
		key(el, "Enter");
		Core.applyChanges();
	};
	write("16.3.26");
	assert.strictEqual(model.getProperty("/d"), "2026-03-16");
	write("31.02.2026");
	assert.ok(one(field.getDomRef() as HTMLElement, ".korNote"), "geçersiz gün");
	assert.strictEqual(model.getProperty("/d"), "2026-03-16");
	write("21.03.2026");
	assert.strictEqual(model.getProperty("/d"), "2026-03-16", "cumartesi reddedilir");
	write("");
	assert.strictEqual(model.getProperty("/d"), null);
	model.setProperty("/d", new Date(2026, 4, 4));
	Core.applyChanges();
	write("05.05.2026");
	assert.ok(model.getProperty("/d") instanceof Date);
	assert.strictEqual((model.getProperty("/d") as Date).getDate(), 5);
});

QUnit.test("DateField: göreli yazım", (assert) => {
	const now = new Date();
	const plus = (n: number) => new Date(now.getFullYear(), now.getMonth(), now.getDate() + n).getTime();
	assert.strictEqual(readDate("yarın")?.getTime(), plus(1));
	assert.strictEqual(readDate("+3")?.getTime(), plus(3));
	assert.strictEqual(readDate("abc"), undefined);
	assert.strictEqual(readDate("2026-13-01"), undefined);
});

QUnit.test("DateRangeField: iki basış, ters sıra, yazarak aralık", (assert) => {
	const model = new JSONModel({ a: "2026-03-02", b: "2026-03-06" });
	const field = new DateRangeField({ start: "{/a}", end: "{/b}" } as never);
	field.setModel(model);
	const input = one(show(field), "input") as HTMLInputElement;
	input.click();
	one(document, '.korCal [data-day="2026-03-20"]').click();
	assert.ok(document.querySelector(".korCal"), "ilk basışta açık kalır");
	one(document, '.korCal [data-day="2026-03-10"]').click();
	Core.applyChanges();
	assert.deepEqual([model.getProperty("/a"), model.getProperty("/b")], ["2026-03-10", "2026-03-20"]);
	const el = one(field.getDomRef() as HTMLElement, "input") as HTMLInputElement;
	el.value = "1.4.2026 - 15.4.2026";
	key(el, "Enter");
	assert.deepEqual([model.getProperty("/a"), model.getProperty("/b")], ["2026-04-01", "2026-04-15"]);
	const shown = field.getId();
	Core.applyChanges();
	const again = one(document, `#${shown} input`) as HTMLInputElement;
	const before = again.value;
	key(again, "Enter");
	assert.strictEqual(again.value, before);
});

QUnit.test("Dialog: açılır, odak içeride, Esc kapatır, modele yazar, engellenebilir", async (assert) => {
	const model = new JSONModel({ open: false });
	let stop = true;
	const opener = new Button({ text: "Aç" });
	const dialog = new Dialog({ open: "{/open}", title: "Pencere", content: [new TextField({ label: "Ad" })], footer: [new Button({ text: "Tamam" })], close: (e: { preventDefault(): void }) => stop && e.preventDefault() } as never);
	opener.addDependent(dialog);
	opener.setModel(model);
	show(opener).focus();
	model.setProperty("/open", true);
	await wait(60);
	const dom = dialog.getDomRef() as HTMLElement;
	assert.ok(dom.getClientRects().length);
	assert.ok(dom.contains(document.activeElement));
	assert.strictEqual((document.activeElement as HTMLElement).tagName, "INPUT");
	const last = all(dom, ".korDialogFoot button")[0];
	last.focus();
	key(last, "Tab");
	assert.strictEqual(document.activeElement, one(dom, "[data-close]"), "odak başa döner");
	key(last, "Escape");
	assert.ok(dialog.getOpen(), "preventDefault açık tutar");
	stop = false;
	key(last, "Escape");
	assert.strictEqual(model.getProperty("/open"), false);
	await wait(60);
	assert.strictEqual(document.activeElement, opener.getDomRef(), "odak geri döner");
});

QUnit.test("Dialog içindeki Select ve menü katmanı çalışır", async (assert) => {
	const select = new SelectField({ label: "S", items: [new Item({ key: "1", text: "Ada" })] });
	const menu = new Button({ text: "M", menuItems: [new MenuItem({ key: "a", text: "A" })] });
	const dialog = new Dialog({ title: "P", content: [select, menu] });
	current.push(dialog);
	dialog.setOpen(true);
	await wait(60);
	one(select.getDomRef() as HTMLElement, "input").click();
	const list = one(document, ".korList");
	assert.ok(Number(list.style.zIndex) > Number(getComputedStyle(dialog.getDomRef() as Element).zIndex));
	list.querySelector("[data-i]")!.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true, cancelable: true }));
	assert.strictEqual(select.getSelectedKey(), "1");
	(menu.getDomRef() as HTMLElement).focus();
	(menu.getDomRef() as HTMLElement).click();
	await wait(60);
	assert.strictEqual((document.activeElement as HTMLElement).className.includes("korMenuItem"), true, "odak menüde kalır");
	dialog.setOpen(false);
});

QUnit.test("Confirm: yazmadan onaylanmaz, Esc hayır demektir", async (assert) => {
	const asked = Confirm.ask({ title: "Silinsin mi?", danger: true, type: "SİL" });
	await wait(60);
	const dom = one(document, ".korConfirm");
	const ok = all(dom, ".korDialogFoot button")[1] as HTMLButtonElement;
	assert.ok(ok.disabled);
	assert.strictEqual(dom.getAttribute("role"), "alertdialog");
	type(one(dom, "input") as HTMLInputElement, "SİL");
	Core.applyChanges();
	assert.notOk((all(dom, ".korDialogFoot button")[1] as HTMLButtonElement).disabled);
	all(dom, ".korDialogFoot button")[1].click();
	assert.strictEqual(await asked, true);
	const second = Confirm.ask({ title: "?" });
	await wait(60);
	key(one(document, ".korConfirm h2"), "Escape");
	assert.strictEqual(await second, false);
	await wait(30);
	assert.strictEqual(document.querySelector(".korConfirm"), null);
});

QUnit.test("Popover: açar, ikinci basış ve Esc kapatır", async (assert) => {
	const opener = new Button({ text: "Aç" });
	const popover = new Popover({ title: "P", content: [new Check({ text: "x" })] });
	opener.addDependent(popover);
	const dom = show(opener);
	popover.openBy(opener);
	await wait(60);
	assert.ok(popover.isOpen());
	assert.strictEqual(dom.getAttribute("aria-expanded"), "true");
	popover.openBy(opener);
	await wait(60);
	assert.notOk(popover.isOpen());
	popover.openBy(opener);
	await wait(60);
	key(popover.getDomRef() as HTMLElement, "Escape");
	await wait(60);
	assert.notOk(popover.isOpen());
});

QUnit.test("Tooltip: fareyle çıkar, Esc kapatır", async (assert) => {
	const button = new Button({ text: "B" });
	button.addDependent(new Tooltip({ text: "İpucu" }));
	const dom = show(button);
	dom.dispatchEvent(new PointerEvent("pointerover", { bubbles: true, pointerType: "mouse" }));
	await wait(520);
	assert.strictEqual(one(document, ".korTooltip").textContent, "İpucu");
	assert.strictEqual(dom.getAttribute("aria-describedby"), "kor-tooltip");
	key(document.body, "Escape");
	assert.strictEqual(document.querySelector(".korTooltip"), null);
	assert.notOk(dom.hasAttribute("aria-describedby"));
});

QUnit.test("Tabs: yalnız seçili içerik, oklar", (assert) => {
	const tabs = new Tabs({ items: [new Tab({ key: "a", text: "A", content: [new Text({ text: "bir" })] }), new Tab({ key: "b", text: "B", content: [new Text({ text: "iki" })] })] });
	const dom = show(tabs);
	assert.strictEqual(one(dom, "[role=tabpanel]").textContent, "bir");
	key(one(dom, "[role=tab]"), "ArrowRight");
	Core.applyChanges();
	assert.strictEqual(one(dom, "[role=tabpanel]").textContent, "iki");
	assert.strictEqual(tabs.getSelectedKey(), "b");
});

QUnit.test("Form.validate: boş zorunlular, başkasının hatası korunur", (assert) => {
	const name = new TextField({ label: "Ad", required: true });
	const tags = new MultiSelect({ label: "E", required: true, items: [new Item({ key: "1", text: "Bir" })] });
	const due = new DateField({ label: "T", required: true });
	const free = new TextField({ label: "S", error: "Sunucu hatası" });
	const form = new Form({ sections: [new FormSection({ title: "B", content: [name, tags, due, free] })] });
	show(form);
	assert.notOk(form.validate());
	assert.ok(name.getError() && tags.getError() && due.getError());
	name.setValue("x");
	tags.setSelectedKeys(["1"]);
	due.setValue("2026-01-05");
	assert.notOk(form.validate(), "sunucu hatası sürer");
	assert.strictEqual(name.getError(), "");
	assert.strictEqual(free.getError(), "Sunucu hatası");
	free.setError("");
	assert.ok(form.validate());
});

QUnit.test("MultiSelect: süz, ekle, geri sil; modele yazar", (assert) => {
	const model = new JSONModel({ k: ["1"] });
	const multi = new MultiSelect({ selectedKeys: "{/k}", items: [new Item({ key: "1", text: "Bir" }), new Item({ key: "2", text: "İki" })] } as never);
	multi.setModel(model);
	const input = one(show(multi), "input") as HTMLInputElement;
	type(input, "ik");
	key(input, "Enter");
	Core.applyChanges();
	assert.deepEqual(model.getProperty("/k"), ["1", "2"]);
	assert.strictEqual(all(multi.getDomRef() as HTMLElement, ".korToken").length, 2);
	key(one(multi.getDomRef() as HTMLElement, "input"), "Backspace");
	assert.deepEqual(model.getProperty("/k"), ["1"]);
});

QUnit.test("RadioGroup: basma ve oklar", (assert) => {
	const radio = new RadioGroup({ items: [new RadioItem({ key: "a", text: "A" }), new RadioItem({ key: "b", text: "B" })] });
	const dom = show(radio);
	all(dom, "[role=radio]")[0].click();
	key(all(dom, "[role=radio]")[0], "ArrowDown");
	assert.strictEqual(radio.getSelectedKey(), "b");
});

QUnit.test("FileDrop: tür ve boyut denetimi", (assert) => {
	let added: File[] = [];
	const drop = new FileDrop({ accept: ".pdf,image/*", maxSize: 0.001, add: (e: { getParameters(): object }) => (added = (e.getParameters() as { files: File[] }).files) } as never);
	const dom = show(drop);
	const data = new DataTransfer();
	[new File(["x"], "a.pdf"), new File(["x"], "b.exe"), new File(["x".repeat(3000)], "c.PDF"), new File(["x"], "d.png", { type: "image/png" })].forEach((f) => data.items.add(f));
	dom.dispatchEvent(new DragEvent("drop", { dataTransfer: data, bubbles: true, cancelable: true }));
	Core.applyChanges();
	assert.deepEqual(added.map((f) => f.name), ["a.pdf", "d.png"]);
	const text = one(drop.getDomRef() as HTMLElement, "[role=alert]").textContent!;
	assert.ok(text.includes("b.exe") && text.includes("c.PDF"), text);
});

QUnit.test("MessageList: sıra, süzme, hedefe odak; UI5 türleri", (assert) => {
	const target = new TextField({ label: "Hedef" });
	show(target);
	const list = new MessageList({ items: [new MessageItem({ state: "Information", title: "bilgi" }), new MessageItem({ state: "Error", title: "hata", target: target.getId() })] });
	const dom = show(list);
	assert.strictEqual(one(dom, ".korMessageTitle").textContent, "hata");
	one(dom, ".korMessageItem").click();
	assert.strictEqual(document.activeElement, target.getFocusDomRef());
	one(dom, "[data-state=info]").click();
	Core.applyChanges();
	assert.strictEqual(all(dom, ".korMessageItem").length, 1);
});

QUnit.test("Message kapanır; Skeleton içeriğe döner", (assert) => {
	const strip = new Message({ state: "Error", title: "x", closable: true });
	const dom = show(strip);
	assert.strictEqual(dom.getAttribute("role"), "alert");
	one(dom, "[data-close]").click();
	assert.notOk(strip.getVisible());
	const sk = new Skeleton({ content: [new Text({ text: "geldi" })] });
	const bones = show(sk);
	assert.strictEqual(bones.getAttribute("aria-busy"), "true");
	sk.setLoading(false);
	Core.applyChanges();
	assert.strictEqual((sk.getDomRef() as HTMLElement).textContent, "geldi");
});

QUnit.test("DataGrid: sütun gizle, sırala, durum geri yükle", (assert) => {
	const button = new Button({ text: "S" });
	show(button);
	const { grid: control } = grid(5);
	// UIArea yeniden çizilebilir; DOM her seferinde tazelenir
	const dom = { querySelector: (q: string) => control.getDomRef()!.querySelector(q), querySelectorAll: (q: string) => control.getDomRef()!.querySelectorAll(q) } as unknown as ParentNode;
	let told = 0;
	control.attachEvent("stateChange", () => told++);
	const before = JSON.parse(JSON.stringify(control.getState())) as object;
	control.openSettings(button);
	one(document, "[data-down='0']").click();
	assert.strictEqual(one(dom, "[role=columnheader][aria-colindex='1']").textContent, "Tutar");
	one(document, "[data-toggle='0']").click();
	assert.strictEqual(all(dom, "[role=columnheader][aria-colindex]").length, 1);
	one(document, "[data-toggle='1']").click();
	assert.strictEqual(all(dom, "[role=columnheader][aria-colindex]").length, 1, "son sütun gizlenmez");
	assert.strictEqual(told, 2);
	const state = JSON.parse(JSON.stringify(control.getState())) as object;
	control.setState(before as never);
	assert.strictEqual(all(dom, "[role=columnheader][aria-colindex]").length, 2);
	control.setState({ ...state, order: ["yok", "amount"], sort: "yok" } as never);
	assert.strictEqual(all(dom, "[role=columnheader][aria-colindex]").length, 1);
	control.setState({ sort: "amount", desc: true });
	assert.strictEqual(one(dom, '[data-row="0"][data-col="0"]').textContent, "S4");
	one(document, ".korColumns").dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
	assert.strictEqual(document.querySelector(".korColumns"), null);
});

function lookup(more: object = {}): { field: LookupField; input: HTMLInputElement; model: JSONModel } {
	const model = new JSONModel({ v: "", t: "", s: [], rows: Array.from({ length: 30 }, (_, i) => ({ id: `${100 + i}`, name: i === 3 ? "Deniz" : i === 4 ? "Denizli" : `Firma ${i}` })) });
	const field = new LookupField({ label: "Müşteri", value: "{/v}", text: "{/t}", ...more } as never);
	field.setModel(model);
	field.bindAggregation("rows", { path: "/rows" } as never);
	return { field, input: one(show(field), "input") as HTMLInputElement, model };
}

QUnit.test("LookupField: önerir, seçer, tam metni tanır, bulamayınca uyarır", (assert) => {
	const { field, input, model } = lookup();
	let changed = 0;
	field.attachEvent("change", () => changed++);
	type(input, "deni");
	assert.strictEqual(all(document, ".korLookupItem").length, 2);
	key(input, "ArrowDown");
	key(input, "Enter");
	Core.applyChanges();
	assert.deepEqual([model.getProperty("/v"), model.getProperty("/t")], ["104", "Denizli"]);
	const write = (text: string) => {
		const el = one(field.getDomRef() as HTMLElement, "input") as HTMLInputElement;
		type(el, text);
		key(el, "Escape");
		key(el, "Enter");
		Core.applyChanges();
	};
	write("deniz");
	assert.strictEqual(model.getProperty("/v"), "103", "tam eşleşme benzerinden önce gelir");
	write("107");
	assert.strictEqual(model.getProperty("/t"), "Firma 7");
	write("yok böyle");
	assert.ok(one(field.getDomRef() as HTMLElement, ".korNote"));
	assert.strictEqual(model.getProperty("/v"), "107", "geçersiz yazı değeri bozmaz");
	write("");
	assert.strictEqual(model.getProperty("/v"), "");
	assert.strictEqual(changed, 4);
});

QUnit.test("LookupField: F4 penceresi, Enter seçer; çoklu seçim", async (assert) => {
	const { input, model } = lookup();
	input.focus();
	key(input, "F4");
	await wait(80);
	Core.applyChanges();
	const scroll = one(document, ".korDialog [role=grid]");
	assert.strictEqual(scroll.getAttribute("aria-rowcount"), "31");
	scroll.focus();
	key(scroll, "ArrowDown");
	key(scroll, "Enter");
	assert.strictEqual(model.getProperty("/v"), "101");
	await wait(80);
	const multi = lookup({ multiple: true, selection: "{/s}" });
	key(multi.input, "F4");
	await wait(80);
	Core.applyChanges();
	const dialog = all(document, ".korDialog").find((d) => d.querySelector("[data-pick]"))!;
	all(dialog, "[data-pick]")[0].click();
	all(dialog, "[data-pick]")[2].click();
	Core.applyChanges();
	all(dialog, ".korDialogFoot button")[1].click();
	Core.applyChanges();
	assert.deepEqual((multi.model.getProperty("/s") as { key: string }[]).map((e) => e.key), ["100", "102"]);
	assert.strictEqual(all(multi.field.getDomRef() as HTMLElement, ".korToken").length, 2);
	key(one(multi.field.getDomRef() as HTMLElement, "input"), "Backspace");
	assert.strictEqual((multi.model.getProperty("/s") as object[]).length, 1);
});

QUnit.test("Variants: değişikliği fark eder, kaydeder, uygular, varsayılanla açılır, siler", async (assert) => {
	localStorage.removeItem("kor-test");
	const { grid: control } = grid(5);
	const dom = { querySelector: (q: string) => control.getDomRef()!.querySelector(q), querySelectorAll: (q: string) => control.getDomRef()!.querySelectorAll(q) } as unknown as ParentNode;
	const bar = new FilterBar({ fields: [new FilterField({ label: "No", path: "id" })], change: (e) => (control.getBinding("rows") as ListBinding).filter((e.getParameters() as unknown as { filters: Filter[] }).filters) });
	show(bar);
	const make = () => new Variants({ storageKey: "kor-test", targets: [control, bar] } as never);
	let variants = make();
	show(variants);
	assert.strictEqual(variants.getDomRef()!.querySelector(".korVariantDirty"), null);
	bar.addToken("id", "Contains", "3");
	control.setState({ hidden: ["amount"] });
	control.fireEvent("stateChange");
	Core.applyChanges();
	assert.ok(variants.getDomRef()!.querySelector(".korVariantDirty"), "kaydedilmemiş işareti");
	variants.saveAs("Üçler", { isDefault: true });
	Core.applyChanges();
	assert.ok(variants.getDomRef()!.textContent!.includes("Üçler"));
	variants.apply("standard");
	Core.applyChanges();
	assert.strictEqual(one(dom, "[role=grid]").getAttribute("aria-rowcount"), "6");
	assert.strictEqual(all(dom, "[role=columnheader][aria-colindex]").length, 2);
	variants.destroy();
	variants = make();
	show(variants);
	Core.applyChanges();
	assert.strictEqual(one(dom, "[role=grid]").getAttribute("aria-rowcount"), "2", "varsayılan açılışta uygulanır");
	(variants.getDomRef() as HTMLElement).click();
	one(document, "[data-go=manage]").click();
	one(document, "[data-do=delete]").click();
	await wait(60);
	all(document, ".korConfirm .korDialogFoot button")[1].click();
	await wait(60);
	assert.strictEqual((variants.getVariants() as object[]).length, 0);
	assert.strictEqual(variants.getSelectedKey(), "standard");
	localStorage.removeItem("kor-test");
});

QUnit.test("TreeGrid: düzeyler, oklar, düğme, düzenleme, seçim, durum", (assert) => {
	const model = new JSONModel({ n: [{ t: "A", v: 1, c: [{ t: "A1", v: 2, c: [{ t: "A1a", v: 3 }] }, { t: "A2", v: 4 }] }, { t: "B", v: 5 }] });
	const tree = new TreeGrid({ height: "400px", selectionMode: "Multi", columns: [new Column({ label: "Ad", path: "t", pinned: true }), new Column({ label: "D", path: "v", type: "number", editable: true })] } as never);
	tree.setModel(model);
	tree.bindAggregation("rows", { path: "/n", parameters: { arrayNames: ["c"] } } as never);
	const dom = show(tree);
	const names = () => all(dom, '.korRow [data-col="0"]').sort((a, b) => Number(a.dataset.row) - Number(b.dataset.row)).map((el) => el.textContent).join();
	assert.strictEqual(one(dom, "[tabindex='0']").getAttribute("role"), "treegrid");
	assert.strictEqual(names(), "A,A1,A2,B");
	one(dom, '[data-row="1"] [data-twist]').click();
	assert.strictEqual(names(), "A,A1,A1a,A2,B");
	const row = () => all(dom, ".korRow").find((el) => el.textContent!.startsWith("A1a"))!;
	assert.strictEqual(row().getAttribute("aria-level"), "3");
	const scroll = one(dom, "[role=treegrid]");
	scroll.focus();
	key(scroll, "ArrowLeft");
	assert.strictEqual(names(), "A,B");
	key(scroll, "ArrowRight");
	assert.strictEqual(names(), "A,A1,A1a,A2,B", "alt dal açık kalmış");
	key(scroll, "ArrowDown");
	key(scroll, "ArrowDown");
	key(scroll, "ArrowLeft");
	key(scroll, "ArrowLeft");
	assert.strictEqual(names(), "A,A1,A2,B", "soldan üste çıkar ve kapatır");
	key(scroll, "ArrowRight", { shiftKey: true });
	const state = tree.getState();
	tree.expandToLevel(0);
	assert.strictEqual(names(), "A,B");
	tree.setState(state as never);
	assert.strictEqual(names(), "A,A1,A2,B");
	all(dom, "[data-pick]")[1].click();
	assert.strictEqual(tree.getSelectedContexts()[0].getProperty("t"), "A1");
	key(scroll, "Home", { ctrlKey: true });
	key(scroll, "ArrowRight");
	key(scroll, "F2");
	const input = one(dom, "input.korCellEditor") as HTMLInputElement;
	input.value = "42";
	key(input, "Enter");
	assert.strictEqual(model.getProperty("/n/0/v"), 42);
});

QUnit.test("Yerel biçim: yüzde ve kısa tarih dile uyar", (assert) => {
	const config = Core.getConfiguration();
	assert.strictEqual(pct(8.4, 1), "%8,4");
	assert.strictEqual(dayText("2026-03-02"), "02.03.2026");
	config.setLanguage("en");
	assert.strictEqual(pct(8.4, 1), "8.4%");
	assert.strictEqual(dayText("2026-03-02"), "03/02/2026");
	assert.strictEqual(parseNum("45%"), 45);
	config.setLanguage("tr");
});
