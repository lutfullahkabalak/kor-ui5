export default {
	children: ["ShipmentStop"],
	summary: { en: "Follows a shipment across road, sea, rail and air.", tr: "Sevkiyatı kara, deniz, demir ve hava yolunda izler." },
	use: { en: ["Use it on a tracking page or an order record."], tr: ["Takip sayfasında veya sipariş kaydında kullan."] },
	related: ["DeliveryRoute", "Stages"],
	samples: [
		{
			title: { en: "Domestic cargo", tr: "Yurt içi kargo" },
			xml: `<k:Shipment title="TR 4821 7730" text="[[2 parcels, 14 kg||2 koli, 14 kg]]" eta="[[Arrives tomorrow 14:00||Yarın 14.00'te]]">
				<k:ShipmentStop title="[[Picked up||Teslim alındı]]" text="İzmir" time="08:40" state="success" icon="package-check"/>
				<k:ShipmentStop title="[[Transfer center||Aktarma merkezi]]" text="Manisa" time="13:10" state="success" icon="warehouse"/>
				<k:ShipmentStop title="[[Branch||Şube]]" text="Ankara" state="info" icon="map-pin" mode="van"/>
				<k:ShipmentStop title="[[Delivery||Teslimat]]" text="Çankaya" icon="house"/>
			</k:Shipment>`
		},
		{
			title: { en: "Multimodal export with a customs hold", tr: "Gümrükte bekleyen çok modlu ihracat" },
			xml: `<k:Shipment title="EXP-2026-118" status="problem" statusText="[[Held at customs||Gümrükte takıldı]]" eta="Hamburg">
				<k:ShipmentStop title="[[Factory||Fabrika]]" text="Bursa" state="success" mode="truck"/>
				<k:ShipmentStop title="[[Port||Liman]]" text="Gemlik" state="success" mode="ship"/>
				<k:ShipmentStop title="[[Customs||Gümrük]]" text="Hamburg" state="danger" mode="train" icon="shield-check"/>
				<k:ShipmentStop title="[[Customer||Müşteri]]" text="Berlin"/>
			</k:Shipment>`
		},
		{
			title: { en: "Every mode", tr: "Tüm taşıma türleri" },
			xml: `<k:Stack gap="12">
				<k:Shipment mode="van" progress="30" title="[[Van||Dağıtım aracı]]"/>
				<k:Shipment mode="bike" progress="55" title="[[Courier||Kurye]]"/>
				<k:Shipment mode="train" progress="45" title="[[Rail||Demiryolu]]"/>
				<k:Shipment mode="ship" progress="60" title="[[Sea||Deniz]]"/>
				<k:Shipment mode="plane" progress="70" title="[[Air||Hava]]"/>
				<k:Shipment mode="truck" status="returning" progress="40" title="[[Return||İade]]"/>
			</k:Stack>`
		}
	]
};
