export default {
	summary: { en: "Shows initials and a color derived from a name.", tr: "Baş harfleri ve addan türetilen bir rengi gösterir." },
	use: { en: ["Identify an assignee or contributor when a photograph is unnecessary."], tr: ["Fotoğraf gerekmediğinde sorumlu kişiyi veya katkı vereni belirt."] },
	related: ["Activity", "Board"],
	samples: [
		{
			title: { en: "Initials only", tr: "Baş harfler" },
			xml: `<k:Stack row="true" gap="8" align="center"><k:Person name="Elif Aydın"/><k:Text text="Elif Aydın"/></k:Stack>`
		},
		{
			title: { en: "Identify the shipment owner", tr: "Sevkiyat sorumlusunu göster" },
			xml: `<k:Stack gap="8">
				<k:Text kind="heading" text="[[Shipment SH-104||Sevkiyat SH-104]]"/>
				<k:Person name="{/owner}" role="{/role}"/>
			</k:Stack>`,
			data: {
				"owner": "Mert Kaya",
				"role": "[[Dispatch coordinator||Sevkiyat sorumlusu]]"
			}
		}
	]
};
