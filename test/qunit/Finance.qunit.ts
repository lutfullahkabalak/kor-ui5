import DamageMap from "kor/ui/DamageMap";
import DamageMark from "kor/ui/DamageMark";
import EscalationField from "kor/ui/EscalationField";
import Installment from "kor/ui/Installment";
import Installments from "kor/ui/Installments";
import LeaseEvent from "kor/ui/LeaseEvent";
import LeaseTimeline from "kor/ui/LeaseTimeline";
import MatchEntry from "kor/ui/MatchEntry";
import MatchGrid from "kor/ui/MatchGrid";
import ReconCell from "kor/ui/ReconCell";
import ReconcileLetter from "kor/ui/ReconcileLetter";
import ReconMatrix from "kor/ui/ReconMatrix";
import ReconRow from "kor/ui/ReconRow";
import Schedule from "kor/ui/Schedule";
import ScheduleLane from "kor/ui/ScheduleLane";
import SignaturePad from "kor/ui/SignaturePad";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";

let current: Control[] = [];
function show<T extends Control>(control: T): HTMLElement {
	current.push(control);
	control.placeAt("qunit-fixture");
	Core.applyChanges();
	return control.getDomRef() as HTMLElement;
}
const all = (root: ParentNode, selector: string) => [...root.querySelectorAll<HTMLElement>(selector)];
const one = (root: ParentNode, selector: string) => root.querySelector<HTMLElement>(selector)!;
const key = (target: Element, name: string, more: KeyboardEventInit = {}) => target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...more }));
const tap = (target: Element, more: MouseEventInit = {}) => target.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, ...more }));
const apply = () => Core.applyChanges();
const dom = (c: Control) => c.getDomRef() as HTMLElement;
const params = (e: unknown) => (e as { getParameters(): Record<string, unknown> }).getParameters();
const stop = (e: { preventDefault(): void }) => e.preventDefault();

QUnit.module("Finance", {
	afterEach: () => {
		current.forEach((c) => c.destroy());
		current = [];
	}
});

const ledger = () => [
	new MatchEntry({ key: "o1", side: "ours", date: "2026-10-03", document: "FT-101", amount: 1200 }),
	new MatchEntry({ key: "o2", side: "ours", date: "2026-10-10", document: "FT-102", amount: 800 }),
	new MatchEntry({ key: "o3", side: "ours", date: "2026-10-20", amount: -500 }),
	new MatchEntry({ key: "t1", side: "theirs", date: "2026-10-05", document: "FT-102", amount: "800" }),
	new MatchEntry({ key: "t2", side: "theirs", date: "2026-10-04", document: "X", amount: 1200 }),
	new MatchEntry({ key: "t3", side: "theirs", date: "2026-10-22", amount: -480 })
];

QUnit.test("MatchGrid: bakiye ve fark; otomatik eşleştirme önce belge, sonra tarih", (assert) => {
	const grid = new MatchGrid({ decimals: 0, entries: ledger() });
	show(grid);
	assert.deepEqual(grid.getTotals(), { ours: 1500, theirs: 1520, difference: -20 });
	assert.ok(one(dom(grid), ".korMatchDiff").classList.contains("korState-danger"));
	const events: unknown[] = [];
	grid.attachMatchChange((e) => events.push(params(e)));
	assert.strictEqual(grid.autoMatch(), 2);
	const byKey = (k: string) => grid.getEntries().find((e) => e.getKey() === k)!;
	assert.strictEqual(byKey("o2").getMatch(), byKey("t1").getMatch(), "aynı belge numarası");
	assert.strictEqual(byKey("o1").getMatch(), byKey("t2").getMatch(), "aynı tutar, en yakın tarih");
	assert.ok(byKey("o1").getAuto());
	assert.strictEqual(byKey("o3").getMatch(), "", "tutarı tutmayan açık kalır");
	assert.strictEqual((events[0] as { action: string }).action, "auto");
	apply();
	assert.strictEqual(all(dom(grid), ".korMatchBand").length, 2);
	assert.strictEqual(all(dom(grid), ".korMatchOpen .korMatchRow").length, 2);
});

