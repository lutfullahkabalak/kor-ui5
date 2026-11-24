export default {
	summary: { en: "Finds and selects a single option by typing.", tr: "Yazarak seçenek bulmayı ve tek seçim yapmayı sağlar." },
	use: { en: ["Choose one item from a known list of values."], tr: ["Bilinen bir değer listesinden tek seçim yaptır."] },
	related: ["MultiSelect", "LookupField"],
	samples: [
		{
			title: { en: "Select a delivery method", tr: "Teslimat yöntemini seç" },
			xml: `<k:SelectField label="[[Delivery||Teslimat]]" selectedKey="pickup" change=".onChange">
				<core:Item key="pickup" text="[[Pickup||Elden teslim]]"/>
				<core:Item key="carrier" text="[[Carrier||Taşıyıcı]]"/>
			</k:SelectField>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.SelectFieldChange", {
				onChange(event) {
					Toast.show(event.getParameter("key") === "pickup" ? "[[Pickup selected||Elden teslim seçildi]]" : "[[Carrier selected||Taşıyıcı seçildi]]");
				}
			}));`
		},
		{
			title: { en: "Find a warehouse", tr: "Depo bul" },
			xml: `<k:SelectField label="[[Warehouse||Depo]]" required="true" placeholder="[[Search by name||Ada göre ara]]" items="{path: '/options', templateShareable: false}" change=".onChange">
				<core:Item key="{key}" text="{text}"/>
			</k:SelectField>`,
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
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.SelectFieldChange", {
				onChange(event) {
					const field = event.getSource();
					const option = field.getItems().find((item) => item.getKey() === event.getParameter("key"));
					if (option) Toast.show(option.getText());
				}
			}));`
		}
	]
};
