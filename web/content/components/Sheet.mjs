export default {
	summary: { en: "Opens record details alongside the current page.", tr: "Kayıt ayrıntılarını sayfanın yanında açar." },
	use: { en: ["Keep the list available while the user inspects a record."], tr: ["Kullanıcı kaydı incelerken listeye erişebilsin."] },
	related: ["Dialog", "DataGrid"],
	samples: [
		{
			title: { en: "Open and dismiss", tr: "Aç ve kapat" },
			xml: `<k:Button text="[[Show details||Ayrıntıyı göster]]" press=".onOpen">
				<k:dependents>
					<k:Sheet id="details" title="[[Order SO-104||Sipariş SO-104]]">
						<k:Text text="[[The order is waiting for packing.||Sipariş paketleme bekliyor.]]"/>
					</k:Sheet>
				</k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => Controller.extend("sample.BasicSheet", {
				onOpen() {
					this.byId("details").setOpen(true);
				}
			}));`
		},
		{
			title: { en: "A footer action", tr: "Alt çubukta işlem" },
			xml: `<k:Button text="[[Review the shipment||Sevkiyatı incele]]" press=".onOpen">
				<k:dependents>
					<k:Sheet id="details" title="[[Shipment SH-104||Sevkiyat SH-104]]" subtitle="[[North warehouse||Kuzey deposu]]">
						<k:content><k:Text text="[[Three pallets are ready for collection.||Üç palet teslim almaya hazır.]]"/></k:content>
						<k:footer><k:Button kind="primary" text="[[Mark as reviewed||İncelendi olarak işaretle]]" press=".onDone"/></k:footer>
					</k:Sheet>
				</k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ShipmentSheet", {
				onOpen() {
					this.byId("details").setOpen(true);
				},
				onDone() {
					this.byId("details").setOpen(false);
					Toast.show("[[Shipment reviewed||Sevkiyat incelendi]]");
				}
			}));`
		}
	]
};
