export default {
	children: ["TreeItem"],
	summary: { en: "Picks a node from a hierarchy.", tr: "Hiyerarşiden bir öğe seçtirir." },
	use: { en: ["Use it for cost centers, categories and locations."], tr: ["Masraf yeri, kategori ve konum seçiminde kullan."] },
	related: ["SelectField", "LookupField"],
	samples: [
		{
			title: { en: "Cost center", tr: "Masraf yeri" },
			xml: `<k:TreeField label="[[Cost center||Masraf yeri]]" leafOnly="true" items="{path: '/nodes', templateShareable: false}"><k:TreeItem key="{id}" parentKey="{up}" text="{text}"/></k:TreeField>`,
			data: {
				"nodes": [
					{
						"id": "1",
						"up": "",
						"text": "[[Production||Üretim]]"
					},
					{
						"id": "11",
						"up": "1",
						"text": "[[Assembly||Montaj]]"
					},
					{
						"id": "12",
						"up": "1",
						"text": "[[Paint shop||Boyahane]]"
					},
					{
						"id": "2",
						"up": "",
						"text": "[[Sales||Satış]]"
					},
					{
						"id": "21",
						"up": "2",
						"text": "[[Export||İhracat]]"
					}
				]
			}
		}
	]
};
