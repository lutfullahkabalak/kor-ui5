# korui5.abapnews.com: plan ve ilerleme

Amaç: Kor için OpenUI5 SDK'sı benzeri, herkese açık dokümantasyon + canlı örnekler + kapsamlı demo.
Varsayılan dil İngilizce (`/`), Türkçe `/tr/`. Her metin iki dilde. Yayın: Cloudflare Workers statik varlık.

**Devam eden kişi:** yukarıdan aşağı ilk boş kutudan sürdür, bitirince `[x]` yap ve commit'le. Push etme, deploy etme (D bölümü hariç: onu Claude yapar).

## Kurallar
- `web/build.mjs` → `web/dist`. Komutlar: `npm run build` (kök, bir kez; `dist/` üretir), `npm run docs`, `npm run docs:check` (tüm canlı örnekleri Chrome'da çalıştırır, hata varsa çıkış 1).
- Başvuru sayfaları: `content/components/Button.mjs`, `content/components/DataGrid.mjs`. Biçimi oradan al.
- Yerelleştirilen değer `{en, tr}`; örnek XML/JS/veri içindeki metin `[[English||Türkçe]]`.
- API tablosu kaynaktan (`src/*.ts` metadata) otomatik gelir; içerikte tekrar yazma. Türkçe açıklama JSDoc'tan, İngilizce açıklama `content/api-en.json` (`"Button.text": "..."`, sınıf açıklaması `"Button"`).
- Her özelliği/olayı kullanmadan önce `src/<Ad>.ts` kaynağından doğrula, uydurma. Ölçülmemiş iddia, müşteri adı, gizli bilgi yok. Veriler uydurma.
- Üslup: kısa, somut, pazarlama dili yok. Türkçe doğal olsun (çeviri kokmasın), İngilizce sade.
- Örnek sayfa başına: basit 1, gerçekçi 1-3 örnek. Olaylar çalışsın (Toast ile görünür sonuç).
- Alt öğeler (Column, NavItem, ...) üst bileşenin sayfasında `children` ile belgelenir; ayrı içerik dosyası gerekmez.
- Codeda 1.108 sonrası API yok.

## A. Altyapı (Claude)
- [x] build.mjs, docs.css, docs.js, arama, tema, dil geçişi, canlı örnek, deneme alanı (playground)
- [x] docs:check denetimi
- [x] Button ve DataGrid başvuru sayfaları
- [x] Ana sayfa

## B. İçerik (Codex)
- [x] B1 `content/api-en.json`: tüm sınıf/özellik/olay/metot (`npm run docs` eksikleri sayar; 0 olmalı)
- [x] B2 Uygulama: Shell(NavItem), CommandPalette(Command), Sheet, Dialog, Confirm, Popover, Tooltip, Tabs(Tab), Toast, Theme
- [x] B3 Veri: TreeGrid, FilterBar(FilterField), Variants, Flow(FlowNode, FlowLink), Trend(Series), Stat
- [x] B4 Planlama: Board(BoardColumn, BoardCard), Schedule(ScheduleLane, ScheduleTask), Stages(Stage), Activity(ActivityItem)
- [x] B5 Giriş: TextField, NumberField, SelectField, MultiSelect, LookupField, DateField, DateRangeField, RadioGroup(RadioItem), Toggle, Check, Segmented, FileDrop(FileItem), Form(FormSection)
- [x] B6 Temel: HoldButton, Status, Person, Icon, Message, MessageList(MessageItem), Skeleton, Empty, Text, Stack (Icon sayfasında tüm simge adları listelensin)
- [x] B7 Kılavuzlar `content/guides/`: getting-started, no-build (ABAP BSP/zip), theming, odata, models-and-binding, accessibility, localization, limits. Kaynak: README, docs/knowledge/kor.md, src. Doğrulanmamışı "not tested" diye yaz.

## C. Örnek uygulamalar (Codex)
- [x] C1 `test/demo` iki dilli: `?lang=en|tr` (varsayılan en), sayfa içi EN/TR geçişi, veri ve tarih/sayı biçimi dahil. `npm test` bozulmasın. Docs'a dönüş bağlantısı.
- [x] C2 `web/examples/orders/`: indirilebilir küçük UI5 projesi (npm'deki `kor-ui5`, manifest, i18n en+tr, XML view, liste + ayrıntı paneli + form + JSON verisi, README en+tr). `web/examples/*` siteye zip olarak ve çalışır halde (`/examples/orders/app/`) konur; build.mjs bunu yapar (zip: sistem `zip`).
- [x] C4 Ana sayfa görüntüleri: `scripts/shots.mjs` (puppeteer-core) demodan en/tr × light/dark `web/assets/shots/{flow,plan}-{en|tr}-{light|dark}.jpg` üretir (1440×900, kalite 82); `content/home.mjs` bunları temaya göre gösterir (CSS `[data-kor-mode]` ile).
- [x] C3 `/examples/` sayfası (en/tr): demo ve orders tanıtımı, canlı bağlantı, kaynak/zip.

## D. Yayın (Claude)
- [ ] Codex işini gözden geçir, tarayıcıda dolaş (açık/koyu, 390 px, en/tr)
- [ ] `cf deploy`, özel alan adı, canlı doğrulama
- [ ] README ve bilgi tabanı bağlantıları

## Codex notları

- Yerel derlemede 114 sayfa üretildi. Eksik içerik ve İngilizce API açıklaması 0. Chrome’da bileşen sayfaları, tüm site bağlantıları ve seçili örnek etkileşimleri geçti. QUnit sonucu her UI5 sürümünde 39 Kor ve 17 OData testi.
- Sipariş projesi dokümantasyondaki statik adresten ve indirilen arşiv açılarak denendi. Arşivde `npm i && npx ui5 serve` npm’den yayımlanmış `kor-ui5@0.1.0` sürümünü kullandı. UI5 CLI sunucusunun yazdığı adreste `/index.html` açılır. `npm audit --omit=dev` bulgu vermedi. Kurulum, geliştirme bağımlılıkları için 21 orta ve 4 yüksek düzeyli bulgu bildirdi.
- `Stack` metadata’sında `wrap` yok. Button örneğindeki öznitelik kaldırıldı. `Sheet` kendi popup’ını yaratmadığı için çizilen görünüm ağacına eklenmeli. Örnek bu düzenle değiştirildi.
- `MessageList` tıklanan düğmenin üst öğelerinde sınırsız `[data-state]` arıyor. Bu yüzden örnek kapsayıcısının durum özniteliği mesaj tıklamasını yutuyordu. Dokümantasyon motoru `data-sample-state` kullanıyor. Kütüphane davranışı aynı.
- `Tooltip` denetiminde düğmenin oluşturduğu `data-kor-tip`, `dependents` içindeki ipucundan önce geliyor. Ayrı açıklama gösteren örnekte düğmenin görünür metni kullanıldı.
- `Theme.set()` vurgu rengini doğrulamadan önce iç ayarlara yazıyor. Geçersiz bir renk sonraki çağrıları da hata durumuna sokabiliyor. Geçerli bir renk verilince düzeliyor.
- Gerçek SAP Gateway/RAP, gerçek OData V2 ağaç servisi, MessageManager, ekran okuyucu, dokunmatik sürükleme, Safari/Firefox ve ABAP BSP/Launchpad denenmedi. D bölümündeki yayın işleri bekliyor.
