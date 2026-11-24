export default {
	summary: { en: "Displays text using Kor typography styles.", tr: "Metni Kor’un yazı stilleriyle gösterir." },
	use: { en: ["Set the level of a heading or present short body and secondary text."], tr: ["Başlığın düzeyini belirle veya kısa gövde metni ve ikincil bilgi göster."] },
	related: ["Stack", "Status"],
	samples: [
		{
			title: { en: "A heading", tr: "Başlık" },
			xml: `<k:Text kind="heading" text="[[Packing instructions||Paketleme talimatı]]"/>`
		},
		{
			title: { en: "Shipment details with hierarchy", tr: "Sevkiyat ayrıntılarında metin hiyerarşisi" },
			xml: `<k:Stack gap="6">
				<k:Text kind="title" text="{/title}"/>
				<k:Text kind="muted" text="{/reference}"/>
				<k:Text kind="body" text="{/instructions}"/>
			</k:Stack>`,
			data: {
				"title": "[[Road shipment||Karayolu sevkiyatı]]",
				"reference": "SH-104",
				"instructions": "[[Secure the load before the carrier arrives.||Taşıyıcı gelmeden yükü sabitle.]]"
			}
		}
	]
};
