export default {
	summary: { en: "Turns a setting on or off.", tr: "Bir ayarı açar veya kapatır." },
	use: { en: ["Use for a setting that takes effect immediately."], tr: ["Hemen etkili olan bir ayar için kullan."] },
	related: ["Check", "Segmented"],
	samples: [
		{
			title: { en: "An on/off setting", tr: "Açma kapama ayarı" },
			xml: `<k:Toggle text="[[Show archived orders||Arşivlenen siparişleri göster]]" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ToggleChange", {
				onChange(event) {
					Toast.show(event.getParameter("selected") ? "[[Archived orders shown||Arşivlenen siparişler gösteriliyor]]" : "[[Archived orders hidden||Arşivlenen siparişler gizlendi]]");
				}
			}));`
		},
		{
			title: { en: "Control dispatch alerts", tr: "Sevkiyat bildirimlerini yönet" },
			xml: `<k:Toggle text="[[Delivery alerts||Teslimat bildirimleri]]" selected="true" help="[[Notify me when a carrier checks in.||Taşıyıcı giriş yaptığında bildir.]]" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ToggleChange", {
				onChange(event) {
					Toast.show(event.getParameter("selected") ? "[[Delivery alerts enabled||Teslimat bildirimleri açıldı]]" : "[[Delivery alerts paused||Teslimat bildirimleri durduruldu]]");
				}
			}));`
		}
	]
};
