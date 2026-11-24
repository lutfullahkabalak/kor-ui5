export default {
	summary: { en: "Accepts a date from a calendar or a typed value.", tr: "Takvimden veya yazıyla tarih alır." },
	use: { en: ["Collect a single day with optional date limits and calendar notes."], tr: ["İsteğe bağlı tarih sınırları ve takvim notlarıyla tek gün seçtir."] },
	related: ["DateRangeField", "Schedule"],
	samples: [
		{
			title: { en: "Choose a day", tr: "Gün seç" },
			xml: `<k:DateField label="[[Delivery date||Teslimat tarihi]]" value="2026-12-08" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.DateFieldChange", {
				onChange(event) {
					Toast.show("[[Delivery date updated||Teslimat tarihi güncellendi]]");
				}
			}));`
		},
		{
			title: { en: "Book a workday", tr: "İş günü ayır" },
			text: { en: "Only weekdays in December are selectable. The calendar marks 15 December with a note.", tr: "Yalnızca Aralık ayındaki iş günleri seçilebilir. Takvimde 15 Aralık notla işaretlidir." },
			xml: `<k:DateField label="[[Inspection date||Kontrol tarihi]]" value="2026-12-08" min="2026-12-01" max="2026-12-31" workdays="true" marks="{/marks}" change=".onChange"/>`,
			data: {
				"marks": {
					"2026-12-15": "[[Morning appointments available||Sabah için yer var]]"
				}
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.DateFieldChange", {
				onChange(event) {
					Toast.show("[[Inspection date updated||Kontrol tarihi güncellendi]]");
				}
			}));`
		}
	]
};
