export default {
	children: ["HeatCell"],
	summary: { en: "Shows where values are dense.", tr: "Değerlerin yoğunlaştığı yeri gösterir." },
	use: { en: ["Use it for hours and days, plants and defects, or risks."], tr: ["Gün ve saat, tesis ve hata veya risk dağılımında kullan."] },
	related: ["Pivot", "Trend"],
	samples: [
		{
			title: { en: "Defects by shift", tr: "Vardiyaya göre hata" },
			xml: `<k:Heatmap label="[[Defects||Hatalar]]" cells="{path: '/cells', templateShareable: false}" cellPress=".onPress"><k:HeatCell row="{r}" column="{c}" value="{v}"/></k:Heatmap>`,
			data: {
				"cells": [
					{
						"r": "[[Mon||Pzt]]",
						"c": "[[Morning||Sabah]]",
						"v": 4
					},
					{
						"r": "[[Mon||Pzt]]",
						"c": "[[Evening||Akşam]]",
						"v": 9
					},
					{
						"r": "[[Mon||Pzt]]",
						"c": "[[Night||Gece]]",
						"v": 2
					},
					{
						"r": "[[Tue||Sal]]",
						"c": "[[Morning||Sabah]]",
						"v": 3
					},
					{
						"r": "[[Tue||Sal]]",
						"c": "[[Evening||Akşam]]",
						"v": 12
					},
					{
						"r": "[[Tue||Sal]]",
						"c": "[[Night||Gece]]",
						"v": 5
					},
					{
						"r": "[[Wed||Çar]]",
						"c": "[[Morning||Sabah]]",
						"v": 7
					},
					{
						"r": "[[Wed||Çar]]",
						"c": "[[Evening||Akşam]]",
						"v": 6
					},
					{
						"r": "[[Wed||Çar]]",
						"c": "[[Night||Gece]]",
						"v": 1
					},
					{
						"r": "[[Thu||Per]]",
						"c": "[[Morning||Sabah]]",
						"v": 2
					},
					{
						"r": "[[Thu||Per]]",
						"c": "[[Evening||Akşam]]",
						"v": 15
					},
					{
						"r": "[[Thu||Per]]",
						"c": "[[Night||Gece]]",
						"v": 8
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Defects", {
				onPress(event) {
					Toast.show(String(event.getParameter("value")));
				}
			}));`
		},
		{
			title: { en: "Around zero", tr: "Sıfırın iki yanı" },
			xml: `<k:Heatmap decimals="1" unit="%" cells="{path: '/cells', templateShareable: false}"><k:HeatCell row="{r}" column="{c}" value="{v}"/></k:Heatmap>`,
			data: {
				"cells": [
					{
						"r": "A",
						"c": "Q1",
						"v": 4.2
					},
					{
						"r": "A",
						"c": "Q2",
						"v": -2.1
					},
					{
						"r": "A",
						"c": "Q3",
						"v": 1.4
					},
					{
						"r": "B",
						"c": "Q1",
						"v": -6.3
					},
					{
						"r": "B",
						"c": "Q2",
						"v": 3.3
					},
					{
						"r": "B",
						"c": "Q3",
						"v": 7.5
					}
				]
			}
		}
	]
};
