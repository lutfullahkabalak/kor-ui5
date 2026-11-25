export default {
	children: ["ListItem"],
	summary: { en: "Lists people, documents or records.", tr: "Kişi, belge veya kayıtları listeler." },
	use: { en: ["Use it when a table would have only a few columns."], tr: ["Tablo yalnızca birkaç sütunlu olacaksa kullan."] },
	related: ["DataGrid", "Inbox"],
	samples: [
		{
			title: { en: "Open records", tr: "Kayıt açma" },
			xml: `<k:List items="{path: '/rows', templateShareable: false}" press=".onPress"><k:ListItem key="{id}" title="{title}" text="{text}" meta="{amount}" state="{state}" person="{person}"/></k:List>`,
			data: {
				"rows": [
					{
						"id": "4711",
						"title": "Deniz Tekstil",
						"text": "[[Order 4711||Sipariş 4711]]",
						"amount": "18.400",
						"state": "success",
						"person": "Deniz Tekstil"
					},
					{
						"id": "4712",
						"title": "Atlas Lojistik",
						"text": "[[Order 4712||Sipariş 4712]]",
						"amount": "7.250",
						"state": "wait",
						"person": "Atlas Lojistik"
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.OpenRows", {
				onPress(event) {
					Toast.show(String(event.getParameter("key")));
				}
			}));`
		},
		{
			title: { en: "Multiple selection", tr: "Çoklu seçim" },
			xml: `<k:List mode="multi" selectedKeys="a" label="[[Documents||Belgeler]]">
				<k:ListItem key="a" group="[[Required||Zorunlu]]" icon="file-text" title="[[Invoice||Fatura]]"/>
				<k:ListItem key="b" group="[[Required||Zorunlu]]" icon="file-text" title="[[Waybill||İrsaliye]]"/>
				<k:ListItem key="c" group="[[Optional||İsteğe bağlı]]" icon="shield-check" title="[[Certificate||Sertifika]]"/>
			</k:List>`
		}
	]
};
