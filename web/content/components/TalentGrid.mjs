export default {
	children: ["TalentPerson"],
	summary: { en: "Places people by performance and potential.", tr: "Kişileri performans ve potansiyele göre yerleştirir." },
	use: { en: ["Use it in talent reviews. Limit who can open it."], tr: ["Yetenek değerlendirmesinde kullan. Erişimi sınırla."] },
	related: ["OrgChart", "Heatmap"],
	samples: [
		{
			title: { en: "Talent review", tr: "Yetenek değerlendirmesi" },
			xml: `<k:TalentGrid press=".onPress">
				<k:TalentPerson key="1" name="Ada Yılmaz" performance="3" potential="3"/>
				<k:TalentPerson key="2" name="Can Koç" performance="2" potential="3"/>
				<k:TalentPerson key="3" name="Ece Tan" performance="2" potential="2"/>
				<k:TalentPerson key="4" name="Mert Aksoy" performance="3" potential="1"/>
				<k:TalentPerson key="5" name="Nil Su" performance="1" potential="2"/>
			</k:TalentGrid>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Talent", {
				onPress(event) {
					Toast.show(String(event.getParameter("key")));
				}
			}));`
		}
	]
};
