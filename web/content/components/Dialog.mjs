export default {
	summary: { en: "Opens a modal dialog and keeps focus inside until dismissal.", tr: "Modal pencere açar ve kapanana kadar odağı pencere içinde tutar." },
	use: { en: ["Ask the user to finish a short task before returning to the page."], tr: ["Sayfaya dönmeden önce kullanıcının kısa bir işi tamamlamasını iste."] },
	related: ["Confirm", "Sheet"],
	samples: [
		{
			title: { en: "Open and dismiss", tr: "Aç ve kapat" },
			xml: `<k:Button text="[[Show details||Ayrıntıyı göster]]" press=".onOpen">
				<k:dependents>
					<k:Dialog id="details" title="[[Delivery instructions||Teslimat talimatı]]">
						<k:Text text="[[Use the east entrance after 16:00.||16.00’dan sonra doğu girişini kullanın.]]"/>
					</k:Dialog>
				</k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => Controller.extend("sample.BasicDialog", {
				onOpen() {
					this.byId("details").setOpen(true);
				}
			}));`
		},
		{
			title: { en: "A footer action", tr: "Alt çubukta işlem" },
			xml: `<k:Button text="[[Review the shipment||Sevkiyatı incele]]" press=".onOpen">
				<k:dependents>
					<k:Dialog id="details" title="[[Shipment SH-104||Sevkiyat SH-104]]" subtitle="[[North warehouse||Kuzey deposu]]">
						<k:content><k:Text text="[[Three pallets are ready for collection.||Üç palet teslim almaya hazır.]]"/></k:content>
						<k:footer><k:Button kind="primary" text="[[Acknowledge||Onayla]]" press=".onDone"/></k:footer>
					</k:Dialog>
				</k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ShipmentDialog", {
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
