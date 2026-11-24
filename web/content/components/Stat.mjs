export default {
	summary: { en: "Shows a metric with an optional change and sparkline.", tr: "Bir ölçümü, isteğe bağlı değişim ve küçük grafikle gösterir." },
	use: { en: ["Use one tile for a measure people check frequently."], tr: ["Sık kontrol edilen bir ölçüme tek kutu ayır."] },
	related: ["Trend", "Status"],
	samples: [
		{
			title: { en: "A single metric", tr: "Tek ölçüm" },
			xml: `<k:Stat label="[[Open shipments||Açık sevkiyat]]" value="56"/>`
		},
		{
			title: { en: "Lead time and its trend", tr: "Teslim süresi ve eğilimi" },
			xml: `<k:Stat label="[[Average lead time||Ortalama teslim süresi]]" value="4.8" decimals="1" unit="[[days||gün]]"
				delta="-12" upIsGood="false" note="[[Compared with last week||Geçen haftaya göre]]" trend="{/days}" press=".onPress"/>`,
			data: {
				"days": [
					5.4,
					5.5,
					5.2,
					5.0,
					4.8
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.LeadTimeStat", {
				onPress() {
					Toast.show("[[Average time from packing to delivery||Paketlemeden teslimata kadar geçen ortalama süre]]");
				}
			}));`
		}
	]
};
