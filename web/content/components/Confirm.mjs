export default {
	summary: { en: "Asks a question and resolves to a boolean answer.", tr: "Onay sorusu gösterir ve yanıtı boolean olarak döndürür." },
	use: { en: ["Confirm a consequential action before applying it."], tr: ["Önemli sonucu olan bir işlemi uygulamadan önce onay iste."] },
	related: ["Dialog", "HoldButton"],
	samples: [
		{
			title: { en: "Ask for confirmation", tr: "Onay iste" },
			xml: `<k:Button text="[[Discard the draft||Taslağı sil]]" press=".onConfirm"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast", "kor/ui/Confirm"], (Controller, Toast, Confirm) => Controller.extend("sample.AskConfirm", {
				async onConfirm() {
					const approved = await Confirm.ask({ title: "[[Discard the draft?||Taslak silinsin mi?]]" });
					Toast.show(approved ? "[[Confirmed||Onaylandı]]" : "[[Cancelled||İptal edildi]]");
				}
			}));`
		},
		{
			title: { en: "Require a record code", tr: "Kayıt kodunun yazılmasını iste" },
			xml: `<k:Button text="[[Remove shipment||Sevkiyatı kaldır]]" press=".onConfirm"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast", "kor/ui/Confirm"], (Controller, Toast, Confirm) => Controller.extend("sample.AskConfirm", {
				async onConfirm() {
					const approved = await Confirm.ask({
						title: "[[Remove shipment SH-104?||SH-104 sevkiyatı kaldırılsın mı?]]",
						text: "[[The dispatch list will no longer show this shipment.||Bu sevkiyat çıkış listesinde artık görünmeyecek.]]",
						danger: true,
						type: "SH-104"
					});
					Toast.show(approved ? "[[Confirmed||Onaylandı]]" : "[[Cancelled||İptal edildi]]");
				}
			}));`
		}
	]
};
