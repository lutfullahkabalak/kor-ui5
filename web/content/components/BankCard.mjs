export default {
	summary: { en: "Shows a bank card and its limit.", tr: "Banka kartını ve limitini gösterir." },
	use: { en: ["Bind only the last four digits. Never send the full number to the page."], tr: ["Yalnız son dört haneyi bağla. Tam numarayı sayfaya gönderme."] },
	related: ["Statement", "Installments"],
	samples: [
		{
			title: { en: "Company card", tr: "Şirket kartı" },
			xml: `<k:BankCard bank="Kor Bank" holder="Ada Yılmaz" last4="4821" expiry="09/29" scheme="BUSINESS" used="38250" limit="50000" currency="TRY" canFreeze="true"/>`
		},
		{
			title: { en: "Colors", tr: "Renkler" },
			xml: `<k:Stack direction="grid" columns="2" gap="14"><k:BankCard bank="Kor Bank" last4="1102" tone="2"/><k:BankCard bank="Kor Bank" last4="7740" tone="3" frozen="true"/></k:Stack>`
		}
	]
};
