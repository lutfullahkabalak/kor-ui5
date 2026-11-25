# Kor: yayınlanacak bileşen paketi (2026-11-24)

Amaç: SAP görünümünden bağımsız, kurumsal işe uygun, herkese açık UI5 bileşen paketi. Tasarım sahibi tarafından onaylandı.

## Kararlar
- `sap.m` sınıfı genişletilmez ve giydirilmez. Kontroller `sap.ui.core.Control`'dan yazılır; tek bağımlılık sap.ui.core.
- Görünüm SAP temasından bağımsız: tek `src/kor.css` (`includeStylesheet` ile), `--kor-*` değişkenleri, `Theme.set`. LESS yok; less-openui5 modern CSS'i (`color-mix`, `:has`) işlemez.
- Görsel dil: köz turuncusu vurgu, mürekkep siyahı birincil düğme, soğuk gri zemin, Archivo'nun genişlik ekseni (başlık geniş, tablo dar). Durum = renk + şekil + metin. Grafik paleti renk körlüğü denetiminden geçirildi (açık ve koyu).

- Demo `test/demo` (Akış, Siparişler, İş panosu, Üretim planı, Bileşenler). Veriler uydurma.

## Dağıtım
`npm run build`: `npm/` (derlenmiş JS + tip) ve `site/` (GitHub Pages demosu, OpenUI5 CDN'den). Doğrulandı: boş bir UI5 1.120.30 uygulamasında `npm install` + manifest `libs` ile çalıştı, `ui5 build --all` başarılı; `site/` yerel sunucuda çalıştı.

## Doğrulanan
QUnit 55/55 (38 genel, 17 OData) ve tarayıcı etkileşim turu (aralık, düzenleme, sıralama, süzgeç, panel, palet, pano, plan, akış, basılı tut) 1.108.55 ve 1.154.0. Koyu, 390 px ve RTL ekran görüntüsüyle bakıldı.

## Eksikler
Gerçek SAP Gateway/RAP servisi, dokunmatik sürükleme, Safari/Firefox, gerçek ekran okuyucu, ABAP/Launchpad dağıtımı denenmedi. Bileşen eksikleri aşağıda.

## Dersler
- Sınıf alanları `init()`'ten SONRA atanır: `init` içinde `this.okFonksiyon` tanımsızdır ve `addEventListener(undefined)` sessizce geçer. Dinleyici olarak `this` ver, `handleEvent` yaz.
- Controller'da getter kullanma: UI5 `Metadata.applySettings` prototipteyken çağırır.
- Şablonsuz bağlama: aggregation `_doesNotRequireFactory: true` + `updateX`/`refreshX`.
- `library.ts` içinde `controls`/`elements` düz dizi olmalı; `map` ile üretilirse derleyici okuyamaz.
- Yüzen katmanlar `sap-ui-static` alanına konur, z-index `Popup.getNextZIndex`.
- Paketlenen JS'ten `sourceMappingURL` silinmeli, yoksa tüketen derleme her dosyada uyarı basar.
- ManagedObject `null` değeri `defaultValue`'ya çevirir; boş tarihin modele `null` yazılması için `defaultValue: null` gerekir.
- Takvimde odak yazı alanında kalır (`aria-activedescendant`); katman `pointerdown` ile odağı almaz. Yeni yüzen katmanlarda aynı yol izlenmeli.

## UI5'te olup Kor'da olmayanlar (2026-11-24)
sap.m, sap.ui.layout ve sap.ui.unified 1.108 kayıtlarından; sap.f, sap.ui.table, sap.tnt, sap.uxap bilgiden (kayıt okunmadı).
1. Yayın için şart grubu tamamlandı: Dialog, Confirm, Popover, Tooltip, Tabs, Form/FormSection, MultiSelect, RadioGroup, FileDrop, Message, MessageList, Skeleton.
2. Kurumsal: yapıldı → TreeGrid, sütun ayarı, Variants, LookupField. Kalan: tabloda gruplama/toplam, sihirbaz, saat ve tarih-saat, kart listesi (List), master-detail (FlexibleColumnLayout), splitter, nesne sayfası, menü çubuğu, kırıntı yolu.
3. İhtiyaca göre: ay/hafta takvimi (SinglePlanningCalendar), kaydırıcı, puan, renk seçici, karusel, akordeon, bildirim merkezi, adım/ilerleme çubuğu, karo, PDF, resim, taslak göstergesi, QR/mask alanı.

## Katman kararları
- Dialog ve Popover `sap.ui.core.Popup` kullanır ve `dependents`e konur (model kendiliğinden gelir, SAP pencereleriyle katman sırası tutar). Dış öğenin `display`/konum stilini Popup yazar; düzen iç kutuda olmalı, ortalama CSS ile zorlanır.
- `Float` katmanları `data-sap-ui-integration-popup-content` taşır; yoksa UI5 modal penceresi odağı geri alır.
- Örtü rengi yalnızca `html.korModal` varken değişir, SAP pencerelerine dokunmaz.
- `Form.validate()` yalnızca kendi koyduğu "zorunlu" hatasını siler; sunucu hatası korunur.
- Durum adları UI5 MessageType'ı da kabul eder (Error, Warning, Success, Information); MessageList mesaj modeline bağlanmak üzere yazıldı, gerçek MessageManager ile denenmedi.

## Ağaç, F4, görünüm kaydı
- TreeGrid, DataGrid'den türer; `isTreeBinding("rows")` true döner, dallar `getRootContexts/getNodeContexts` ile düzleştirilir. OData V4 hiyerarşisi ağaç bağlaması vermediği için kapsam dışı; OData V2 ağacı denenmedi.
- Ortak çizim `gridRenderer.ts`tedir: varsayılan sınıf ile adlı dışa aktarım aynı modülde olursa UI5 modülü sınıf yerine nesne döndürür.
- `getState/setState` sözleşmesi: DataGrid, TreeGrid, FilterBar ve `stateChange` olayı. Variants bunları sunan her kontrolle çalışır; durumlar kontrol kimliğinin son parçasıyla saklanır, kimlik değişirse kayıt eşleşmez.
- Variants kalıcılığı: `storageKey` (tarayıcı) veya `variants` + `change` (sunucu). "Herkesle paylaş" yalnızca işarettir; paylaşımı uygulama yapar. SAP'nin LRep/variant altyapısına bağlı değildir.
- LookupField önerisi kendi bağlamasını süzer, pencere ayrı bağlama kurar. Geç gelen veri için `asked` bekletilir (async denenmedi).
- Testte `placeAt` sonrası UIArea yeniden çizilir; DOM başvurusunu her seferinde tazele.

## OData (2026-11-24)
Testler `test/qunit/OData.qunit.ts`: V2 = UI5 MockServer, V4 = `odata/v4.ts` (sinon). İki UI5 sürümünde ve İstanbul, New York, UTC, Auckland saat dilimlerinde geçti (`TZ=... npm test`).
Bulunan ve düzeltilen hatalar: V2 tarihinin bir gün kayması, Decimal'in sayıya dönmesi, yüklenmemiş aralığın yarım toplanması, kaydırınca seçimin kaybolması, "tümünü seç"in yalnız yüklenenleri alması, F4'te her tuşta istek, `$count`suz V4'te kaydırmanın takılması, geç gelen verinin açık düzenlemeyi silmesi, FilterBar'ın ≥ gösterip > göndermesi, yok edilen Dialog/Popover DOM'unun kalması.
- `toDate` her zaman yerel gün döndürür; UTC gece yarısı olan Date, UTC günü sayılır. Yazarken `dateValue(gün, eskiDeğer, model)` kullan.
- V4 `getLength()` yalnız oluşturulan bağlamları sayar; önbellekten gelen sayfada change olayı çıkmaz.
- V4 autoExpandSelect geçici `-2` bağlamı verir; satır sayılmaz.
- MockServer modülü sinon'a kalıcı süzgeç ekler; ikinci sahte sunucu süzgeçleri geçici boşaltmalı.
- Bağımlı (dependent) kontrol ebeveynle yok edilince DOM'u kalır; static alandaki kontroller `exit`te kendi DOM'unu siler.

## Yayın (2026-11-24)
- Kararlar: ad Kor (`kor-ui5`, `kor.ui`), Apache-2.0, telif Lütfullah Kabalak, ayrı depo. Önceki deneme geçmişi bu depoya taşınmadı.
- `npm/` yayınlanan pakettir (kök `private`). `index.d.ts` içindeki yollar `./src/`e çevrilir; çevrilmezse TypeScript kullananlar tip bulamaz. Her yayında TS tüketicisiyle dene.
- `*.gen.d.ts` izlenmez: üretici ortama göre farklı açıklama yazıyor.
- Yüzde `pct`, tablo tarihi `dayText` ile yerel biçimlenir; metin içine `%` veya `dd.MM` gömme.
- `build:interfaces` gerekirse iki kez koşar: temiz klonda TreeGrid, DataGrid arayüzü henüz yokken üretilemez.
- Arama karşılaştırmaları `fold` kullanır: `toLocaleLowerCase()` tarayıcı diline bakar, İngilizce tarayıcıda "İ" eşleşmez (CI yakaladı).
- 0.1.0 npm ve GitHub'da yayında (2026-11-24). npm yayını iki adımlı doğrulama ister: sahibi kendi terminalinde `cd npm && npm publish --access public` çalıştırır; yeni sürüm birkaç dakika işlenir (önce `0.0.0-stage` görünür).

## Dokümantasyon ve örnekler (2026-11-25)

- `web/PLAN.md` B ve C tamamlandı. Kökte `npm run build` sonrası `npm run docs` ile `web/dist` üretilir. `npm run docs:check -- /components/` bileşenleri, süzgeçsiz komut tüm siteyi denetler. Bu turda 114 sayfa, eksik içerik/API 0. QUnit 1.108.55 ve 1.154.0’da 56/56.
- `web/content/components` sayfaları alt öğeleri `children` ile ekler. API Türkçesi `src` JSDoc’undan, İngilizcesi `web/content/api-en.json` dosyasından gelir. Aynı adlı olay ve metot varsa metot anahtarında `()` kullanılır. Örnek kapsayıcısının `data-sample-state` özniteliği MessageList’in `[data-state]` aramasıyla çakışmaz.
- Demo varsayılan İngilizce. `?lang=en|tr` başlatma sırasında UI5 dilini belirler. Metinler `test/demo/i18n*.properties` dosyalarındadır. Dil geçişi sayfayı yeniler, ekranı ve görünümü URL üzerinden korur. Sipariş süzgeçlerinin kayıtlı görünümleri dile göre ayrı tutulur çünkü durum değerleri yerelleştirilir.
- `web/examples/orders`, yayımlanmış `kor-ui5@0.1.0` ile UI5 CLI üzerinden çalışır. `npm i && npx ui5 serve` sonrası sunucunun yazdığı adreste `/index.html` açılır. Site derlemesi bu projeyi arşivler ve statik kopyanın UI5 adresiyle `kor.ui` kaynak kökünü değiştirir.
- `node scripts/shots.mjs` kök derlemenin `site/` çıktısından 1440×900 ana sayfa görsellerini üretir. Tarayıcı yolu gerekirse `CHROME_PATH` ile verilir. Siteyi yerelde ve iki dilde doğruladık. Yayın adımları `web/PLAN.md` D bölümündedir.

## Doküman sitesi (2026-11-25)
https://korui5.abapnews.com (EN varsayılan, `/tr/`), Cloudflare Worker `korui5`, yalnız statik varlık. Biçim kuralları ve bulunan kütüphane kusurları (MessageList `[data-state]`, Theme geçersiz renk, Tooltip önceliği) `web/PLAN.md` içinde.
- API tablosu `src` metadata'sından üretilir; İngilizcesi `web/content/api-en.json`. Örnekler UI5 1.108.55'i sdk.openui5.org'dan yükler.
- Genel `cf` 0.x klasör yayınlayamaz; `web/` içindeki 1.0 rc kullanılır.
- Sitedeki kütüphane yereldeki `src` derlemesidir, npm sürümünden ileride olabilir.
- Arka plandaki sekmede IntersectionObserver çalışmaz; paralel denetimde her işçiye ayrı Chrome açılır.
- github.io/kor-ui5 aynı sitenin alt yoldaki kopyasıdır (2026-11-25): `DOCS_BASE=/kor-ui5 npm run docs`, `pages.yml` her push'ta yayımlar; canonical korui5.abapnews.com. Denetim: `DOCS_BASE=/kor-ui5 npm run docs:check`. Demo artık `/kor-ui5/demo/`.
- Örnek uygulamalar ayrı depoda: `../kor-ui5-examples` (github.io/kor-ui5-examples).
- Kusur: Flow açık zeminde okunmaz (etiketler sabit açık renk); sitede örnek zemini koyulaştırıldı.
