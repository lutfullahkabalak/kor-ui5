export default {
	children: ["CalendarEvent"],
	summary: { en: "Shows events of a month.", tr: "Ayın etkinliklerini gösterir." },
	use: { en: ["Use it for due dates, visits and holidays."], tr: ["Vade, ziyaret ve tatiller için kullan."] },
	related: ["Schedule", "Timetable"],
	samples: [
		{
			title: { en: "Team calendar", tr: "Ekip takvimi" },
			xml: `<k:MonthCalendar date="2026-11-25" events="{path: '/events', templateShareable: false}"><k:CalendarEvent key="{id}" title="{title}" start="{a}" end="{b}" time="{t}" state="{s}"/></k:MonthCalendar>`,
			data: {
				"events": [
					{
						"id": "1",
						"title": "[[Stock count||Sayım]]",
						"a": "2026-11-23",
						"b": "2026-11-25",
						"t": "",
						"s": "wait"
					},
					{
						"id": "2",
						"title": "[[Supplier visit||Tedarikçi ziyareti]]",
						"a": "2026-11-25",
						"b": "",
						"t": "10:00",
						"s": "info"
					},
					{
						"id": "3",
						"title": "[[Payment due||Ödeme günü]]",
						"a": "2026-11-30",
						"b": "",
						"t": "",
						"s": "danger"
					}
				]
			}
		}
	]
};
