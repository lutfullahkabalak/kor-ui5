const quarters = ["[[Q1||1. Ç]]", "[[Q2||2. Ç]]", "[[Q3||3. Ç]]", "[[Q4||4. Ç]]"];
export default {
	children: ["Series"],
	summary: { en: "Compares categories with vertical or horizontal bars.", tr: "Sınıfları dikey veya yatay çubuklarla karşılaştırır." },
	use: { en: ["Compare categories side by side, stacked or in percent.", "For long names use horizontal bars; for time series use Trend."], tr: ["Sınıfları yan yana, yığılmış veya yüzde olarak karşılaştır.", "Uzun adlarda yatay çubuk, zaman serisinde Trend kullan."] },
	keyboard: [
		["←, →, ↑, ↓", { en: "Move between categories: left and right for vertical bars, up and down for horizontal bars.", tr: "Sınıflar arasında dolaşır: dikeyde sağ ve sol, yatayda yukarı ve aşağı." }],
		["Home, End", { en: "Go to the first or last category.", tr: "İlk veya son sınıfa gider." }],
		["Enter", { en: "Presses the category when barPress is set.", tr: "barPress varsa sınıfa basar." }]
	],
	related: ["PieChart", "Trend", "Waterfall"],
	samples: [
		{
			title: { en: "Grouped bars", tr: "Yan yana çubuklar" },
			xml: `<k:BarChart label="[[Sales by quarter||Çeyreklik satış]]" labels="{/quarters}" unit="[[thousand TRY||bin TRY]]">
				<k:Series name="2025" values="{/last}"/>
				<k:Series name="2026" values="{/now}"/>
			</k:BarChart>`,
			data: { quarters, last: [320, 410, 380, 460], now: [365, 398, 472, 540] }
		},
		{
			title: { en: "Horizontal, with values", tr: "Yatay, değerleriyle" },
			xml: `<k:BarChart horizontal="true" showValues="true" label="[[Open orders by plant||Tesise göre açık sipariş]]" labels="{/plants}" unit="[[orders||sipariş]]">
				<k:Series name="[[Open orders||Açık sipariş]]" values="{/open}"/>
			</k:BarChart>`,
			data: { plants: ["[[Istanbul assembly||İstanbul montaj]]", "[[Bursa press||Bursa pres]]", "[[Izmir paint||İzmir boya]]", "[[Ankara spare parts||Ankara yedek parça]]"], open: [148, 112, 64, 37] }
		},
		{
			title: { en: "Stacked", tr: "Yığılmış" },
			xml: `<k:BarChart stack="stacked" showValues="true" label="[[Shipments by channel||Kanala göre sevkiyat]]" labels="{/quarters}" unit="[[tons||ton]]">
				<k:Series name="[[Road||Kara]]" values="{/road}"/>
				<k:Series name="[[Sea||Deniz]]" values="{/sea}"/>
				<k:Series name="[[Air||Hava]]" values="{/air}"/>
			</k:BarChart>`,
			data: { quarters, road: [210, 240, 225, 260], sea: [130, 120, 160, 175], air: [24, 30, 28, 41] }
		},
		{
			title: { en: "Percent, horizontal", tr: "Yüzde, yatay" },
			xml: `<k:BarChart stack="full" horizontal="true" label="[[Delivery performance||Teslim performansı]]" labels="{/carriers}">
				<k:Series name="[[Late||Geç]]" values="{/late}"/>
				<k:Series name="[[On time||Zamanında]]" values="{/ontime}"/>
			</k:BarChart>`,
			data: { carriers: ["[[Carrier A||Taşıyıcı A]]", "[[Carrier B||Taşıyıcı B]]", "[[Carrier C||Taşıyıcı C]]"], ontime: [182, 96, 240], late: [18, 24, 12] }
		},
		{
			title: { en: "Negative values", tr: "Eksi değerler" },
			xml: `<k:BarChart showValues="true" label="[[Monthly net cash||Aylık net nakit]]" labels="{/months}" unit="[[thousand TRY||bin TRY]]" height="220">
				<k:Series name="[[Net cash||Net nakit]]" values="{/net}"/>
			</k:BarChart>`,
			data: { months: ["[[Jan||Oca]]", "[[Feb||Şub]]", "[[Mar||Mar]]", "[[Apr||Nis]]", "[[May||May]]", "[[Jun||Haz]]"], net: [120, -45, 80, -90, 30, 140] }
		}
	]
};
