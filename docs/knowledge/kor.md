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
QUnit 94/94 (42 genel, 35 sektör, 17 OData) ve tarayıcı etkileşim turu (aralık, düzenleme, sıralama, süzgeç, panel, palet, pano, plan, akış, basılı tut) 1.108.55 ve 1.154.0. Koyu, 390 px ve RTL ekran görüntüsüyle bakıldı.

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
2. Yapıldı: TreeGrid, sütun ayarı, Variants, LookupField, sihirbaz, saat ve tarih-saat, List, ColumnLayout, Splitter, RecordPage, Breadcrumbs, MonthCalendar, Slider, Rating, Accordion, Inbox, Progress, Card.
3. Kalan: DataGrid'de gruplama ve alt toplam, Excel'e aktarma, hafta takvimi, menü çubuğu, çift listeli aktarım, tur, renk seçici, karusel, PDF, QR/barkod.

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
- `web/examples/orders`, yayımlanmış `kor-ui5@0.2.0` ile UI5 CLI üzerinden çalışır. `npm i && npx ui5 serve` sonrası sunucunun yazdığı adreste `/index.html` açılır. Site derlemesi bu projeyi arşivler ve statik kopyanın UI5 adresiyle `kor.ui` kaynak kökünü değiştirir.
- `node scripts/shots.mjs` kök derlemenin `site/` çıktısından 1440×900 ana sayfa görsellerini üretir. Tarayıcı yolu gerekirse `CHROME_PATH` ile verilir. Siteyi yerelde ve iki dilde doğruladık. Yayın adımları `web/PLAN.md` D bölümündedir.

