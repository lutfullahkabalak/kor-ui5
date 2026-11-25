export default {
	children: ["Student"],
	summary: { en: "Takes attendance on a seating plan.", tr: "Oturma planı üzerinde yoklama alır." },
	use: { en: ["Use it for classes and training sessions."], tr: ["Ders ve eğitimlerde kullan."] },
	related: ["Timetable", "CoursePath"],
	samples: [
		{
			title: { en: "Attendance", tr: "Yoklama" },
			xml: `<k:Classroom title="9A" board="[[Mathematics||Matematik]]" columns="4">
				<k:Student key="1" name="Ada Yılmaz" state="present"/><k:Student key="2" name="Can Koç" state="late"/><k:Student key="3" name="Deniz Ak" state="absent"/><k:Student key="4" name="Ece Tan"/>
				<k:Student key="5" name="Mert Aksoy"/><k:Student key="6" name="Nil Su"/><k:Student key="7" name="Ozan Er"/><k:Student key="8" name="Pelin Ay"/>
			</k:Classroom>`
		}
	]
};
