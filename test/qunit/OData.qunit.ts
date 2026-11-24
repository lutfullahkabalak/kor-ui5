import Column from "kor/ui/Column";
import DataGrid from "kor/ui/DataGrid";
import DateField from "kor/ui/DateField";
import FilterBar from "kor/ui/FilterBar";
import FilterField from "kor/ui/FilterField";
import LookupField from "kor/ui/LookupField";
import TreeGrid from "kor/ui/TreeGrid";
import type Control from "sap/ui/core/Control";
import Core from "sap/ui/core/Core";
import MockServer from "sap/ui/core/util/MockServer";
import type Filter from "sap/ui/model/Filter";
import type ListBinding from "sap/ui/model/ListBinding";
import type Model from "sap/ui/model/Model";
import V2Model from "sap/ui/model/odata/v2/ODataModel";
import V4Model from "sap/ui/model/odata/v4/ODataModel";
import V4Server from "./odata/v4";

let current: Control[] = [];
function show<T extends Control>(control: T): T {
	current.push(control);
	control.placeAt("qunit-fixture");
	Core.applyChanges();
	return control;
}
const one = (c: Control | ParentNode, q: string) => ("getDomRef" in c ? (c.getDomRef() as HTMLElement) : c).querySelector<HTMLElement>(q)!;
const all = (c: Control | ParentNode, q: string) => [...("getDomRef" in c ? (c.getDomRef() as HTMLElement) : c).querySelectorAll<HTMLElement>(q)];
const key = (target: HTMLElement, name: string, more: KeyboardEventInit = {}) => target.dispatchEvent(new KeyboardEvent("keydown", { key: name, bubbles: true, cancelable: true, ...more }));
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
async function until(test: () => unknown, label = ""): Promise<void> {
	for (let i = 0; i < 150; i++) {
		if (test()) return;
		await wait(20);
	}
	throw new Error(`Beklenen olmadı: ${label || test.toString()}`);
}
const type = (input: HTMLInputElement, text: string) => {
	input.focus();
	input.value = text;
	input.dispatchEvent(new Event("input", { bubbles: true }));
};
const cell = (g: Control, row: number, col: number) => one(g, `[data-row="${row}"][data-col="${col}"]`)?.textContent ?? "";
const COUNT = 600;
const raw = Array.from({ length: COUNT }, (_, i) => ({ Id: `S${String(i).padStart(4, "0")}`, Firm: i === 5 ? "Deniz" : `Firma ${i}`, Amount: `${i}.50`, Qty: i }));
const gridOf = (model: Model, parameters?: object) => {
	const grid = new DataGrid({
		height: "400px", selectionMode: "Multi",
		columns: [new Column({ label: "No", path: "Id", type: "link" }), new Column({ label: "Firma", path: "Firm" }), new Column({ label: "Tutar", path: "Amount", type: "currency", decimals: 2, editable: true }), new Column({ label: "Termin", path: "Due", type: "date", editable: true }), new Column({ label: "Adet", path: "Qty", type: "number", editable: true })]
	});
	grid.setModel(model);
	grid.bindAggregation("rows", { path: "/Orders", parameters } as never);
	return show(grid);
};
const edit = (g: DataGrid, row: number, col: number, text: string) => {
	const scroll = one(g, "[role=grid]");
	scroll.focus();
	key(scroll, "Home", { ctrlKey: true });
	for (let i = 0; i < row; i++) key(scroll, "ArrowDown");
	for (let i = 0; i < col; i++) key(scroll, "ArrowRight");
	key(scroll, "F2");
	const input = one(g, ".korCellEditor") as HTMLInputElement;
	input.value = text;
	key(input, "Enter");
};
const clean = () => {
	current.forEach((c) => c.destroy());
	current = [];
	document.querySelectorAll(".korFloat, .korToast").forEach((el) => el.remove());
};

