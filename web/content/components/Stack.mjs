export default {
	summary: { en: "Arranges controls in a column, row or responsive grid.", tr: "Kontrolleri sütun, satır veya uyarlanabilir ızgarada dizer." },
	use: { en: ["Lay out related controls with a consistent gap and alignment."], tr: ["İlişkili kontrolleri tutarlı aralık ve hizayla yerleştir."] },
	related: ["Shell", "Form"],
	samples: [
		{
			title: { en: "Inline details", tr: "Yan yana ayrıntılar" },
			xml: `<k:Stack row="true" gap="8" align="center">
				<k:Text text="SO-104"/>
				<k:Status state="wait" text="[[Packing||Paketlemede]]"/>
			</k:Stack>`
		},
		{
			title: { en: "An order summary with two columns", tr: "İki sütunlu sipariş özeti" },
			text: { en: "The grid falls back to a single column on a narrow screen.", tr: "Ekran daraldığında ızgara tek sütuna iner." },
			xml: `<k:Stack columns="2fr 1fr" gap="20" align="start">
				<k:Stack gap="4">
					<k:Text kind="heading" text="[[Order SO-104||Sipariş SO-104]]"/>
					<k:Text text="[[Collection at the north warehouse||Kuzey deposundan teslim alma]]"/>
				</k:Stack>
				<k:Stat label="[[Parcels||Koli]]" value="12"/>
			</k:Stack>`
		}
	]
};
