import Accordion from "kor/ui/Accordion";
import AccordionItem from "kor/ui/AccordionItem";
import BankCard from "kor/ui/BankCard";
import BankLogo from "kor/ui/BankLogo";
import BarChart from "kor/ui/BarChart";
import Breadcrumbs from "kor/ui/Breadcrumbs";
import CalendarEvent from "kor/ui/CalendarEvent";
import Card from "kor/ui/Card";
import Classroom from "kor/ui/Classroom";
import ColumnLayout from "kor/ui/ColumnLayout";
import Compare from "kor/ui/Compare";
import CompareColumn from "kor/ui/CompareColumn";
import CompareRow from "kor/ui/CompareRow";
import CourseModule from "kor/ui/CourseModule";
import CoursePath from "kor/ui/CoursePath";
import Crumb from "kor/ui/Crumb";
import DateTimeField from "kor/ui/DateTimeField";
import DeliveryRoute from "kor/ui/DeliveryRoute";
import DeliveryStop from "kor/ui/DeliveryStop";
import Detail from "kor/ui/Detail";
import Details from "kor/ui/Details";
import Dock from "kor/ui/Dock";
import DockBoard from "kor/ui/DockBoard";
import DockTruck from "kor/ui/DockTruck";
import Form from "kor/ui/Form";
import FormSection from "kor/ui/FormSection";
import HeatCell from "kor/ui/HeatCell";
import Heatmap from "kor/ui/Heatmap";
import Inbox from "kor/ui/Inbox";
import InboxItem from "kor/ui/InboxItem";
import Installment from "kor/ui/Installment";
import Installments from "kor/ui/Installments";
import LeaveBalance from "kor/ui/LeaveBalance";
import Lesson from "kor/ui/Lesson";
import Link from "kor/ui/Link";
import List from "kor/ui/List";
import ListItem from "kor/ui/ListItem";
import LoadItem from "kor/ui/LoadItem";
import LoadPlan from "kor/ui/LoadPlan";
import MachineCard from "kor/ui/MachineCard";
import MachineSpan from "kor/ui/MachineSpan";
import MonthCalendar from "kor/ui/MonthCalendar";
import OrgChart from "kor/ui/OrgChart";
import OrgPerson from "kor/ui/OrgPerson";
import PieChart from "kor/ui/PieChart";
import PieSlice from "kor/ui/PieSlice";
import Pivot from "kor/ui/Pivot";
import ProductionLine from "kor/ui/ProductionLine";
import ProductionStation from "kor/ui/ProductionStation";
import Progress from "kor/ui/Progress";
import PromptField from "kor/ui/PromptField";
import Rating from "kor/ui/Rating";
import RecordPage from "kor/ui/RecordPage";
import RecordSection from "kor/ui/RecordSection";
import ShiftEntry from "kor/ui/ShiftEntry";
import Series from "kor/ui/Series";
import ShiftRoster from "kor/ui/ShiftRoster";
import ShiftType from "kor/ui/ShiftType";
import Shipment from "kor/ui/Shipment";
import ShipmentStop from "kor/ui/ShipmentStop";
import Slider from "kor/ui/Slider";
import Splitter from "kor/ui/Splitter";
import Statement from "kor/ui/Statement";
import Student from "kor/ui/Student";
import TalentGrid from "kor/ui/TalentGrid";
import TalentPerson from "kor/ui/TalentPerson";
import Text from "kor/ui/Text";
import TextField from "kor/ui/TextField";
import TimeField from "kor/ui/TimeField";
import Timetable from "kor/ui/Timetable";
import Transaction from "kor/ui/Transaction";
import TreeField from "kor/ui/TreeField";
import TreeItem from "kor/ui/TreeItem";
import Waterfall from "kor/ui/Waterfall";
import WaterfallStep from "kor/ui/WaterfallStep";
import Wizard from "kor/ui/Wizard";
import WizardStep from "kor/ui/WizardStep";
import Flag from "kor/ui/Flag";
import { bankInfo, clearBankLogos, registerBankLogos, setBankLogoProvider } from "kor/ui/bankLogos";
import { flagNames, isoCodes } from "kor/ui/flags";
import { icons } from "kor/ui/icons";
import { processIcons, productIcon } from "kor/ui/processes";
import { minutesOf, readTime, timeValue } from "kor/ui/time";
import { countryName, flagCode, safeHref } from "kor/ui/util";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
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
const apply = () => Core.applyChanges();
const params = (e: unknown) => (e as { getParameters(): Record<string, unknown> }).getParameters();

QUnit.module("Sector", {
	afterEach: () => {
		current.forEach((c) => c.destroy());
		current = [];
		document.querySelectorAll(".korFloat, .korToast").forEach((el) => el.remove());
	}
});

QUnit.test("Simgeler: süreç ve ürün adlarının hepsi var", (assert) => {
	assert.deepEqual(Object.entries(processIcons).filter(([, icon]) => !icons[icon]), []);
	["textile", "automotive", "food", "beverage", "pharma", "electronics", "furniture", "metal", "packaging", "chemical", "construction", "energy"].forEach((s) => assert.ok(icons[productIcon(s)], s));
	["nfc", "snowflake", "maximize-2", "minimize-2", "square", "award", "video", "palmtree"].forEach((s) => assert.ok(icons[s], s));
});

