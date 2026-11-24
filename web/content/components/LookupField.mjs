export default {
	children: ["Column", "FilterField"],
	summary: { en: "Selects a record through suggestions or an F4 lookup dialog.", tr: "Öneriden veya F4 değer yardımı penceresinden kayıt seçer." },
	use: { en: ["Look up a related record by its code or descriptive name."], tr: ["İlişkili kaydı koduyla veya açıklayıcı adıyla bul."] },
	keyboard: [
		["F4", { en: "Open the lookup dialog from the field.", tr: "Alandan değer yardımı penceresini açar." }]
	],
	related: ["SelectField", "MultiSelect", "DataGrid"],
	samples: [
		{
			title: { en: "Lookup by code or name", tr: "Kodla veya adla ara" },
			xml: `<k:LookupField label="[[Warehouse||Depo]]" rows="{/sites}" keyPath="id" textPath="name" change=".onChange"/>`,
			data: {
				"sites": [
					{
						"id": "WH-01",
						"name": "[[East depot||Doğu deposu]]",
						"region": "[[Distribution||Dağıtım]]"
					},
					{
						"id": "WH-02",
						"name": "[[North warehouse||Kuzey deposu]]",
						"region": "[[Assembly||Montaj]]"
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.LookupFieldChange", {
				onChange(event) {
					Toast.show(event.getParameter("text") || "[[Selection cleared||Seçim kaldırıldı]]");
				}
			}));`
		},
		{
			title: { en: "Assign multiple warehouses", tr: "Birden çok depo ata" },
			text: { en: "Open the search dialog and narrow the results by area.", tr: "Arama penceresini aç ve sonuçları bölüme göre daralt." },
			xml: `<k:LookupField label="[[Assigned warehouses||Atanan depolar]]" rows="{/sites}" keyPath="id" textPath="name" infoPath="region" multiple="true" change=".onChange">
				<k:columns>
					<k:Column label="[[Code||Kod]]" path="id" width="100"/>
					<k:Column label="[[Warehouse||Depo]]" path="name" grow="1"/>
					<k:Column label="[[Area||Bölüm]]" path="region" grow="1"/>
				</k:columns>
				<k:filterFields><k:FilterField label="[[Area||Bölüm]]" path="region"/></k:filterFields>
			</k:LookupField>`,
			data: {
				"sites": [
					{
						"id": "WH-01",
						"name": "[[East depot||Doğu deposu]]",
						"region": "[[Distribution||Dağıtım]]"
					},
					{
						"id": "WH-02",
						"name": "[[North warehouse||Kuzey deposu]]",
						"region": "[[Assembly||Montaj]]"
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.LookupFieldChange", {
				onChange(event) {
					const selection = event.getParameter("selection") || [];
					Toast.show(selection.map((record) => record.text).join(", ") || "[[Selection cleared||Seçim kaldırıldı]]");
				}
			}));`
		}
	]
};
