// Yan menü sırası. Yeni sayfa eklenince buraya da eklenir; içerik dosyası olmayan ad sitede görünmez.
export const guides = ["getting-started", "no-build", "models-and-binding", "odata", "theming", "accessibility", "localization", "limits"];
export const groups = [
	{ title: { en: "App", tr: "Uygulama" }, items: ["Shell", "CommandPalette", "Sheet", "Dialog", "Confirm", "Popover", "Tooltip", "Tabs", "Accordion", "Breadcrumbs", "Wizard", "Splitter", "ColumnLayout", "RecordPage", "Inbox", "Toast", "Theme"] },
	{ title: { en: "Data", tr: "Veri" }, items: ["DataGrid", "TreeGrid", "FilterBar", "Variants", "Flow", "Trend", "BarChart", "PieChart", "Stat", "List", "Details", "Compare", "Pivot", "Heatmap", "Waterfall"] },
	{ title: { en: "Planning", tr: "Planlama" }, items: ["Board", "Schedule", "Stages", "Activity", "MonthCalendar"] },
	{ title: { en: "Input", tr: "Giriş" }, items: ["TextField", "NumberField", "SelectField", "MultiSelect", "LookupField", "DateField", "DateRangeField", "TimeField", "DateTimeField", "TreeField", "Slider", "Rating", "PromptField", "RadioGroup", "Toggle", "Check", "Segmented", "FileDrop", "Form"] },
	{ title: { en: "Base", tr: "Temel" }, items: ["Button", "HoldButton", "Status", "Person", "Icon", "Message", "MessageList", "Skeleton", "Empty", "Text", "Stack", "Link", "Card", "Progress"] },
	{ title: { en: "Cargo", tr: "Kargo" }, items: ["Shipment", "DeliveryRoute", "LoadPlan", "DockBoard"] },
	{ title: { en: "Manufacturing", tr: "Üretim" }, items: ["ProductionLine", "MachineCard"] },
	{ title: { en: "Banking", tr: "Bankacılık" }, items: ["BankCard", "Statement", "Installments"] },
	{ title: { en: "Education", tr: "Eğitim" }, items: ["Timetable", "Classroom", "CoursePath"] },
	{ title: { en: "Human resources", tr: "İnsan kaynakları" }, items: ["OrgChart", "LeaveBalance", "ShiftRoster", "TalentGrid"] }
];
