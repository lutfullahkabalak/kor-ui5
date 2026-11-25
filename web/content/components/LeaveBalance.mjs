export default {
	summary: { en: "Shows used and remaining leave days.", tr: "Kullanılan ve kalan izin günlerini gösterir." },
	use: { en: ["Use it next to a leave request."], tr: ["İzin talebinin yanında kullan."] },
	related: ["ShiftRoster", "Progress"],
	samples: [
		{
			title: { en: "Annual and sick leave", tr: "Yıllık izin ve rapor" },
			xml: `<k:Stack direction="grid" columns="2" gap="14">
				<k:LeaveBalance title="[[Annual leave||Yıllık izin]]" total="20" used="8" planned="3" pending="2" expires="[[5 days expire on 31 Dec||5 gün 31 Aralık'ta biter]]"/>
				<k:LeaveBalance title="[[Sick leave||Sağlık izni]]" icon="stethoscope" total="10" used="1.5"/>
			</k:Stack>`
		}
	]
};