## Doküman sitesi (2026-11-25)
https://korui5.abapnews.com (EN varsayılan, `/tr/`), Cloudflare Worker `korui5`, yalnız statik varlık. Biçim kuralları ve bulunan kütüphane kusurları (MessageList `[data-state]`, Theme geçersiz renk, Tooltip önceliği) `web/PLAN.md` içinde.
- API tablosu `src` metadata'sından üretilir; İngilizcesi `web/content/api-en.json`. Örnekler UI5 1.108.55'i sdk.openui5.org'dan yükler.
- Genel `cf` 0.x klasör yayınlayamaz; `web/` içindeki 1.0 rc kullanılır.
- Sitedeki kütüphane yereldeki `src` derlemesidir, npm sürümünden ileride olabilir.
- Arka plandaki sekmede IntersectionObserver çalışmaz; paralel denetimde her işçiye ayrı Chrome açılır.
- github.io/kor-ui5 aynı sitenin alt yoldaki kopyasıdır (2026-11-25): `DOCS_BASE=/kor-ui5 npm run docs`, `pages.yml` her push'ta yayımlar; canonical korui5.abapnews.com. Denetim: `DOCS_BASE=/kor-ui5 npm run docs:check`. Demo artık `/kor-ui5/demo/`.
- Örnek uygulamalar ayrı depoda: `../kor-ui5-examples` (github.io/kor-ui5-examples).
- Trafik (2026-11-26): Cloudflare Web Analytics sitesi `korui5.abapnews.com` (elle kurulum, site_tag `0e2c4bdd…`). abapnews.com zone'unun otomatik RUM'u Worker statik yanıtlarına beacon basmaz; bu yüzden `build.mjs` her HTML'e (demo, örnekler dahil) beacon ekler, localhost'ta yüklemez. github.io kopyası da aynı token ile sayılır (host'a göre ayrılır). Beacon öncesi ham trafik için zone SQL'i: `cf sql query "... FROM events.httpRequests WHERE clientRequestHttpHost='korui5.abapnews.com' ..." --scope-zone <zone>`; ORDER BY için LIMIT şart, `multiIf` yok, `sampleInterval` ile toplanır.
- Kusur: Flow açık zeminde okunmaz (etiketler sabit açık renk); sitede örnek zemini koyulaştırıldı.

## Sektör aileleri ve eksik bileşenler (2026-11-25)
39 yeni bileşen eklendi (liste: CHANGELOG Unreleased). Seçimin dayanağı: component.gallery sayıları (Accordion 101, List 67, Breadcrumbs 55, Progress 40, Slider 38, Stepper 20, Rating 19), UI5 Web Components ve Ant Design listeleri (TimePicker, Wizard, NotificationList, PromptInput, Splitter, TreeSelect, Descriptions), AG Grid'in ücretli özellikleri (Pivot). Sahibi ayrıca kargo, üretim, bankacılık, eğitim ve İK ailelerini istedi.
- `busy` özellik adı kullanılmaz: sap.ui.core.Control'ün kendi `busy`si vardır ve yeniden çizmez. Yerine `working`.
- Araç çizimleri `src/vehicles.ts` (unsafeHtml; yalnız sabit metin). Süreç ve ürün simgeleri `src/processes.ts`; yeni süreç eklenince simge `scripts/icons.mjs` listesine de girmeli (Sector testi denetler).
- İç içe konabilen bileşenlerde tıklama `data-of=<id>` ile kendi kökünden ayrılır.
- Shipment yeri duraklardan bulur: `info` yolda, `wait`/`danger` o durakta durur; `progress` verilirse o geçerli. Bacağın aracı, çıkılan durağın `mode` değeridir.
- BankCard yalnız son dört haneyi DOM'a yazar. Link ve Breadcrumbs `safeHref` ile javascript:/data: adreslerini eler.
- DockBoard ve ShiftRoster veriyi değiştirmez, olay verir; Classroom ve TalentGrid öğenin kendi özelliğini değiştirir.
- Pivot ve OrgChart tarayıcıdaki veriyle çalışır; büyük OData kümesi denenmedi.
- Doğrulama: QUnit 89/89 iki sürümde; 46 örnek açık, koyu, 390 px ve RTL (kapsayıcıya `dir`) ekran görüntüsüyle bakıldı. TimeField/DateTimeField gerçek OData ile, ekran okuyucu ve dokunmatik denenmedi.
- Doküman sitesinin çıplak `table/th/td` kuralları örneklere sızıyordu, `.tableWrap` altına alındı. 0.2.0 GitHub, npm (2026-11-26), site (iki adres) ve örnekler deposunda yayında; grafikler dahil.

## Grafikler (2026-11-26)
`Trend`, `Waterfall`, `Heatmap` yanına `PieChart` (pasta/halka, öğe `PieSlice`) ve `BarChart` (dikey/yatay, yan yana/yığın/yüzde, eksi değer; `Series` kullanır) eklendi; 0.2.0'a dahildir.
- Seri paleti 6 renk (`--kor-data1..6`, açık ve koyu denetimden geçti); 7. renk üretilmez, pastada fazlası gri "Diğer" olur.
- Dilim arası boşluk yolun geometrisindedir, çerçeve değil: grafik her zeminde durur. Tek dilim tam daire özel çizilir.
- SVG `direction: ltr`; RTL aynalama BarChart içinde `px()` ile yapılır. Trend RTL'de aynalanmaz.
- Denetlendi: QUnit 91/91 iki sürüm, açık, koyu, 390 px, RTL görüntü. Denenmedi: gerçek ekran okuyucu, dokunmatik, Safari/Firefox.
- Pages iş akışı iki işlidir (build, deploy): tek işte deploy-pages yeni yüklenen artifact'i bulamadı (2026-11-26).

## DataGrid: SAP GUI tablo deneyimi (2026-11-26)
Sahibin isteği: sütunlar sürükle-bırakla yer değiştirsin, SAP GUI (ALV) deneyimi ve kısayolları olsun, mevcut davranış kötüleşmesin.
- Başlık sürüklenir (5 px eşik, dokunmatikte kapalı): hayalet başlık, tablo boyu turuncu bırakma çizgisi, kenarda yatay kaydırma, Escape iptal. Sabit (pinned) sütun taşınmaz, önüne bırakılamaz. Sürüklemeden sonraki tıklama sıralama yapmaz.
- Ctrl/⌘+←/→ etkin sütunu taşır (UI5 tablo ve Kor Board ile aynı). Önceden bu tuşlar düz ok gibiydi.
- Sütun menüsü: başlığa sağ tık, Shift+F10 veya Menü tuşu. Artan/azalan sırala, sıralamayı kaldır, en uygun genişlik, sola/sağa taşı, gizle, Sütunlar paneli.
- Ayraçta çift tık: en uygun genişlik (64–640 px), başlık ve çizili satırlara göre; hücre kopyası `width:max-content` ile ölçülür. scrollWidth yanıltır: flex düğmede metin satır kaydırır.
- Ctrl+F arama çubuğu tablonun içinde açılır (tarayıcı aramasının yerine, yalnızca tablo odaktayken); Enter/Shift+Enter, Ctrl+G/Ctrl+Shift+G, F3. Arama görünen sütunların biçimli metninde, `fold` ile Türkçe harf duyarsız. Sunucu bağlamasında gelmemiş satırlar atlanır, sayaç "yüklenen satırlarda" der.
- SAP GUI'nin sıralama kısayolları (Ctrl+F4 artan, Ctrl+Shift+F4 azalan, Ctrl+F5 süzgeç) bilerek alınmadı: tarayıcıda Ctrl+F4 sekmeyi kapatır, Ctrl+F5 sayfayı yeniler; sayfa bunları engelleyemez. Sıralama menüden yapılır.
- Ekran okuyucu için `<id>-say` canlı alanı taşıma sonucunu söyler; tablo `aria-keyshortcuts` taşır.
- Mac'te Ctrl+ok Mission Control'e gider; ⌘ ile çalışır, menü ipucu ⌘ gösterir. Gerçek Mac kısayol çakışması ve Windows Menü tuşu elle denenmedi.
- RTL'de sürükleme ve menü yönü kodda ele alındı ama tarayıcıda denenmedi.

## Bayrak ve banka logosu (2026-11-26)
Sahibin isteği: dünyadaki tüm bayrak ve banka logolarını kapsayan özellik. `Flag` ve `BankLogo` eklendi; ayrı dal `bayrak-ve-banka-logolari` (ana depoda başka oturumun commit'lenmemiş işi vardı, worktree ile ayrıldı).
- Bayraklar `flag-icons` 7.6.0'dan (MIT): 271 bayrak, ISO 3166-1'in 249 ülkesinin tümü, İngiltere ülkeleri, bazı bölgeler, eu/un. `scripts/flags.mjs` SVG'leri `src/assets/flags/{4x3,1x1}` altına kopyalar (izlenmez, 5,2 MB; `postinstall` ve `build` çalıştırır) ve `src/flags.ts` ad tablosunu üretir (izlenir). Bayrak `<img loading=lazy>` ile yalnız görününce yüklenir; ad `Intl.DisplayNames` ile uygulama dilinde.
- Banka logosu DAĞITILMAZ: logolar tescilli marka, dünya bankalarını kapsayan açık lisanslı küme yok, depo herkese açık Apache-2.0. Kapsama BIC ile sağlanır: `kor/ui/bankLogos` modülünde `registerBankLogos` (anahtar: uygulama anahtarı → BIC11 → BIC8) ve `setBankLogoProvider` (şablon `{bic8}` vb. veya işlev). Logo yoksa veya resim yüklenemezse BIC/ad baş harfli işaret + BIC'in (yoksa IBAN'ın) ülke bayrağı çizilir.
- Kayıt değişince çizilmiş BankLogo kendiliğinden yenilenmez; kayıt görünümden önce yapılmalı (veya `invalidate`). IBAN yalnız ülke için okunur, DOM'a yazılmaz. `src` yalnız http(s), göreli ve resim `data:` kabul eder.
- Yardımcı işlevler ayrı modülde (`bankLogos.ts`): varsayılan sınıf ile adlı dışa aktarım aynı modülde olamaz (bkz. Ağaç bölümü).
- `docs-check` artık örnekteki `img` öğesini içerik sayar (bayrak örnekleri "boş" sanılıyordu).
- Doğrulandı: QUnit 96/96 (Sector 37) 1.108.55 ve 1.154.0; `docs:check /components/` 178 sayfa 0 hata; Flag ve BankLogo sayfalarına açık temada bakıldı. Python `http.server` 280 eşzamanlı istekte birkaç bayrağı düşürdü; dosyalar sağlam, gerçek sunucuda denenmedi. Koyu Kor teması, ekran okuyucu, RTL ve 390 px denenmedi.
