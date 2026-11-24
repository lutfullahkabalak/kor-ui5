export default {
	summary: { en: "Applies appearance settings at runtime.", tr: "Görünüm ayarlarını çalışma sırasında uygular." },
	use: { en: ["Let users change density or apply a brand color across Kor controls."], tr: ["Kullanıcı yoğunluğu değiştirsin veya Kor kontrollerinde kurum rengi uygulansın."] },
	samples: [
		{
			title: { en: "Toggle density", tr: "Yoğunluğu değiştir" },
			xml: `<k:Button text="[[Switch cozy or compact||Rahat veya sıkışık görünüme geç]]" press=".onDensity"/>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Theme", "kor/ui/Toast"], (Controller, Theme, Toast) => Controller.extend("sample.ThemeDensity", {
				onDensity() {
					const density = Theme.get().density === "cozy" ? "compact" : "cozy";
					Theme.set({ density });
					Toast.show(density === "compact" ? "[[Compact density||Sıkışık görünüm]]" : "[[Cozy density||Rahat görünüm]]");
				}
			}));`
		},
		{
			title: { en: "Preview and restore a brand color", tr: "Kurum rengini önizle ve geri yükle" },
			text: { en: "Appearance settings apply to the whole page.", tr: "Görünüm ayarları sayfanın tamamına uygulanır." },
			xml: `<k:Stack row="true" gap="8">
				<k:Button kind="accent" text="[[Preview green||Yeşili önizle]]" press=".onPreview"/>
				<k:Button text="[[Restore color||Rengi geri yükle]]" press=".onRestore"/>
			</k:Stack>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Theme"], (Controller, Theme) => Controller.extend("sample.ThemeAccent", {
				onPreview() {
					this.previousAccent ??= Theme.get().accent;
					Theme.set({ accent: "#0B7A5B" });
				},
				onRestore() {
					if (this.previousAccent) Theme.set({ accent: this.previousAccent });
					this.previousAccent = undefined;
				},
				onExit() {
					this.onRestore();
				}
			}));`
		}
	]
};
