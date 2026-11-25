export default {
	children: ["PieSlice"],
	summary: { en: "Shows the parts of a whole as a pie or donut.", tr: "Bir bütünün paylarını pasta veya halka olarak gösterir." },
	use: { en: ["Use it for a few parts that add up to a whole.", "To compare close values, use BarChart."], tr: ["Toplamı bir bütün eden az sayıda pay için kullan.", "Birbirine yakın değerleri karşılaştırmak için BarChart kullan."] },
	keyboard: [["Tab, Enter", { en: "Moves through slices and presses one when slicePress is set.", tr: "slicePress varsa dilimler arasında dolaşır ve basar." }]],
	related: ["BarChart", "Trend", "Stat"],
	samples: [
		{
			title: { en: "Pie", tr: "Pasta" },
			xml: `<k:PieChart label="[[Sales by region||Bölgeye göre satış]]" unit="[[thousand TRY||bin TRY]]">
				<k:PieSlice label="[[Marmara||Marmara]]" value="420"/>
				<k:PieSlice label="[[Aegean||Ege]]" value="260"/>
				<k:PieSlice label="[[Central Anatolia||İç Anadolu]]" value="190"/>
				<k:PieSlice label="[[Mediterranean||Akdeniz]]" value="130"/>
			</k:PieChart>`
		},
		{
			title: { en: "Donut from a model", tr: "Modelden halka" },
			xml: `<k:PieChart kind="donut" label="[[Expenses||Giderler]]" totalLabel="[[Expenses||Gider]]" compact="true" unit="TRY" slices="{/costs}">
				<k:PieSlice label="{name}" value="{amount}"/>
			</k:PieChart>`,
			data: { costs: [
				{ name: "[[Material||Malzeme]]", amount: 1840000 }, { name: "[[Labor||İşçilik]]", amount: 960000 }, { name: "[[Energy||Enerji]]", amount: 520000 },
				{ name: "[[Freight||Nakliye]]", amount: 340000 }, { name: "[[Rent||Kira]]", amount: 210000 }, { name: "[[Insurance||Sigorta]]", amount: 90000 }, { name: "[[Training||Eğitim]]", amount: 60000 }
			] }
		}
	]
};
