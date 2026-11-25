export default {
	children: ["LoadItem"],
	summary: { en: "Shows how a vehicle is loaded.", tr: "Aracın nasıl yüklendiğini gösterir." },
	use: { en: ["Use it before dispatch to check space and weight."], tr: ["Sevkten önce yer ve ağırlık denetiminde kullan."] },
	related: ["DockBoard", "DeliveryRoute"],
	samples: [
		{
			title: { en: "A full trailer", tr: "Dolu dorse" },
			xml: `<k:LoadPlan title="34 KRG 72" text="[[13.6 m trailer||13,6 m dorse]]" slots="26" maxWeight="24000">
				<k:LoadItem key="1" title="Deniz Tekstil" text="Bursa" slots="10" weight="7200" stop="3"/>
				<k:LoadItem key="2" title="Anadolu Metal" text="Eskişehir" slots="6" weight="11800" stop="2"/>
				<k:LoadItem key="3" title="Ege Gıda" text="Bilecik" slots="8" weight="6100" stop="1"/>
			</k:LoadPlan>`
		}
	]
};
