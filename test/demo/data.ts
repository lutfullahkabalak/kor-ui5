/* Tümü uydurma veridir. */
let seed = 7;
const rnd = (): number => {
	seed = (seed * 16807) % 2147483647;
	return (seed - 1) / 2147483646;
};
const pick = <T>(list: T[]): T => list[Math.floor(rnd() * list.length)];
export const people = ["Elif Aydın", "Mert Kaya", "Selin Uçar", "Okan Demir", "Deniz Şahin", "Barış Çelik", "İpek Güneş", "Kerem Yalın"];
const firms = ["Ada Yapı", "Deniz Lojistik", "Mavi Tekstil", "Toros Gıda", "Ege Seramik", "Yıldız Ambalaj", "Atlas Metal", "Bozkır Enerji", "Çınar Mobilya", "Lale Kimya", "Poyraz Otomotiv", "Meriç Tarım", "Sarp Denizcilik", "Işık Elektronik"];
const items = ["Hidrolik pres", "Konveyör bandı", "Servo motor", "Kontrol paneli", "Rulman seti", "Çelik profil", "Sensör modülü", "Pompa grubu", "Vana takımı", "Kaynak robotu"];
export const statuses = ["Taslak", "Onayda", "Üretimde", "Sevk edildi", "Faturalandı", "Bloke"];
export const states = { Taslak: "none", Onayda: "wait", "Üretimde": "info", "Sevk edildi": "info", "Faturalandı": "success", Bloke: "danger" };
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
export const customers = roots.flatMap((r) => kinds.map((k) => ({ name: `${r} ${k}` }))).map((c, i) => ({ id: String(100010 + i * 7), name: c.name, city: pick(cities), limit: 50000 * (1 + Math.floor(rnd() * 40)), risk: pick(["Düşük", "Düşük", "Orta", "Yüksek"]) }));
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
const costs: Cost[] = ([["Üretim", "1", ["Pres hattı", "Kaynak", "Boya", "Montaj"]], ["Lojistik", "2", ["Depo", "Nakliye", "Gümrük"]], ["Satış", "3", ["Yurt içi", "İhracat", "Servis"]], ["Yönetim", "4", ["Finans", "İnsan kaynakları", "Bilgi sistemleri"]]] as [string, string, string[]][]).map(([name, code, units]) => branch(name, code, units.map((u, i) => branch(u, `${code}${i + 1}0`, ["Personel", "Enerji", "Bakım", "Sarf malzeme", "Dış hizmet"].map((k, j) => leaf(k, `${code}${i + 1}${j + 1}`))))));
const flow = (k: number, stuck: number) => ({
	nodes: [
		{ key: "teklif", label: "Teklif", column: 0, value: 96 * k, state: "none", note: "" },
		{ key: "siparis", label: "Sipariş", column: 1, value: 71 * k, state: "none", note: "" },
		{ key: "kayip", label: "Kaybedilen", column: 1, value: 25 * k, state: "danger", note: "%26 kayıp" },
		{ key: "uretim", label: "Üretim", column: 2, value: 44 * k, state: "wait", note: `${stuck} iş takıldı` },
		{ key: "stok", label: "Stoktan", column: 2, value: 27 * k, state: "none", note: "" },
		{ key: "sevk", label: "Sevkiyat", column: 3, value: 60 * k, state: "none", note: "" },
		{ key: "fatura", label: "Fatura", column: 4, value: 53 * k, state: "none", note: "" },
		{ key: "tahsil", label: "Tahsilat", column: 5, value: 42 * k, state: "none", note: "kasada" },
		{ key: "gec", label: "Geciken", column: 5, value: 11 * k, state: "danger", note: "vadesi geçti" }
	],
	links: [["teklif", "siparis", 71], ["teklif", "kayip", 25], ["siparis", "uretim", 44], ["siparis", "stok", 27], ["uretim", "sevk", 34], ["stok", "sevk", 26], ["sevk", "fatura", 53], ["fatura", "tahsil", 42], ["fatura", "gec", 11]].map(([source, target, value]) => ({ source, target, value: Number(value) * k }))
});
export const periods: Record<string, { flow: ReturnType<typeof flow>; cash: number; delta: number }> = {
	hafta: { flow: flow(0.25e6, 6), cash: 10.5, delta: -2.1 },
	ay: { flow: flow(1e6, 18), cash: 42.1, delta: 8.4 },
	ceyrek: { flow: flow(2.9e6, 41), cash: 121.8, delta: 12.6 }
};
/** Durak → sipariş durumu */
export const stageStatus: Record<string, string> = { teklif: "Taslak", siparis: "Onayda", kayip: "Bloke", uretim: "Üretimde", stok: "Üretimde", sevk: "Sevk edildi", fatura: "Faturalandı", tahsil: "Faturalandı", gec: "Bloke" };
export const model = {
	page: "akis", period: "ay", stage: "", stageTitle: "Son siparişler", picked: 0, pickedText: "",
	...{ flow: periods.ay.flow, cash: periods.ay.cash, delta: periods.ay.delta },
	orders, states, statuses,
	months: ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"],
	cashIn: [22.4, 25.1, 24.2, 28.9, 31.5, 29.8, 33.2, 36.1, 34.4, 38.7, 42.1], cashPlan: [24, 25, 26, 28, 30, 31, 33, 35, 37, 39, 41, 43],
	spark1: [12, 14, 13, 17, 16, 19, 22, 21, 24], spark2: [9, 8.6, 8.9, 8.1, 7.4, 7.6, 6.9, 6.2, 5.8], spark3: [91, 92, 90, 93, 94, 93, 95, 96, 96.4],
	decisions: [
		{ firm: "Poyraz Otomotiv", text: "Kaynak robotu, 3 adet. Vade 45 günden 60 güne çıkıyor.", amount: "1.284.500,00 TRY", owner: "Mert Kaya", why: "Vade kuralın dışında" },
		{ firm: "Ege Seramik", text: "Konveyör bandı, 12 adet. İskonto %14 istendi.", amount: "486.200,00 TRY", owner: "Selin Uçar", why: "İskonto sınırı %10" },
		{ firm: "Toros Gıda", text: "Pompa grubu, 40 adet. Kredi limiti aşılıyor.", amount: "742.000,00 TRY", owner: "Okan Demir", why: "Limit 620.000 TRY" }
	],
	decision: 0,
	look: { mode: "light", density: "cozy", radius: 10 },
	order: {} as Record<string, unknown>, sheet: false, lookSheet: false,
	columns: [{ key: "yeni", title: "Yeni", limit: 0, state: "none" }, { key: "inceleme", title: "İncelemede", limit: 3, state: "info" }, { key: "onay", title: "Onayda", limit: 4, state: "wait" }, { key: "bloke", title: "Engelli", limit: 0, state: "danger" }, { key: "tamam", title: "Tamam", limit: 0, state: "success" }],
	cards: ([
		["yeni", "Hidrolik silindir teklifi", "Bozkır Enerji", "318.000 TRY", "Deniz Şahin", "Satın alma", "none"],
		["yeni", "Yıllık bakım sözleşmesi", "Ada Yapı", "96.400 TRY", "Elif Aydın", "Sözleşme", "none"],
		["yeni", "Laboratuvar sarf talebi", "Lale Kimya", "41.750 TRY", "İpek Güneş", "Satın alma", "none"],
		["inceleme", "Kur farkı mutabakatı", "Deniz Lojistik", "58.300 TRY", "Okan Demir", "Finans", "info"],
		["inceleme", "Yeni tedarikçi kaydı", "Meriç Tarım", "", "Selin Uçar", "Ana veri", "info"],
		["inceleme", "Servo motor fiyat revizyonu", "Işık Elektronik", "212.900 TRY", "Mert Kaya", "Satın alma", "info"],
		["onay", "Pres hattı yatırımı", "Atlas Metal", "2.450.000 TRY", "Kerem Yalın", "Yatırım", "wait"],
		["onay", "Ek nakliye bedeli", "Sarp Denizcilik", "73.600 TRY", "Barış Çelik", "Lojistik", "wait"],
		["bloke", "Fatura tutarı uyuşmuyor", "Yıldız Ambalaj", "127.480 TRY", "Elif Aydın", "Finans", "danger"],
		["tamam", "Ekim dönem kapanışı", "Muhasebe", "", "Okan Demir", "Finans", "success"],
		["tamam", "Konveyör kabul tutanağı", "Çınar Mobilya", "389.000 TRY", "Deniz Şahin", "Kalite", "success"]
	] as string[][]).map(([column, title, text, meta, person, tag, state], i) => ({ key: String(i), column, title, text, meta, person, tag, state })),
	lanes: [["pres", "Pres hattı", "Hol A", 92], ["kaynak", "Kaynak robotu", "Hol A", 114], ["boya", "Boya kabini", "Hol B", 61], ["montaj", "Montaj", "Hol C", 78], ["test", "Test ve kalite", "Laboratuvar", 45], ["paket", "Paketleme", "Depo 2", 38], ["saha", "Saha ekibi", "Dış montaj", 83]].map(([key, title, text, capacity]) => ({ key, title, text, capacity })),
	tasks: ([["pres", "Gövde sacı", "Atlas Metal", -6, -2, 100, "success"], ["pres", "Yan panel", "Poyraz Otomotiv", -1, 4, 55, "info"], ["pres", "Taban plakası", "Ada Yapı", 6, 10, 0, "none"], ["kaynak", "Şasi", "Poyraz Otomotiv", -3, 2, 70, "info"], ["kaynak", "Kasa", "Ege Seramik", 2, 6, 10, "wait"], ["kaynak", "Braket", "Bozkır Enerji", 8, 12, 0, "none"], ["boya", "Astar kat", "Atlas Metal", -1, 1, 80, "info"], ["boya", "Son kat", "Poyraz Otomotiv", 4, 7, 0, "wait"], ["montaj", "Konveyör", "Çınar Mobilya", -5, 0, 90, "info"], ["montaj", "Pompa grubu", "Toros Gıda", 2, 8, 0, "none"], ["montaj", "Hat kurulumu", "Lale Kimya", 10, 15, 0, "none"], ["test", "Basınç testi", "Toros Gıda", 9, 11, 0, "none"], ["paket", "Ambalaj", "Atlas Metal", 2, 4, 0, "none"], ["paket", "Sevk hazırlığı", "Çınar Mobilya", 5, 7, 0, "none"], ["saha", "Kurulum", "Deniz Lojistik", -7, -1, 100, "success"], ["saha", "Devreye alma", "Meriç Tarım", 0, 5, 20, "info"], ["saha", "Servis", "Ege Seramik", 8, 14, 0, "none"], ["test", "Kabul", "Çınar Mobilya", 1, 2, 0, "wait"]] as [string, string, string, number, number, number, string][]).map(([lane, title, text, s, e, progress, state], i) => ({ key: String(i), lane, title, text, start: iso(s), end: iso(e), progress, state })),
	stages: [{ title: "Teklif", info: "3 Kasım", state: "success" }, { title: "Sipariş", info: "7 Kasım", state: "success" }, { title: "Üretim", info: "sürüyor", state: "info" }, { title: "Sevkiyat", info: "", state: "none" }, { title: "Fatura", info: "", state: "none" }],
	activity: [
		{ person: "Mert Kaya", text: "vadeyi değiştirdi.", time: "09:40", field: "Vade", oldValue: "30 gün", newValue: "45 gün" },
		{ person: "Selin Uçar", text: "çizimi ekledi: pres-rev4.pdf", time: "dün" },
		{ person: "Sistem", text: "stok ayırdı.", time: "dün", icon: "package-check" }
	],
	marks: { "2026-10-29": "Cumhuriyet Bayramı", "2026-12-31": "Envanter sayımı", "2027-01-01": "Yılbaşı" },
cities, risks: { "Düşük": "success", Orta: "wait", "Yüksek": "danger" }, customers, costs, lookup: { id: "100010", name: "Ada Yapı", many: [{ key: "100017", text: "Ada Lojistik" }] },
	gallery: "giris", newOpen: false, draft: {} as Record<string, unknown>, ids: { tax: "" }, files: [{ key: "1", name: "teklif-4510000.pdf", size: 482000, progress: 100, error: "" }, { key: "2", name: "teknik-cizim.png", size: 1860000, progress: 100, error: "Bağlantı koptu" }],
	tags: ["Öncelikli", "İhracat", "Garanti", "Yedek parça", "Proje", "Numune"].map((name) => ({ key: name, name })),
	samples: { tags: ["Öncelikli", "Proje"], ship: "kara", loading: true, date: "2026-12-04", from: "2026-11-16", to: "2026-12-04", qty: 24, name: "Poyraz Otomotiv", toggle: true, check: true, seg: "ay", firm: "ada" },
	firms: firms.map((name, i) => ({ key: i ? String(i) : "ada", name }))
};
