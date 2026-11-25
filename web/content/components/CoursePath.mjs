export default {
	children: ["CourseModule"],
	summary: { en: "Guides a learner through modules.", tr: "Öğreneni bölümler boyunca yönlendirir." },
	use: { en: ["Use it for courses, onboarding and certification."], tr: ["Kurs, işe alıştırma ve sertifikada kullan."] },
	related: ["Progress", "Stages"],
	samples: [
		{
			title: { en: "Safety training", tr: "İş güvenliği eğitimi" },
			xml: `<k:CoursePath title="[[Work safety||İş güvenliği]]" press=".onPress">
				<k:CourseModule key="1" title="[[Introduction||Giriş]]" text="[[8 min||8 dk]]" kind="video" progress="100"/>
				<k:CourseModule key="2" title="[[Protective equipment||Koruyucu donanım]]" text="[[15 min||15 dk]]" progress="40"/>
				<k:CourseModule key="3" title="[[Quiz||Sınav]]" kind="quiz" locked="true"/>
				<k:CourseModule key="4" title="[[Certificate||Sertifika]]" kind="exam" locked="true"/>
			</k:CoursePath>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Course", {
				onPress(event) {
					Toast.show(String(event.getParameter("key")));
				}
			}));`
		}
	]
};
