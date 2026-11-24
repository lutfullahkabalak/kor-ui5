// Yan menü sırası. Yeni sayfa eklenince buraya da eklenir; içerik dosyası olmayan ad sitede görünmez.
export const guides = ["getting-started", "no-build", "models-and-binding", "odata", "theming", "accessibility", "localization", "limits"];
export const groups = [
	{ title: { en: "App", tr: "Uygulama" }, items: ["Shell", "CommandPalette", "Sheet", "Dialog", "Confirm", "Popover", "Tooltip", "Tabs", "Toast", "Theme"] },
	{ title: { en: "Data", tr: "Veri" }, items: ["DataGrid", "TreeGrid", "FilterBar", "Variants", "Flow", "Trend", "Stat"] },
	{ title: { en: "Planning", tr: "Planlama" }, items: ["Board", "Schedule", "Stages", "Activity"] },
	{ title: { en: "Input", tr: "Giriş" }, items: ["TextField", "NumberField", "SelectField", "MultiSelect", "LookupField", "DateField", "DateRangeField", "RadioGroup", "Toggle", "Check", "Segmented", "FileDrop", "Form"] },
	{ title: { en: "Base", tr: "Temel" }, items: ["Button", "HoldButton", "Status", "Person", "Icon", "Message", "MessageList", "Skeleton", "Empty", "Text", "Stack"] }
];
