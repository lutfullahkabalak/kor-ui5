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
- [ ] B4 Planlama: Board(BoardColumn, BoardCard), Schedule(ScheduleLane, ScheduleTask), Stages(Stage), Activity(ActivityItem)
- [ ] B5 Giriş: TextField, NumberField, SelectField, MultiSelect, LookupField, DateField, DateRangeField, RadioGroup(RadioItem), Toggle, Check, Segmented, FileDrop(FileItem), Form(FormSection)
- [ ] B6 Temel: HoldButton, Status, Person, Icon, Message, MessageList(MessageItem), Skeleton, Empty, Text, Stack (Icon sayfasında tüm simge adları listelensin)
- [ ] B7 Kılavuzlar `content/guides/`: getting-started, no-build (ABAP BSP/zip), theming, odata, models-and-binding, accessibility, localization, limits. Kaynak: README, docs/knowledge/kor.md, src. Doğrulanmamışı "not tested" diye yaz.

## C. Örnek uygulamalar (Codex)
- [ ] C1 `test/demo` iki dilli: `?lang=en|tr` (varsayılan en), sayfa içi EN/TR geçişi, veri ve tarih/sayı biçimi dahil. `npm test` bozulmasın. Docs'a dönüş bağlantısı.
- [ ] C2 `web/examples/orders/`: indirilebilir küçük UI5 projesi (npm'deki `kor-ui5`, manifest, i18n en+tr, XML view, liste + ayrıntı paneli + form + JSON verisi, README en+tr). `web/examples/*` siteye zip olarak ve çalışır halde (`/examples/orders/app/`) konur; build.mjs bunu yapar (zip: sistem `zip`).
- [ ] C4 Ana sayfa görüntüleri: `scripts/shots.mjs` (puppeteer-core) demodan en/tr × light/dark `web/assets/shots/{flow,plan}-{en|tr}-{light|dark}.jpg` üretir (1440×900, kalite 82); `content/home.mjs` bunları temaya göre gösterir (CSS `[data-kor-mode]` ile).
- [ ] C3 `/examples/` sayfası (en/tr): demo ve orders tanıtımı, canlı bağlantı, kaynak/zip.

## D. Yayın (Claude)
- [ ] Codex işini gözden geçir, tarayıcıda dolaş (açık/koyu, 390 px, en/tr)
- [ ] `cf deploy`, özel alan adı, canlı doğrulama
- [ ] README ve bilgi tabanı bağlantıları
