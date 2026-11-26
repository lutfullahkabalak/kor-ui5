export default {
	summary: { en: "Captures a hand-drawn signature as an SVG path.", tr: "Elle atılan imzayı SVG yolu olarak alır." },
	use: { en: ["Use it on handover reports, delivery notes and approvals signed on a tablet."], tr: ["Teslim tutanağı, irsaliye ve tablette imzalanan onaylarda kullan."] },
	avoid: { en: ["It is not a qualified electronic signature and cannot be signed with the keyboard. Offer another way to confirm when accessibility matters."], tr: ["Nitelikli elektronik imza değildir ve klavyeyle atılamaz. Erişilebilirlik gerektiğinde başka bir onay yolu sun."] },
	related: ["DamageMap", "HoldButton", "Form"],
	samples: [
		{
			title: { en: "Vehicle handover", tr: "Araç teslimi" },
			xml: `<k:Stack columns="repeat(auto-fit, minmax(240px, 1fr))" gap="20">
				<k:SignaturePad label="[[Handed over by||Teslim eden]]" signer="Mert Kaya" required="true"/>
				<k:SignaturePad label="[[Received by||Teslim alan]]" signer="Selin Arı" required="true"/>
			</k:Stack>`
		}
	]
};
