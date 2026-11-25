export default {
	summary: { en: "Collects or shows a star rating.", tr: "Yıldızla puan alır veya gösterir." },
	use: { en: ["Use it for supplier or service feedback."], tr: ["Tedarikçi ve hizmet değerlendirmesinde kullan."] },
	related: ["Slider", "RadioGroup"],
	samples: [
		{
			title: { en: "Rate and show", tr: "Puanla ve göster" },
			xml: `<k:Stack gap="16">
				<k:Rating label="[[Delivery quality||Teslimat kalitesi]]" value="4"/>
				<k:Rating label="[[Average||Ortalama]]" value="3.6" readOnly="true"/>
			</k:Stack>`
		}
	]
};
