export default {
	summary: { en: "Takes an instruction for an AI assistant.", tr: "Yapay zekâ yardımcısına istem alır." },
	use: { en: ["Connect it to your own AI service. The control sends nothing by itself."], tr: ["Kendi yapay zekâ hizmetine bağla. Bileşen kendiliğinden hiçbir yere veri göndermez."] },
	related: ["TextField", "CommandPalette"],
	samples: [
		{
			title: { en: "Ask about orders", tr: "Siparişleri sor" },
			xml: `<k:PromptField placeholder="[[Ask about your orders||Siparişlerini sor]]" maxLength="300" note="[[Answers may contain mistakes.||Yanıtlar hata içerebilir.]]" submit=".onSubmit">
				<core:Item xmlns:core="sap.ui.core" text="[[Which orders are late?||Hangi siparişler gecikti?]]"/>
				<core:Item xmlns:core="sap.ui.core" text="[[Summarize this week||Bu haftayı özetle]]"/>
			</k:PromptField>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Prompt", {
				onSubmit(event) {
					Toast.show(String(event.getParameter("value")));
				}
			}));`
		}
	]
};
