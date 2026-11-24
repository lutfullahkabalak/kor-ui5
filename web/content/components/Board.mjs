export default {
	children: ["BoardColumn", "BoardCard"],
	summary: { en: "Groups work cards into columns and shows when a work limit is exceeded.", tr: "İş kartlarını sütunlarda toplar ve iş sınırı aşılınca gösterir." },
	use: { en: ["Track work as it moves between a few operational states."], tr: ["İşin birkaç durum arasında nasıl ilerlediğini izle."] },
	keyboard: [
		["Ctrl+←, Ctrl+→", { en: "Move a focused card to the adjacent column.", tr: "Odaktaki kartı yan sütuna taşır." }],
		["Enter", { en: "Open the focused card.", tr: "Odaktaki kartı açar." }]
	],
	related: ["Schedule", "Stages"],
	samples: [
		{
			title: { en: "Two work columns", tr: "İki iş sütunu" },
			xml: `<k:Board label="[[Packing board||Paketleme panosu]]">
				<k:columns>
					<k:BoardColumn key="queued" title="[[Queued||Sırada]]"/>
					<k:BoardColumn key="done" title="[[Packed||Paketlendi]]" state="success"/>
				</k:columns>
				<k:cards><k:BoardCard key="SO-104" column="queued" title="SO-104" text="[[Box of pump seals||Pompa contaları kutusu]]"/></k:cards>
			</k:Board>`
		},
		{
			title: { en: "Pick and pack orders", tr: "Siparişleri topla ve paketle" },
			text: { en: "Move SO-104 into Packing to exceed its one-card limit.", tr: "SO-104 kartını Paketlemede sütununa taşı ve bir kartlık sınırın aşıldığını gör." },
			xml: `<k:Board label="[[Fulfillment board||Sipariş hazırlama panosu]]" cardMove=".onMove" cardPress=".onOpen">
				<k:columns>
					<k:BoardColumn key="pick" title="[[To pick||Toplanacak]]"/>
					<k:BoardColumn key="pack" title="[[Packing||Paketlemede]]" limit="1" state="wait"/>
					<k:BoardColumn key="done" title="[[Ready||Hazır]]" state="success"/>
				</k:columns>
				<k:cards>
					<k:BoardCard key="SO-104" column="pick" title="SO-104" text="[[Valve kits||Vana setleri]]" person="Elif Aydın" meta="12" tag="[[Parcel||Koli]]"/>
					<k:BoardCard key="SO-105" column="pack" title="SO-105" text="[[Pump seals||Pompa contaları]]" person="Mert Kaya"/>
				</k:cards>
			</k:Board>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.PackingBoard", {
				onMove(event) {
					Toast.show(event.getParameter("card").getTitle() + " · [[Moved||Taşındı]]");
				},
				onOpen(event) {
					Toast.show(event.getParameter("card").getText());
				}
			}));`
		}
	]
};