/* Her iki sürümde aynı olması gerekenler */
function shared(name: string, make: () => Model, requests: () => string[], parameters?: object): void {
	QUnit.test(`${name}: DataGrid ilk sayfa, toplam, sıralama, süzme`, async (assert) => {
		const grid = gridOf(make(), parameters);
		await until(() => cell(grid, 0, 0).startsWith("S0000") && one(grid, "[role=grid]").getAttribute("aria-rowcount") === String(COUNT + 1), "ilk sayfa ve toplam");
		assert.strictEqual(cell(grid, 5, 1), "Deniz");
		assert.strictEqual(cell(grid, 5, 2), "5,50");
		assert.strictEqual(cell(grid, 1, 3), "02.03.2026", "gün kaymaz");
		one(grid, '[data-sort="4"]').click();
		one(grid, '[data-sort="4"]').click();
		await until(() => cell(grid, 0, 0).startsWith("S0599"), "azalan sıralama");
		const bar = show(new FilterBar({ fields: [new FilterField({ label: "Firma", path: "Firm" }), new FilterField({ label: "Tutar", path: "Amount", type: "number" })], change: (e) => (grid.getBinding("rows") as ListBinding).filter((e.getParameters() as unknown as { filters: Filter[] }).filters) }));
		bar.addToken("Firm", "Contains", "Deniz");
		await until(() => one(grid, "[role=grid]").getAttribute("aria-rowcount") === "2", "metin süzgeci");
		bar.clear();
		bar.addToken("Amount", "GT", 590);
		await until(() => one(grid, "[role=grid]").getAttribute("aria-rowcount") === "11", "tutar süzgeci");
		assert.ok(requests().length < 25, `istek sayısı ${requests().length}`);
	});

	QUnit.test(`${name}: kaydırınca yeni sayfa; yüklenmeyen satır iskelet`, async (assert) => {
		const grid = gridOf(make(), parameters);
		await until(() => cell(grid, 0, 0).startsWith("S0000") && one(grid, "[role=grid]").getAttribute("aria-rowcount") === String(COUNT + 1));
		one(grid, "[role=grid]").scrollTop = 400 * 44;
		await until(() => all(grid, ".korRowWait").length > 0, "iskelet satır");
		await until(() => cell(grid, 402, 0).startsWith("S0402"), "402. satır");
		await until(() => all(grid, ".korRowWait").length === 0, "iskelet kalkar");
		assert.ok(all(grid, ".korRow").length < 40);
	});

	QUnit.test(`${name}: seçim kaydırınca kaybolmaz, tümünü seç yüklenmeyenleri de alır`, async (assert) => {
		const grid = gridOf(make(), parameters);
		await until(() => cell(grid, 0, 0).startsWith("S0000") && one(grid, "[role=grid]").getAttribute("aria-rowcount") === String(COUNT + 1));
		one(grid, '[data-pick="1"]').click();
		one(grid, "[role=grid]").scrollTop = 500 * 44;
		await until(() => cell(grid, 503, 0).startsWith("S0503"));
		one(grid, '[data-pick="503"]').click();
		assert.deepEqual(grid.getSelectedContexts().map((c) => c.getProperty("Id") as string), ["S0001", "S0503"]);
		let last = 0;
		grid.attachEvent("selectionChange", (e: { getParameters(): { contexts: unknown[] } }) => (last = e.getParameters().contexts.length));
		one(grid, "[data-all]").click();
		await until(() => last === COUNT, "tümü seçildi");
		assert.strictEqual(grid.getSelectedContexts().length, COUNT);
	});

	QUnit.test(`${name}: yüklenmemiş aralığın toplamı yarım gösterilmez`, async (assert) => {
		const grid = gridOf(make(), parameters);
		await until(() => cell(grid, 0, 0).startsWith("S0000") && one(grid, "[role=grid]").getAttribute("aria-rowcount") === String(COUNT + 1));
		const scroll = one(grid, "[role=grid]");
		scroll.focus();
		for (let i = 0; i < 4; i++) key(scroll, "ArrowRight");
		key(scroll, "ArrowDown", { ctrlKey: true, shiftKey: true });
		assert.ok(one(grid, ".korFootWait"), "önce bekler");
		await until(() => one(grid, ".korGridFoot").textContent!.includes("179.700,00"), "doğru toplam");
		assert.strictEqual(one(grid, ".korFootWait"), null);
	});

	QUnit.test(`${name}: LookupField yazınca tek istek, öneri, seçim`, async (assert) => {
		const model = make();
		const field = new LookupField({ label: "Sipariş", keyPath: "Id", textPath: "Firm" });
		field.setModel(model);
		field.bindAggregation("rows", { path: "/Orders", parameters } as never);
		show(field);
		await wait(80);
		const before = requests().filter((r) => r.includes("Orders")).length;
		assert.strictEqual(before, 0, "açılışta istek atmaz");
		const input = one(field, "input") as HTMLInputElement;
		["D", "De", "Den", "Deni", "Deniz"].forEach((t) => type(input, t));
		await until(() => all(document, ".korLookupItem").length === 1 && one(document, ".korLookupText").textContent === "Deniz", "öneri");
		assert.ok(requests().filter((r) => /\$filter/.test(r) && !/\$count\?/.test(r)).length <= 2, "her tuşta istek atmaz");
		key(input, "Enter");
		assert.strictEqual(field.getValue(), "S0005");
		type(one(field, "input") as HTMLInputElement, "Firma 77");
		key(one(field, "input"), "Escape");
		key(one(field, "input"), "Enter");
		await until(() => field.getValue() === "S0077", "geç gelen yanıt çözülür");
		type(one(field, "input") as HTMLInputElement, "yok yok");
		key(one(field, "input"), "Escape");
		key(one(field, "input"), "Enter");
		await until(() => one(field, ".korNote"), "bulunamadı uyarısı");
		assert.strictEqual(field.getValue(), "S0077");
	});

	QUnit.test(`${name}: F4 penceresi yalnız sayfa yükler, seçer`, async (assert) => {
		const field = new LookupField({ label: "Sipariş", keyPath: "Id", textPath: "Firm" });
		field.setModel(make());
		field.bindAggregation("rows", { path: "/Orders", parameters } as never);
		show(field);
		one(field, "input").focus();
		key(one(field, "input"), "F4");
		await until(() => all(document, ".korDialog .korRow").length > 3 && one(document, ".korDialog [data-row='5'][data-col='1']")?.textContent === "Deniz", "F4 satırları");
		const scroll = one(document, ".korDialog [role=grid]");
		scroll.focus();
		for (let i = 0; i < 5; i++) key(scroll, "ArrowDown");
		key(scroll, "Enter");
		assert.strictEqual(field.getText(), "Deniz");
		await wait(60);
		field.destroy();
		assert.strictEqual(document.querySelector(".korDialog"), null, "pencere DOM'da kalmaz");
	});
}

