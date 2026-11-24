export default {
	children: ["NavItem"],
	summary: { en: "Frames an application with navigation, a title bar and a content area.", tr: "Menü, üst çubuk ve içerik alanıyla uygulamanın çatısını kurar." },
	use: { en: ["Give related screens shared navigation and global actions."], tr: ["Birlikte kullanılan ekranlara ortak bir menü ve işlem alanı ver."] },
	related: ["CommandPalette", "Tabs"],
	samples: [
		{
			title: { en: "Navigation rail", tr: "Gezinme menüsü" },
			xml: `<k:Shell brand="Kor" title="[[Warehouse||Depo]]" selectedKey="inventory">
				<k:items><k:NavItem key="inventory" text="[[Inventory||Stok]]" icon="boxes"/></k:items>
				<k:content><k:Text text="[[Inventory overview||Stok özeti]]"/></k:content>
			</k:Shell>`
		},
		{
			title: { en: "Switch work areas", tr: "Çalışma alanını değiştir" },
			xml: `<k:Shell brand="Kor" title="{/title}" selectedKey="orders" navigate=".onNavigate">
				<k:items>
					<k:NavItem key="orders" text="[[Orders||Siparişler]]" icon="list" count="4"/>
					<k:NavItem key="receipts" text="[[Receipts||Mal girişleri]]" icon="truck"/>
				</k:items>
				<k:content><k:Text text="{/detail}"/></k:content>
			</k:Shell>`,
			data: {
				"title": "[[Orders||Siparişler]]",
				"detail": "[[Four orders are ready to pick.||Dört sipariş toplamaya hazır.]]"
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ShellAreas", {
				onNavigate(event) {
					const orders = event.getParameter("key") === "orders";
					const model = this.getView().getModel();
					model.setProperty("/title", orders ? "[[Orders||Siparişler]]" : "[[Receipts||Mal girişleri]]");
					model.setProperty("/detail", orders ? "[[Four orders are ready to pick.||Dört sipariş toplamaya hazır.]]" : "[[Two deliveries arrive today.||Bugün iki teslimat bekleniyor.]]");
					Toast.show(model.getProperty("/title"));
				}
			}));`
		}
	]
};