QUnit.test("Link: betik adresi açılmaz, düğmeye döner", (assert) => {
	assert.strictEqual(safeHref("javascript:alert(1)"), "");
	assert.strictEqual(safeHref("java\nscript:alert(1)"), "");
	assert.strictEqual(safeHref("#/x"), "#/x");
	let pressed = 0;
	const dom = show(new Link({ text: "A", href: "javascript:alert(1)", press: () => pressed++ }));
	assert.strictEqual(dom.tagName, "BUTTON");
	dom.click();
	assert.strictEqual(pressed, 1);
	assert.strictEqual(show(new Link({ text: "A", href: "#x", target: "_blank" })).getAttribute("rel"), "noopener noreferrer");
});

QUnit.test("Breadcrumbs: dar yerde ortadakiler menüye girer", async (assert) => {
	let chosen = "";
	const crumbs = new Breadcrumbs({ items: ["Ana sayfa", "Satış", "Siparişler", "2026", "4711"].map((text, i) => new Crumb({ key: `k${i}`, text: text + " uzun bir ad" })), select: (e: unknown) => (chosen = String(params(e).key)) } as never);
	const dom = show(crumbs);
	one(document, "#qunit-fixture").style.width = "420px";
	await wait(80);
	one(dom, "[data-more]").click();
	const hidden = all(document, ".korMenu [data-i]");
	assert.ok(hidden.length > 0 && hidden.length < 4);
	hidden[0].click();
	assert.strictEqual(chosen, "k1");
	one(document, "#qunit-fixture").style.width = "";
});

QUnit.test("Accordion: tek açık, iç içe karışmaz", (assert) => {
	const inner = new Accordion({ items: [new AccordionItem({ key: "x", title: "X" })] });
	const acc = new Accordion({ multiple: false, items: [new AccordionItem({ title: "A", open: true, content: [inner] }), new AccordionItem({ title: "B", content: [new Text({ text: "b" })] })] });
	let dom = show(acc);
	one(dom, ".korAccBody .korAccHead button").click();
	apply();
	assert.ok(acc.getItems()[0].getOpen());
	assert.ok(inner.getItems()[0].getOpen());
	dom = acc.getDomRef() as HTMLElement;
	(document.getElementById(`${acc.getItems()[1].getId()}-b`) as HTMLElement).click();
	apply();
	assert.deepEqual(acc.getItems().map((i) => i.getOpen()), [false, true]);
});

QUnit.test("Card, Details, Progress", (assert) => {
	let pressed = 0;
	const card = show(new Card({ title: "K", state: "wait", press: () => pressed++ }));
	one(card, "h3 button").click();
	assert.strictEqual(pressed, 1);
	const details = show(new Details({ items: [new Detail({ label: "No", value: "4711", copyable: true }), new Detail({ label: "Boş" })] }));
	assert.strictEqual(all(details, ".korCopy").length, 1);
	const bar = show(new Progress({ value: 30, max: 120 }));
	assert.strictEqual(bar.getAttribute("aria-valuenow"), "30");
	assert.strictEqual(bar.style.getPropertyValue("--kor-part"), "0.25");
	assert.notOk(show(new Progress({ value: -1 })).hasAttribute("aria-valuenow"));
});

QUnit.test("Rating: tıklama, aynı yıldız siler, klavye, salt okunur", (assert) => {
	const rating = new Rating({ value: 2 });
	show(rating);
	const star = (n: number) => one(rating.getDomRef() as HTMLElement, `[data-star="${n}"]`);
	star(4).click();
	apply();
	assert.strictEqual(rating.getValue(), 4);
	star(4).click();
	apply();
	assert.strictEqual(rating.getValue(), 0);
	key(one(rating.getDomRef() as HTMLElement, ".korStars"), "ArrowRight");
	assert.strictEqual(rating.getValue(), 1);
	rating.setReadOnly(true);
	apply();
	star(5).click();
	assert.strictEqual(rating.getValue(), 1);
});

QUnit.test("Slider: klavye, aralık sınırı, ondalık adım", (assert) => {
	let changes = 0;
	const slider = new Slider({ value: 20, to: 40, range: true, step: 10, change: () => changes++ });
	const dom = show(slider);
	const [a, b] = all(dom, "[role=slider]");
	key(a, "End");
	assert.strictEqual(slider.getValue(), 40, "bitişi aşamaz");
	key(b, "Home");
	assert.strictEqual(slider.getTo(), 40, "başlangıcın altına inemez");
	key(b, "ArrowRight");
	assert.strictEqual(slider.getTo(), 50);
	assert.strictEqual(changes, 2);
	const fine = new Slider({ value: 0.1, min: 0, max: 1, step: 0.1, decimals: 1 });
	key(one(show(fine), "[role=slider]"), "ArrowRight");
	assert.strictEqual(fine.getValue(), 0.2);
});

QUnit.test("Slider: sürükleme", (assert) => {
	const slider = new Slider({ value: 0 });
	const dom = show(slider);
	dom.style.width = "400px";
	const track = one(dom, ".korSliderTrack");
	track.setPointerCapture = () => undefined;
	const rect = track.getBoundingClientRect();
	const at = (type: string, part: number) => track.dispatchEvent(new PointerEvent(type, { bubbles: true, button: 0, clientX: rect.left + rect.width * part }));
	at("pointerdown", 0.25);
	assert.strictEqual(slider.getValue(), 25);
	at("pointermove", 0.75);
	at("pointerup", 0.75);
	assert.strictEqual(slider.getValue(), 75);
});

