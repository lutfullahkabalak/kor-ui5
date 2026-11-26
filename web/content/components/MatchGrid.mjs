export default {
	children: ["MatchEntry"],
	summary: { en: "Matches your ledger against a business partner's statement and shows what is left open.", tr: "Defterinizi karşı tarafın ekstresiyle eşleştirir, açık kalanı gösterir." },
	use: {
		en: ["Use it for account reconciliation with customers and suppliers, bank reconciliation and intercompany matching.", "Give both sides' amounts in the same direction: convert the partner's statement to your sign first."],
		tr: ["Müşteri ve tedarikçi cari mutabakatında, banka mutabakatında ve şirketler arası eşleştirmede kullan.", "İki tarafın tutarını aynı yönle ver: karşı tarafın ekstresini önce kendi işaretine çevir."]
	},
	avoid: { en: ["Do not use it for tens of thousands of lines; filter to one partner and one period first."], tr: ["On binlerce satır için kullanma; önce tek cari ve tek döneme süz."] },
	keyboard: [
		["Space, Enter", { en: "Select or clear a record. A matched record selects its whole group.", tr: "Kaydı seçer veya bırakır. Eşleşmiş kayıt tüm grubunu seçer." }],
		["Escape", { en: "Clear the selection.", tr: "Seçimi kaldırır." }]
	],
	related: ["ReconcileLetter", "ReconMatrix", "Statement"],
	samples: [
		{
			title: { en: "Supplier reconciliation", tr: "Tedarikçi mutabakatı" },
			text: { en: "Press Auto-match, then select the two remaining returns and match them by hand; the difference is shown on the group.", tr: "Otomatik eşleştir'e bas, kalan iki iadeyi seçip elle eşleştir; fark grubun üzerinde görünür." },
			xml: `<k:MatchGrid currency="TRY" oursTitle="[[Our ledger||Defterimiz]]" theirsTitle="Ege Çelik" tolerance="0.5" matchChange=".onMatch" entries="{path: '/entries', templateShareable: false}">
				<k:MatchEntry key="{key}" side="{side}" date="{date}" document="{doc}" text="{text}" amount="{amount}" match="{match}" auto="{auto}"/>
			</k:MatchGrid>`,
			data: {
				entries: [
					{ key: "o1", side: "ours", date: "2026-11-03", doc: "FT-2611", text: "[[Sheet metal||Sac levha]]", amount: 48200, match: "", auto: false },
					{ key: "o2", side: "ours", date: "2026-11-12", doc: "FT-2644", text: "[[Profile||Profil]]", amount: 15750, match: "", auto: false },
					{ key: "o3", side: "ours", date: "2026-11-20", doc: "OD-118", text: "[[Payment||Ödeme]]", amount: -40000, match: "", auto: false },
					{ key: "o4", side: "ours", date: "2026-11-25", doc: "IA-07", text: "[[Return||İade]]", amount: -2300, match: "", auto: false },
					{ key: "t1", side: "theirs", date: "2026-11-03", doc: "FT-2611", text: "[[Invoice||Fatura]]", amount: 48200, match: "", auto: false },
					{ key: "t2", side: "theirs", date: "2026-11-13", doc: "FT-2644", text: "[[Invoice||Fatura]]", amount: 15750, match: "", auto: false },
					{ key: "t3", side: "theirs", date: "2026-11-21", doc: "", text: "[[Transfer received||Gelen havale]]", amount: -40000, match: "", auto: false },
					{ key: "t4", side: "theirs", date: "2026-11-27", doc: "IA-07", text: "[[Return, rate difference||İade, kur farkı]]", amount: -2280, match: "", auto: false },
					{ key: "t5", side: "theirs", date: "2026-11-29", doc: "FT-2690", text: "[[Invoice not in our books||Bizde olmayan fatura]]", amount: 6900, match: "", auto: false }
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Match", {
				onMatch(event) {
					const count = event.getParameter("keys").length;
					Toast.show(event.getParameter("action") === "unmatch" ? "[[Match removed||Eşleşme çözüldü]]" : "[[Matched||Eşleşti]]", { text: count + " [[records||kayıt]]" });
				}
			}));`
		}
	]
};
