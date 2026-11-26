import { readFileSync } from "node:fs";

// Galeri derleme sırasında ad tablosundan üretilir; kaynak: npm run renkli
const meta = JSON.parse(readFileSync(new URL("../../assets/renkli/fonts/RenkliIkon.json", import.meta.url), "utf8"));
const names = Object.keys(meta).sort();
const L = {
	en: { all: `All ${names.length} icons`, find: "Filter icons", bg: "Background", page: "Page", dark: "Dark", color: "Colored", hint: "Select an icon to copy its address. The SVG of each icon is at `/assets/renkli/svg/<name>.svg`.", none: "No icon matches." },
	tr: { all: `${names.length} ikonun tamamı`, find: "İkon süz", bg: "Zemin", page: "Sayfa", dark: "Koyu", color: "Renkli", hint: "Adresini kopyalamak için ikonu seç. Her ikonun SVG'si `/assets/renkli/svg/<ad>.svg` adresindedir.", none: "Eşleşen ikon yok." }
};
const code = (s) => s.replace(/`([^`]+)`/g, (_, c) => `<code>${c.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</code>`);
const gallery = (lang) => {
	const l = L[lang];
	return `<h2 id="icons">${l.all}</h2><p>${code(l.hint)}</p>
<section class="riGallery" data-ri>
<div class="riBar"><input type="search" placeholder="${l.find}" aria-label="${l.find}" autocomplete="off" spellcheck="false">
<div class="riSeg" role="group" aria-label="${l.bg}"><button type="button" data-pal="" aria-pressed="true">${l.page}</button><button type="button" data-pal="koyu" aria-pressed="false">${l.dark}</button><button type="button" data-pal="zemin" aria-pressed="false">${l.color}</button></div>
<span class="riCount" role="status" data-none="${l.none}"></span></div>
<div class="riGrid">${names.map((n) => `<button type="button" class="riCell" data-n="${n}" title="sap-icon://renkli/${n}"><i class="ri ri-${n}" aria-hidden="true"></i><span>${n}</span></button>`).join("")}</div>
</section>`;
};

export default {
	title: { en: "Colorful icons", tr: "Renkli ikonlar" },
	summary: {
		en: `A colorful, originally drawn version of all ${names.length} SAP icon names, for Kor and SAP controls.`,
		tr: `SAP ikon adlarının ${names.length}'ünün tamamı için özgün çizimli, renkli bir set. Kor ve SAP kontrolleriyle çalışır.`
	},
	head: '<link rel="stylesheet" href="/assets/renkli/renkli-web.css">',
	html: gallery,
	toc: { en: [["icons", L.en.all]], tr: [["icons", L.tr.all]] },
	body: {
		en: `## What you get

The set covers every name in SAP-icons for UI5 1.108 and 1.154, aliases included. Each icon is drawn on a 24 px grid with its own colors. The icons are not copies of the SAP glyphs; only the names and code points come from OpenUI5.

| File | Purpose |
| --- | --- |
| \`fonts/RenkliIkon.woff2\` | Color font (COLRv0 with three palettes), about 60 KB. Code points match SAP-icons. |
| \`fonts/RenkliIkon.json\` | Icon names for UI5 |
| \`register.js\` | UI5 module: the \`renkli\` collection and replace mode |
| \`renkli.css\` | Font face and palette rules, loaded by \`register.js\` |
| \`renkli-web.css\` | Use without UI5: \`<i class="ri ri-cart"></i>\` |
| \`svg/<name>.svg\` | One SVG per icon |

[Download renkli.zip](/assets/renkli.zip) and copy the \`renkli\` folder next to your app.

## Load it

Add a resource root and load \`renkli/register\` before the first view. Kor controls look up icons synchronously, so wait for \`ready()\`; it loads the icon names once.

\`\`\`html
data-sap-ui-resourceroots='{"kor.ui": "./resources/kor/ui/", "renkli": "./renkli/"}'
\`\`\`

\`\`\`js
sap.ui.require(["renkli/register"], (Renkli) => {
  Renkli.ready().then(() => {
    // Create the component or view here
  });
});
\`\`\`

## Use an icon

Write \`sap-icon://renkli/<name>\` wherever an icon address is accepted: \`icon\` on Kor \`Button\`, \`name\` on Kor \`Icon\`, and the icon properties of SAP controls. The names are the SAP names, so \`sap-icon://cart\` becomes \`sap-icon://renkli/cart\`.

\`\`\`xml
<k:Button text="Save" icon="sap-icon://renkli/save" kind="primary"/>
<k:Icon name="sap-icon://renkli/shipping-status" size="24"/>
\`\`\`

## Replace every SAP icon

\`Renkli.replaceStandardIcons()\` shows all existing \`sap-icon://<name>\` icons in color without changing your views. It covers \`sap.ui.core.Icon\` in SAP controls and the UI5 icons inside Kor controls. Call \`replaceStandardIcons(false)\` to go back. Other collections, such as TNT, stay as they are.

## Light, dark and colored backgrounds

The font has three palettes, and the right one is usually picked for you:

- **Dark:** in Kor dark mode and in dark or high contrast black SAP themes.
- **Colored background:** on a Kor \`accent\` button, an emphasized SAP button and the selected Horizon tab.
- **Kor primary button:** the palette that matches the button's background in each mode.

Anywhere else, add \`renkliKoyu\` (dark), \`renkliZemin\` (colored) or \`renkliAcik\` (light) to a container.

## Without UI5

\`\`\`html
<link rel="stylesheet" href="renkli/renkli-web.css">
<i class="ri ri-cart"></i>
<i class="ri ri-cart renkliKoyu"></i>
\`\`\`

## Limits

- An icon keeps its own colors. CSS \`color\` and semantic colors such as \`color="Negative"\` on a SAP icon have no effect. Use a plain SAP icon where color carries meaning.
- Replace mode changes icons drawn with the icon font. Small marks that controls draw with their own CSS, such as a checkbox tick or a dropdown arrow, stay the same.
- Icons are not mirrored in right-to-left layouts.
- Color fonts work in current Chrome, Edge, Firefox and Safari.`,
		tr: `## İçinde ne var

Set, UI5 1.108 ve 1.154'teki SAP-icons adlarının tamamını, takma adlarıyla birlikte kapsar. Her ikon 24 px ızgarada, kendi renkleriyle çizilmiştir. Çizimler SAP gliflerinin kopyası değildir; yalnızca adlar ve kod noktaları OpenUI5'ten alınmıştır.

| Dosya | Ne işe yarar |
| --- | --- |
| \`fonts/RenkliIkon.woff2\` | Renkli font (COLRv0, üç palet), yaklaşık 60 KB. Kod noktaları SAP-icons ile aynıdır. |
| \`fonts/RenkliIkon.json\` | UI5 için ikon adları |
| \`register.js\` | UI5 modülü: \`renkli\` koleksiyonu ve değiştirme kipi |
| \`renkli.css\` | Font ve palet kuralları; \`register.js\` yükler |
| \`renkli-web.css\` | UI5 olmadan kullanım: \`<i class="ri ri-cart"></i>\` |
| \`svg/<ad>.svg\` | Her ikon için ayrı SVG |

[renkli.zip dosyasını indir](/assets/renkli.zip) ve \`renkli\` klasörünü uygulamanın yanına kopyala.

## Yükle

Bir kaynak kökü ekle ve ilk görünümden önce \`renkli/register\` modülünü yükle. Kor kontrolleri ikonu eşzamanlı arar; bu yüzden \`ready()\` bitmesini bekle. Bu çağrı ikon adlarını bir kez yükler.

\`\`\`html
data-sap-ui-resourceroots='{"kor.ui": "./resources/kor/ui/", "renkli": "./renkli/"}'
\`\`\`

\`\`\`js
sap.ui.require(["renkli/register"], (Renkli) => {
  Renkli.ready().then(() => {
    // Bileşeni veya görünümü burada oluştur
  });
});
\`\`\`

## İkon kullan

İkon adresi alan her yere \`sap-icon://renkli/<ad>\` yaz: Kor \`Button\` için \`icon\`, Kor \`Icon\` için \`name\` ve SAP kontrollerinin ikon özellikleri. Adlar SAP adlarıyla aynıdır: \`sap-icon://cart\`, \`sap-icon://renkli/cart\` olur.

\`\`\`xml
<k:Button text="Kaydet" icon="sap-icon://renkli/save" kind="primary"/>
<k:Icon name="sap-icon://renkli/shipping-status" size="24"/>
\`\`\`

## Tüm SAP ikonlarını değiştir

\`Renkli.replaceStandardIcons()\`, mevcut bütün \`sap-icon://<ad>\` ikonlarını görünümleri değiştirmeden renkli gösterir. SAP kontrollerindeki \`sap.ui.core.Icon\` ile Kor kontrollerinin içindeki UI5 ikonlarını kapsar. Geri dönmek için \`replaceStandardIcons(false)\` çağır. TNT gibi diğer koleksiyonlar olduğu gibi kalır.

## Açık, koyu ve renkli zemin

Fontta üç palet var; doğru olan çoğunlukla kendiliğinden seçilir:

- **Koyu:** Kor koyu görünümünde ve koyu veya yüksek karşıtlık siyah SAP temalarında.
- **Renkli zemin:** Kor \`accent\` düğmesinde, vurgulu SAP düğmesinde ve Horizon'un seçili sekmesinde.
- **Kor primary düğmesi:** her görünümde düğmenin zeminine uyan palet.

Başka bir yerde kapsayıcıya \`renkliKoyu\` (koyu), \`renkliZemin\` (renkli) veya \`renkliAcik\` (açık) sınıfını ekle.

## UI5 olmadan

\`\`\`html
<link rel="stylesheet" href="renkli/renkli-web.css">
<i class="ri ri-cart"></i>
<i class="ri ri-cart renkliKoyu"></i>
\`\`\`

## Sınırlar

- İkon kendi renklerini korur. CSS \`color\` ve SAP ikonundaki \`color="Negative"\` gibi anlamsal renkler etkisizdir. Rengin anlam taşıdığı yerde düz SAP ikonu kullan.
- Değiştirme kipi ikon fontuyla çizilen ikonları değiştirir. Kontrollerin kendi CSS'iyle çizdiği onay kutusu tiki veya açılır ok gibi küçük işaretler aynı kalır.
- İkonlar sağdan sola düzende yansıtılmaz.
- Renkli fontlar güncel Chrome, Edge, Firefox ve Safari'de çalışır.`
	},
	samples: [
		{
			title: { en: "Kor controls", tr: "Kor kontrolleri" },
			text: { en: "The icon follows the button: dark palette on primary, colored palette on accent.", tr: "İkon düğmeye uyar: primary'de koyu, accent'te renkli zemin paleti." },
			xml: `<k:Stack gap="16">
				<k:Stack row="true" gap="8" align="center">
					<k:Button text="[[Save||Kaydet]]" icon="sap-icon://renkli/save" kind="primary"/>
					<k:Button text="[[Add to cart||Sepete ekle]]" icon="sap-icon://renkli/cart" kind="accent"/>
					<k:Button text="[[Print||Yazdır]]" icon="sap-icon://renkli/print"/>
					<k:Button icon="sap-icon://renkli/email" label="[[Send by email||E-postayla gönder]]"/>
				</k:Stack>
				<k:Stack row="true" gap="16" align="center">
					<k:Icon name="sap-icon://renkli/shipping-status" size="32" alt="[[Shipment||Sevkiyat]]"/>
					<k:Icon name="sap-icon://renkli/factory" size="32" alt="[[Plant||Fabrika]]"/>
					<k:Icon name="sap-icon://renkli/customer" size="32" alt="[[Customer||Müşteri]]"/>
					<k:Icon name="sap-icon://renkli/pdf-attachment" size="32" alt="PDF"/>
					<k:Icon name="sap-icon://renkli/excel-attachment" size="32" alt="Excel"/>
				</k:Stack>
			</k:Stack>`
		},
		{
			title: { en: "Replace mode", tr: "Değiştirme kipi" },
			text: { en: "The icons below use plain SAP addresses. Turn on the switch to show them in color. It applies to the whole page.", tr: "Aşağıdaki ikonlar düz SAP adresleri kullanır. Renkli göstermek için anahtarı aç. Ayar bütün sayfaya uygulanır." },
			xml: `<k:Stack gap="16">
				<k:Toggle text="[[Colorful icons||Renkli ikonlar]]" change=".onToggle"/>
				<k:Stack row="true" gap="8" align="center">
					<k:Button text="[[Accept||Onayla]]" icon="sap-icon://accept"/>
					<k:Button text="[[Reject||Reddet]]" icon="sap-icon://decline"/>
					<k:Button text="[[Attach||Ekle]]" icon="sap-icon://attachment"/>
					<core:Icon src="sap-icon://add-document" size="1.5rem"/>
				</k:Stack>
			</k:Stack>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "renkli/register"], (Controller, Renkli) => Controller.extend("sample.Main", {
				onToggle(event) {
					Renkli.replaceStandardIcons(event.getParameter("selected"));
				}
			}));`
		}
	]
};
