export default {
	summary: { en: "Shows contextual feedback directly in the page.", tr: "İşle ilgili geri bildirimi sayfa içinde gösterir." },
	use: { en: ["Keep an actionable warning or result next to the affected controls."], tr: ["İşlem gerektiren uyarıyı veya sonucu ilgili kontrollerin yanında tut."] },
	related: ["MessageList", "Toast"],
	samples: [
		{
			title: { en: "A confirmation message", tr: "Onay mesajı" },
			xml: `<k:Message state="success" title="[[Order saved||Sipariş kaydedildi]]" text="[[You can continue picking.||Ürünleri toplamaya devam edebilirsin.]]"/>`
		},
		{
			title: { en: "Resolve a delivery warning", tr: "Teslimat uyarısını gider" },
			xml: `<k:Message id="delivery" state="Warning" closable="true" title="[[Delivery window missing||Teslimat saati eksik]]"
				text="[[Confirm a time before dispatch.||Sevkiyattan önce bir saat belirle.]]" close=".onClose">
				<k:Button text="[[Use 14:00||14.00 olarak ayarla]]" press=".onSet"/>
			</k:Message>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.DeliveryMessage", {
				onSet() {
					const message = this.byId("delivery");
					message.setState("success").setTitle("[[Delivery time set||Teslimat saati belirlendi]]").setText("14:00");
					message.destroyActions();
					Toast.show("[[Delivery time saved||Teslimat saati kaydedildi]]");
				},
				onClose() {
					Toast.show("[[Message dismissed||Mesaj kapatıldı]]");
				}
			}));`
		}
	]
};
