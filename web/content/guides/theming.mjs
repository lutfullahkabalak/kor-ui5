export default {
	title: { en: "Appearance", tr: "Görünüm" },
	summary: { en: "Change the appearance of Kor controls at runtime.", tr: "Kor kontrollerinin görünümünü çalışma sırasında değiştir." },
	body: {
		en: `## Set appearance from JavaScript

Load \`kor/ui/Theme\` and pass the settings you want to update. \`mode\` accepts light, dark or system. \`density\` accepts cozy or compact. Use a six-digit hexadecimal accent and a radius in pixels.

\`\`\`js
sap.ui.require(["kor/ui/Theme"], (Theme) => {
  Theme.set({ mode: "system", accent: "#0B7A5B", density: "compact", radius: 8 });
});
\`\`\`

## Use CSS variables

Kor loads \`kor.css\` independently of the SAP theme. In application CSS, use variables such as \`--kor-canvas\`, \`--kor-surface\`, \`--kor-ink\` and \`--kor-line\` to style surrounding content. \`Theme.set\` applies the mode and density to the document root, so the change also applies to overlays outside the view. Choose the SAP theme separately for any SAP controls in the same application.

Try the controls on the [Theme page](/components/theme/).`,
		tr: `## JavaScript ile görünümü ayarla

\`kor/ui/Theme\` modülünü yükle ve güncellemek istediğin ayarları ver. \`mode\` light, dark veya system değerini alır. \`density\` için cozy veya compact kullan. Vurgu rengini altı haneli onaltılık kodla, köşe yarıçapını piksel olarak ver.

\`\`\`js
sap.ui.require(["kor/ui/Theme"], (Theme) => {
  Theme.set({ mode: "system", accent: "#0B7A5B", density: "compact", radius: 8 });
});
\`\`\`

## CSS değişkenlerini kullan

Kor \`kor.css\` dosyasını SAP temasından bağımsız yükler. Çevredeki içeriği biçimlendirmek için uygulama CSS’inde \`--kor-canvas\`, \`--kor-surface\`, \`--kor-ink\` ve \`--kor-line\` gibi değişkenleri kullan. \`Theme.set\` görünümü ve yoğunluğu belge köküne uygular. Böylece değişiklik, görünüm dışında açılan katmanları da kapsar. Aynı uygulamadaki SAP kontrolleri için SAP temasını ayrıca seç.

[Theme sayfasındaki](/components/theme/) ayarları deneyebilirsin.`
	}
};