let v2: V2Model;
let mock: MockServer;
let seen: string[] = [];
QUnit.module("OData V2", {
	before: () => {
		(MockServer as unknown as { config(o: object): void }).config({ autoRespond: true, autoRespondAfter: 60 });
	},
	beforeEach: () => {
		seen = [];
		mock = new MockServer({ rootUri: "/v2/" } as never);
		const base = sap.ui.require.toUrl("kor/ui/qunit/odata/v2.xml");
		(mock as unknown as { simulate(m: string, o: object): void }).simulate(base.includes("kor/ui/qunit") && !base.includes("test-resources") ? base.replace("resources/kor", "test-resources/kor") : base, { bGenerateMissingMockData: false, sMockdataBaseUrl: "" });
		const ms = mock as unknown as { setEntitySetData(n: string, d: object[]): void; start(): void; attachBefore(m: string, fn: (e: { getParameters(): { oXhr: { url: string } } }) => void): void; attachAfter(m: string, fn: () => void): void };
		ms.setEntitySetData("Orders", raw.map((r, i) => ({ ...r, Due: `/Date(${Date.UTC(2026, 2, 1 + (i % 28))})/`, __metadata: { id: `/v2/Orders('${r.Id}')`, uri: `/v2/Orders('${r.Id}')`, type: "KOR.Order" } })));
		const node = (Id: string, Parent: string | null, Level: number, Drill: string) => ({ Id, Parent, Level, Drill, Name: `Dal ${Id}`, __metadata: { id: `/v2/Nodes('${Id}')`, uri: `/v2/Nodes('${Id}')`, type: "KOR.Node" } });
		ms.setEntitySetData("Nodes", [node("1", null, 0, "expanded"), node("11", "1", 1, "collapsed"), node("111", "11", 2, "leaf"), node("12", "1", 1, "leaf"), node("2", null, 0, "leaf")]);
		ms.attachBefore("GET", (e) => seen.push(decodeURIComponent(e.getParameters().oXhr.url)));
		ms.start();
		v2 = new V2Model("/v2/", { defaultCountMode: "Inline", useBatch: true } as never);
		v2.setDefaultBindingMode("TwoWay" as never);
	},
	afterEach: () => {
		clean();
		v2.destroy();
		mock.destroy();
	}
});
shared("V2", () => v2, () => seen);

