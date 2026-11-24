export default {
	children: ["Series"],
	summary: { en: "Plots time series as areas, lines, bars or shaded targets.", tr: "Zaman serilerini alan, çizgi, çubuk veya hedef gölgesi olarak çizer." },
	use: { en: ["Compare a measure over time with a plan or a second series."], tr: ["Zaman içindeki bir ölçümü planla veya ikinci seriyle karşılaştır."] },
	keyboard: [
		["←, →", { en: "Move between chart positions after focusing it.", tr: "Grafiğe odaklandıktan sonra noktalar arasında dolaşır." }]
	],
	related: ["Stat", "Flow"],
	samples: [
		{
			title: { en: "A single line", tr: "Tek çizgi" },
			xml: `<k:Trend label="[[Daily shipments||Günlük sevkiyat]]" labels="{/days}" height="180">
				<k:Series name="[[Shipped||Sevk edilen]]" values="{/actual}"/>
			</k:Trend>`,
			data: {
				"days": [
					"[[Mon||Pzt]]",
					"[[Tue||Sal]]",
					"[[Wed||Çar]]"
				],
				"actual": [
					42,
					51,
					47
				]
			}
		},
		{
			title: { en: "Actual and target", tr: "Gerçekleşen ve hedef" },
			xml: `<k:Trend label="[[Weekly output and plan||Haftalık üretim ve plan]]" labels="{/weeks}" unit="[[units||adet]]" height="220">
				<k:Series name="[[Actual||Gerçekleşen]]" kind="bar" values="{/actual}"/>
				<k:Series name="[[Plan||Plan]]" kind="ghost" values="{/plan}"/>
			</k:Trend>`,
			data: {
				"weeks": [
					"W01",
					"W02",
					"W03",
					"W04"
				],
				"actual": [
					205,
					190,
					224,
					246
				],
				"plan": [
					200,
					200,
					220,
					220
				]
			}
		}
	]
};
