export default {
	summary: { en: "Groups information and actions about one thing.", tr: "Tek bir konuya ait bilgi ve işlemleri toplar." },
	use: { en: ["Use cards for a small set of things people compare or open."], tr: ["Karşılaştırılan veya açılan az sayıda öğe için kullan."] },
	related: ["List", "Stat"],
	samples: [
		{
			title: { en: "Suppliers", tr: "Tedarikçiler" },
			xml: `<k:Stack direction="grid" columns="2" gap="14">
				<k:Card title="Anadolu Metal" text="[[Sheet steel||Sac]]" icon="factory" state="success" statusText="[[Approved||Onaylı]]" press=".onPress">
					<k:Text text="[[12 open orders||12 açık sipariş]]"/>
					<k:footer><k:Button text="[[New order||Yeni sipariş]]"/></k:footer>
				</k:Card>
				<k:Card title="Ege Plastik" text="[[Packaging||Ambalaj]]" icon="package" state="wait" statusText="[[In review||İncelemede]]" press=".onPress"><k:Text text="[[2 open orders||2 açık sipariş]]"/></k:Card>
			</k:Stack>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.Cards", {
				onPress(event) {
					Toast.show(String(event.getSource().getTitle()));
				}
			}));`
		}
	]
};