QUnit.test("MatchGrid: elle eşleştir, durdurma, çöz, süzgeç, tolerans", (assert) => {
	const grid = new MatchGrid({ decimals: 0, entries: ledger() });
	show(grid);
	const row = (k: string) => document.getElementById(grid.getEntries().find((e) => e.getKey() === k)!.getId())!;
	tap(row("o3"));
	apply();
	assert.ok(one(dom(grid), '[data-act="match"]').hasAttribute("disabled"), "tek taraf eşleşmez");
	tap(row("t3"));
	apply();
	assert.ok(one(dom(grid), ".korMatchBar").textContent?.includes("20"), "seçim farkı");
	grid.attachMatchChange(stop as never);
	tap(one(dom(grid), '[data-act="match"]'));
	apply();
	assert.strictEqual(grid.getEntries().filter((e) => e.getMatch()).length, 0, "preventDefault durdurur");
	grid.detachMatchChange(stop as never);
	let last: Record<string, unknown> = {};
	grid.attachMatchChange((e) => (last = params(e)));
	tap(one(dom(grid), '[data-act="match"]'));
	apply();
	assert.strictEqual(last.difference, -20);
	assert.deepEqual(last.keys, ["o3", "t3"]);
	const band = one(dom(grid), ".korMatchBand");
	assert.ok(one(band, ".korMatchTag").classList.contains("korState-wait"), "farklı eşleşme uyarı taşır");
	tap(row("o3"));
	apply();
	assert.strictEqual(all(dom(grid), ".korMatchOn").length, 2, "eşleşmiş kayda basmak grubu seçer");
	tap(one(dom(grid), '[data-act="unmatch"]'));
	apply();
	assert.strictEqual(last.action, "unmatch");
	assert.strictEqual(all(dom(grid), ".korMatchBand").length, 0);
	grid.setTolerance(20);
	grid.autoMatch();
	grid.setFilter("open");
	apply();
	assert.strictEqual(all(dom(grid), ".korMatchBand").length, 0, "açık süzgeci grupları gizler");
	assert.ok(one(dom(grid), ".korMatchNone"), "tolerans ile hepsi eşleşti");
	assert.ok(one(dom(grid), ".korMatchDiff").classList.contains("korState-success"));
});

QUnit.test("ReconcileLetter: mutabıkız, itiraz, zorunlu bakiye, durdurma, son gün", (assert) => {
	const letter = new ReconcileLetter({ party: "Ege Çelik", balance: "125430.5", currency: "TRY", date: "2026-12-31", dueDate: "2027-01-15", today: "2027-01-10" });
	show(letter);
	assert.ok(dom(letter).textContent?.includes("5"), "kalan gün");
	let last: Record<string, unknown> = {};
	letter.attachRespond((e) => (last = params(e)));
	tap(one(dom(letter), '[data-act="dispute"]'));
	apply();
	const input = () => document.getElementById(`${letter.getId()}-their`) as HTMLInputElement;
	assert.strictEqual(document.activeElement, input(), "odak bakiyede");
	tap(one(dom(letter), '[data-act="send"]'));
	apply();
	assert.strictEqual(input().getAttribute("aria-invalid"), "true", "bakiye zorunlu");
	assert.strictEqual(letter.getStatus(), "open");
	input().value = "120.000,50";
	input().dispatchEvent(new Event("input", { bubbles: true }));
	assert.ok(document.getElementById(`${letter.getId()}-diff`)?.textContent?.includes("5.430"), "canlı fark");
	tap(one(dom(letter), '[data-reason="exchange"]'));
	(document.getElementById(`${letter.getId()}-note`) as HTMLTextAreaElement).value = "Kur 31.12";
	letter.attachRespond(stop as never);
	tap(one(dom(letter), '[data-act="send"]'));
	assert.strictEqual(letter.getStatus(), "open", "preventDefault durdurur");
	letter.detachRespond(stop as never);
	tap(one(dom(letter), '[data-act="send"]'));
	apply();
	assert.strictEqual(letter.getStatus(), "disputed");
	assert.strictEqual(last.theirBalance, 120000.5);
	assert.strictEqual(last.reason, "exchange");
	assert.strictEqual(letter.getNote(), "Kur 31.12");
	assert.ok(one(dom(letter), ".korLetterStamp").classList.contains("korState-danger"));
	const late = new ReconcileLetter({ balance: 10, dueDate: "2027-01-15", today: "2027-01-20", direction: "credit" });
	show(late);
	assert.strictEqual(late.getDaysLeft(), -5);
	assert.ok(one(dom(late), ".korStatus").classList.contains("korState-danger"));
	tap(one(dom(late), '[data-act="agree"]'));
	assert.strictEqual(late.getStatus(), "agreed");
});

