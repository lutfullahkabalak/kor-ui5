export default {
	children: ["RadioItem"],
	summary: { en: "Presents a single choice as rows or descriptive cards.", tr: "Tek seçimi satırlar veya açıklamalı kartlarla sunar." },
	use: { en: ["Show every option when users need to compare them before choosing."], tr: ["Kullanıcı seçmeden önce karşılaştıracaksa seçeneklerin tamamını göster."] },
	related: ["SelectField", "Segmented"],
	samples: [
		{
			title: { en: "Two delivery options", tr: "İki teslimat seçeneği" },
			xml: `<k:RadioGroup label="[[Delivery method||Teslimat yöntemi]]" selectedKey="pickup" change=".onChange">
				<k:RadioItem key="pickup" text="[[Pickup||Elden teslim]]"/>
				<k:RadioItem key="carrier" text="[[Carrier||Taşıyıcı]]"/>
			</k:RadioGroup>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.RadioGroupChange", {
				onChange(event) {
					Toast.show(event.getParameter("key") === "pickup" ? "[[Pickup selected||Elden teslim seçildi]]" : "[[Carrier selected||Taşıyıcı seçildi]]");
				}
			}));`
		},
		{
			title: { en: "Compare delivery details", tr: "Teslimat ayrıntılarını karşılaştır" },
			xml: `<k:RadioGroup label="[[Dispatch method||Sevkiyat yöntemi]]" cards="true" selectedKey="pickup" change=".onChange">
				<k:RadioItem key="pickup" icon="boxes" text="[[Warehouse pickup||Depodan teslim]]" help="[[Collect it from the east entrance.||Doğu girişinden teslim al.]]"/>
				<k:RadioItem key="carrier" icon="truck" text="[[Carrier delivery||Taşıyıcıyla teslimat]]" help="[[Delivery takes two working days.||Teslimat iki iş günü sürer.]]"/>
			</k:RadioGroup>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.RadioGroupChange", {
				onChange(event) {
					Toast.show(event.getParameter("key") === "pickup" ? "[[Pickup selected||Elden teslim seçildi]]" : "[[Carrier selected||Taşıyıcı seçildi]]");
				}
			}));`
		}
	]
};
