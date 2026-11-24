const orders = Array.from({ length: 500 }, (_, i) => ({
	Id: "SO-" + (10400 + i),
	Customer: ["Northwind Steel", "Aegean Pumps", "Helix Motors", "Delta Packaging", "Orbit Paper"][i % 5],
	Amount: 1200 + ((i * 7919) % 48000),
	Currency: "EUR",
	Status: ["open", "late", "done"][i % 3],
	Due: `2026-12-${String(1 + (i % 28)).padStart(2, "0")}`
}));
export default {
	children: ["Column"],
	summary: {
		en: "A table for large lists: virtual rows, range selection with live totals, inline editing, and copy and paste with Excel.",
		tr: "Büyük listeler için tablo: sanal satırlar, anlık toplamlı aralık seçimi, yerinde düzenleme ve Excel ile kopyala yapıştır."
	},
	use: {
		en: ["Users compare, total or edit many rows.", "Rows come from any UI5 list binding: JSON, OData V2 or V4. No template is needed."],
		tr: ["Kullanıcı çok sayıda satırı karşılaştırıyor, topluyor veya düzenliyorsa.", "Satırlar her UI5 liste bağlamasından gelir: JSON, OData V2 veya V4. Şablon gerekmez."]
	},
	avoid: {
		en: ["Hierarchical data: use TreeGrid.", "A handful of facts about one object: use Stat or Text."],
		tr: ["Hiyerarşik veri: TreeGrid kullan.", "Tek nesneye ait birkaç bilgi: Stat veya Text kullan."]
	},
	related: ["TreeGrid", "FilterBar", "Variants"],
	samples: [
		{
			title: { en: "Orders", tr: "Siparişler" },
			text: { en: "500 rows. Drag across amounts to see their total, double-click a customer to edit it.", tr: "500 satır. Tutarlar üzerinde sürükleyince toplam görünür; müşteriye çift tıklayınca düzenlenir." },
			xml: `<k:DataGrid rows="{/orders}" selectionMode="Multi" height="26rem" label="[[Orders||Siparişler]]" rowPress=".onOpen" cellChange=".onChange">
	<k:columns>
		<k:Column label="[[Order||Sipariş]]" path="Id" type="link" width="120" pinned="true"/>
		<k:Column label="[[Customer||Müşteri]]" path="Customer" grow="1" editable="true"/>
		<k:Column label="[[Amount||Tutar]]" path="Amount" type="currency" unitPath="Currency" decimals="2"/>
		<k:Column label="[[Due||Vade]]" path="Due" type="date"/>
		<k:Column label="[[Status||Durum]]" path="Status" type="status"
			states="{/states}"
			formatter=".statusText"/>
	</k:columns>
</k:DataGrid>`,
			data: { orders, states: { open: "wait", late: "danger", done: "success" } },
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Grid", {
	statusText(value) {
		return { open: "[[Open||Açık]]", late: "[[Late||Gecikti]]", done: "[[Done||Bitti]]" }[value];
	},
	onOpen(event) {
		Toast.show(event.getParameter("context").getProperty("Id"));
	},
	onChange(event) {
		Toast.show("[[Saved||Kaydedildi]]: " + event.getParameter("value"));
	}
}));`
		}
	]
};
