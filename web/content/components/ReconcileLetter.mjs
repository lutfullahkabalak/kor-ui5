export default {
	summary: { en: "A balance confirmation letter the business partner confirms or disputes.", tr: "Karşı tarafın onayladığı veya itiraz ettiği cari mutabakat mektubu." },
	use: {
		en: ["Use it on the page your partner opens from the confirmation e-mail, and to show the reply in your own app.", "Put a FileDrop inside it to let the partner attach their statement."],
		tr: ["Karşı tarafın mutabakat e-postasından açtığı sayfada ve kendi uygulamanda yanıtı göstermek için kullan.", "Karşı taraf ekstresini eklesin diye içine FileDrop koy."]
	},
	avoid: { en: ["It is not a legal e-signature. Record who answered and when on the server."], tr: ["Hukuki e-imza değildir. Kimin ne zaman yanıtladığını sunucuda kaydet."] },
	related: ["MatchGrid", "ReconMatrix", "FileDrop"],
	samples: [
		{
			title: { en: "Reply to a confirmation", tr: "Mutabakatı yanıtla" },
			text: { en: "Choose Dispute, enter a balance and send. The difference is calculated while you type.", tr: "Mutabık değiliz'i seçip bakiye girin ve gönderin. Fark yazarken hesaplanır." },
			xml: `<k:ReconcileLetter company="Anadolu Metal A.Ş." party="Ege Çelik Ltd." reference="MUT-2026-0412" date="2026-12-31" dueDate="2027-01-15" today="2027-01-06" balance="125430.50" currency="TRY" respond=".onRespond">
				<k:FileDrop label="[[Your statement||Ekstreniz]]" accept=".pdf,.xlsx"/>
			</k:ReconcileLetter>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Letter", {
				onRespond(event) {
					Toast.show(event.getParameter("status") === "agreed" ? "[[Thank you for confirming||Onayınız için teşekkürler]]" : "[[Your objection was sent||İtirazınız iletildi]]");
				}
			}));`
		},
		{
			title: { en: "Disputed reply", tr: "İtiraz edilmiş yanıt" },
			xml: `<k:ReconcileLetter party="Kuzey Lojistik" reference="MUT-2026-0398" date="2026-12-31" balance="18400" direction="credit" currency="TRY" status="disputed" theirBalance="16900" reason="payment" note="[[Our payment of 1,500 TRY was sent on 30 December.||1.500 TL ödememiz 30 Aralık'ta gönderildi.]]" answeredBy="Selin Arı" answeredAt="2027-01-04"/>`
		}
	]
};