QUnit.test("ReconMatrix: durumlar, eşik, özet, klavye, tıklama", (assert) => {
	const matrix = new ReconMatrix({
		periods: ["2026-09", "2026-10", "2026-11"],
		threshold: 5000,
		tolerance: 1,
		rows: [
			new ReconRow({ key: "a", title: "A", cells: [
				new ReconCell({ period: "2026-09", ourCount: 3, ourAmount: 12000, theirCount: 3, theirAmount: "12000.4" }),
				new ReconCell({ period: "2026-10", ourCount: 3, ourAmount: 12000, theirCount: 2, theirAmount: 12000 }),
				new ReconCell({ period: "2026-11", ourCount: 1, ourAmount: 9000 })
			] }),
			new ReconRow({ key: "b", title: "B", cells: [new ReconCell({ period: "2026-09", ourCount: 1, ourAmount: 900 })] })
		]
	});
	show(matrix);
	const cells = () => all(dom(matrix), ".korReconCell");
	assert.deepEqual(cells().map((c) => /korState-(\w+)/.exec(c.className)![1]), ["success", "danger", "wait", "none", "none", "none"]);
	assert.deepEqual(matrix.getSummary(), { success: 1, danger: 1, wait: 1, none: 3 });
	assert.strictEqual(cells().filter((c) => c.tabIndex === 0).length, 1);
	cells()[0].focus();
	key(cells()[0], "ArrowDown");
	assert.strictEqual(document.activeElement, cells()[3]);
	key(cells()[3], "End");
	assert.strictEqual(document.activeElement, cells()[5]);
	let last: Record<string, unknown> = {};
	matrix.attachCellPress((e) => (last = params(e)));
	cells()[1].click();
	assert.deepEqual(last, { id: matrix.getId(), row: "a", period: "2026-10" });
	assert.strictEqual(one(dom(matrix), "tbody tr td.korReconEnd .korNum").textContent, "1/3");
});

QUnit.test("LeaseTimeline: bildirim süresi, kaçan süre, geçmiş, sıradaki", (assert) => {
	const lease = new LeaseTimeline({
		start: "2024-01-01", end: "2028-12-31", today: "2026-11-26", noticeDays: 60,
		events: [
			new LeaseEvent({ key: "i1", date: "2025-01-01", kind: "increase" }),
			new LeaseEvent({ key: "o1", date: "2027-06-30", kind: "option", deadline: "2027-01-10" }),
			new LeaseEvent({ key: "r1", date: "2028-12-31", kind: "renewal", deadline: "2028-06-30" }),
			new LeaseEvent({ key: "t1", date: "2027-01-01", kind: "termination", deadline: "2026-10-01" })
		]
	});
	show(lease);
	const states = lease.getEvents().map((e) => lease.getEventState(e).state);
	assert.deepEqual(states, ["none", "wait", "info", "danger"]);
	assert.ok(lease.getEventState(lease.getEvents()[1]).text.includes("45"));
	assert.strictEqual(all(dom(lease), ".korLeaseList li").map((li) => li.classList.contains("korLeaseNext")).indexOf(true), 1, "sıralı listede ilk gelecek olay");
	assert.strictEqual(all(dom(lease), ".korLeaseDot").length, 4);
	assert.ok(one(dom(lease), ".korLeaseTrack").getAttribute("aria-label")?.includes("58"));
	let pressed = "";
	lease.attachEventPress((e) => (pressed = params(e).key as string));
	lease.invalidate();
	apply();
	all(dom(lease), "button.korLeaseRow")[2].click();
	assert.strictEqual(pressed, "o1");
});

QUnit.test("EscalationField: sabit bileşik artış, tavanlı endeks, kural değişimi", (assert) => {
	const field = new EscalationField({ base: 10000, rate: 10, periods: 3, start: "2027-01-01", decimals: 0 });
	show(field);
	assert.deepEqual(field.getSchedule().map((s) => Math.round(s.rent)), [11000, 12100, 13310]);
	assert.strictEqual(all(dom(field), ".korEscTable tbody tr").length, 4);
	field.setRule("index");
	field.setIndexRates([30, 20]);
	field.setCap(25);
	const steps = field.getSchedule();
	assert.deepEqual(steps.map((s) => s.rate), [25, 20, 20], "son endeks değeri sürer");
	assert.deepEqual(steps.map((s) => s.capped), [true, false, false]);
	assert.strictEqual(steps[1].date?.getFullYear(), 2028);
	apply();
	assert.strictEqual(all(dom(field), ".korEscCap").length, 1);
	let last: Record<string, unknown> = {};
	field.attachChange((e) => (last = params(e)));
	const cap = document.getElementById(`${field.getId()}-cap`) as HTMLInputElement;
	cap.value = "";
	cap.dispatchEvent(new Event("change", { bubbles: true }));
	assert.strictEqual(field.getCap(), -1, "boş tavan yok demek");
	assert.strictEqual(last.cap, -1);
	apply();
	one(dom(field), '[data-rule="none"]').click();
	assert.strictEqual(last.rule, "none");
	assert.ok(field.getSchedule().every((s) => s.rent === 10000));
});

