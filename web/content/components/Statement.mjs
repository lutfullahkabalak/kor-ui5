export default {
	children: ["Transaction"],
	summary: { en: "Lists account transactions by day.", tr: "Hesap hareketlerini güne göre listeler." },
	use: { en: ["Use it for accounts, cards and petty cash."], tr: ["Hesap, kart ve kasa hareketlerinde kullan."] },
	related: ["BankCard", "DataGrid"],
	samples: [
		{
			title: { en: "Account", tr: "Hesap" },
			xml: `<k:Statement currency="TRY" balance="{/balance}" items="{path: '/rows', templateShareable: false}"><k:Transaction title="{t}" text="{x}" date="{d}" amount="{a}" category="{c}" state="{s}"/></k:Statement>`,
			data: {
				"balance": 62180.5,
				"rows": [
					{
						"t": "Ege Market",
						"x": "[[Card||Kart]]",
						"d": "2026-11-25",
						"a": -640.9,
						"c": "market",
						"s": ""
					},
					{
						"t": "[[Salary||Maaş]]",
						"x": "",
						"d": "2026-11-25",
						"a": 52000,
						"c": "salary",
						"s": ""
					},
					{
						"t": "[[Flight||Uçak bileti]]",
						"x": "[[Cancelled||İptal]]",
						"d": "2026-11-24",
						"a": -3200,
						"c": "travel",
						"s": "danger"
					},
					{
						"t": "[[Electricity||Elektrik]]",
						"x": "",
						"d": "2026-11-24",
						"a": -815.4,
						"c": "bill",
						"s": ""
					}
				]
			}
		}
	]
};
