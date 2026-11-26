export default {
	children: ["DamageMark"],
	summary: { en: "Records vehicle damage at handover and return, and singles out new damage.", tr: "Teslim ve iadede araç hasarını kaydeder, yeni hasarı ayırır." },
	use: {
		en: ["Use it in vehicle rental, fleet leasing and pool car handovers. Set stage to return on the return form.", "A return mark in a zone with no handover mark is new damage."],
		tr: ["Araç kiralama, filo kiralama ve havuz aracı teslimlerinde kullan. İade formunda stage değerini return yap.", "Teslimde hasarı olmayan bölgede iadede bulunan hasar yeni hasardır."]
	},
	keyboard: [
		["Tab", { en: "Move between vehicle parts.", tr: "Araç bölgeleri arasında gezer." }],
		["Enter, Space", { en: "Open the damage types for a part.", tr: "Bölgenin hasar türlerini açar." }],
		["Escape", { en: "Close the damage types.", tr: "Hasar türlerini kapatır." }]
	],
	related: ["SignaturePad", "FileDrop", "Schedule"],
	samples: [
		{
			title: { en: "Return inspection", tr: "İade kontrolü" },
			xml: `<k:DamageMap label="34 KOR 512" stage="return" change=".onChange">
				<k:DamageMark key="h1" zone="frontBumper" kind="scratch" stage="handover" note="[[10 cm, lower left||10 cm, sol alt]]"/>
				<k:DamageMark key="h2" zone="rearRightDoor" kind="dent" stage="handover"/>
				<k:DamageMark key="r1" zone="frontBumper" kind="scratch" stage="return"/>
				<k:DamageMark key="r2" zone="windshield" kind="broken" stage="return" note="[[Stone chip||Taş izi]]"/>
			</k:DamageMap>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Damage", {
				onChange(event) {
					Toast.show(event.getParameter("action") === "add" ? "[[Damage added||Hasar eklendi]]" : "[[Damage removed||Hasar silindi]]");
				}
			}));`
		}
	]
};
