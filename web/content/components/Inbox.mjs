export default {
	children: ["InboxItem"],
	summary: { en: "Lists notifications and their actions.", tr: "Bildirimleri ve işlemlerini listeler." },
	use: { en: ["Put it in a Popover or a Sheet opened from the bell."], tr: ["Zil düğmesinden açılan Popover veya Sheet içine koy."] },
	related: ["Toast", "Activity"],
	samples: [
		{
			title: { en: "Notifications", tr: "Bildirimler" },
			xml: `<k:Inbox action=".onAction">
				<k:InboxItem key="1" person="Ada Yılmaz" title="[[Approval needed: purchase 8812||Onay bekliyor: satın alma 8812]]" text="[[24,500 TRY, Anadolu Metal||24.500 TRY, Anadolu Metal]]" time="[[5 min ago||5 dk önce]]" actionText="[[Approve||Onayla]]"/>
				<k:InboxItem key="2" state="danger" title="[[Line 2 stopped||2. hat durdu]]" time="[[20 min ago||20 dk önce]]"/>
				<k:InboxItem key="3" unread="false" state="success" title="[[Delivery completed||Teslimat tamamlandı]]" time="[[Yesterday||Dün]]"/>
			</k:Inbox>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Notices", {
				onAction(event) {
					Toast.show(String(event.getParameter("key")));
				}
			}));`
		}
	]
};
