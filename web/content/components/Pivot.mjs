export default {
	summary: { en: "Summarizes records by rows and columns.", tr: "Kayıtları satır ve sütuna göre özetler." },
	use: { en: ["Use it for up to several thousand records already in the browser."], tr: ["Tarayıcıya yüklenmiş birkaç bin kayda kadar kullan."] },
	related: ["DataGrid", "Heatmap"],
	samples: [
		{
			title: { en: "Sales by region", tr: "Bölgeye göre satış" },
			xml: `<k:Pivot data="{/sales}" rows="region,product" column="year" value="amount" unit="TRY" rowLabel="[[Region||Bölge]]" expandedLevels="2" cellPress=".onPress"/>`,
			data: {
				"sales": [
					{
						"region": "Marmara",
						"product": "A",
						"year": 2025,
						"amount": 120
					},
					{
						"region": "Marmara",
						"product": "B",
						"year": 2025,
						"amount": 80
					},
					{
						"region": "Marmara",
						"product": "A",
						"year": 2026,
						"amount": 150
					},
					{
						"region": "Ege",
						"product": "A",
						"year": 2025,
						"amount": 60
					},
					{
						"region": "Ege",
						"product": "B",
						"year": 2026,
						"amount": 95
					},
					{
						"region": "Ege",
						"product": "A",
						"year": 2026,
						"amount": 70
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Sales", {
				onPress(event) {
					Toast.show(String(JSON.stringify(event.getParameter("filters"))));
				}
			}));`
		}
	]
};
