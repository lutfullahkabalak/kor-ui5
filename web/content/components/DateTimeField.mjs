export default {
	summary: { en: "Enters a date and a time together.", tr: "Tarih ve saati birlikte alır." },
	use: { en: ["Use it for a precise moment, such as a deadline."], tr: ["Son tarih gibi kesin bir an için kullan."] },
	related: ["DateField", "TimeField"],
	samples: [
		{
			title: { en: "Deadline", tr: "Son tarih" },
			xml: `<k:DateTimeField label="[[Deadline||Son tarih]]" value="{/due}" defaultTime="17:00"/>`,
			data: {
				"due": "2026-11-25T14:30:00Z"
			}
		}
	]
};
