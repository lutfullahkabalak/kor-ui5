// Mutabakat ve kiralama sayfalarının verisi (uydurma)
import { t } from "./i18n";

const entry = (key: string, side: string, date: string, doc: string, text: string, amount: number) => ({ key, side, date, doc, text, amount, match: "", auto: false });

export const finance = {
	// Gönderim takibi
	campaign: { sent: 48, opened: 41, agreed: 29, disputed: 6, silent: 13 },
	entries: [
		entry("o1", "ours", "2026-11-03", "FT-2611", t("finSheet"), 48200),
		entry("o2", "ours", "2026-11-12", "FT-2644", t("finProfile"), 15750),
		entry("o3", "ours", "2026-11-18", "FT-2652", t("finPipe"), 22400),
		entry("o4", "ours", "2026-11-20", "OD-118", t("finPayment"), -40000),
		entry("o5", "ours", "2026-11-25", "IA-07", t("finReturn"), -2300),
		entry("o6", "ours", "2026-11-28", "OD-121", t("finPayment"), -18000),
		entry("t1", "theirs", "2026-11-03", "FT-2611", t("finInvoice"), 48200),
		entry("t2", "theirs", "2026-11-13", "FT-2644", t("finInvoice"), 15750),
		entry("t3", "theirs", "2026-11-19", "FT-2652", t("finInvoice"), 22400),
		entry("t4", "theirs", "2026-11-21", "", t("finTransfer"), -40000),
		entry("t5", "theirs", "2026-11-27", "IA-07", t("finReturnFx"), -2280),
		entry("t6", "theirs", "2026-11-29", "FT-2690", t("finNotOurs"), 6900)
	],
	bridge: [
		{ key: "ours", label: t("finOurBalance"), value: 26050, kind: "total" },
		{ key: "transit", label: t("finInTransit"), value: 18000, kind: "change" },
		{ key: "invoice", label: t("finMissingInvoice"), value: 6900, kind: "change" },
		{ key: "fx", label: t("finFx"), value: 20, kind: "change" },
		{ key: "theirs", label: t("finTheirBalance"), value: 50970, kind: "total" }
	],
	periods: ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"],
	partners: [
		["Ege Çelik", "4810", [[4, 182000, 4, 182000], [3, 96500, 3, 96500], [5, 210300, 5, 210300], [4, 182000, 4, 182000], [3, 96500, 3, 96500], [5, 210300, 4, 198300]]],
		["Kuzey Lojistik", "7720", [[2, 24000, 2, 24000], [2, 26500, 2, 26500], [2, 25100, 2, 25100], [2, 24000, 2, 24000], [2, 26500, 2, 26500], [3, 31800, -1, null]]],
		["Marmara Ambalaj", "1093", [[1, 3200, -1, null], [2, 8900, 2, 8900], [2, 9100, 2, 9150], [1, 4100, 1, 4100], [2, 8800, 2, 8800], [2, 9100, 2, 9100]]],
		["Anka Kimya", "5531", [[6, 412000, 6, 412000], [5, 388000, 5, 388000], [6, 401500, 6, 401500], [7, 455000, 6, 431000], [6, 410000, 6, 410000], [6, 398000, -1, null]]],
		["Toros Enerji", "2208", [[1, 61000, 1, 61000], [1, 61000, 1, 61000], [1, 64500, 1, 64500], [1, 64500, 1, 64500], [1, 64500, 1, 64500], [1, 64500, 1, 64500]]]
	].map(([title, vkn, cells], i) => ({
		key: String(i + 1),
		title: title as string,
		text: `VKN ${vkn as string} ···`,
		cells: (cells as (number | null)[][]).map(([oc, oa, tc, ta], p) => ({ period: ["2026-06", "2026-07", "2026-08", "2026-09", "2026-10", "2026-11"][p], oc, oa, tc, ta }))
	})),
	// Kiralama
	lease: [
		{ key: "i1", date: "2025-03-01", kind: "increase", title: "", text: t("finCpiPast1"), deadline: null, state: "success" },
		{ key: "i2", date: "2026-03-01", kind: "increase", title: "", text: t("finCpiPast2"), deadline: null, state: "success" },
		{ key: "o1", date: "2027-03-01", kind: "option", title: t("finFloorOption"), text: t("finFloorText"), deadline: "2027-01-01", state: "" },
		{ key: "i3", date: "2027-03-01", kind: "increase", title: "", text: t("finCpiAvg"), deadline: null, state: "" },
		{ key: "t1", date: "2028-03-01", kind: "termination", title: t("finBreak"), text: t("finBreakText"), deadline: "2027-09-01", state: "" },
		{ key: "r1", date: "2029-02-28", kind: "renewal", title: "", text: t("finRenewText"), deadline: "2028-11-30", state: "" }
	],
	escalation: { rule: "index", rate: 15, cap: 25, index: [32.9, 24.1, 18.6, 15] },
	rentPlan: [
		{ date: "2026-09-01", principal: 61200, interest: 23800, state: "success", remeasured: false },
		{ date: "2026-10-01", principal: 61700, interest: 23300, state: "success", remeasured: false },
		{ date: "2026-11-01", principal: 62200, interest: 22800, state: "success", remeasured: false },
		{ date: "2026-12-01", principal: 62700, interest: 22300, state: "none", remeasured: false },
		{ date: "2027-01-01", principal: 63200, interest: 21800, state: "none", remeasured: false },
		{ date: "2027-03-01", principal: 79600, interest: 26650, state: "none", remeasured: true }
	],
	fleet: [
		{ key: "c1", title: "34 KOR 512", text: t("finCompact") },
		{ key: "c2", title: "34 KOR 718", text: "SUV" },
		{ key: "c3", title: "06 KOR 204", text: t("finVan") },
		{ key: "c4", title: "35 KOR 090", text: t("finCompact") }
	],
	bookings: [
		{ key: "R-1041", lane: "c1", title: "R-1041", text: "Selin Uçar", start: "2026-11-23", end: "2026-11-26", state: "info" },
		{ key: "M-1", lane: "c1", title: t("finService"), text: "", start: "2026-11-30", end: "2026-11-30", state: "wait" },
		{ key: "R-1042", lane: "c2", title: "R-1042", text: "Mert Kaya", start: "2026-11-24", end: "2026-12-01", state: "info" },
		{ key: "R-1043", lane: "c3", title: "R-1043", text: "Kuzey Lojistik", start: "2026-11-27", end: "2026-12-04", state: "success" },
		{ key: "R-1044", lane: "c4", title: "R-1044", text: "Okan Demir", start: "2026-12-02", end: "2026-12-05", state: "none" }
	]
};