QUnit.test("List: çoklu seçim, klavye, kapalı satır, grup", (assert) => {
	const list = new List({ mode: "multi", items: ["a", "b", "c"].map((k, i) => new ListItem({ key: k, title: k, group: i ? "G2" : "G1", enabled: k !== "c" })) });
	const dom = show(list);
	assert.strictEqual(all(dom, ".korListGroup").length, 2);
	all(dom, "[data-i]").forEach((row) => row.click());
	apply();
	assert.deepEqual(list.getSelectedKeys(), ["a", "b"]);
	const rows = () => all(list.getDomRef() as HTMLElement, "[data-i]");
	key(rows()[0], "ArrowDown");
	assert.strictEqual(document.activeElement, rows()[1]);
	key(rows()[1], " ");
	assert.deepEqual(list.getSelectedKeys(), ["a"]);
});

QUnit.test("Saat okuma ve yazma", (assert) => {
	const of = (text: string) => readTime(text);
	assert.strictEqual(of("9"), 540);
	assert.strictEqual(of("930"), 570);
	assert.strictEqual(of("14.30"), 870);
	assert.strictEqual(of("2:30 pm"), 870);
	assert.strictEqual(of("12 am"), 0);
	assert.strictEqual(of("25:00"), undefined);
	assert.strictEqual(of("13 pm"), undefined);
	assert.strictEqual(of("abc"), undefined);
	assert.strictEqual(minutesOf({ ms: 34200000, __edmType: "Edm.Time" }), 570);
	assert.deepEqual(timeValue(570, { ms: 0 }), { __edmType: "Edm.Time", ms: 34200000 });
	assert.strictEqual(timeValue(570, "08:00:00"), "09:30:00");
	assert.strictEqual(timeValue(570, "08:00"), "09:30");
});

QUnit.test("TimeField: yazma, sınır, liste, saniye korunur", (assert) => {
	const field = new TimeField({ value: "08:15:42", min: "08:00", max: "18:00" });
	show(field);
	const input = () => field.getDomRef("in") as unknown as HTMLInputElement;
	const put = (text: string) => {
		input().focus();
		input().value = text;
		key(input(), "Enter");
		apply();
	};
	put("8:15");
	assert.strictEqual(field.getValue(), "08:15:42");
	put("22:00");
	assert.strictEqual(field.getValue(), "08:15:42");
	assert.strictEqual(input().getAttribute("aria-invalid"), "true");
	put("9.45");
	assert.strictEqual(field.getValue(), "09:45:00");
	input().click();
	key(input(), "ArrowDown");
	key(input(), "Enter");
	apply();
	assert.strictEqual(field.getValue(), "10:00:00");
	put("");
	assert.strictEqual(field.getValue(), null);
});

QUnit.test("DateTimeField: ISO ve Date, yarım değer, silme", (assert) => {
	const local = new Date(2026, 10, 25, 9, 30);
	const field = new DateTimeField({ value: local.toISOString() });
	show(field);
	const time = () => document.getElementById(`${field.getId()}-time-in`) as HTMLInputElement;
	const day = () => document.getElementById(`${field.getId()}-day-in`) as HTMLInputElement;
	const put = (input: HTMLInputElement, text: string) => {
		input.focus();
		input.value = text;
		key(input, "Enter");
		apply();
	};
	assert.strictEqual(minutesOf((Core.byId(`${field.getId()}-time`) as TimeField).getValue()), 570);
	put(time(), "14:00");
	assert.strictEqual(field.getValue(), new Date(2026, 10, 25, 14).toISOString().replace(".000Z", "Z"));
	put(time(), "");
	assert.strictEqual(field.getValue(), null, "saatsiz gün değer değildir");
	assert.ok(day().value, "gün yazısı kalır");
	put(time(), "10:00");
	assert.strictEqual(new Date(field.getValue() as string).getTime(), new Date(2026, 10, 25, 10).getTime());
	put(day(), "");
	assert.strictEqual(field.getValue(), null);
	assert.strictEqual(time().value, "");
	const asDate = new DateTimeField({ value: local });
	show(asDate);
	const input = document.getElementById(`${asDate.getId()}-time-in`) as HTMLInputElement;
	put(input, "0:05");
	assert.ok((asDate.getValue() as unknown) instanceof Date);
	asDate.setValue(new Date(2027, 0, 1, 23, 59));
	apply();
	assert.strictEqual(minutesOf((Core.byId(`${asDate.getId()}-time`) as TimeField).getValue()), 1439);
});

QUnit.test("TreeField: süzme dalı açar, yalnız uç seçilir, yol görünür", (assert) => {
	const tree = new TreeField({ leafOnly: true, items: [["tr", "", "Türkiye"], ["ist", "tr", "İstanbul"], ["kad", "ist", "Kadıköy"], ["de", "", "Almanya"]].map(([k, p, t]) => new TreeItem({ key: k, parentKey: p, text: t })) });
	show(tree);
	const input = tree.getDomRef("in") as unknown as HTMLInputElement;
	input.focus();
	input.click();
	assert.strictEqual(all(document, "[role=treeitem]").length, 2);
	key(input, "ArrowRight");
	assert.strictEqual(all(document, "[role=treeitem]").length, 3);
	input.value = "kadi";
	input.dispatchEvent(new Event("input", { bubbles: true }));
	key(input, "Enter");
	assert.strictEqual(tree.getSelectedKey(), "kad");
	assert.strictEqual(input.value, "Türkiye / İstanbul / Kadıköy");
});

QUnit.test("TreeField: döngülü veri takılmaz", (assert) => {
	const tree = new TreeField({ selectedKey: "a", items: [new TreeItem({ key: "a", parentKey: "b", text: "A" }), new TreeItem({ key: "b", parentKey: "a", text: "B" })] });
	show(tree);
	assert.ok((tree.getDomRef("in") as unknown as HTMLInputElement).value);
});

