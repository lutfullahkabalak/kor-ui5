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
	keyboard: [
		["←, →, ↑, ↓", { en: "Move between cells. With Shift, extend the range; the footer shows its total.", tr: "Hücreler arasında gezer. Shift ile aralığı genişletir; alt çubuk toplamı gösterir." }],
		["Enter, F2", { en: "Edit the cell, or open the row if the cell is read-only.", tr: "Hücreyi düzenler; düzenlenemiyorsa satırı açar." }],
		["Space", { en: "Select the row when selectionMode is Multi.", tr: "selectionMode Multi ise satırı seçer." }],
		["Ctrl+C, Ctrl+V", { en: "Copy the range, or paste rows and columns from Excel.", tr: "Aralığı kopyalar veya Excel'den satır ve sütun yapıştırır." }],
		["Ctrl+←, Ctrl+→", { en: "Move the active column. A header can also be dragged.", tr: "Etkin sütunu taşır. Başlık sürüklenerek de taşınır." }],
		["Shift+F10", { en: "Column menu: sort, optimal width, move, hide. Right-click a header for the same menu.", tr: "Sütun menüsü: sıralama, en uygun genişlik, taşıma, gizleme. Başlığa sağ tıklamak da açar." }],
		["Ctrl+F", { en: "Find in the table. Enter goes to the next match, Shift+Enter to the previous one.", tr: "Tabloda arar. Enter sonraki, Shift+Enter önceki eşleşmeye gider." }],
		["Ctrl+G, Ctrl+Shift+G", { en: "Next or previous match of the last search.", tr: "Son aramanın sonraki veya önceki eşleşmesi." }],
		["Escape", { en: "Collapse the range, close the search, or cancel a column drag.", tr: "Aralığı daraltır, aramayı kapatır veya sütun sürüklemeyi iptal eder." }]
	],
	related: ["TreeGrid", "FilterBar", "Variants"],
	samples: [
		{
			title: { en: "Orders", tr: "Siparişler" },
			text: { en: "500 rows. Drag across amounts to see their total, double-click a customer to edit it. Drag a header to move its column; double-click a column border to fit it.", tr: "500 satır. Tutarlar üzerinde sürükleyince toplam görünür; müşteriye çift tıklayınca düzenlenir. Başlığı sürükleyerek sütunu taşıyın; sütun ayracına çift tıklayınca genişlik içeriğe uyar." },
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
