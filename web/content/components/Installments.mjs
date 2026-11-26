export default {
	children: ["Installment"],
	summary: { en: "Shows a repayment plan.", tr: "Geri ödeme planını gösterir." },
	use: { en: ["Use it for loans, leasing and installment sales."], tr: ["Kredi, kiralama ve taksitli satışta kullan."] },
	related: ["Statement", "LeaseTimeline", "EscalationField"],
	samples: [
		{
			title: { en: "Loan plan", tr: "Kredi planı" },
			xml: `<k:Installments currency="TRY" decimals="0">
				<k:Installment date="2026-10-15" principal="7200" interest="2800" state="success"/>
				<k:Installment date="2026-11-15" principal="7500" interest="2500" state="danger"/>
				<k:Installment date="2026-12-15" principal="7900" interest="2100"/>
				<k:Installment date="2027-01-15" principal="8300" interest="1700"/>
				<k:Installment date="2027-02-15" principal="8700" interest="1300"/>
			</k:Installments>`
		},
		{
			title: { en: "Lease schedule with principal left", tr: "Kalan anaparalı kira planı" },
			text: { en: "showBalance adds the principal left after each payment; remeasured marks a payment whose amount changed.", tr: "showBalance her ödemeden sonra kalan anaparayı ekler; remeasured tutarı değişen ödemeyi işaretler." },
			xml: `<k:Installments currency="TRY" decimals="0" showBalance="true">
				<k:Installment date="2027-01-01" principal="61200" interest="23800" state="success"/>
				<k:Installment date="2027-04-01" principal="63100" interest="21900" state="success"/>
				<k:Installment date="2027-07-01" principal="76400" interest="25600" remeasured="true"/>
				<k:Installment date="2027-10-01" principal="79000" interest="23000"/>
			</k:Installments>`
		}
	]
};
