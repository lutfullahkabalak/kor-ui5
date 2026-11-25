export default {
	summary: { en: "Picks a number or an interval by dragging.", tr: "Sürükleyerek sayı veya aralık seçer." },
	use: { en: ["Use it when the approximate value matters more than the exact one."], tr: ["Kesin sayıdan çok yaklaşık değer önemliyse kullan."] },
	related: ["NumberField", "Rating"],
	samples: [
		{
			title: { en: "Value and interval", tr: "Değer ve aralık" },
			xml: `<k:Stack gap="18">
				<k:Slider label="[[Discount||İskonto]]" value="15" max="50" unit="%"/>
				<k:Slider label="[[Price||Fiyat]]" range="true" value="200" to="750" max="1000" step="10" unit="TRY"/>
			</k:Stack>`
		}
	]
};
