export default {
	summary: { en: "Collects an inclusive range using two calendar months or presets.", tr: "İki aylık takvim veya hazır aralıklarla başlangıç ve bitiş gününü seçtirir." },
	use: { en: ["Set a period for a report or a reservation."], tr: ["Bir raporun ya da rezervasyonun tarih aralığını belirle."] },
	related: ["DateField", "Schedule"],
	samples: [
		{
			title: { en: "Choose a date range", tr: "Tarih aralığı seç" },
			xml: `<k:DateRangeField label="[[Report period||Rapor dönemi]]" start="2026-12-01" end="2026-12-07" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.DateRangeFieldChange", {
				onChange(event) {
					Toast.show("[[Report period updated||Rapor dönemi güncellendi]]");
				}
			}));`
		},
		{
			title: { en: "Limit a reservation window", tr: "Rezervasyon dönemini sınırla" },
			text: { en: "Both boundary days are included. The reservation can only use dates in December 2026.", tr: "Başlangıç ve bitiş günleri aralığa dahildir. Rezervasyon yalnızca Aralık 2026 içindeki günlere yapılabilir." },
			xml: `<k:DateRangeField label="[[Equipment reservation||Ekipman rezervasyonu]]" start="2026-12-07" end="2026-12-09" presets="false" min="2026-12-01" max="2026-12-31" required="true" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.DateRangeFieldChange", {
				onChange(event) {
					Toast.show("[[Reservation dates updated||Rezervasyon tarihleri güncellendi]]");
				}
			}));`
		}
	]
};
