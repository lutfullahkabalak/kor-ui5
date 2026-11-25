export default {
	children: ["WaterfallStep"],
	summary: { en: "Explains how a value changed.", tr: "Bir değerin nasıl değiştiğini açıklar." },
	use: { en: ["Use it for profit bridges and budget changes."], tr: ["Kâr köprüsü ve bütçe değişiminde kullan."] },
	related: ["Trend", "Stat"],
	samples: [
		{
			title: { en: "From revenue to profit", tr: "Cirodan kâra" },
			xml: `<k:Waterfall unit="[[thousand TRY||bin TRY]]" height="220">
				<k:WaterfallStep label="[[Revenue||Ciro]]" value="920" kind="total"/>
				<k:WaterfallStep label="[[Material||Malzeme]]" value="-410"/>
				<k:WaterfallStep label="[[Labor||İşçilik]]" value="-180"/>
				<k:WaterfallStep label="[[Incentive||Teşvik]]" value="60"/>
				<k:WaterfallStep label="[[Energy||Enerji]]" value="-95"/>
				<k:WaterfallStep label="[[Profit||Kâr]]" kind="total"/>
			</k:Waterfall>`
		}
	]
};
