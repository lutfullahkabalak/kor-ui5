export default {
	summary: { en: "Adds expandable branches to the DataGrid.", tr: "DataGrid’e açılıp kapanabilen dallar ekler." },
	use: { en: ["Show detail rows within a hierarchy such as cost centers and budget lines."], tr: ["Maliyet merkezleri ve bütçe kalemleri gibi hiyerarşik kayıtları aynı tabloda göster."] },
	keyboard: [
		["←, →", { en: "Collapse or expand the focused branch.", tr: "Odaktaki dalı kapatır veya açar." }]
	],
	related: ["DataGrid", "Variants"],
	samples: [
		{
			title: { en: "Bind nested data", tr: "İç içe veriyi bağla" },
			xml: `<k:TreeGrid id="tree" label="[[Cost centers||Maliyet merkezleri]]" height="13rem" rows="{path:'/nodes', parameters:{arrayNames:['children']}}" openLevels="0">
				<k:columns>
					<k:Column label="[[Cost center||Maliyet merkezi]]" path="name" grow="1"/>
					<k:Column label="[[Budget||Bütçe]]" path="budget" type="number"/>
				</k:columns>
			</k:TreeGrid>`,
			data: {
				"nodes": [
					{
						"name": "[[Operations||Operasyon]]",
						"budget": 56000,
						"children": [
							{
								"name": "[[Packing||Paketleme]]",
								"budget": 21000
							},
							{
								"name": "[[Dispatch||Sevkiyat]]",
								"budget": 35000
							}
						]
					},
					{
						"name": "[[Purchasing||Satın alma]]",
						"budget": 12000
					}
				]
			}
		},
		{
			title: { en: "Control expansion depth", tr: "Açık düzey sayısını değiştir" },
			xml: `<k:Stack gap="8">
				<k:Button text="[[Expand cost centers||Maliyet merkezlerini aç]]" press=".onExpand"/>
				<k:TreeGrid id="tree" label="[[Cost centers||Maliyet merkezleri]]" height="13rem" rows="{path:'/nodes', parameters:{arrayNames:['children']}}" toggle=".onToggle" openLevels="0">
					<k:columns>
						<k:Column label="[[Cost center||Maliyet merkezi]]" path="name" grow="1"/>
						<k:Column label="[[Budget||Bütçe]]" path="budget" type="number"/>
					</k:columns>
				</k:TreeGrid>
			</k:Stack>`,
			data: {
				"nodes": [
					{
						"name": "[[Operations||Operasyon]]",
						"budget": 56000,
						"children": [
							{
								"name": "[[Packing||Paketleme]]",
								"budget": 21000
							},
							{
								"name": "[[Dispatch||Sevkiyat]]",
								"budget": 35000
							}
						]
					},
					{
						"name": "[[Purchasing||Satın alma]]",
						"budget": 12000
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.BudgetTree", {
				onExpand() {
					this.byId("tree").expandToLevel(1);
					Toast.show("[[Cost centers expanded||Maliyet merkezleri açıldı]]");
				},
				onToggle(event) {
					Toast.show(event.getParameter("context").getProperty("name"));
				}
			}));`
		}
	]
};
