export default {
	children: ["ShiftType","ShiftEntry"],
	summary: { en: "Plans who works which shift.", tr: "Kimin hangi vardiyada çalışacağını planlar." },
	use: { en: ["Use it for production, stores and call centers."], tr: ["Üretim, mağaza ve çağrı merkezinde kullan."] },
	related: ["Schedule", "LeaveBalance"],
	samples: [
		{
			title: { en: "Weekly roster", tr: "Haftalık çizelge" },
			xml: `<k:ShiftRoster start="2026-11-23" days="5" people="Ada Yılmaz,Can Koç,Ece Tan" entries="{path: '/entries', templateShareable: false}" change=".onChange">
				<k:shifts>
					<k:ShiftType key="d" title="[[Day||Gündüz]]" short="08–16" icon="sun" tone="4" need="2"/>
					<k:ShiftType key="n" title="[[Night||Gece]]" short="00–08" icon="moon" tone="3" need="1"/>
				</k:shifts>
				<k:entries><k:ShiftEntry person="{p}" date="{d}" shift="{s}"/></k:entries>
			</k:ShiftRoster>`,
			data: {
				"entries": [
					{
						"p": "Ada Yılmaz",
						"d": "2026-11-23",
						"s": "d"
					},
					{
						"p": "Ada Yılmaz",
						"d": "2026-11-24",
						"s": "d"
					},
					{
						"p": "Can Koç",
						"d": "2026-11-23",
						"s": "d"
					},
					{
						"p": "Can Koç",
						"d": "2026-11-25",
						"s": "n"
					},
					{
						"p": "Ece Tan",
						"d": "2026-11-23",
						"s": "n"
					},
					{
						"p": "Ece Tan",
						"d": "2026-11-24",
						"s": "d"
					},
					{
						"p": "Ece Tan",
						"d": "2026-11-26",
						"s": "n"
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => Controller.extend("sample.Roster", {
				onChange(event) {
					const { person, date, shift } = event.getParameters();
					const model = this.getView().getModel();
					const rest = model.getProperty("/entries").filter((entry) => entry.p !== person || entry.d !== date);
					model.setProperty("/entries", shift ? [...rest, { p: person, d: date, s: shift }] : rest);
				}
			}));`
		}
	]
};
