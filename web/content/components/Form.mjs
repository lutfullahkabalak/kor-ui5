export default {
	children: ["FormSection"],
	summary: { en: "Groups fields into sections and checks required values.", tr: "Alanları bölümlere ayırır ve zorunlu değerleri denetler." },
	use: { en: ["Give related fields a section heading and validate before saving."], tr: ["İlişkili alanlara bölüm başlığı ver ve kaydetmeden önce doğrula."] },
	related: ["TextField", "DateField", "FileDrop"],
	samples: [
		{
			title: { en: "Validate a required field", tr: "Zorunlu alanı doğrula" },
			xml: `<k:Stack gap="12">
				<k:Form id="form">
					<k:FormSection title="[[Contact||İletişim]]">
						<k:TextField label="[[Name||Ad]]" required="true"/>
					</k:FormSection>
				</k:Form>
				<k:Button kind="primary" text="[[Save contact||Kişiyi kaydet]]" press=".onSave"/>
			</k:Stack>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ValidateForm", {
				onSave() {
					if (this.byId("form").validate()) Toast.show("[[Form saved||Form kaydedildi]]");
				}
			}));`
		},
		{
			title: { en: "Edit dispatch details", tr: "Sevkiyat ayrıntılarını düzenle" },
			xml: `<k:Stack gap="12">
				<k:Form id="form">
					<k:FormSection title="[[Shipment||Sevkiyat]]" text="[[These details appear on the dispatch list.||Bu bilgiler sevk listesinde görünür.]]" columns="2">
						<k:TextField label="[[Reference||Referans]]" value="SH-104" required="true"/>
						<k:DateField label="[[Dispatch date||Sevk tarihi]]" required="true"/>
					</k:FormSection>
					<k:FormSection title="[[Handling||Taşıma]]">
						<k:Check text="[[Handle with care||Dikkatli taşı]]"/>
					</k:FormSection>
				</k:Form>
				<k:Button kind="primary" text="[[Save shipment||Sevkiyatı kaydet]]" press=".onSave"/>
			</k:Stack>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.ValidateForm", {
				onSave() {
					if (this.byId("form").validate()) Toast.show("[[Form saved||Form kaydedildi]]");
				}
			}));`
		}
	]
};
