export default {
	summary: { en: "Enters a time of day.", tr: "Günün saatini alır." },
	use: { en: ["Use it for appointments and shifts."], tr: ["Randevu ve vardiya saatleri için kullan."] },
	related: ["DateField", "DateTimeField"],
	samples: [
		{
			title: { en: "Appointment time", tr: "Randevu saati" },
			xml: `<k:TimeField label="[[Arrival||Varış]]" value="09:30" min="08:00" max="18:00" step="15" help="[[Type 930 or 9:30 am||930 veya 9.30 yazabilirsin]]"/>`
		}
	]
};
