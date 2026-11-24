export default {
	children: ["FileItem"],
	summary: { en: "Accepts file selections and displays application-managed progress or errors.", tr: "Dosya seçimini alır, uygulamanın yönettiği ilerlemeyi veya hataları gösterir." },
	use: { en: ["Collect attachments while the application owns validation and upload."], tr: ["Ekleri al, doğrulama ve yüklemeyi uygulamada yönet."] },
	related: ["Form", "MessageList"],
	samples: [
		{
			title: { en: "Choose a PDF", tr: "PDF seç" },
			xml: `<k:FileDrop label="[[Packing slip||Paket fişi]]" accept=".pdf" maxSize="5" add=".onAdd"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.SimpleFile", {
				onAdd(event) {
					Toast.show(event.getParameter("files")[0].name);
				}
			}));`
		},
		{
			title: { en: "Manage inspection attachments", tr: "Kontrol eklerini yönet" },
			text: { en: "This example simulates upload completion locally. Choose a PDF or an image, then remove an entry or retry the failed one.", tr: "Örnek yükleme sonucunu yerelde canlandırır. PDF veya görsel seç, ardından bir kaydı kaldır veya hatalı yüklemeyi yeniden dene." },
			xml: `<k:FileDrop label="[[Inspection attachments||Kontrol ekleri]]" accept=".pdf,image/*" maxSize="5"
				multiple="true" add=".onAdd" remove=".onRemove" retry=".onRetry">
				<k:FileItem name="inspection.pdf" size="2048" error="[[Upload interrupted||Yükleme kesildi]]"/>
			</k:FileDrop>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast", "kor/ui/FileItem"], (Controller, Toast, FileItem) => Controller.extend("sample.InspectionFiles", {
				onAdd(event) {
					const drop = event.getSource();
					for (const file of event.getParameter("files")) {
						drop.addFile(new FileItem({ name: file.name, size: file.size, progress: 100 }));
					}
					Toast.show("[[Files added locally||Dosyalar yerelde eklendi]]");
				},
				onRemove(event) {
					event.getSource().removeFile(event.getParameter("item")).destroy();
					Toast.show("[[File removed||Dosya kaldırıldı]]");
				},
				onRetry(event) {
					const item = event.getParameter("item");
					item.setError("").setProgress(100);
					Toast.show("[[Simulated upload completed||Deneme yüklemesi tamamlandı]]");
				}
			}));`
		}
	]
};
