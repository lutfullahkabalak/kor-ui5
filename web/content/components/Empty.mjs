export default {
	summary: { en: "Explains why a region is empty and can offer the next action.", tr: "Alanın neden boş olduğunu açıklar ve sıradaki işlemi sunabilir." },
	use: { en: ["Explain an empty list or search result and give a way forward when available."], tr: ["Boş listeyi veya arama sonucunu açıkla, varsa sonraki adımı göster."] },
	related: ["Skeleton", "DataGrid"],
	samples: [
		{
			title: { en: "No shipments", tr: "Sevkiyat yok" },
			xml: `<k:Empty icon="truck" title="[[No shipments today||Bugün sevkiyat yok]]" text="[[Scheduled shipments will appear here.||Planlanan sevkiyatlar burada görünür.]]"/>`
		},
		{
			title: { en: "Recover from an empty search", tr: "Boş arama sonucunu düzelt" },
			xml: `<k:Stack gap="10">
				<k:Empty visible="{/filtered}" icon="search" title="[[No matching orders||Eşleşen sipariş yok]]" text="[[The current filter excludes all orders.||Geçerli süzgeç tüm siparişleri dışarıda bırakıyor.]]">
					<k:Button text="[[Clear filter||Süzgeci temizle]]" press=".onClear"/>
				</k:Empty>
				<k:Text visible="{= !\${/filtered} }" text="[[SO-104 · Ready to pack||SO-104 · Paketlemeye hazır]]"/>
			</k:Stack>`,
			data: {
				"filtered": true
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.NoOrders", {
				onClear() {
					this.getView().getModel().setProperty("/filtered", false);
					Toast.show("[[Filter cleared||Süzgeç temizlendi]]");
				}
			}));`
		}
	]
};
