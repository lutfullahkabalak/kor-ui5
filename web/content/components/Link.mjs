export default {
	summary: { en: "Opens an address or starts an action from text.", tr: "Metinden bir adres açar veya işlem başlatır." },
	use: { en: ["Link to a related record or an external page."], tr: ["İlgili kayda veya dış sayfaya bağlantı ver."] },
	related: ["Button", "Breadcrumbs"],
	samples: [
		{
			title: { en: "Address and action", tr: "Adres ve işlem" },
			xml: `<k:Stack direction="row" gap="20">
				<k:Link text="[[Documentation||Dokümantasyon]]" href="https://korui5.abapnews.com" target="_blank"/>
				<k:Link text="[[Show history||Geçmişi göster]]" icon="clock" press=".onPress"/>
			</k:Stack>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.LinkAction", {
				onPress(event) {
					Toast.show(String("[[History opened||Geçmiş açıldı]]"));
				}
			}));`
		}
	]
};
