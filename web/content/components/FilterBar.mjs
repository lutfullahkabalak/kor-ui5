export default {
	children: ["FilterField"],
	summary: { en: "Turns user input into UI5 filters for a list binding.", tr: "Kullanıcı girişini liste bağlamasında kullanılabilen UI5 süzgeçlerine dönüştürür." },
	use: { en: ["Let users narrow the same list by text, discrete values or numeric comparisons."], tr: ["Kullanıcı aynı listeyi metin, seçenek veya sayısal karşılaştırmayla daraltsın."] },
	related: ["DataGrid", "Variants"],
	samples: [
		{
			title: { en: "Add or remove a token", tr: "Süzgeç ekle veya kaldır" },
			xml: `<k:FilterBar placeholder="[[Type a customer name||Müşteri adı yaz]]" change=".onFilter">
				<k:FilterField label="[[Customer||Müşteri]]" path="customer"/>
			</k:FilterBar>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.CustomerFilter", {
				onFilter(event) {
					Toast.show(event.getParameter("filters").length ? "[[Filter applied||Süzgeç uygulandı]]" : "[[Filters cleared||Süzgeçler temizlendi]]");
				}
			}));`
		},
		{
			title: { en: "Filter the order grid", tr: "Sipariş tablosunu süz" },
			text: { en: "Type “Aster” or “>5000”, then choose a suggestion. Remove the token to see all orders again.", tr: "“Aster” veya “>5000” yaz ve öneriyi seç. Tüm siparişleri yeniden görmek için süzgeci kaldır." },
			xml: `<k:Stack gap="10">
				<k:FilterBar id="filter" placeholder="[[Search customers or amounts||Müşteri veya tutar ara]]" change=".onFilter">
					<k:FilterField label="[[Customer||Müşteri]]" path="customer"/>
					<k:FilterField label="[[Amount||Tutar]]" path="amount" type="number" unit="TRY"/>
				</k:FilterBar>
				<k:DataGrid id="grid" rows="{/orders}" height="13rem" label="[[Orders||Siparişler]]">
					<k:columns>
						<k:Column label="[[Order||Sipariş]]" path="id" width="100"/>
						<k:Column label="[[Customer||Müşteri]]" path="customer" grow="1"/>
						<k:Column label="[[Amount||Tutar]]" path="amount" type="number"/>
					</k:columns>
				</k:DataGrid>
			</k:Stack>`,
			data: {
				"orders": [
					{
						"id": "SO-104",
						"customer": "Aster",
						"amount": 12500
					},
					{
						"id": "SO-105",
						"customer": "Mira",
						"amount": 3200
					},
					{
						"id": "SO-106",
						"customer": "Aster",
						"amount": 4800
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.OrderFilter", {
				onFilter(event) {
					this.byId("grid").getBinding("rows").filter(event.getParameter("filters"));
					Toast.show("[[Order list updated||Sipariş listesi güncellendi]]");
				}
			}));`
		}
	]
};
