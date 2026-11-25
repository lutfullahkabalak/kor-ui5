export default {
	children: ["DeliveryStop"],
	summary: { en: "Follows the stops of a delivery round.", tr: "Dağıtım turunun duraklarını izler." },
	use: { en: ["Use it for last mile delivery and field service."], tr: ["Son kilometre dağıtımında ve saha hizmetinde kullan."] },
	related: ["Shipment", "LoadPlan"],
	samples: [
		{
			title: { en: "Today's round", tr: "Bugünkü tur" },
			xml: `<k:DeliveryRoute title="34 KRG 72" driver="Mert Aksoy" stopPress=".onStop">
				<k:DeliveryStop key="1" title="Moda Eczanesi" text="Caferağa Mah. 12" time="09:10" parcels="2" state="success"/>
				<k:DeliveryStop key="2" title="Ada Yılmaz" text="Osmanağa Mah. 8" time="09:35" state="danger" statusText="[[Nobody home||Adreste yok]]"/>
				<k:DeliveryStop key="3" title="Deniz Tekstil" text="Rasimpaşa Mah. 44" time="10:00 – 10:30" parcels="6"/>
				<k:DeliveryStop key="4" title="Atlas Kırtasiye" text="Hasanpaşa Mah. 3" time="11:00" parcels="3" state="wait"/>
			</k:DeliveryRoute>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Round", {
				onStop(event) {
					Toast.show(String(event.getParameter("key")));
				}
			}));`
		}
	]
};
