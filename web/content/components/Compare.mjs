export default {
	children: ["CompareColumn","CompareRow"],
	summary: { en: "Puts offers or versions side by side.", tr: "Teklif veya sürümleri yan yana koyar." },
	use: { en: ["Use it for quotations, document versions and products."], tr: ["Teklif, belge sürümü ve ürün karşılaştırmasında kullan."] },
	related: ["Pivot", "Details"],
	samples: [
		{
			title: { en: "Quotations", tr: "Teklifler" },
			xml: `<k:Compare rows="{path: '/rows', templateShareable: false}">
				<k:columns>
					<k:CompareColumn key="a" title="Anadolu Metal" text="[[Current supplier||Mevcut tedarikçi]]"/>
					<k:CompareColumn key="b" title="Ege Çelik" actionText="[[Choose||Seç]]"/>
					<k:CompareColumn key="c" title="Nord Steel" actionText="[[Choose||Seç]]"/>
				</k:columns>
				<k:rows><k:CompareRow label="{label}" values="{values}" best="{best}" unit="{unit}" group="{group}"/></k:rows>
			</k:Compare>`,
			data: {
				"rows": [
					{
						"group": "[[Price||Fiyat]]",
						"label": "[[Unit price||Birim fiyat]]",
						"values": [
							420,
							398,
							445
						],
						"best": "min",
						"unit": "TRY"
					},
					{
						"group": "[[Price||Fiyat]]",
						"label": "[[Payment||Ödeme]]",
						"values": [
							"30",
							"30",
							"60"
						],
						"best": "max",
						"unit": "[[days||gün]]"
					},
					{
						"group": "[[Quality||Kalite]]",
						"label": "[[Certificate||Sertifika]]",
						"values": [
							"ISO 9001",
							"ISO 9001",
							"ISO 9001"
						],
						"best": "",
						"unit": ""
					}
				]
			}
		}
	]
};
