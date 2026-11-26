export default {
	children: ["ReconRow", "ReconCell"],
	summary: { en: "Compares document counts and amounts per business partner and month.", tr: "Belge adedini ve tutarı cari ve ay bazında karşılaştırır." },
	use: {
		en: ["Use it for monthly purchase and sales notification reconciliation (for example Form BA/BS) and for tracking which partners have replied.", "Set the reporting threshold your rules require; the component does not know legal limits."],
		tr: ["Aylık alış ve satış bildirimi mutabakatında (ör. BA/BS formları) ve hangi carinin yanıt verdiğini izlemekte kullan.", "Kurallarının gerektirdiği bildirim eşiğini ver; bileşen yasal sınırları bilmez."]
	},
	keyboard: [
		["←, →, ↑, ↓", { en: "Move between cells.", tr: "Hücreler arasında gezer." }],
		["Home, End", { en: "Go to the first or last month.", tr: "İlk veya son aya gider." }],
		["Enter, Space", { en: "Open the cell.", tr: "Hücreyi açar." }]
	],
	related: ["MatchGrid", "Heatmap", "ReconcileLetter"],
	samples: [
		{
			title: { en: "BA/BS reconciliation", tr: "BA/BS mutabakatı" },
			xml: `<k:ReconMatrix label="[[Purchase notifications||Alış bildirimleri]]" currency="TRY" threshold="5000" tolerance="1" periods="{/periods}" rows="{path: '/rows', templateShareable: false}" cellPress=".onCell">
				<k:ReconRow key="{key}" title="{title}" text="{text}" cells="{path: 'cells', templateShareable: false}">
					<k:ReconCell period="{period}" ourCount="{oc}" ourAmount="{oa}" theirCount="{tc}" theirAmount="{ta}"/>
				</k:ReconRow>
			</k:ReconMatrix>`,
			data: {
				periods: ["2026-09", "2026-10", "2026-11"],
				rows: [
					{ key: "1", title: "Ege Çelik", text: "VKN 4810 ···", cells: [{ period: "2026-09", oc: 4, oa: 182000, tc: 4, ta: 182000 }, { period: "2026-10", oc: 3, oa: 96500, tc: 3, ta: 96500 }, { period: "2026-11", oc: 5, oa: 210300, tc: 4, ta: 198300 }] },
					{ key: "2", title: "Kuzey Lojistik", text: "VKN 7720 ···", cells: [{ period: "2026-09", oc: 2, oa: 24000, tc: 2, ta: 24000 }, { period: "2026-10", oc: 2, oa: 26500, tc: 2, ta: 26500 }, { period: "2026-11", oc: 3, oa: 31800, tc: -1, ta: null }] },
					{ key: "3", title: "Marmara Ambalaj", text: "VKN 1093 ···", cells: [{ period: "2026-09", oc: 1, oa: 3200, tc: -1, ta: null }, { period: "2026-10", oc: 2, oa: 8900, tc: 2, ta: 8900 }, { period: "2026-11", oc: 2, oa: 9100, tc: 2, ta: 9150 }] }
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Recon", {
				onCell(event) {
					Toast.show(event.getParameter("period"), { text: "[[Partner||Cari]] " + event.getParameter("row") });
				}
			}));`
		}
	]
};