QUnit.test("DamageMap: bölge seç, tür ekle, yeni hasar, yalnız kendi aşaması silinir", (assert) => {
	const map = new DamageMap({ stage: "return", marks: [new DamageMark({ key: "a", zone: "hood", kind: "scratch", stage: "handover" })] });
	show(map);
	const zone = (name: string) => dom(map).querySelector(`[data-zone="${name}"]`)!;
	assert.strictEqual(all(dom(map), ".korDmgZone").length, DamageMap.zones.length);
	tap(zone("hood"));
	apply();
	assert.ok(one(dom(map), ".korDmgPick"));
	assert.strictEqual(document.activeElement, one(dom(map), "[data-kind]"), "odak türlerde");
	one(dom(map), '[data-kind="dent"]').click();
	apply();
	assert.strictEqual(map.getMarks().length, 2);
	assert.strictEqual(map.getNewMarks().length, 0, "teslimde aynı bölgede hasar vardı");
	zone("frontLeftDoor").dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
	apply();
	map.attachChange(stop as never);
	one(dom(map), '[data-kind="broken"]').click();
	assert.strictEqual(map.getMarks().length, 2, "preventDefault durdurur");
	map.detachChange(stop as never);
	one(dom(map), '[data-kind="broken"]').click();
	apply();
	assert.strictEqual(map.getNewMarks().length, 1);
	assert.strictEqual(map.getNewMarks()[0].getZone(), "frontLeftDoor");
	assert.ok(zone("frontLeftDoor").classList.contains("korState-danger"));
	assert.strictEqual(all(dom(map), "[data-drop]").length, 2, "teslim hasarı iadede silinmez");
	all(dom(map), "[data-drop]")[0].click();
	apply();
	assert.strictEqual(map.getMarks().length, 2);
	assert.deepEqual(map.getMarks().map((m) => m.getKey()), ["a", "d2"]);
});

QUnit.test("SignaturePad: çizgi, tek dokunuş sayılmaz, silme, salt okunur", (assert) => {
	const pad = new SignaturePad({ label: "Teslim alan" });
	show(pad);
	const sheet = () => one(dom(pad), ".korSignSheet");
	const box = sheet().getBoundingClientRect();
	const at = (type: string, x: number, y: number, target: EventTarget) => target.dispatchEvent(new PointerEvent(type, { bubbles: true, cancelable: true, button: 0, clientX: box.left + x, clientY: box.top + y }));
	let changes = 0;
	pad.attachChange(() => changes++);
	at("pointerdown", 10, 10, sheet());
	at("pointerup", 10, 10, window);
	assert.notOk(pad.isSigned(), "tek dokunuş");
	at("pointerdown", 10, 10, sheet());
	at("pointermove", 60, 40, window);
	at("pointermove", 120, 30, window);
	at("pointerup", 120, 30, window);
	assert.ok(pad.getValue().startsWith("M"));
	assert.strictEqual(pad.getValue().split("L").length, 3);
	assert.strictEqual(changes, 1);
	apply();
	one(dom(pad), "[data-clear]").click();
	assert.strictEqual(pad.getValue(), "");
	pad.setEditable(false);
	apply();
	at("pointerdown", 10, 10, sheet());
	at("pointermove", 60, 40, window);
	at("pointerup", 60, 40, window);
	assert.notOk(pad.isSigned());
});

QUnit.test("Installments: kalan anapara ve yeni tutar; Schedule: boş güne basma", (assert) => {
	const loan = show(new Installments({ decimals: 0, showBalance: true, items: [new Installment({ principal: 300, interest: 50 }), new Installment({ principal: "300", interest: 40, remeasured: true }), new Installment({ principal: 400 })] }));
	assert.deepEqual(all(loan, ".korLoanLeft").map((el) => el.textContent), ["700", "400", "0"]);
	assert.strictEqual(all(loan, ".korLoanNew").length, 1);
	const plan = new Schedule({ start: "2026-12-01", days: 10, dayWidth: 40, lanes: [new ScheduleLane({ key: "car1", title: "34 ABC 12" })] });
	show(plan);
	let last: Record<string, unknown> = {};
	plan.attachSlotPress((e) => (last = params(e)));
	const track = one(dom(plan), ".korPlanTrack");
	const box = track.getBoundingClientRect();
	tap(track, { clientX: box.left + 40 * 3 + 5, clientY: box.top + 5 });
	assert.strictEqual(last.lane, "car1");
	assert.strictEqual((last.date as Date).getDate(), 4);
});
