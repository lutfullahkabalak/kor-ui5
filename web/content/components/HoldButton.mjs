export default {
	summary: { en: "Requires a deliberate hold before confirming an action.", tr: "İşlemi onaylamadan önce düğmenin bir süre basılı tutulmasını ister." },
	use: { en: ["Add a deliberate step to an action that is hard to undo."], tr: ["Geri alınması zor bir işlem için bilinçli bir onay adımı ekle."] },
	keyboard: [
		["Space", { en: "Hold until the action is confirmed.", tr: "İşlem onaylanana kadar basılı tut." }],
		["Enter", { en: "Press twice while focus stays on the button.", tr: "Odak düğmedeyken iki kez bas." }]
	],
	related: ["Button", "Confirm"],
	samples: [
		{
			title: { en: "Confirm by holding", tr: "Basılı tutarak onayla" },
			xml: `<k:HoldButton text="[[Hold to confirm||Onaylamak için basılı tut]]" doneText="[[Confirmed||Onaylandı]]" confirm=".onConfirm"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.BasicHold", {
				onConfirm() {
					Toast.show("[[Action confirmed||İşlem onaylandı]]");
				}
			}));`
		},
		{
			title: { en: "Release a shipment", tr: "Sevkiyatı serbest bırak" },
			xml: `<k:Stack gap="10">
				<k:Text text="{/status}"/>
				<k:HoldButton id="release" text="[[Hold to release||Serbest bırakmak için basılı tut]]" doneText="[[Released||Serbest bırakıldı]]" icon="truck" duration="1200" confirm=".onRelease"/>
				<k:Button kind="ghost" text="[[Reset example||Örneği sıfırla]]" press=".onReset"/>
			</k:Stack>`,
			data: {
				"status": "[[Shipment SH-104 is awaiting release.||SH-104 sevkiyatı onay bekliyor.]]"
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ReleaseHold", {
				onRelease() {
					this.getView().getModel().setProperty("/status", "[[Shipment SH-104 is ready for pickup.||SH-104 sevkiyatı teslim almaya hazır.]]");
					Toast.show("[[Shipment released||Sevkiyat serbest bırakıldı]]");
				},
				onReset() {
					this.byId("release").setDone(false);
					this.getView().getModel().setProperty("/status", "[[Shipment SH-104 is awaiting release.||SH-104 sevkiyatı onay bekliyor.]]");
				}
			}));`
		}
	]
};