QUnit.test("PromptField: Enter gönderir, Shift+Enter göndermez, sınır, durdurma", (assert) => {
	const sent: string[] = [];
	let stops = 0;
	const field = new PromptField({ maxLength: 5, submit: (e: unknown) => void sent.push(String(params(e).value)), stop: () => stops++ } as never);
	const dom = show(field);
	const input = one(dom, "textarea") as HTMLTextAreaElement;
	const put = (text: string) => {
		input.value = text;
		input.dispatchEvent(new Event("input", { bubbles: true }));
	};
	put("merhaba");
	key(input, "Enter");
	assert.deepEqual(sent, [], "sınır aşıldı");
	put("selam");
	key(input, "Enter", { shiftKey: true });
	key(input, "Enter", { isComposing: true });
	assert.deepEqual(sent, []);
	key(input, "Enter");
	assert.deepEqual(sent, ["selam"]);
	assert.strictEqual(field.getValue(), "");
	field.setWorking(true);
	apply();
	one(field.getDomRef() as HTMLElement, "[data-send]").click();
	assert.strictEqual(stops, 1);
});

QUnit.test("Wizard: form doğrulanır, preventDefault, bitiş", async (assert) => {
	let finished = 0;
	const name = new TextField({ required: true });
	const wizard = new Wizard({ steps: [new WizardStep({ title: "1", content: [new Form({ sections: [new FormSection({ content: [name] })] })] }), new WizardStep({ title: "2" })], finish: () => finished++ });
	show(wizard);
	const click = (what: string) => {
		one(wizard.getDomRef() as HTMLElement, `[data-wiz="${what}"]`).click();
		apply();
	};
	click("next");
	assert.strictEqual(wizard.getCurrent(), 0);
	assert.ok(name.getError());
	name.setValue("A");
	const stop = (e: { preventDefault(): void }) => e.preventDefault();
	wizard.attachEvent("stepChange", stop as never);
	click("next");
	assert.strictEqual(wizard.getCurrent(), 0);
	wizard.detachEvent("stepChange", stop as never);
	click("next");
	assert.strictEqual(wizard.getCurrent(), 1);
	click("next");
	assert.strictEqual(finished, 1);
	click("back");
	assert.strictEqual(wizard.getCurrent(), 0);
	assert.notOk((one(wizard.getDomRef() as HTMLElement, '[data-wiz="1"]') as HTMLButtonElement).disabled, "görülen adıma dönülür");
	await wait(20);
});

QUnit.test("Splitter ve ColumnLayout", async (assert) => {
	const split = new Splitter({ height: "200px", min: 100, start: [new Text({ text: "a" })], end: [new Text({ text: "b" })] });
	const dom = show(split);
	dom.style.width = "1000px";
	const bar = one(dom, "[role=separator]");
	key(bar, "ArrowRight");
	assert.strictEqual(split.getPosition(), 52);
	key(bar, "Home");
	assert.strictEqual(split.getPosition(), 10, "en az 100 piksel");
	key(bar, "Enter");
	assert.strictEqual(split.getPosition(), 0);
	key(bar, "Enter");
	assert.strictEqual(split.getPosition(), 10);
	const cols = new ColumnLayout({ columns: 3, height: "300px", list: [new Text({ text: "l" })], record: [new Text({ text: "r" })], detail: [new Text({ text: "d" })] });
	const root = show(cols);
	const seen = () => [...(cols.getDomRef() as HTMLElement).children].filter((el) => !(el as HTMLElement).hidden).length;
	root.style.width = "1200px";
	await wait(60);
	assert.strictEqual(seen(), 3);
	root.style.width = "800px";
	await wait(60);
	assert.strictEqual(seen(), 2);
	root.style.width = "400px";
	await wait(60);
	assert.strictEqual(seen(), 1);
	one(cols.getDomRef() as HTMLElement, ".korColBack").click();
	apply();
	assert.strictEqual(cols.getColumns(), 2);
});

QUnit.test("RecordPage: bölüme kaydırma", async (assert) => {
	const page = new RecordPage({ title: "K", height: "240px", sections: ["a", "b", "c"].map((k) => new RecordSection({ key: k, title: k, content: [new Splitter({ height: "300px" })] })) });
	let at = "";
	page.attachEvent("sectionChange", ((e: unknown) => (at = String(params(e).key))) as never);
	const dom = show(page);
	one(dom, '[data-sec="1"]').click();
	assert.strictEqual(at, "b");
	await wait(800);
	dom.scrollTop = dom.scrollHeight;
	await wait(150);
	assert.strictEqual(at, "c");
});

QUnit.test("Inbox: okundu, süzgeç, tümü", (assert) => {
	const inbox = new Inbox({ items: ["a", "b", "c"].map((k) => new InboxItem({ key: k, title: k })) });
	show(inbox);
	const dom = () => inbox.getDomRef() as HTMLElement;
	all(dom(), '[data-inbox="open"]')[0].click();
	apply();
	assert.notOk(inbox.getItems()[0].getUnread());
	one(dom(), '[data-inbox="unread"]').click();
	apply();
	assert.strictEqual(all(dom(), "li").length, 2);
	one(dom(), '[data-inbox="read"]').click();
	apply();
	assert.strictEqual(all(dom(), "li").length, 0);
});

