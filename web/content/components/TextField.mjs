export default {
	summary: { en: "Provides a labeled single-line or multiline input.", tr: "Etiketli tek veya çok satırlı metin alanı sunar." },
	use: { en: ["Collect a short value or a note and show validation beside the field."], tr: ["Kısa bir değer veya not al, doğrulama sonucunu alanın yanında göster."] },
	related: ["Form", "NumberField"],
	samples: [
		{
			title: { en: "A reference field", tr: "Referans alanı" },
			xml: `<k:TextField label="[[Reference||Referans]]" placeholder="SO-104" icon="search" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.TextFieldChange", {
				onChange(event) {
					Toast.show("[[Reference updated||Referans güncellendi]]");
				}
			}));`
		},
		{
			title: { en: "Validate a packing note", tr: "Paketleme notunu doğrula" },
			xml: `<k:TextField label="[[Packing note||Paketleme notu]]" rows="3" required="true" help="[[Mention any special packing instructions.||Özel paketleme talimatlarını yaz.]]" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.TextFieldChange", {
				onChange(event) {
					const field = event.getSource();
					const value = event.getParameter("value").trim();
					field.setError(value ? "" : "[[Enter a packing note.||Paketleme notu gir.]]");
					if (value) Toast.show("[[Packing note updated||Paketleme notu güncellendi]]");
				}
			}));`
		}
	]
};
