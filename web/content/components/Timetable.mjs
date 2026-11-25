export default {
	children: ["Lesson"],
	summary: { en: "Shows lessons of a week.", tr: "Haftanın derslerini gösterir." },
	use: { en: ["Use it for schools, training and rooms."], tr: ["Okul, eğitim ve derslik planında kullan."] },
	related: ["MonthCalendar", "Classroom"],
	samples: [
		{
			title: { en: "Class 9A", tr: "9A sınıfı" },
			xml: `<k:Timetable from="08:30" until="13:00">
				<k:Lesson title="[[Mathematics||Matematik]]" text="B12" day="1" start="08:30" end="10:00"/>
				<k:Lesson title="[[Physics||Fizik]]" text="Lab 1" day="1" start="10:15" end="11:45"/>
				<k:Lesson title="[[History||Tarih]]" text="A04" day="2" start="09:00" end="10:30"/>
				<k:Lesson title="[[English||İngilizce]]" text="A06" day="3" start="08:30" end="10:00"/>
				<k:Lesson title="[[Chess club||Satranç]]" day="3" start="09:15" end="10:45"/>
				<k:Lesson title="[[Mathematics||Matematik]]" text="B12" day="4" start="10:15" end="11:45" cancelled="true"/>
				<k:Lesson title="[[Sports||Beden eğitimi]]" day="5" start="11:00" end="12:30"/>
			</k:Timetable>`
		}
	]
};