QUnit.test("MonthCalendar: çok günlü etkinlik, taşma, klavye, ay sonu", (assert) => {
	const days: string[] = [];
	const cal = new MonthCalendar({ date: "2026-01-31", events: [new CalendarEvent({ key: "a", title: "A", start: "2026-01-30", end: "2026-02-02" }), ...[1, 2, 3].map((n) => new CalendarEvent({ key: `x${n}`, title: `X${n}`, start: "2026-01-30" }))], daySelect: (e: unknown) => void days.push(String(params(e).date)) } as never);
	show(cal);
	const cell = (d: string) => one(cal.getDomRef() as HTMLElement, `[data-day="${d}"]`);
	assert.strictEqual(all(cell("2026-01-31"), ".korMonthGoes").length, 1);
	assert.strictEqual(all(cell("2026-01-30"), ".korMonthChip").length, 2);
	assert.ok(one(cell("2026-01-30"), ".korMonthMore"));
	key(cell("2026-01-31"), "ArrowRight");
	apply();
	assert.strictEqual(cal.getDate(), "2026-02-01");
	cal.setDate("2026-01-31");
	apply();
	key(cell("2026-01-31"), "PageDown");
	apply();
	assert.strictEqual(cal.getDate(), "2026-02-28");
	assert.deepEqual(days, ["2026-02-01", "2026-02-28"]);
	assert.strictEqual(document.activeElement, cell("2026-02-28"));
});

QUnit.test("Compare: fark, en iyi, yalnız farklar", (assert) => {
	const compare = new Compare({ columns: ["A", "B"].map((t) => new CompareColumn({ key: t, title: t })), rows: [new CompareRow({ label: "Fiyat", values: [100, 90], best: "min" }), new CompareRow({ label: "Teslim", values: ["5 gün", "5 gün"] })] });
	show(compare);
	const dom = () => compare.getDomRef() as HTMLElement;
	assert.strictEqual(all(dom(), ".korCompareDiff").length, 1);
	assert.ok(one(dom(), ".korCompareBest").textContent?.includes("90"));
	one(dom(), "[data-diff]").click();
	apply();
	assert.strictEqual(all(dom(), "tbody tr").length, 1);
});

QUnit.test("Heatmap, Waterfall", (assert) => {
	let hit = "";
	const heat = show(new Heatmap({ cells: [new HeatCell({ row: "Pzt", column: "08", value: 4 }), new HeatCell({ row: "Sal", column: "10", value: -2 })], cellPress: (e: unknown) => (hit = String(params(e).row)) } as never));
	assert.strictEqual(all(heat, ".korHeatCell").length, 2);
	assert.strictEqual(all(heat, ".korHeatMinus").length, 1);
	all(heat, ".korHeatCell")[1].click();
	assert.strictEqual(hit, "Sal");
	const fall = new Waterfall({ steps: [new WaterfallStep({ label: "Baş", value: 100, kind: "total" }), new WaterfallStep({ label: "Gider", value: -130 }), new WaterfallStep({ label: "Gelir", value: "50" as never }), new WaterfallStep({ label: "Son", kind: "total" })] });
	show(fall);
	assert.deepEqual(fall.getRanges().map((r) => r.to), [100, -30, 20, 20]);
});

QUnit.test("PieChart: pay, Diğer, eksi değer, tıklama", (assert) => {
	let hit: Record<string, unknown> = {};
	const values: unknown[] = ["40.0", 30, 10, 8, 6, 4, 2, -5];
	const pie = new PieChart({ kind: "donut", maxSlices: 4, slices: values.map((value, i) => new PieSlice({ key: `k${i}`, label: `L${i}`, value } as never)), slicePress: (e: unknown) => (hit = params(e)) } as never);
	const dom = show(pie);
	assert.deepEqual(pie.getParts().map((p) => p.value), [40, 30, 10, 20]);
	assert.strictEqual(pie.getParts().reduce((s, p) => s + p.share, 0), 1);
	assert.strictEqual(all(dom, ".korSlice").length, 4);
	all(dom, ".korPieRow")[3].click();
	assert.strictEqual(hit.key, "");
	assert.deepEqual(hit.keys, ["k3", "k4", "k5", "k6", "k7"]);
	const one1 = show(new PieChart({ slices: [new PieSlice({ label: "Tek", value: 5 }), new PieSlice({ label: "Sıfır", value: 0 })] }));
	assert.strictEqual(all(one1, ".korSlice").length, 1);
	assert.strictEqual(all(one1, ".korPieRow").length, 2);
	assert.strictEqual(all(show(new PieChart()), ".korMenuNone").length, 1);
});

QUnit.test("BarChart: yan yana, yığın, yüzde, eksi, klavye, tıklama", (assert) => {
	const done = assert.async();
	let hit: Record<string, unknown> = {};
	const chart = new BarChart({ labels: ["A", "B"], stack: "stacked", series: [new Series({ name: "S1", values: ["10.5", -4] }), new Series({ name: "S2", values: [5, -6] }), new Series({ name: "S3", values: [null, 3] })], barPress: (e: unknown) => (hit = params(e)) } as never);
	const dom = show(chart);
	assert.deepEqual(chart.getBars(0).map((b) => [b.from, b.to]), [[0, 10.5], [10.5, 15.5]]);
	assert.deepEqual(chart.getBars(1).map((b) => [b.from, b.to]), [[0, -4], [-4, -10], [0, 3]]);
	assert.deepEqual(chart.getBars(1).map((b) => b.end), [false, true, true]);
	setTimeout(() => {
		assert.strictEqual(all(dom, ".korCol").length, 5);
		dom.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
		assert.ok(one(dom, ".korTip").textContent?.includes("S1"));
		dom.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
		assert.strictEqual(hit.label, "A");
		chart.setStack("full");
		assert.strictEqual(chart.getBars(1).reduce((s, b) => s + Math.abs(b.to - b.from), 0), 100);
		const full = show(new BarChart({ labels: ["A"], stack: "full", series: [new Series({ values: [1] }), new Series({ values: [3] })] } as never));
		setTimeout(() => {
			assert.notOk([...full.querySelectorAll(".korAxis")].some((t) => /[-−]/.test(t.textContent ?? "")), "artılarda eksi eksen yok");
			done();
		}, 200);
	}, 200);
});

