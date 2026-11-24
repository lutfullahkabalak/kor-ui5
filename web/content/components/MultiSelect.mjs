export default {
	summary: { en: "Finds options by typing and keeps multiple selections.", tr: "Yazarak seçenek bulur ve birden çok seçimi saklar." },
	use: { en: ["Choose several values from a limited list such as warehouse filters."], tr: ["Depo süzgeci gibi sınırlı bir listeden birden çok değer seç."] },
	related: ["SelectField", "LookupField"],
	samples: [
		{
			title: { en: "Choose delivery channels", tr: "Teslimat kanallarını seç" },
			xml: `<k:MultiSelect label="[[Delivery channels||Teslimat kanalları]]" change=".onChange">
				<core:Item key="pickup" text="[[Pickup||Elden teslim]]"/>
				<core:Item key="carrier" text="[[Carrier||Taşıyıcı]]"/>
			</k:MultiSelect>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.MultiSelectChange", {
				onChange(event) {
					const field = event.getSource();
					const keys = event.getParameter("keys");
					const labels = field.getItems().filter((item) => keys.includes(item.getKey())).map((item) => item.getText());
					Toast.show(labels.join(", ") || "[[Selection cleared||Seçim kaldırıldı]]");
				}
			}));`
		},
		{
			title: { en: "Choose warehouses", tr: "Depoları seç" },
			text: { en: "Selected entries remain visible while you search for more.", tr: "Başka seçenek ararken seçtiklerin görünür kalır." },
			xml: `<k:MultiSelect label="[[Warehouses||Depolar]]" placeholder="[[Type a warehouse name||Depo adı yaz]]" items="{path: '/options', templateShareable: false}" change=".onChange">
				<core:Item key="{key}" text="{text}"/>
			</k:MultiSelect>`,
			data: {
				"options": [
					{
						"key": "east",
						"text": "[[East depot||Doğu deposu]]"
					},
					{
						"key": "north",
						"text": "[[North warehouse||Kuzey deposu]]"
					},
					{
						"key": "south",
						"text": "[[South warehouse||Güney deposu]]"
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.MultiSelectChange", {
				onChange(event) {
					const field = event.getSource();
					const keys = event.getParameter("keys");
					const labels = field.getItems().filter((item) => keys.includes(item.getKey())).map((item) => item.getText());
					Toast.show(labels.join(", ") || "[[Selection cleared||Seçim kaldırıldı]]");
				}
			}));`
		}
	]
};
