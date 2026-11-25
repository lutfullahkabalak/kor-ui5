export default {
	summary: { en: "Shows a list, a record and its detail side by side.", tr: "Liste, kayıt ve ayrıntıyı yan yana gösterir." },
	use: { en: ["Use it when people move quickly between records."], tr: ["Kayıtlar arasında hızlı geçilecekse kullan."] },
	related: ["Splitter", "RecordPage"],
	samples: [
		{
			title: { en: "Open a record", tr: "Kayıt aç" },
			xml: `<k:ColumnLayout columns="{/columns}" height="300px" listWidth="260">
				<k:list><k:List press=".onOpen"><k:ListItem key="1" title="Deniz Tekstil"/><k:ListItem key="2" title="Atlas Lojistik"/></k:List></k:list>
				<k:record><k:Details columns="2"><k:Detail label="[[Order||Sipariş]]" value="4711"/><k:Detail label="[[Total||Toplam]]" value="18.400 TRY"/></k:Details></k:record>
			</k:ColumnLayout>`,
			data: {
				"columns": 2
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => Controller.extend("sample.Columns", {
				onOpen() {
					this.getView().getModel().setProperty("/columns", 2);
				}
			}));`
		}
	]
};
