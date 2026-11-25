export default {
	title: { en: "Use Kor without a build step", tr: "Kor’u derlemeden kullan" },
	summary: { en: "Serve the compiled library next to an existing application.", tr: "Derlenmiş kütüphaneyi mevcut uygulamanın yanında sun." },
	body: {
		en: `## Copy the library files

1. Download [kor-ui.zip](https://github.com/lutfullahkabalak/kor-ui5/releases/download/v0.2.0/kor-ui.zip) and unpack it.
2. Copy the full \`kor/ui\` directory to the application server. Keep the JS modules, message bundles, stylesheet and assets together.
3. Map the UI5 resource root \`kor.ui\` to that directory. Keep your application's existing resource roots and library dependencies.

\`\`\`html
<script id="sap-ui-bootstrap"
    src="/resources/sap-ui-core.js"
    data-sap-ui-async="true"
    data-sap-ui-compatVersion="edge"
    data-sap-ui-libs="kor.ui"
    data-sap-ui-resourceroots='{"kor.ui": "./kor/ui/"}'>
</script>
\`\`\`

Adjust the bootstrap URL to match the UI5 runtime on your server. If you use a manifest, add \`kor.ui\` to its libraries as shown in [Getting started](/guides/getting-started/).

## ABAP BSP and Launchpad

For a BSP application the same relative layout is a starting point. Upload the extracted files as static resources, use the existing SAPUI5 runtime and match the resource-root URL to the deployed directory. Check that JS, CSS, fonts and message bundles return HTTP 200 after deployment. ABAP BSP and Launchpad deployment: **not tested**.`,
		tr: `## Kütüphane dosyalarını kopyala

1. [kor-ui.zip](https://github.com/lutfullahkabalak/kor-ui5/releases/download/v0.2.0/kor-ui.zip) dosyasını indir ve aç.
2. \`kor/ui\` dizininin tamamını uygulama sunucusuna kopyala. JS modülleri, mesaj dosyaları, stil dosyası ve varlıklar birlikte kalsın.
3. UI5’te \`kor.ui\` kaynak kökünü bu dizine yönlendir. Uygulamanın mevcut kaynak köklerini ve kütüphane bağımlılıklarını koru.

\`\`\`html
<script id="sap-ui-bootstrap"
    src="/resources/sap-ui-core.js"
    data-sap-ui-async="true"
    data-sap-ui-compatVersion="edge"
    data-sap-ui-libs="kor.ui"
    data-sap-ui-resourceroots='{"kor.ui": "./kor/ui/"}'>
</script>
\`\`\`

Başlatma adresini sunucundaki UI5 çalışma ortamına göre ayarla. Manifest kullanıyorsan [Başlangıç kılavuzundaki](/guides/getting-started/) gibi \`kor.ui\` kütüphanesini ekle.

## ABAP BSP ve Launchpad

BSP uygulaması için aynı göreli dizin yapısı başlangıç noktası olabilir. Açtığın dosyaları statik kaynak olarak yükle, mevcut SAPUI5 çalışma ortamını kullan ve kaynak kökü adresini dağıtılan dizine yönlendir. Dağıtımdan sonra JS, CSS, yazı tipi ve mesaj dosyalarının HTTP 200 ile döndüğünü kontrol et. ABAP BSP ve Launchpad dağıtımı **denenmedi**.`
	}
};
