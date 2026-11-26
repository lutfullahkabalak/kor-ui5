# Changelog

## Unreleased

- DataGrid: drag a column header to move the column (Ctrl+← / Ctrl+→ from the keyboard)
- DataGrid: column menu on right-click or Shift+F10 with sort, optimal width, move, hide
- DataGrid: double-click a column border for optimal width; Ctrl+F finds, Ctrl+G goes to the next match
- Reconciliation: MatchGrid (two-sided matching with auto-match), ReconcileLetter (balance confirmation and reply), ReconMatrix (partner × month, e.g. BA/BS)
- Leasing: LeaseTimeline (increases, options, notice deadlines), EscalationField (rent increase rule with preview), DamageMap (vehicle handover and return)
- Input: SignaturePad
- Installments: `showBalance` and `Installment.remeasured`; Schedule: `slotPress` for clicks on an empty day
- No breaking changes

## 0.2.0

- App: Accordion, Breadcrumbs, Wizard, Splitter, ColumnLayout, RecordPage, Inbox
- Data: List, Details, Compare, Pivot, Heatmap, Waterfall, BarChart, PieChart
- Input: TimeField, DateTimeField, TreeField, Slider, Rating, PromptField
- Planning: MonthCalendar. Base: Link, Card, Progress
- Cargo: Shipment, DeliveryRoute, LoadPlan, DockBoard
- Manufacturing: ProductionLine, MachineCard
- Banking: BankCard, Statement, Installments
- Education: Timetable, Classroom, CoursePath
- Human resources: OrgChart, LeaveBalance, ShiftRoster, TalentGrid
- No breaking changes

## 0.1.0

First public release. Early version: names and properties may still change.

- App: Shell, CommandPalette, Sheet, Dialog, Confirm, Popover, Tooltip, Tabs, Toast, Theme
- Data: DataGrid, TreeGrid, FilterBar, Variants, Flow, Trend, Stat
- Planning: Board, Schedule, Stages, Activity
- Input: TextField, NumberField, SelectField, MultiSelect, LookupField, DateField, DateRangeField, RadioGroup, Toggle, Check, Segmented, FileDrop, Form
- Base: Button, HoldButton, Status, Person, Icon, Message, MessageList, Skeleton, Empty, Text, Stack
- Tested with OpenUI5 1.108.55 and 1.154.0; OData V2 and V4 against mock servers
