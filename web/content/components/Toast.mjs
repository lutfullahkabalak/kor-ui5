export default {
	summary: { en: "Shows brief feedback and can offer an action.", tr: "Kısa geri bildirim gösterir ve işlem düğmesi sunabilir." },
	use: { en: ["Acknowledge a completed action or let the user undo it immediately."], tr: ["Tamamlanan işlemi bildir veya kullanıcıya hemen geri alma fırsatı ver."] },
	related: ["Message", "Confirm"],
	samples: [
		{
			title: { en: "Save feedback", tr: "Kaydetme bildirimi" },
			xml: `<k:Button text="[[Save the note||Notu kaydet]]" press=".onSave"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.SaveToast", {
				onSave() {
					Toast.show("[[Note saved||Not kaydedildi]]");
				}
			}));`
		},
		{
			title: { en: "Undo an archive", tr: "Arşivlemeyi geri al" },
			xml: `<k:Stack gap="8">
				<k:Text text="{/status}"/>
				<k:Button text="[[Archive order||Siparişi arşivle]]" press=".onArchive"/>
			</k:Stack>`,
			data: {
				"status": "[[Active order||Etkin sipariş]]"
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.UndoToast", {
				onArchive() {
					const model = this.getView().getModel();
					model.setProperty("/status", "[[Archived||Arşivlendi]]");
					Toast.show("[[Order archived||Sipariş arşivlendi]]", {
						actionText: "[[Undo||Geri al]]",
						action: () => model.setProperty("/status", "[[Active order||Etkin sipariş]]")
					});
				}
			}));`
		}
	]
};
