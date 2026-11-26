export default {
	children: ["LeaseEvent"],
	summary: { en: "Shows a lease from start to end with increases, options and notice deadlines.", tr: "Kira sözleşmesini başından sonuna artışlar, opsiyonlar ve bildirim süreleriyle gösterir." },
	use: {
		en: ["Use it on lease, rental and service contract pages to see what is next and which notice period is about to close.", "Give options and terminations a deadline; it turns amber noticeDays before and red after."],
		tr: ["Kira, kiralama ve hizmet sözleşmesi sayfalarında sırada ne olduğunu ve hangi bildirim süresinin dolmak üzere olduğunu görmek için kullan.", "Opsiyon ve fesihlere son bildirim günü ver; noticeDays kala sarı, geçince kırmızı olur."]
	},
	related: ["Installments", "EscalationField", "Stages"],
	samples: [
		{
			title: { en: "Office lease", tr: "Ofis kirası" },
			xml: `<k:LeaseTimeline label="[[Levent office||Levent ofisi]]" start="2024-03-01" end="2029-02-28" today="2026-11-26" noticeDays="60" eventPress=".onEvent">
				<k:LeaseEvent key="i1" date="2025-03-01" kind="increase" text="[[CPI, +44.4%||TÜFE, %44,4]]" state="success"/>
				<k:LeaseEvent key="i2" date="2026-03-01" kind="increase" text="[[CPI, +31.2%||TÜFE, %31,2]]" state="success"/>
				<k:LeaseEvent key="o1" date="2027-03-01" kind="option" title="[[Extra floor option||Ek kat opsiyonu]]" deadline="2027-01-01"/>
				<k:LeaseEvent key="i3" date="2027-03-01" kind="increase" text="[[CPI 12-month average||TÜFE 12 ay ortalaması]]"/>
				<k:LeaseEvent key="t1" date="2028-03-01" kind="termination" title="[[Break option||Erken fesih hakkı]]" deadline="2027-09-01"/>
				<k:LeaseEvent key="r1" date="2029-02-28" kind="renewal" text="[[5 years||5 yıl]]" deadline="2028-11-30"/>
			</k:LeaseTimeline>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Lease", {
				onEvent(event) {
					Toast.show(event.getParameter("key"));
				}
			}));`
		}
	]
};
