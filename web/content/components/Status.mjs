export default {
	summary: { en: "Combines a shape and text with color to convey state.", tr: "Durumu renk, şekil ve metinle birlikte gösterir." },
	use: { en: ["Mark a record state such as approval, delay or completion."], tr: ["Onay, gecikme veya tamamlanma gibi kayıt durumlarını göster."] },
	related: ["Stages", "Message"],
	samples: [
		{
			title: { en: "Default state text", tr: "Varsayılan durum metni" },
			xml: `<k:Status state="success"/>`
		},
		{
			title: { en: "Shipment statuses", tr: "Sevkiyat durumları" },
			xml: `<k:Stack gap="8">
				<k:Status state="success" text="[[Collected||Teslim alındı]]"/>
				<k:Status state="wait" text="[[Awaiting carrier||Taşıyıcı bekleniyor]]"/>
				<k:Status state="danger" text="[[Delivery blocked||Teslimat durduruldu]]"/>
			</k:Stack>`
		}
	]
};
