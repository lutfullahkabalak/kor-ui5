export default {
	children: ["ActivityItem"],
	summary: { en: "Records who made a change, what changed and when.", tr: "Kimin neyi ne zaman değiştirdiğini gösterir." },
	use: { en: ["Add a readable history to a record with several contributors."], tr: ["Birden çok kişinin çalıştığı kayda okunabilir bir hareket dökümü ekle."] },
	related: ["Person", "Stages"],
	samples: [
		{
			title: { en: "One entry", tr: "Tek kayıt" },
			xml: `<k:Activity>
				<k:ActivityItem person="Elif Aydın" text="[[created the order||siparişi oluşturdu]]" time="09:20"/>
			</k:Activity>`
		},
		{
			title: { en: "Changes to a shipment", tr: "Sevkiyat değişiklikleri" },
			text: { en: "Supply a localized display string for time. Activity preserves the order of the entries supplied by the application.", tr: "Zamanı kullanıcının dilinde biçimlendirip metin olarak ver. Activity kayıtları uygulamadan gelen sırayla gösterir." },
			xml: `<k:Activity items="{path: '/changes', templateShareable: false}">
				<k:ActivityItem person="{person}" text="{text}" time="{time}" icon="{icon}" field="{field}" oldValue="{from}" newValue="{to}"/>
			</k:Activity>`,
			data: {
				"changes": [
					{
						"person": "Mert Kaya",
						"text": "[[changed the route||rotayı değiştirdi]]",
						"time": "10:15",
						"icon": "truck",
						"field": "[[Pickup point||Teslim alma yeri]]",
						"from": "[[East gate||Doğu kapısı]]",
						"to": "[[North gate||Kuzey kapısı]]"
					},
					{
						"person": "Elif Aydın",
						"text": "[[updated the shipment||sevkiyatı güncelledi]]",
						"time": "09:30",
						"icon": "",
						"field": "[[Status||Durum]]",
						"from": "[[Queued||Sırada]]",
						"to": "[[Packing||Paketlemede]]"
					}
				]
			}
		}
	]
};
