export default {
	title: { en: "Localization", tr: "Yerelleştirme" },
	summary: { en: "Use the UI5 language for library strings and display formats.", tr: "Kütüphane metinlerinde ve gösterim biçimlerinde UI5 dilini kullan." },
	body: {
		en: `## Set the language at bootstrap

Set \`data-sap-ui-language="en"\` or \`data-sap-ui-language="tr"\` on the UI5 bootstrap. Kor reads its own strings from the UI5 library resource bundle. English is the default bundle and Turkish has its own bundle.

## Keep application copy in resource files

Put labels, validation messages and button texts in your application's resource model. Bind them with an expression such as \`label="{i18n>deliveryDate}"\`. Keep technical keys, currency codes and ISO date values stable across languages.

## Format values at display time

Pass numbers and dates as model values. Kor uses UI5 \`NumberFormat\` and \`DateFormat\` for display and input. Use the same formatters for text you assemble yourself, such as a toast with an amount. For day-only values in JSON, \`yyyy-MM-dd\` keeps the data independent of the display locale.`,
		tr: `## Başlatırken dili ayarla

UI5 başlatma etiketinde \`data-sap-ui-language="en"\` veya \`data-sap-ui-language="tr"\` kullan. Kor kendi metinlerini UI5 kütüphane mesaj dosyasından okur. Varsayılan dosya İngilizcedir. Türkçenin ayrı mesaj dosyası vardır.

## Uygulama metinlerini kaynak dosyalarına koy

Etiketleri, doğrulama mesajlarını ve düğme metinlerini uygulamanın kaynak modeline koy. \`label="{i18n>deliveryDate}"\` gibi bir ifadeyle bağla. Teknik anahtarları, para birimi kodlarını ve ISO tarih değerlerini diller arasında sabit tut.

## Değerleri gösterirken biçimlendir

Sayıları ve tarihleri model değeri olarak ver. Kor gösterim ve giriş için UI5 \`NumberFormat\` ve \`DateFormat\` kullanır. Tutar içeren kısa bildirim gibi kendi oluşturduğun metinlerde de aynı biçimleyicileri kullan. JSON’da yalnızca gün içeren değerleri \`yyyy-MM-dd\` biçiminde tutarak veriyi gösterim dilinden bağımsız sakla.`
	}
};
