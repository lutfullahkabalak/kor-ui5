export default {
	summary: { en: "Switches between a few mutually exclusive options.", tr: "Az sayıda seçenek arasında tek seçimle geçiş yapar." },
	use: { en: ["Switch the time range or display mode for the same data."], tr: ["Aynı verinin zaman aralığını veya görünüm biçimini değiştir."] },
	related: ["Tabs", "RadioGroup"],
	samples: [
		{
			title: { en: "Switch units of time", tr: "Zaman birimini değiştir" },
			xml: `<k:Segmented label="[[Period||Dönem]]" selectedKey="day" change=".onChange">
				<core:Item key="day" text="[[Day||Gün]]"/>
				<core:Item key="week" text="[[Week||Hafta]]"/>
			</k:Segmented>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.SegmentedChange", {
				onChange(event) {
					Toast.show(event.getParameter("key") === "day" ? "[[Daily period||Günlük dönem]]" : "[[Weekly period||Haftalık dönem]]");
				}
			}));`
		},
		{
			title: { en: "Switch between order totals", tr: "Sipariş toplamları arasında geçiş" },
			xml: `<k:Stack gap="10">
				<k:Segmented label="[[Report period||Rapor dönemi]]" selectedKey="day" change=".onChange">
					<core:Item key="day" text="[[Today||Bugün]]"/>
					<core:Item key="week" text="[[This week||Bu hafta]]"/>
				</k:Segmented>
				<k:Stat label="[[Orders received||Alınan siparişler]]" value="{/total}"/>
			</k:Stack>`,
			data: {
				"total": 42
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.OrderPeriod", {
				onChange(event) {
					const daily = event.getParameter("key") === "day";
					this.getView().getModel().setProperty("/total", daily ? 42 : 270);
					Toast.show(daily ? "[[Showing today||Bugün gösteriliyor]]" : "[[Showing this week||Bu hafta gösteriliyor]]");
				}
			}));`
		}
	]
};
