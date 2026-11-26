export default {
	summary: { en: "Sets a rent increase rule and previews the rent for the coming periods.", tr: "Kira artış kuralını belirler ve sonraki dönemlerin kirasını önizler." },
	use: {
		en: ["Use it in lease and rental contracts: fixed rate, index-linked with an optional cap, or no increase.", "Pass the index forecast in indexRates; the last value is used for the remaining periods."],
		tr: ["Kira ve kiralama sözleşmelerinde kullan: sabit oran, isteğe bağlı tavanlı endeks veya artışsız.", "Endeks beklentisini indexRates ile ver; son değer kalan dönemlerde de kullanılır."]
	},
	avoid: { en: ["It does not know legal caps. Set cap from your own rules."], tr: ["Yasal tavanları bilmez. cap değerini kendi kurallarına göre ver."] },
	related: ["LeaseTimeline", "Installments", "NumberField"],
	samples: [
		{
			title: { en: "Index-linked with a cap", tr: "Tavanlı endeks" },
			xml: `<k:EscalationField label="[[Annual rent increase||Yıllık kira artışı]]" rule="{/rule}" rate="{/rate}" cap="{/cap}" indexName="[[CPI 12-month average||TÜFE 12 ay ortalaması]]" indexRates="{/index}" base="85000" currency="TRY" decimals="0" start="2027-03-01" periods="4"/>`,
			data: { rule: "index", rate: 15, cap: 25, index: [32.9, 24.1, 18.6, 15] }
		}
	]
};
