export default {
	name: "kor.ui",
	defaults: {
		bootCore: true,
		ui5: { libs: "kor.ui", theme: "sap_horizon", language: "tr", noConflict: true, preload: "auto" },
		qunit: { version: 2, reorder: false },
		sinon: false,
		module: "./{name}.qunit"
	},
	tests: { Kor: { title: "Kor" }, Sector: { title: "Kor sektör bileşenleri" }, OData: { title: "OData" } }
};
