export default {
	children: ["MachineSpan"],
	summary: { en: "Shows the efficiency and downtime of a machine.", tr: "Makinenin verimliliğini ve duruşlarını gösterir." },
	use: { en: ["Use it on a shop floor dashboard."], tr: ["Üretim sahası panosunda kullan."] },
	related: ["ProductionLine", "Stat"],
	samples: [
		{
			title: { en: "Milling machine", tr: "Freze" },
			xml: `<k:MachineCard title="CNC 04" text="[[Order 1000482||Emir 1000482]]" process="machining" availability="91" performance="88" quality="97" from="08:00" until="16:00">
				<k:MachineSpan minutes="30" state="wait" text="[[Setup||Ayar]]"/>
				<k:MachineSpan minutes="150"/>
				<k:MachineSpan minutes="25" state="danger" text="[[Tool break||Takım kırılması]]"/>
				<k:MachineSpan minutes="120"/>
				<k:MachineSpan minutes="30" state="none" text="[[Break||Mola]]"/>
				<k:MachineSpan minutes="125"/>
			</k:MachineCard>`
		}
	]
};
