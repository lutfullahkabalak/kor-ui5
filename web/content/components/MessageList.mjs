export default {
	children: ["MessageItem"],
	summary: { en: "Groups messages by severity and can focus the field connected to an entry.", tr: "Mesajları önem derecesine göre gruplar ve seçilen mesajın alanına odaklanabilir." },
	use: { en: ["Collect validation results from several fields in one place."], tr: ["Birden çok alanın doğrulama sonuçlarını bir araya getir."] },
	related: ["Message", "Form"],
	samples: [
		{
			title: { en: "A short message list", tr: "Kısa mesaj listesi" },
			xml: `<k:MessageList press=".onSelect">
				<k:MessageItem state="Error" title="[[Postcode required||Posta kodu zorunlu]]"/>
				<k:MessageItem state="Information" title="[[Pickup also available||Elden teslim seçeneği de var]]"/>
			</k:MessageList>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.MessageSummary", {
				onSelect(event) {
					Toast.show(event.getParameter("item").getTitle());
				}
			}));`
		},
		{
			title: { en: "Jump to the invalid field", tr: "Hatalı alana git" },
			text: { en: "Select the message to focus the input. Set target to the field’s full UI5 ID.", tr: "Alana odaklanmak için mesajı seç. target değerine alanın tam UI5 kimliğini ver." },
			xml: `<k:Stack gap="10">
				<k:MessageList press=".onSelect">
					<k:MessageItem id="postcodeMessage" state="Error" title="[[Postcode missing||Posta kodu eksik]]" text="[[Complete the dispatch address.||Sevkiyat adresini tamamla.]]"/>
				</k:MessageList>
				<k:TextField id="postcode" label="[[Postcode||Posta kodu]]" error="[[Enter the postcode.||Posta kodunu gir.]]"/>
			</k:Stack>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.DispatchMessages", {
				onInit() {
					this.byId("postcodeMessage").setTarget(this.byId("postcode").getId());
				},
				onSelect(event) {
					Toast.show(event.getParameter("item").getTitle());
				}
			}));`
		}
	]
};
