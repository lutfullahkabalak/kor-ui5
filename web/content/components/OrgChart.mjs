export default {
	children: ["OrgPerson"],
	summary: { en: "Shows who reports to whom.", tr: "Kimin kime bağlı olduğunu gösterir." },
	use: { en: ["Use it for teams and open positions."], tr: ["Ekip ve boş kadro görünümünde kullan."] },
	related: ["TreeGrid", "TalentGrid"],
	samples: [
		{
			title: { en: "Sales team", tr: "Satış ekibi" },
			xml: `<k:OrgChart press=".onPress" people="{path: '/people', templateShareable: false}"><k:OrgPerson key="{k}" managerKey="{m}" name="{n}" role="{r}" vacant="{v}"/></k:OrgChart>`,
			data: {
				"people": [
					{
						"k": "1",
						"m": "",
						"n": "Ada Yılmaz",
						"r": "[[Sales director||Satış direktörü]]",
						"v": false
					},
					{
						"k": "2",
						"m": "1",
						"n": "Can Koç",
						"r": "[[Domestic||Yurt içi]]",
						"v": false
					},
					{
						"k": "3",
						"m": "1",
						"n": "Ece Tan",
						"r": "[[Export||İhracat]]",
						"v": false
					},
					{
						"k": "4",
						"m": "2",
						"n": "Mert Aksoy",
						"r": "[[Specialist||Uzman]]",
						"v": false
					},
					{
						"k": "5",
						"m": "3",
						"n": "",
						"r": "[[Specialist||Uzman]]",
						"v": true
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Team", {
				onPress(event) {
					Toast.show(String(event.getParameter("key")));
				}
			}));`
		}
	]
};
