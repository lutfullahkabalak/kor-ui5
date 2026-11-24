export default {
	children: ["Tab"],
	summary: { en: "Switches between panels and renders the selected panel.", tr: "Paneller arasında geçiş yapar ve seçili paneli çizer." },
	use: { en: ["Group parallel views of a record, such as details and history."], tr: ["Bir kaydın ayrıntı ve geçmiş gibi eş düzey görünümlerini grupla."] },
	related: ["Segmented", "Shell"],
	samples: [
		{
			title: { en: "Two panels", tr: "İki panel" },
			xml: `<k:Tabs label="[[Order details||Sipariş ayrıntıları]]">
				<k:Tab key="details" text="[[Details||Ayrıntılar]]"><k:Text text="[[Delivery by truck||Kamyonla teslimat]]"/></k:Tab>
				<k:Tab key="history" text="[[History||Geçmiş]]"><k:Text text="[[Order created today||Sipariş bugün oluşturuldu]]"/></k:Tab>
			</k:Tabs>`
		},
		{
			title: { en: "A count on the exceptions tab", tr: "İstisnalar sekmesinde sayaç" },
			xml: `<k:Tabs selectedKey="queue" label="[[Fulfillment||Sipariş hazırlama]]" change=".onChange">
				<k:Tab key="queue" text="[[Queue||Sıra]]" icon="list"><k:Text text="[[Six orders await packing.||Altı sipariş paketleme bekliyor.]]"/></k:Tab>
				<k:Tab key="exceptions" text="[[Exceptions||İstisnalar]]" count="2" state="wait"><k:Text text="[[Two orders have missing stock.||İki sipariş için stok eksik.]]"/></k:Tab>
			</k:Tabs>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.WorkTabs", {
				onChange(event) {
					Toast.show(event.getParameter("key") === "queue" ? "[[Queue opened||Sıra açıldı]]" : "[[Exceptions opened||İstisnalar açıldı]]");
				}
			}));`
		}
	]
};
