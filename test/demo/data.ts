import DateFormat from "sap/ui/core/format/DateFormat";
import { dayText, num, pct } from "kor/ui/util";
import { language, t } from "./i18n";

/* Tümü uydurma veridir. */
const month = DateFormat.getDateInstance({ pattern: "MMM" });
const monthAndYear = DateFormat.getDateInstance({ format: "yMMMM" });
const time = DateFormat.getTimeInstance({ style: "short" });
const clock = (hour: number, minute = 0): string => time.format(new Date(2026, 10, 24, hour, minute));
const money = (value: number, decimals = 0): string => `${num(value, decimals)} TRY`;
let seed = 7;
const rnd = (): number => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};
const pick = <T>(list: T[]): T => list[Math.floor(rnd() * list.length)];
export const people = ["Elif Aydın", "Mert Kaya", "Selin Uçar", "Okan Demir", "Deniz Şahin", "Barış Çelik", "İpek Güneş", "Kerem Yalın"];
const firms = ["Ada Yapı", "Deniz Lojistik", "Mavi Tekstil", "Toros Gıda", "Ege Seramik", "Yıldız Ambalaj", "Atlas Metal", "Bozkır Enerji", "Çınar Mobilya", "Lale Kimya", "Poyraz Otomotiv", "Meriç Tarım", "Sarp Denizcilik", "Işık Elektronik"];
const items = [t("hydraulicPress"), t("conveyorBelt"), t("servoMotor"), t("controlPanel"), t("bearingKit"), t("steelProfile"), t("sensorModule"), t("pumpAssembly"), t("valveKit"), t("weldingRobot")];
export const statuses = [t("draft"), t("pending"), t("inProduction"), t("shipped"), t("invoiced"), t("blocked")];
export const states = Object.fromEntries(statuses.map((status, index) => [status, ["none", "wait", "info", "info", "success", "danger"][index]]));
const iso = (offset: number): string => {
	const d = new Date(Date.UTC(2026, 10, 24 + offset));
	return d.toISOString().slice(0, 10);
};
export type Order = { id: string; firm: string; item: string; status: string; qty: number; amount: number; currency: string; due: string; progress: number; owner: string; trend: number[]; note: string };
export const orders: Order[] = Array.from({ length: 10000 }, (_, i) => {
	const status = pick(statuses);
	const at = statuses.indexOf(status);
	let level = 40 + rnd() * 30;
	return {
		id: String(4510000 - i), firm: pick(firms), item: pick(items), status, qty: 1 + Math.floor(rnd() * 240),
		amount: Math.round((2000 + rnd() ** 3 * 900000) * 100) / 100, currency: "TRY", due: iso(Math.floor(rnd() * 90) - 20),
		progress: [0, 10, 45, 80, 100, 30][at] + (at === 2 ? Math.floor(rnd() * 30) : 0), owner: pick(people),
		trend: Array.from({ length: 9 }, () => (level += (rnd() - 0.48) * 22)), note: ""
	};
});
const cities = ["İstanbul", "Bursa", "İzmir", "Ankara", "Kocaeli", "Gaziantep", "Konya", "Adana"];
const kinds = ["Yapı", "Lojistik", "Tekstil", "Gıda", "Seramik", "Ambalaj", "Metal", "Enerji", "Kimya", "Otomotiv"];
const roots = ["Ada", "Deniz", "Mavi", "Toros", "Ege", "Yıldız", "Atlas", "Bozkır", "Çınar", "Lale", "Poyraz", "Meriç", "Sarp", "Işık", "Vadi", "Doruk", "Kuğu", "Nehir"];
export const customers = roots.flatMap((r) => kinds.map((k) => ({ name: `${r} ${k}` }))).map((c, i) => ({ id: String(100010 + i * 7), name: c.name, city: pick(cities), limit: 50000 * (1 + Math.floor(rnd() * 40)), risk: pick([t("riskLow"), t("riskLow"), t("riskMedium"), t("riskHigh")]) }));
type Cost = { name: string; code: string; owner: string; budget: number; actual: number; diff: number; used: number; children?: Cost[] };
const leaf = (name: string, code: string): Cost => {
	const budget = 40000 + Math.round(rnd() * 900) * 1000;
	const actual = Math.round(budget * (0.55 + rnd() * 0.55));
	return { name, code, owner: pick(people), budget, actual, diff: budget - actual, used: Math.round((actual / budget) * 100) };
};
const branch = (name: string, code: string, children: Cost[]): Cost => {
	const budget = children.reduce((a, c) => a + c.budget, 0);
	const actual = children.reduce((a, c) => a + c.actual, 0);
	return { name, code, owner: pick(people), budget, actual, diff: budget - actual, used: Math.round((actual / budget) * 100), children };
};
const costs: Cost[] = ([[t("production"), "1", [t("pressLine"), t("welding"), t("paint"), t("assembly")]], [t("logistics"), "2", [t("warehouse"), t("transport"), t("customs")]], [t("sales"), "3", [t("domestic"), t("exports"), t("service")]], [t("administration"), "4", [t("finance"), t("hr"), t("it")]]] as [string, string, string[]][]).map(([name, code, units]) => branch(name, code, units.map((u, i) => branch(u, `${code}${i + 1}0`, [t("staff"), t("energy"), t("maintenance"), t("consumables"), t("externalServices")].map((k, j) => leaf(k, `${code}${i + 1}${j + 1}`))))));
const flow = (k: number, stuck: number) => ({
	nodes: [
		{ key: "teklif", label: t("quote"), column: 0, value: 96 * k, state: "none", note: "" },
		{ key: "siparis", label: t("order"), column: 1, value: 71 * k, state: "none", note: "" },
		{ key: "kayip", label: t("lost"), column: 1, value: 25 * k, state: "danger", note: t("lossRate", pct(26)) },
		{ key: "uretim", label: t("production"), column: 2, value: 44 * k, state: "wait", note: t("blockedJobs", num(stuck)) },
		{ key: "stok", label: t("fromStock"), column: 2, value: 27 * k, state: "none", note: "" },
		{ key: "sevk", label: t("dispatch"), column: 3, value: 60 * k, state: "none", note: "" },
		{ key: "fatura", label: t("invoice"), column: 4, value: 53 * k, state: "none", note: "" },
		{ key: "tahsil", label: t("collections"), column: 5, value: 42 * k, state: "none", note: t("collected") },
		{ key: "gec", label: t("overdue"), column: 5, value: 11 * k, state: "danger", note: t("pastDue") }
	],
	links: [["teklif", "siparis", 71], ["teklif", "kayip", 25], ["siparis", "uretim", 44], ["siparis", "stok", 27], ["uretim", "sevk", 34], ["stok", "sevk", 26], ["sevk", "fatura", 53], ["fatura", "tahsil", 42], ["fatura", "gec", 11]].map(([source, target, value]) => ({ source, target, value: Number(value) * k }))
});
export const periods: Record<string, { flow: ReturnType<typeof flow>; cash: number; delta: number }> = {
	hafta: { flow: flow(0.25e6, 6), cash: 10.5, delta: -2.1 },
	ay: { flow: flow(1e6, 18), cash: 42.1, delta: 8.4 },
	ceyrek: { flow: flow(2.9e6, 41), cash: 121.8, delta: 12.6 }
};
/** Durak → sipariş durumu */
export const stageStatus: Record<string, string> = {
	teklif: t("draft"), siparis: t("pending"), kayip: t("blocked"), uretim: t("inProduction"),
	stok: t("inProduction"), sevk: t("shipped"), fatura: t("invoiced"), tahsil: t("invoiced"), gec: t("blocked")
};
export const model = {
	language,
	variantKeys: { orders: `kor-demo-orders-${language}`, costs: "kor-demo-costs" },
	labels: {
		shellTitle: t("shellTitle", monthAndYear.format(new Date(2026, 10, 1))),
		orderCount: num(orders.length),
		orderCountHint: t("rowCount", num(orders.length)),
		cardCount: num(11),
		autoPayTime: t("autoPayAt", clock(9)),
		lineItemTotal: t("lineItemTotal", num(124)),
		creditDetails: t("creditDetails", money(620000), money(742000)),
		closeInDays: t("closeInDays", num(6)),
		exchangeUpdated: t("exchangeUpdated", clock(9))
	},
	page: "akis", period: "ay", stage: "", stageTitle: t("latestOrders"), picked: 0, pickedText: "",
	...{ flow: periods.ay.flow, cash: periods.ay.cash, delta: periods.ay.delta },
	orders, states, statuses,
	months: Array.from({ length: 12 }, (_, index) => month.format(new Date(2026, index, 1))),
	cashIn: [22.4, 25.1, 24.2, 28.9, 31.5, 29.8, 33.2, 36.1, 34.4, 38.7, 42.1], cashPlan: [24, 25, 26, 28, 30, 31, 33, 35, 37, 39, 41, 43],
	spark1: [12, 14, 13, 17, 16, 19, 22, 21, 24], spark2: [9, 8.6, 8.9, 8.1, 7.4, 7.6, 6.9, 6.2, 5.8], spark3: [91, 92, 90, 93, 94, 93, 95, 96, 96.4],
	decisions: [
		{ firm: "Poyraz Otomotiv", text: t("approvalRobot"), amount: money(1284500, 2), owner: "Mert Kaya", why: t("approvalTerms") },
		{ firm: "Ege Seramik", text: t("discountRequested", pct(14)), amount: money(486200, 2), owner: "Selin Uçar", why: t("discountLimit", pct(10)) },
		{ firm: "Toros Gıda", text: t("approvalPump"), amount: money(742000, 2), owner: "Okan Demir", why: t("limitAmount", money(620000)) }
	],
	decision: 0,
	look: { mode: "light", density: "cozy", radius: 10 },
	order: {} as Record<string, unknown>, sheet: false, lookSheet: false,
	columns: [{ key: "yeni", title: t("new"), limit: 0, state: "none" }, { key: "inceleme", title: t("inReview"), limit: 3, state: "info" }, { key: "onay", title: t("pending"), limit: 4, state: "wait" }, { key: "bloke", title: t("boardBlocked"), limit: 0, state: "danger" }, { key: "tamam", title: t("done"), limit: 0, state: "success" }],
	cards: ([
		["yeni", t("hydraulicQuote"), "Bozkır Enerji", money(318000), "Deniz Şahin", t("purchasing"), "none"],
		["yeni", t("maintenanceContract"), "Ada Yapı", money(96400), "Elif Aydın", t("contract"), "none"],
		["yeni", t("labRequest"), "Lale Kimya", money(41750), "İpek Güneş", t("purchasing"), "none"],
		["inceleme", t("exchangeReconciliation"), "Deniz Lojistik", money(58300), "Okan Demir", t("finance"), "info"],
		["inceleme", t("supplierRegistration"), "Meriç Tarım", "", "Selin Uçar", t("masterData"), "info"],
		["inceleme", t("motorPrice"), "Işık Elektronik", money(212900), "Mert Kaya", t("purchasing"), "info"],
		["onay", t("pressInvestment"), "Atlas Metal", money(2450000), "Kerem Yalın", t("investment"), "wait"],
		["onay", t("extraFreight"), "Sarp Denizcilik", money(73600), "Barış Çelik", t("logistics"), "wait"],
		["bloke", t("invoiceMismatch"), "Yıldız Ambalaj", money(127480), "Elif Aydın", t("finance"), "danger"],
		["tamam", t("octoberClose"), t("accounting"), "", "Okan Demir", t("finance"), "success"],
		["tamam", t("conveyorAcceptance"), "Çınar Mobilya", money(389000), "Deniz Şahin", t("quality"), "success"]
	] as string[][]).map(([column, title, text, meta, person, tag, state], i) => ({ key: String(i), column, title, text, meta, person, tag, state })),
	lanes: [["pres", t("pressLine"), t("hallA"), 92], ["kaynak", t("weldingRobot"), t("hallA"), 114], ["boya", t("paintBooth"), t("hallB"), 61], ["montaj", t("assembly"), t("hallC"), 78], ["test", t("testQuality"), t("lab"), 45], ["paket", t("packing"), t("warehouseTwo"), 38], ["saha", t("fieldTeam"), t("externalAssembly"), 83]].map(([key, title, text, capacity]) => ({ key, title, text, capacity })),
	tasks: ([["pres", t("bodySheet"), "Atlas Metal", -6, -2, 100, "success"], ["pres", t("sidePanel"), "Poyraz Otomotiv", -1, 4, 55, "info"], ["pres", t("basePlate"), "Ada Yapı", 6, 10, 0, "none"], ["kaynak", t("chassis"), "Poyraz Otomotiv", -3, 2, 70, "info"], ["kaynak", t("housing"), "Ege Seramik", 2, 6, 10, "wait"], ["kaynak", t("bracket"), "Bozkır Enerji", 8, 12, 0, "none"], ["boya", t("primer"), "Atlas Metal", -1, 1, 80, "info"], ["boya", t("topCoat"), "Poyraz Otomotiv", 4, 7, 0, "wait"], ["montaj", t("conveyor"), "Çınar Mobilya", -5, 0, 90, "info"], ["montaj", t("pumpAssembly"), "Toros Gıda", 2, 8, 0, "none"], ["montaj", t("lineInstallation"), "Lale Kimya", 10, 15, 0, "none"], ["test", t("pressureTest"), "Toros Gıda", 9, 11, 0, "none"], ["paket", t("packaging"), "Atlas Metal", 2, 4, 0, "none"], ["paket", t("dispatchPreparation"), "Çınar Mobilya", 5, 7, 0, "none"], ["saha", t("installation"), "Deniz Lojistik", -7, -1, 100, "success"], ["saha", t("commissioning"), "Meriç Tarım", 0, 5, 20, "info"], ["saha", t("service"), "Ege Seramik", 8, 14, 0, "none"], ["test", t("acceptance"), "Çınar Mobilya", 1, 2, 0, "wait"]] as [string, string, string, number, number, number, string][]).map(([lane, title, text, s, e, progress, state], i) => ({ key: String(i), lane, title, text, start: iso(s), end: iso(e), progress, state })),
	stages: [{ title: t("quote"), info: dayText("2026-11-03"), state: "success" }, { title: t("order"), info: dayText("2026-11-07"), state: "success" }, { title: t("production"), info: t("inProgress"), state: "info" }, { title: t("dispatch"), info: "", state: "none" }, { title: t("invoice"), info: "", state: "none" }],
	activity: [
		{ person: "Mert Kaya", text: t("changedTerms"), time: clock(9, 40), field: t("paymentTerms"), oldValue: t("daysCount", num(30)), newValue: t("daysCount", num(45)) },
		{ person: "Selin Uçar", text: t("addedDrawing"), time: t("yesterday") },
		{ person: t("systemUser"), text: t("reservedStock"), time: t("yesterday"), icon: "package-check" }
	],
	marks: { "2026-10-29": t("republicDay"), "2026-12-31": t("stockCount"), "2027-01-01": t("newYear") },
	cities, risks: { [t("riskLow")]: "success", [t("riskMedium")]: "wait", [t("riskHigh")]: "danger" }, customers, costs, lookup: { id: "100010", name: "Ada Yapı", many: [{ key: "100017", text: "Ada Lojistik" }] },
	gallery: "giris", newOpen: false, draft: {} as Record<string, unknown>, ids: { tax: "" }, files: [{ key: "1", name: "teklif-4510000.pdf", size: 482000, progress: 100, error: "" }, { key: "2", name: "teknik-cizim.png", size: 1860000, progress: 100, error: t("connectionLost") }],
	tags: ["priority", "exports", "warranty", "spares", "project", "sample"].map((key) => ({ key, name: t(key) })),
	samples: { tags: ["priority", "project"], ship: "kara", loading: true, date: "2026-12-04", from: "2026-11-16", to: "2026-12-04", qty: 24, name: "Poyraz Otomotiv", toggle: true, check: true, seg: "ay", firm: "ada" },
	firms: firms.map((name, i) => ({ key: i ? String(i) : "ada", name }))
};