QUnit.test("V2: Decimal metin kalır, tarih UTC gün olarak yazılır", async (assert) => {
	const grid = gridOf(v2);
	await until(() => cell(grid, 5, 1) === "Deniz");
	edit(grid, 2, 2, "1.234,5");
	assert.strictEqual(v2.getProperty("/Orders('S0002')/Amount"), "1234.5");
	edit(grid, 3, 3, "15.12.2026");
	assert.strictEqual((v2.getProperty("/Orders('S0003')/Due") as Date).getTime(), Date.UTC(2026, 11, 15));
	edit(grid, 4, 4, "12");
	assert.strictEqual(v2.getProperty("/Orders('S0004')/Qty"), 12);
	assert.ok(v2.hasPendingChanges());
	assert.strictEqual(cell(grid, 3, 3), "15.12.2026");
	v2.resetChanges();
	await until(() => cell(grid, 4, 4) === "4", "geri alınır");
});

QUnit.test("V2: DateField Edm.DateTime günü kaydırmaz", async (assert) => {
	const grid = gridOf(v2);
	await until(() => cell(grid, 5, 1) === "Deniz");
	const field = new DateField({ value: "{Due}" } as never);
	field.setModel(v2);
	field.bindElement("/Orders('S0001')");
	show(field);
	await until(() => (one(field, "input") as HTMLInputElement).value.startsWith("2 Mar"), "gün");
	const input = one(field, "input") as HTMLInputElement;
	input.value = "20.04.2026";
	key(input, "Enter");
	assert.strictEqual((v2.getProperty("/Orders('S0001')/Due") as Date).getTime(), Date.UTC(2026, 3, 20));
});

QUnit.test("V2: TreeGrid hiyerarşi (istemci kipi)", async (assert) => {
	const tree = new TreeGrid({ height: "300px", openLevels: 1, columns: [new Column({ label: "Ad", path: "Name" })] } as never);
	tree.setModel(v2);
	tree.bindAggregation("rows", { path: "/Nodes", parameters: { operationMode: "Client", countMode: "Inline", treeAnnotationProperties: { hierarchyLevelFor: "Level", hierarchyNodeFor: "Id", hierarchyParentNodeFor: "Parent", hierarchyDrillStateFor: "Drill" } } } as never);
	show(tree);
	const names = () => all(tree, ".korRow").sort((a, b) => Number(a.getAttribute("aria-rowindex")) - Number(b.getAttribute("aria-rowindex"))).map((r) => r.textContent).join();
	await until(() => names() === "Dal 1,Dal 11,Dal 12,Dal 2", "ilk düzey");
	one(tree, '[data-row="1"] [data-twist]').click();
	await until(() => names() === "Dal 1,Dal 11,Dal 111,Dal 12,Dal 2", "dal açılır");
	assert.strictEqual(all(tree, "[aria-level='3']").length, 1);
});

let v4: V4Model;
let server: V4Server;
QUnit.module("OData V4", {
	beforeEach: () => {
		server = new V4Server("/v4/", raw.map((r, i) => ({ ...r, Due: new Date(Date.UTC(2026, 2, 1 + (i % 28))).toISOString().slice(0, 10) })));
		v4 = new V4Model({ serviceUrl: "/v4/", synchronizationMode: "None", groupId: "$direct", operationMode: "Server", autoExpandSelect: true } as never);
	},
	afterEach: async () => {
		clean();
		await wait(60);
		v4.destroy();
		server.stop();
	}
});
shared("V4", () => v4, () => server.log, { $count: true });

QUnit.test("V4: $count olmadan da sonuna kadar kaydırılır", async (assert) => {
	const grid = gridOf(v4);
	await until(() => cell(grid, 5, 1) === "Deniz");
	const scroll = one(grid, "[role=grid]");
	for (let i = 0; i < 12; i++) {
		scroll.scrollTop = 1e7;
		await wait(90);
	}
	await until(() => scroll.getAttribute("aria-rowcount") === String(COUNT + 1), "gerçek uzunluk");
	assert.ok(true);
});

QUnit.test("V4: yazınca PATCH gider, Decimal metindir; hata olursa hücre geri döner", async (assert) => {
	const grid = gridOf(v4, { $count: true });
	await until(() => cell(grid, 5, 1) === "Deniz");
	edit(grid, 2, 2, "1.234,5");
	await until(() => server.log.some((l) => l.startsWith("PATCH")), "PATCH");
	assert.strictEqual(server.rows[2].Amount, "1234.5");
	edit(grid, 3, 3, "15.12.2026");
	await until(() => server.rows[3].Due === "2026-12-15", "Edm.Date");
	server.fail = true;
	edit(grid, 4, 4, "99");
	await until(() => cell(grid, 4, 4) === "4", "hata sonrası eski değer");
	assert.ok(one(document, ".korToast"), "kullanıcıya söylenir");
});
