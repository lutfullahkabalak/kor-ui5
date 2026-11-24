export default {
	children: ["Stage"],
	summary: { en: "Shows the stages of a record in order.", tr: "Bir kaydın aşamalarını sırasıyla gösterir." },
	use: { en: ["Show where an order or request stands in a known sequence."], tr: ["Sipariş veya talebin belirli bir sürecin neresinde olduğunu göster."] },
	related: ["Status", "Activity"],
	samples: [
		{
			title: { en: "Progress through a sequence", tr: "Süreçte ilerleme" },
			xml: `<k:Stages>
				<k:Stage title="[[Received||Alındı]]" state="success"/>
				<k:Stage title="[[Picking||Toplanıyor]]" state="info"/>
				<k:Stage title="[[Dispatched||Sevkiyat]]"/>
			</k:Stages>`
		},
		{
			title: { en: "A release awaiting inspection", tr: "Kontrol bekleyen üretim emri" },
			xml: `<k:Stages stages="{path: '/steps', templateShareable: false}">
				<k:Stage title="{title}" info="{info}" state="{state}"/>
			</k:Stages>`,
			data: {
				"steps": [
					{
						"title": "[[Assembly||Montaj]]",
						"info": "[[Complete||Tamamlandı]]",
						"state": "success"
					},
					{
						"title": "[[Inspection||Kontrol]]",
						"info": "[[Awaiting measurement||Ölçüm bekleniyor]]",
						"state": "wait"
					},
					{
						"title": "[[Release||Serbest bırakma]]",
						"info": "[[Scheduled||Planlandı]]",
						"state": "none"
					}
				]
			}
		}
	]
};
