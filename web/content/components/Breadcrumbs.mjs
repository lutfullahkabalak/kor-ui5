export default {
	children: ["Crumb"],
	summary: { en: "Shows where the user is and leads back up.", tr: "Bulunulan yeri gösterir ve üst düzeylere götürür." },
	use: { en: ["Use it on pages more than two levels deep."], tr: ["İki düzeyden derin sayfalarda kullan."] },
	related: ["Link", "RecordPage"],
	samples: [
		{
			title: { en: "Path to a record", tr: "Kayda giden yol" },
			xml: `<k:Breadcrumbs select=".onSelect">
				<k:Crumb key="home" text="[[Home||Ana sayfa]]"/>
				<k:Crumb key="sales" text="[[Sales||Satış]]"/>
				<k:Crumb key="orders" text="[[Orders||Siparişler]]"/>
				<k:Crumb text="4711"/>
			</k:Breadcrumbs>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Trail", {
				onSelect(event) {
					Toast.show(String(event.getParameter("key")));
				}
			}));`
		}
	]
};
