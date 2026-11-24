export default {
	children: ["Command"],
	summary: { en: "Finds actions by name, section or search keyword.", tr: "İşlemleri ad, bölüm veya anahtar sözcükle bulur." },
	use: { en: ["Offer a searchable shortcut to actions across the application."], tr: ["Uygulamanın farklı bölümlerindeki işlemlere aramayla erişim sağla."] },
	keyboard: [
		["↑, ↓", { en: "Move between results.", tr: "Sonuçlar arasında dolaşır." }],
		["Enter, Esc", { en: "Run the active command or close the palette.", tr: "Seçili komutu çalıştırır veya paleti kapatır." }]
	],
	related: ["Shell", "Button"],
	samples: [
		{
			title: { en: "Open a palette", tr: "Paleti aç" },
			xml: `<k:Button text="[[Find a command||Komut bul]]" press=".onOpen">
				<k:dependents>
					<k:CommandPalette id="palette" hotkey="false" placeholder="[[Search commands||Komut ara]]" run=".onRun">
						<k:Command key="orders" text="[[Open orders||Siparişleri aç]]"/>
					</k:CommandPalette>
				</k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.PaletteActions", {
				onOpen() {
					this.byId("palette").open();
				},
				onRun(event) {
					Toast.show("[[Orders opened||Siparişler açıldı]]");
				}
			}));`
		},
		{
			title: { en: "Find warehouse actions", tr: "Depo işlemlerini bul" },
			text: { en: "Search for “audit” to find the count. Enable hotkey to use Ctrl+K or Command+K across the page.", tr: "Stok sayımını bulmak için “denetim” yaz. Sayfa genelinde Ctrl+K veya Command+K için hotkey ayarını aç." },
			xml: `<k:Button text="[[Warehouse commands||Depo komutları]]" press=".onOpen">
				<k:dependents>
					<k:CommandPalette id="palette" hotkey="false" placeholder="[[Search commands||Komut ara]]" run=".onRun">
						<k:Command key="count" group="[[Inventory||Stok]]" text="[[Start a stock count||Stok sayımı başlat]]" keywords="[[audit recount||denetim tekrar]]" icon="boxes"/>
						<k:Command key="receive" group="[[Inbound||Giriş]]" text="[[Receive a delivery||Mal girişi yap]]" icon="truck"/>
					</k:CommandPalette>
				</k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.PaletteActions", {
				onOpen() {
					this.byId("palette").open();
				},
				onRun(event) {
					Toast.show(event.getParameter("key") === "count" ? "[[Stock count started||Stok sayımı başladı]]" : "[[Receiving opened||Mal girişi açıldı]]");
				}
			}));`
		}
	]
};