QUnit.test("Pivot: toplam, metin ondalık, açma, sıralama, hücre süzgeci", (assert) => {
	let hit: Record<string, unknown> = {};
	const pivot = new Pivot({ rows: ["bolge", "sehir"], column: "yil", value: "tutar", cellPress: (e: unknown) => (hit = params(e)) } as never);
	pivot.setModel(new JSONModel({ d: [{ bolge: "B", sehir: "X", yil: 2025, tutar: "10.5" }, { bolge: "B", sehir: "Y", yil: 2026, tutar: "4.5" }, { bolge: "A", sehir: "Z", yil: 2026, tutar: 1 }] }));
	pivot.bindProperty("data", { path: "/d" });
	show(pivot);
	const dom = () => pivot.getDomRef() as HTMLElement;
	const names = () => all(dom(), "tbody th").map((th) => th.textContent);
	assert.deepEqual(names(), ["A", "B"]);
	assert.ok(one(dom(), "tfoot").textContent?.includes("16"));
	one(dom(), '[data-sort=""]').click();
	apply();
	assert.deepEqual(names(), ["B", "A"]);
	one(dom(), '[data-twist="0"]').click();
	apply();
	assert.deepEqual(names(), ["B", "X", "Y", "A"]);
	one(dom(), '[data-cell="1|0"]').click();
	assert.deepEqual(hit, { ...hit, filters: { bolge: "B", sehir: "X", yil: "2025" }, value: 10.5 });
	pivot.setAggregate("avg");
	apply();
	assert.ok(one(dom(), "tfoot .korPivotSum").textContent);
});

QUnit.test("Shipment: yer ve araç duraktan bulunur", (assert) => {
	const stops = (...states: string[]) => states.map((state, i) => new ShipmentStop({ key: `s${i}`, title: `${i}`, state, mode: ["truck", "ship", "train", ""][i] }));
	const a = new Shipment({ stops: stops("success", "success", "info", "none") });
	const dom = show(a);
	assert.ok(a.getPosition() > 1 / 3 && a.getPosition() < 2 / 3);
	assert.strictEqual(a.getLegMode(), "ship");
	assert.ok(one(dom, ".korVehicle"));
	const held = new Shipment({ status: "problem", stops: stops("success", "success", "danger", "none") });
	show(held);
	assert.strictEqual(held.getPosition(), 2 / 3);
	assert.ok(one(held.getDomRef() as HTMLElement, ".korShipFlag"));
	held.setStatus("delivered");
	assert.strictEqual(held.getPosition(), 1);
	a.setProgress(90);
	apply();
	assert.strictEqual(a.getLegMode(), "train");
	assert.ok((a.getDomRef() as HTMLElement).classList.contains("korShip-train"));
	assert.strictEqual(show(new Shipment({ mode: "yok" })).querySelectorAll(".korVehicle").length, 1, "durak yokken çizilir");
});

QUnit.test("DeliveryRoute ve LoadPlan", (assert) => {
	const route = new DeliveryRoute({ stops: ["success", "danger", "none", "none"].map((state, i) => new DeliveryStop({ key: `${i}`, title: `${i}`, state, parcels: 3 })) });
	let dom = show(route);
	assert.strictEqual(all(dom, ".korRoundNext").length, 1);
	assert.ok(one(dom, ".korRoundSum").textContent?.includes("6"));
	one(dom, "[data-fold]").click();
	apply();
	assert.strictEqual(all(route.getDomRef() as HTMLElement, "li").length, 2);
	const load = new LoadPlan({ slots: 4, maxWeight: 1000, items: [new LoadItem({ key: "a", title: "A", slots: 3, weight: 700 }), new LoadItem({ key: "b", title: "B", slots: 3, weight: 500 })] });
	dom = show(load);
	assert.strictEqual(all(dom, ".korLoadOver").length, 2);
	assert.strictEqual(all(dom, ".korLoadGauge.korState-danger").length, 2);
	all(dom, ".korLoadItem button")[4].click();
	assert.strictEqual(load.getSelectedKey(), "b");
});

QUnit.test("DockBoard: araç seç, boş rampaya ver", (assert) => {
	let given: Record<string, unknown> = {};
	const board = new DockBoard({ docks: [new Dock({ key: "r1", name: "1", plate: "34 A 1", state: "loading", progress: 40 }), new Dock({ key: "r2", name: "2" }), new Dock({ key: "r3", name: "3", state: "closed" })], queue: [new DockTruck({ key: "t1", plate: "06 B 2" })], assign: (e: unknown) => (given = params(e)) } as never);
	show(board);
	const dom = () => board.getDomRef() as HTMLElement;
	one(dom(), "[data-truck]").click();
	apply();
	assert.deepEqual(all(dom(), "[data-dock]").map((b) => (b as HTMLButtonElement).disabled), [true, false, true]);
	one(dom(), '[data-dock="1"]').click();
	assert.strictEqual(given.truck, "t1");
	assert.strictEqual(given.dock, "r2");
	assert.strictEqual(board.getSelectedTruck(), "");
});

