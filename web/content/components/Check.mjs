export default {
	summary: { en: "Marks an independent option as selected.", tr: "Bağımsız bir seçeneği işaretler." },
	use: { en: ["Let users select an optional part of a form or acknowledge a condition."], tr: ["Formda isteğe bağlı bir seçeneği veya bir koşulu işaretlet."] },
	related: ["Toggle", "Form"],
	samples: [
		{
			title: { en: "Include a packing slip", tr: "Paket fişi ekle" },
			xml: `<k:Check text="[[Include packing slip||Paket fişi ekle]]" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.CheckChange", {
				onChange(event) {
					Toast.show(event.getParameter("selected") ? "[[Packing slip included||Paket fişi eklendi]]" : "[[Packing slip removed||Paket fişi çıkarıldı]]");
				}
			}));`
		},
		{
			title: { en: "Confirm order review", tr: "Sipariş incelemesini işaretle" },
			xml: `<k:Check text="[[I reviewed the address||Adresi kontrol ettim]]" help="[[Check the postcode and delivery entrance.||Posta kodunu ve teslimat girişini kontrol et.]]" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.CheckChange", {
				onChange(event) {
					Toast.show(event.getParameter("selected") ? "[[Address review marked||Adres kontrolü işaretlendi]]" : "[[Address review cleared||Adres kontrolü işareti kaldırıldı]]");
				}
			}));`
		}
	]
};
