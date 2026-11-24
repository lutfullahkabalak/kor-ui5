export default {
	summary: { en: "Saves and reapplies named views of connected controls.", tr: "Bağlı kontrollerin görünümünü adla kaydeder ve yeniden uygular." },
	use: { en: ["Let users return to a set of filters or a grid layout they use frequently."], tr: ["Kullanıcı sık kullandığı süzgeçlere veya tablo düzenine dönebilsin."] },
	related: ["FilterBar", "DataGrid", "TreeGrid"],
	samples: [
		{
			title: { en: "Save a grid view", tr: "Tablo görünümünü kaydet" },
			text: { en: "Sort a column, save the view, then use the menu to switch between the standard and saved views.", tr: "Bir sütunu sırala, görünümü kaydet ve menüden standart görünüm ile kayıtlı görünüm arasında geçiş yap." },
			xml: `<k:Stack gap="10">
				<k:Stack row="true" gap="8">
					<k:Variants id="views" targets="grid" standardText="[[Standard orders||Standart siparişler]]"/>
					<k:Button text="[[Save current view||Geçerli görünümü kaydet]]" press=".onSave"/>
				</k:Stack>
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
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.GridVariants", {
				onSave() {
					this.byId("views").saveAs("[[My order list||Sipariş listem]]");
					Toast.show("[[View saved||Görünüm kaydedildi]]");
				}
			}));`
		},
		{
			title: { en: "Restore an order filter", tr: "Sipariş süzgecini geri yükle" },
			text: { en: "Choose the supplied view to filter to Aster orders. Bind variants and listen for change if the application manages storage.", tr: "Aster siparişlerini görmek için hazır görünümü seç. Kayıtları uygulama saklıyorsa variants özelliğini bağla ve change olayını dinle." },
			xml: `<k:Stack gap="10">
				<k:Variants targets="filter grid" variants="{/views}" select=".onSelect"/>
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
				],
				"views": [
					{
						"key": "aster",
						"name": "[[Aster orders||Aster siparişleri]]",
						"state": {
							"filter": [
								{
									"path": "customer",
									"op": "Contains",
									"value": "Aster"
								}
							]
						}
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.OrderVariants", {
				onFilter(event) {
					this.byId("grid").getBinding("rows").filter(event.getParameter("filters"));
				},
				onSelect(event) {
					Toast.show(event.getParameter("key") === "aster" ? "[[Aster orders||Aster siparişleri]]" : "[[Standard orders||Standart siparişler]]");
				}
			}));`
		}
	]
};
