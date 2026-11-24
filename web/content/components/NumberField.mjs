export default {
	summary: { en: "Edits a number using the active UI5 number format.", tr: "Sayıyı etkin UI5 sayı biçimiyle düzenler." },
	use: { en: ["Collect quantities with a unit, a step size or an allowed range."], tr: ["Birimi, artış adımı veya geçerli aralığı olan miktarları al."] },
	related: ["TextField", "Form"],
	samples: [
		{
			title: { en: "Count items", tr: "Adet gir" },
			xml: `<k:NumberField label="[[Quantity||Miktar]]" value="2" min="0" change=".onChange"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.NumberFieldChange", {
				onChange(event) {
					Toast.show("[[Quantity updated||Miktar güncellendi]]");
				}
			}));`
		},
		{
			title: { en: "Set the parcel weight", tr: "Paket ağırlığını ayarla" },
			xml: `<k:NumberField label="[[Parcel weight||Paket ağırlığı]]" value="2.5" unit="kg" min="0" max="25"
				step="0.5" decimals="1" help="[[Maximum 25 kg per parcel.||Paket başına en fazla 25 kg.]]" change=".onWeight"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast", "sap/ui/core/format/NumberFormat"], (Controller, Toast, NumberFormat) => Controller.extend("sample.ParcelWeight", {
				onWeight(event) {
					const format = NumberFormat.getFloatInstance({ minFractionDigits: 1, maxFractionDigits: 1 });
					Toast.show(format.format(event.getParameter("value")) + " kg");
				}
			}));`
		}
	]
};
