export default {
	summary: { en: "Shows how far work has come.", tr: "İşin ne kadar ilerlediğini gösterir." },
	use: { en: ["Use it for uploads, jobs and goals."], tr: ["Yükleme, iş ve hedef takibinde kullan."] },
	related: ["Skeleton", "Stages"],
	samples: [
		{
			title: { en: "Bars and a ring", tr: "Çubuk ve halka" },
			xml: `<k:Stack gap="18">
				<k:Progress label="[[Invoice import||Fatura aktarımı]]" value="64"/>
				<k:Progress label="[[Checking stock||Stok denetleniyor]]" value="-1"/>
				<k:Progress kind="ring" label="[[Target||Hedef]]" value="82" state="success"/>
			</k:Stack>`
		}
	]
};
