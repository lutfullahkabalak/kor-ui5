export default {
	children: ["ScheduleLane", "ScheduleTask"],
	summary: { en: "Places work on a calendar by resource and highlights overlaps.", tr: "İşleri kaynaklara göre takvime yerleştirir ve çakışmaları gösterir." },
	use: { en: ["Plan work across equipment, teams or other resources that can have conflicting assignments."], tr: ["Atamaları çakışabilen ekip, makine veya diğer kaynaklar için iş planla."] },
	keyboard: [
		["←, →", { en: "Move a focused task by one day.", tr: "Odaktaki işi bir gün kaydırır." }],
		["Shift+←, Shift+→", { en: "Move the end date by one day.", tr: "Bitiş gününü bir gün kaydırır." }],
		["↑, ↓", { en: "Move to an adjacent lane.", tr: "İşi yan kaynağa taşır." }],
		["Enter", { en: "Open the focused task.", tr: "Odaktaki işi açar." }]
	],
	related: ["Board", "DateRangeField"],
	samples: [
		{
			title: { en: "Read-only schedule", tr: "Salt okunur plan" },
			xml: `<k:Schedule label="[[Inspection plan||Kontrol planı]]" start="2026-12-01" today="2026-12-02" days="6" editable="false">
				<k:lanes><k:ScheduleLane key="bench" title="[[Test bench||Test tezgâhı]]"/></k:lanes>
				<k:tasks><k:ScheduleTask key="I-42" lane="bench" title="[[Final inspection||Son kontrol]]" start="2026-12-02" end="2026-12-04" progress="40"/></k:tasks>
			</k:Schedule>`
		},
		{
			title: { en: "Reschedule production", tr: "Üretimi yeniden planla" },
			text: { en: "Move WO-82 to Line B to resolve the overlap. End dates are inclusive.", tr: "Çakışmayı gidermek için WO-82 işini Hat B’ye taşı. Bitiş günleri plana dahildir." },
			xml: `<k:Schedule label="[[Production plan||Üretim planı]]" start="2026-12-01" today="2026-12-03" days="8" taskChange=".onChange" taskPress=".onOpen">
				<k:lanes>
					<k:ScheduleLane key="a" title="[[Line A||Hat A]]" text="[[Assembly||Montaj]]" capacity="80"/>
					<k:ScheduleLane key="b" title="[[Line B||Hat B]]" text="[[Assembly||Montaj]]" capacity="40"/>
				</k:lanes>
				<k:tasks>
					<k:ScheduleTask key="WO-81" lane="a" title="WO-81" text="[[Valve assembly||Vana montajı]]" start="2026-12-02" end="2026-12-04" progress="50" state="info"/>
					<k:ScheduleTask key="WO-82" lane="a" title="WO-82" text="[[Pump assembly||Pompa montajı]]" start="2026-12-04" end="2026-12-06" state="wait"/>
				</k:tasks>
			</k:Schedule>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ProductionPlan", {
				onChange(event) {
					const task = event.getParameter("task");
					Toast.show(task.getTitle(), {
						text: event.getParameter("conflict") ? "[[Overlaps another task||Başka bir işle çakışıyor]]" : "[[Schedule updated||Plan güncellendi]]"
					});
				},
				onOpen(event) {
					Toast.show(event.getParameter("task").getText());
				}
			}));`
		}
	]
};
