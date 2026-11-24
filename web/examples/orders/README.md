# Kor Orders / Kor Siparişler

## English

This UI5 sample uses the published `kor-ui5` package. It binds a JSON order list to DataGrid and uses a Sheet with a Form to edit the delivery date, status and dispatch note. Changes are held in memory until the page reloads.

With Node.js 22 or later, run these commands from the extracted project directory.

```sh
npm i
npx ui5 serve
```

Open `/index.html` at the URL printed by UI5 Tooling, usually [http://localhost:8080/index.html](http://localhost:8080/index.html). English is the default. Select **TR** or open [the Turkish version](http://localhost:8080/index.html?lang=tr). Select an order number, edit the delivery details and save. Use Cancel to discard edits.

The library dependency is declared in `webapp/manifest.json`. The view is in `webapp/view/`, messages in `webapp/i18n/` and sample orders in `webapp/model/orders.json`.

## Türkçe

Bu UI5 örneği yayımlanmış `kor-ui5` paketini kullanır. JSON sipariş listesini DataGrid’e bağlar. Teslim tarihini, durumu ve sevkiyat notunu düzenlemek için Sheet içinde Form kullanır. Değişiklikler sayfa yenilenene kadar bellekte tutulur.

Node.js 22 veya üzeriyle, arşivden çıkardığın proje dizininde bu komutları çalıştır.

```sh
npm i
npx ui5 serve
```

UI5 Tooling’in yazdığı adreste `/index.html` sayfasını aç. Varsayılan port kullanılıyorsa adres [http://localhost:8080/index.html](http://localhost:8080/index.html). Varsayılan dil İngilizcedir. **TR** düğmesini seçerek veya [Türkçe adresi](http://localhost:8080/index.html?lang=tr) açarak dili değiştir. Sipariş numarasını seç, teslimat ayrıntılarını düzenle ve kaydet. Düzenlemeleri uygulamadan çıkmak için Vazgeç’i seç.

Kütüphane bağımlılığı `webapp/manifest.json` dosyasında tanımlıdır. Görünüm `webapp/view/`, çeviriler `webapp/i18n/`, örnek siparişler `webapp/model/orders.json` içindedir.
