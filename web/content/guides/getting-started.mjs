export default {
	title: { en: "Getting started", tr: "Başlangıç" },
	summary: { en: "Add Kor to a UI5 project and render your first control.", tr: "Kor’u UI5 projesine ekle ve ilk kontrolü çiz." },
	body: {
		en: `## Install the library

Run this in a UI5 application with a UI5 Tooling specification version of 3.0 or later. Use OpenUI5 or SAPUI5 1.108 or later.

\`\`\`bash
npm install kor-ui5
\`\`\`

Add Kor under the existing sap.ui5 entry in manifest.json. Keep any dependencies your application already uses. Kor itself depends on sap.ui.core and loads its own stylesheet.

\`\`\`json
{
  "sap.ui5": {
    "dependencies": {
      "minUI5Version": "1.108.0",
      "libs": { "sap.ui.core": {}, "kor.ui": {} }
    }
  }
}
\`\`\`

## Render a button

Use the kor.ui namespace in an XML view. Assign a controller name to the view and define the onSave handler in that controller.

\`\`\`xml
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:k="kor.ui" controllerName="example.Main">
  <k:Button kind="primary" text="Save" press=".onSave"/>
</mvc:View>
\`\`\`

\`\`\`js
sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) =>
  Controller.extend("example.Main", {
    onSave() { Toast.show("Saved"); }
  })
);
\`\`\`

Run \`npx ui5 serve\` from your application and open its index page. See [Button examples](/components/button/) and [the setup for static hosting](/guides/no-build/).`,
		tr: `## Kütüphaneyi kur

Bu komutu UI5 Tooling belirtim sürümü en az 3.0 olan bir UI5 uygulamasında çalıştır. OpenUI5 veya SAPUI5 1.108 ve üzerini kullan.

\`\`\`bash
npm install kor-ui5
\`\`\`

manifest.json dosyasındaki mevcut sap.ui5 bölümüne Kor’u ekle. Uygulamanın kullandığı bağımlılıkları koru. Kor sap.ui.core’a bağlıdır ve kendi stil dosyasını yükler.

\`\`\`json
{
  "sap.ui5": {
    "dependencies": {
      "minUI5Version": "1.108.0",
      "libs": { "sap.ui.core": {}, "kor.ui": {} }
    }
  }
}
\`\`\`

## Bir düğme çiz

XML görünümünde kor.ui ad alanını kullan. Görünüme bir denetleyici adı ver ve onSave olay işleyicisini bu denetleyicide tanımla.

\`\`\`xml
<mvc:View xmlns:mvc="sap.ui.core.mvc" xmlns:k="kor.ui" controllerName="example.Main">
  <k:Button kind="primary" text="Kaydet" press=".onSave"/>
</mvc:View>
\`\`\`

\`\`\`js
sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) =>
  Controller.extend("example.Main", {
    onSave() { Toast.show("Kaydedildi"); }
  })
);
\`\`\`

Uygulama dizininde \`npx ui5 serve\` çalıştır ve uygulamanın başlangıç sayfasını aç. [Button örneklerine](/components/button/) ve [statik sunucu kurulumuna](/guides/no-build/) bak.`
	}
};
