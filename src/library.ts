import "sap/ui/core/library";
import includeStylesheet from "sap/ui/dom/includeStylesheet";

// sap/ui/core/Lib 1.118'de geldi; 1.108 desteği için Core.initLibrary kullanılır.
const thisLib = sap.ui.getCore().initLibrary({
	name: "kor.ui",
	version: "${version}",
	dependencies: ["sap.ui.core"],
	types: [],
	interfaces: [],
	controls: [
		"kor.ui.Activity",
		"kor.ui.Board",
		"kor.ui.Button",
		"kor.ui.Check",
		"kor.ui.DataGrid",
		"kor.ui.DateField",
		"kor.ui.DateRangeField",
		"kor.ui.Dialog",
		"kor.ui.Empty",
		"kor.ui.FileDrop",
		"kor.ui.FilterBar",
		"kor.ui.Flow",
		"kor.ui.Form",
		"kor.ui.HoldButton",
		"kor.ui.Icon",
		"kor.ui.LookupField",
		"kor.ui.Message",
		"kor.ui.MessageList",
		"kor.ui.MultiSelect",
		"kor.ui.NumberField",
		"kor.ui.Person",
		"kor.ui.Popover",
		"kor.ui.RadioGroup",
		"kor.ui.Schedule",
		"kor.ui.Segmented",
		"kor.ui.SelectField",
		"kor.ui.Sheet",
		"kor.ui.Shell",
		"kor.ui.Skeleton",
		"kor.ui.Stack",
		"kor.ui.Stages",
		"kor.ui.Stat",
		"kor.ui.Status",
		"kor.ui.Tabs",
		"kor.ui.Text",
		"kor.ui.TextField",
		"kor.ui.Toggle",
		"kor.ui.TreeGrid",
		"kor.ui.Trend",
		"kor.ui.Variants"
	],
	elements: [
		"kor.ui.ActivityItem",
		"kor.ui.BoardCard",
		"kor.ui.BoardColumn",
		"kor.ui.Column",
		"kor.ui.Command",
		"kor.ui.CommandPalette",
		"kor.ui.FileItem",
		"kor.ui.FilterField",
		"kor.ui.FlowLink",
		"kor.ui.FlowNode",
		"kor.ui.FormSection",
		"kor.ui.MenuItem",
		"kor.ui.MessageItem",
		"kor.ui.NavItem",
		"kor.ui.RadioItem",
		"kor.ui.ScheduleLane",
		"kor.ui.ScheduleTask",
		"kor.ui.Series",
		"kor.ui.Stage",
		"kor.ui.Tab",
		"kor.ui.Tooltip"
	],
	// Görünüm SAP temasından bağımsızdır: tek CSS dosyası, her UI5 sürümünde ve temasında aynı.
	noLibraryCSS: true
}) as unknown as object;

void includeStylesheet(sap.ui.require.toUrl("kor/ui/kor.css"), { id: "kor-ui-css" } as never);

export default thisLib;
