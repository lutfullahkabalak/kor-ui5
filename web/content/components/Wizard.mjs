export default {
	children: ["WizardStep"],
	summary: { en: "Leads through a long task step by step.", tr: "Uzun bir işi adım adım yaptırır." },
	use: { en: ["Use it for rare tasks with several dependent steps."], tr: ["Birbirine bağlı adımları olan seyrek işlerde kullan."] },
	related: ["Form", "Stages"],
	samples: [
		{
			title: { en: "New supplier", tr: "Yeni tedarikçi" },
			xml: `<k:Wizard finish=".onFinish" finishText="[[Create||Oluştur]]">
				<k:WizardStep title="[[Company||Şirket]]" text="[[Who is the supplier?||Tedarikçi kim?]]">
					<k:Form><k:FormSection><k:TextField label="[[Name||Ad]]" required="true"/></k:FormSection></k:Form>
				</k:WizardStep>
				<k:WizardStep title="[[Terms||Koşullar]]"><k:NumberField label="[[Payment days||Vade, gün]]" value="30"/></k:WizardStep>
				<k:WizardStep title="[[Review||Kontrol]]"><k:Message text="[[Check the details before you create the supplier.||Oluşturmadan önce bilgileri kontrol et.]]" state="info"/></k:WizardStep>
			</k:Wizard>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.NewSupplier", {
				onFinish(event) {
					Toast.show(String("[[Supplier created||Tedarikçi oluşturuldu]]"));
				}
			}));`
		}
	]
};
