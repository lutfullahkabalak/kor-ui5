export default {
	summary: { en: "Shows brief help on pointer hover or keyboard focus.", tr: "İşaretçi üzerine gelince veya klavyeyle odaklanınca kısa yardım gösterir." },
	use: { en: ["Explain a control with a short supplement to its label."], tr: ["Kontrolün etiketine sığmayan kısa bir açıklama ver."] },
	keyboard: [
		["Tab, Esc", { en: "Show help on focus or dismiss it.", tr: "Odaklanınca yardımı gösterir veya kapatır." }]
	],
	related: ["Button", "Popover"],
	samples: [
		{
			title: { en: "Help on focus", tr: "Odaklanınca yardım" },
			xml: `<k:Button text="[[Refresh||Yenile]]" press=".onRefresh">
				<k:dependents><k:Tooltip text="[[Fetch the latest shipment list||Güncel sevkiyat listesini getir]]"/></k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.RefreshTip", {
				onRefresh() {
					Toast.show("[[Shipments refreshed||Sevkiyat listesi yenilendi]]");
				}
			}));`
		},
		{
			title: { en: "Explain an icon button", tr: "Simge düğmesini açıkla" },
			xml: `<k:Button kind="ghost" icon="download" label="[[Export CSV||CSV dışa aktar]]" press=".onExport">
				<k:dependents><k:Tooltip text="[[Download all filtered rows as CSV||Süzülen tüm satırları CSV olarak indir]]"/></k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ExportTip", {
				onExport() {
					Toast.show("[[Export requested||Dışa aktarma istendi]]");
				}
			}));`
		}
	]
};