QUnit.test("ProductionLine: darboğaz; MachineCard: OEE", (assert) => {
	const line = new ProductionLine({ sector: "textile", stations: [new ProductionStation({ key: "a", process: "weaving", rate: 90 }), new ProductionStation({ key: "b", process: "sewing", rate: 60 }), new ProductionStation({ key: "c", process: "packing", rate: 20, state: "danger" })] });
	const dom = show(line);
	assert.strictEqual(line.getBottleneck()?.getKey(), "b", "duran istasyon sayılmaz");
	assert.strictEqual(all(dom, ".korBeltItem").length, 2);
	const machine = new MachineCard({ availability: 90, performance: 80, quality: 50, spans: [new MachineSpan({ minutes: 10, state: "danger" })] });
	show(machine);
	assert.strictEqual(machine.getOee(), 36);
});

QUnit.test("BankCard: yalnız son dört hane; dondurma engellenebilir", (assert) => {
	const card = new BankCard({ last4: "4111 1111 1111 1234", canFreeze: true, used: 10, limit: 100 });
	const dom = show(card);
	assert.notOk(dom.outerHTML.includes("4111"));
	assert.ok(one(dom, ".korBankNo").textContent?.endsWith("1234"));
	const stop = (e: { preventDefault(): void }) => e.preventDefault();
	card.attachEvent("freeze", stop as never);
	one(dom, "[data-freeze]").click();
	assert.notOk(card.getFrozen());
	card.detachEvent("freeze", stop as never);
	one(dom, "[data-freeze]").click();
	assert.ok(card.getFrozen());
});

QUnit.test("Statement: iptal toplama girmez, gün sonu bakiyesi; Installments", (assert) => {
	const statement = new Statement({ balance: 100, items: [new Transaction({ title: "a", date: "2026-11-25", amount: -20 }), new Transaction({ title: "b", date: "2026-11-25", amount: -5, state: "danger" }), new Transaction({ title: "c", date: "2026-11-24", amount: "50.5" })] });
	show(statement);
	const dom = () => statement.getDomRef() as HTMLElement;
	const days = all(dom(), ".korStateDay").map((li) => li.lastElementChild?.textContent);
	assert.strictEqual(days.length, 2);
	assert.ok(days[0]?.startsWith("100"));
	assert.ok(days[1]?.startsWith("120"));
	assert.ok(one(dom(), '[data-filter="out"]').textContent?.includes("20"));
	one(dom(), '[data-filter="in"]').click();
	apply();
	assert.strictEqual(all(dom(), "li:not(.korStateDay)").length, 1);
	const loan = show(new Installments({ decimals: 0, items: [new Installment({ principal: "80", interest: 20, state: "success" }), new Installment({ principal: 90, interest: 10 })] }));
	assert.ok(all(loan, "header b").every((b) => b.textContent === "100"));
	assert.strictEqual(all(loan, ".korLoanNext").length, 1);
});

QUnit.test("Timetable: çakışan dersler yan yana", (assert) => {
	const table = show(new Timetable({ lessons: [["A", "09:00", "10:00"], ["B", "09:30", "10:30"], ["C", "10:30", "11:00"]].map(([t, s, e]) => new Lesson({ title: t, day: 1, start: s, end: e })) }));
	assert.strictEqual(all(table, ".korLessonClash").length, 2);
	assert.strictEqual(all(table, "li").length, 3);
});

QUnit.test("Classroom, CoursePath", (assert) => {
	const room = new Classroom({ students: [new Student({ key: "1", name: "Ada Y" }), new Student({ key: "2", name: "Can K" })] });
	show(room);
	const seat = (i: number) => all(room.getDomRef() as HTMLElement, "[data-i]")[i];
	["present", "late", "absent", "present"].forEach((state) => {
		seat(0).click();
		apply();
		assert.strictEqual(room.getStudents()[0].getState(), state);
	});
	key(seat(0), "ArrowRight");
	assert.strictEqual(document.activeElement, seat(1));
	const path = show(new CoursePath({ modules: [new CourseModule({ progress: 100 }), new CourseModule({ progress: 40 }), new CourseModule({ locked: true })] }));
	assert.deepEqual(all(path, "button").map((b) => (b as HTMLButtonElement).disabled), [false, false, true]);
	assert.strictEqual(all(path, ".korPathNext").length, 1);
});

QUnit.test("OrgChart: açma, sayı, boş kadro, döngü", (assert) => {
	const chart = new OrgChart({ expandedLevels: 1, people: [new OrgPerson({ key: "a", name: "A" }), new OrgPerson({ key: "b", managerKey: "a", name: "B" }), new OrgPerson({ key: "c", managerKey: "b", vacant: true })] });
	show(chart);
	const dom = () => chart.getDomRef() as HTMLElement;
	const fold = () => one(dom(), '[data-fold="a"]');
	assert.strictEqual(all(dom(), ".korOrgCard").length, 1);
	assert.ok(fold().textContent?.startsWith("1"), "boş kadro sayılmaz");
	fold().click();
	apply();
	assert.strictEqual(all(dom(), ".korOrgCard").length, 2);
	key(all(dom(), ".korOrgCard")[0], "ArrowDown");
	assert.strictEqual(document.activeElement, all(dom(), ".korOrgCard")[1]);
	assert.ok(show(new OrgChart({ people: [new OrgPerson({ key: "x", managerKey: "y" }), new OrgPerson({ key: "y", managerKey: "x" })] })));
});

