export default {
	summary: { en: "Reserves space for content while it loads.", tr: "İçerik yüklenirken yerini ayırır." },
	use: { en: ["Show where a region will appear while its data is being fetched."], tr: ["Veri alınırken içeriğin ekranda nerede görüneceğini belli et."] },
	related: ["Empty", "Message"],
	samples: [
		{
			title: { en: "Loading text rows", tr: "Yüklenen metin satırları" },
			xml: `<k:Skeleton kind="text" count="3" loading="true"/>`
		},
		{
			title: { en: "Load a shipment summary", tr: "Sevkiyat özetini yükle" },
			text: { en: "The reload simulates a short request. The summary reappears when loading ends.", tr: "Yenileme, kısa bir isteği canlandırır. Yükleme bittiğinde özet yeniden görünür." },
			xml: `<k:Stack gap="10">
				<k:Button text="[[Reload summary||Özeti yenile]]" enabled="{= !\${/loading} }" press=".onReload"/>
				<k:Skeleton kind="rows" count="2" loading="{/loading}">
					<k:Text kind="heading" text="[[Shipment SH-104||Sevkiyat SH-104]]"/>
					<k:Status state="success" text="[[Ready to ship||Sevke hazır]]"/>
				</k:Skeleton>
			</k:Stack>`,
			data: {
				"loading": false
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => Controller.extend("sample.LoadShipment", {
				onReload() {
					const model = this.getView().getModel();
					model.setProperty("/loading", true);
					this.timer = setTimeout(() => model.setProperty("/loading", false), 900);
				},
				onExit() {
					clearTimeout(this.timer);
				}
			}));`
		}
	]
};
