export default {
	children: ["ProductionStation"],
	summary: { en: "Shows stations, flow and the bottleneck of a line.", tr: "Hattın istasyonlarını, akışını ve darboğazını gösterir." },
	use: { en: ["Pick a sector and name the process of each station to get fitting icons."], tr: ["Sektörü seç, her istasyonun sürecini yaz; uygun simge gelir."] },
	related: ["MachineCard", "Schedule"],
	samples: [
		{
			title: { en: "Textile", tr: "Tekstil" },
			xml: `<k:ProductionLine sector="textile" title="[[Shirt line||Gömlek hattı]]" unit="[[pcs/h||ad/sa]]" stationPress=".onPress">
				<k:ProductionStation key="w" title="[[Weaving||Dokuma]]" process="weaving" rate="140"/>
				<k:ProductionStation key="d" title="[[Dyeing||Boyama]]" process="dyeing" rate="120"/>
				<k:ProductionStation key="c" title="[[Cutting||Kesim]]" process="cutting" rate="130" queue="40"/>
				<k:ProductionStation key="s" title="[[Sewing||Dikim]]" process="sewing" rate="85" queue="210"/>
				<k:ProductionStation key="i" title="[[Ironing||Ütü]]" process="ironing" rate="110"/>
				<k:ProductionStation key="p" title="[[Packing||Paketleme]]" process="packing" rate="125"/>
			</k:ProductionLine>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Textile", {
				onPress(event) {
					Toast.show(String(event.getParameter("key")));
				}
			}));`
		},
		{
			title: { en: "Automotive", tr: "Otomotiv" },
			xml: `<k:ProductionLine sector="automotive" title="[[Body line||Gövde hattı]]" unit="[[cars/h||araç/sa]]">
				<k:ProductionStation title="[[Press||Pres]]" process="pressing" rate="42"/>
				<k:ProductionStation title="[[Welding||Kaynak]]" process="welding" rate="38"/>
				<k:ProductionStation title="[[Painting||Boya]]" process="painting" state="danger" statusText="[[Filter change||Filtre değişimi]]"/>
				<k:ProductionStation title="[[Assembly||Montaj]]" process="assembly" state="wait" rate="36"/>
				<k:ProductionStation title="[[Testing||Test]]" process="testing" rate="40"/>
			</k:ProductionLine>`
		},
		{
			title: { en: "Food, electronics and furniture", tr: "Gıda, elektronik ve mobilya" },
			xml: `<k:Stack gap="22">
				<k:ProductionLine sector="food" title="[[Bakery||Fırın]]"><k:ProductionStation title="[[Mixing||Karıştırma]]" process="mixing"/><k:ProductionStation title="[[Baking||Pişirme]]" process="baking"/><k:ProductionStation title="[[Cooling||Soğutma]]" process="cooling"/><k:ProductionStation title="[[Packing||Paketleme]]" process="packing"/></k:ProductionLine>
				<k:ProductionLine sector="electronics" title="[[Board line||Kart hattı]]"><k:ProductionStation title="SMT" process="smt"/><k:ProductionStation title="[[Soldering||Lehim]]" process="soldering"/><k:ProductionStation title="[[Inspection||Muayene]]" process="inspection"/><k:ProductionStation title="[[Packing||Paketleme]]" process="packing"/></k:ProductionLine>
				<k:ProductionLine sector="furniture" title="[[Sofa line||Koltuk hattı]]"><k:ProductionStation title="[[Sawing||Kesim]]" process="sawing"/><k:ProductionStation title="[[Sanding||Zımpara]]" process="sanding"/><k:ProductionStation title="[[Upholstery||Döşeme]]" process="upholstery"/><k:ProductionStation title="[[Shipping||Sevk]]" process="shipping"/></k:ProductionLine>
			</k:Stack>`
		}
	]
};