QUnit.test("LeaveBalance, ShiftRoster, TalentGrid", (assert) => {
	const leave = new LeaveBalance({ total: 14, used: 5, planned: 3, pending: 1 });
	const dom = show(leave);
	assert.strictEqual(leave.getRemaining(), 5);
	assert.strictEqual(all(dom, ".korLeaveDays .korLeave-left").length, 5);
	let changed: Record<string, unknown> = {};
	const roster = new ShiftRoster({ start: "2026-11-23", people: ["Ada", "Can"], shifts: [new ShiftType({ key: "g", title: "Gündüz", need: 2 })], entries: [new ShiftEntry({ person: "Ada", date: "2026-11-23", shift: "g" })], change: (e: unknown) => (changed = params(e)) } as never);
	const grid = show(roster);
	assert.strictEqual(all(grid, ".korRosterLow").length, 7);
	one(grid, '[data-at="0|0"]').click();
	assert.strictEqual(changed.shift, "");
	one(grid, '[data-at="1|2"]').click();
	assert.strictEqual(changed.date, "2026-11-25");
	assert.strictEqual(changed.shift, "g");
	const person = new TalentPerson({ key: "a", name: "Ada", performance: 3, potential: 2 });
	const talent = new TalentGrid({ people: [person] });
	show(talent);
	const button = () => one(talent.getDomRef() as HTMLElement, "button");
	key(button(), "ArrowUp", { ctrlKey: true });
	apply();
	assert.strictEqual(person.getPotential(), 3);
	assert.strictEqual(document.activeElement, button());
	key(button(), "ArrowRight", { ctrlKey: true });
	assert.strictEqual(person.getPerformance(), 3);
});

QUnit.test("Flag: tüm ISO ülkeleri, bölgeler, bilinmeyen kod ve biçim", async (assert) => {
	assert.ok(isoCodes.length >= 249, "ISO 3166-1 ülkelerinin tümü");
	assert.ok(isoCodes.every((c) => flagNames[c]));
	assert.strictEqual(flagCode(" TR "), "tr");
	assert.strictEqual(flagCode("GB_SCT"), "gb-sct");
	assert.strictEqual(flagCode("zz"), "");
	assert.ok(countryName("de").length > 2);
	const flag = new Flag({ code: "TR", size: 24 });
	let dom = show(flag);
	assert.strictEqual(dom.tagName, "IMG");
	assert.ok(dom.getAttribute("src")?.endsWith("assets/flags/4x3/tr.svg"));
	assert.strictEqual(dom.getAttribute("width"), "32");
	assert.strictEqual(dom.getAttribute("alt"), countryName("tr"));
	const loaded = await new Promise<boolean>((resolve) => {
		const img = new Image();
		img.onload = () => resolve(img.naturalWidth > 0);
		img.onerror = () => resolve(false);
		img.src = dom.getAttribute("src")!;
	});
	assert.ok(loaded, "SVG sunuluyor");
	flag.setShape("circle");
	flag.setCode("nope");
	apply();
	dom = flag.getDomRef() as HTMLElement;
	assert.ok(dom.getAttribute("src")?.endsWith("1x1/xx.svg"));
	assert.ok(dom.classList.contains("korFlag-circle"));
	assert.strictEqual(flag.getKnownCode(), "");
	flag.setDecorative(true);
	apply();
	assert.strictEqual((flag.getDomRef() as HTMLElement).getAttribute("aria-hidden"), "true");
});

QUnit.test("BankLogo: kayıt, sunucu, üretilen işaret, bayrak ve güvenli adres", async (assert) => {
	clearBankLogos();
	assert.deepEqual(bankInfo("tgba tr is", "", "", ""), { key: "", bic: "TGBATRISXXX", bic8: "TGBATRIS", bank: "TGBA", country: "tr", name: "" });
	assert.strictEqual(bankInfo("bad", "DE89 3704 0044 0532 0130 00").country, "de");
	const logo = new BankLogo({ bic: "DEUTDEFF", size: 48 });
	let dom = show(logo);
	assert.strictEqual(one(dom, ".korBankLogoMark").textContent, "DE");
	assert.ok(one(dom, ".korBankLogoFlag").getAttribute("src")?.endsWith("1x1/de.svg"));
	assert.ok(dom.getAttribute("aria-label")?.startsWith("DEUTDEFF, "));
	registerBankLogos({ DEUTDEFF: { src: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E", name: "Deutsche Bank" } });
	logo.invalidate();
	apply();
	dom = logo.getDomRef() as HTMLElement;
	assert.ok(one(dom, ".korBankLogoImg"), "kayıttaki logo");
	assert.ok(dom.getAttribute("aria-label")?.startsWith("Deutsche Bank"));
	clearBankLogos();
	setBankLogoProvider("https://logo.invalid/{country}/{bic8}.svg");
	const other = new BankLogo({ bic: "TGBATRISXXX", name: "Garanti BBVA" });
	dom = show(other);
	assert.strictEqual(one(dom, ".korBankLogoImg").getAttribute("src"), "https://logo.invalid/tr/TGBATRIS.svg");
	one(dom, ".korBankLogoImg").dispatchEvent(new Event("error"));
	apply();
	dom = other.getDomRef() as HTMLElement;
	assert.notOk(dom.querySelector(".korBankLogoImg"), "yüklenemeyen logo işarete döner");
	assert.strictEqual(one(dom, ".korBankLogoMark").textContent, "GB");
	setBankLogoProvider();
	const unsafe = new BankLogo({ src: "javascript:alert(1)", name: "X Bank", iban: "TR33 0006 1005 1978 6457 8413 26" });
	dom = show(unsafe);
	assert.notOk(dom.querySelector(".korBankLogoImg"));
	assert.notOk(dom.outerHTML.includes("0006"), "IBAN DOM'a yazılmaz");
	assert.ok(one(dom, ".korBankLogoFlag").getAttribute("src")?.endsWith("1x1/tr.svg"));
	clearBankLogos();
	await wait(0);
});
