export default {
	// Bu sayfada belgelenecek alt öğeler
	children: ["MenuItem"],
	summary: {
		en: "Starts an action. Five kinds tell the user how much weight the action carries.",
		tr: "Bir işlemi başlatır. Beş türü, işlemin ağırlığını kullanıcıya gösterir."
	},
	use: {
		en: ["One primary button per screen area: the action most people came for.", "Accent only for a single, decisive action such as Approve.", "Ghost for icon buttons and tools that repeat in every row."],
		tr: ["Bir ekran bölgesinde tek birincil düğme: çoğu kişinin yapmaya geldiği işlem.", "Vurgu rengi yalnızca tek ve belirleyici işlemde, örneğin Onayla.", "Simge düğmeleri ve her satırda tekrarlanan araçlar için ghost."]
	},
	avoid: {
		en: ["An irreversible action: use HoldButton or Confirm.", "Switching between views: use Segmented or Tabs."],
		tr: ["Geri alınamayan işlem: HoldButton veya Confirm kullan.", "Görünümler arası geçiş: Segmented veya Tabs kullan."]
	},
	keyboard: [
		["Enter, Space", { en: "Press, or open the menu", tr: "Basar veya menüyü açar" }],
		["↓", { en: "Open the menu", tr: "Menüyü açar" }],
		["Esc", { en: "Close the menu", tr: "Menüyü kapatır" }]
	],
	related: ["HoldButton", "Segmented", "Confirm"],
	samples: [
		{
			title: { en: "Kinds", tr: "Türler" },
			xml: `<k:Stack row="true" gap="10">
	<k:Button kind="primary" text="[[Save||Kaydet]]" press=".onPress"/>
	<k:Button kind="accent" text="[[Approve||Onayla]]" icon="check" press=".onPress"/>
	<k:Button text="[[Duplicate||Çoğalt]]" press=".onPress"/>
	<k:Button kind="ghost" icon="palette" label="[[Appearance||Görünüm]]" press=".onPress"/>
	<k:Button kind="danger" text="[[Reject||Reddet]]" press=".onPress"/>
</k:Stack>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Buttons", {
	onPress(event) {
		const button = event.getSource();
		Toast.show("[[Pressed||Basıldı]]: " + (button.getText() || button.getLabel()));
	}
}));`
		},
		{
			title: { en: "Menu", tr: "Menü" },
			text: { en: "Add `menuItems` and the button opens a menu. `menuSelect` carries the key of the chosen row.", tr: "`menuItems` eklenince düğme menü açar. `menuSelect` seçilen satırın anahtarını taşır." },
			xml: `<k:Button text="[[Export||Dışa aktar]]" menuSelect=".onMenu">
	<k:MenuItem key="xlsx" text="Excel"/>
	<k:MenuItem key="csv" text="CSV"/>
</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Menu", {
	onMenu(event) {
		Toast.show(event.getParameter("key"));
	}
}));`
		},
		{
			title: { en: "Loading and disabled", tr: "Yükleniyor ve kapalı" },
			text: { en: "`loading` blocks further presses until you set it back to false.", tr: "`loading`, false yapılana kadar yeni basışları engeller." },
			xml: `<k:Stack row="true" gap="10">
	<k:Button kind="primary" text="[[Post invoice||Faturayı kaydet]]" loading="{/busy}" press=".onPost"/>
	<k:Button text="[[Not available||Kullanılamaz]]" enabled="false"/>
</k:Stack>`,
			data: { busy: false },
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Loading", {
	onPost() {
		const model = this.getView().getModel();
		model.setProperty("/busy", true);
		setTimeout(() => {
			model.setProperty("/busy", false);
			Toast.show("[[Invoice posted||Fatura kaydedildi]]");
		}, 1500);
	}
}));`
		}
	]
};
