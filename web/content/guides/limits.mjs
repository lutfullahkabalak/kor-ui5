export default {
	title: { en: "Compatibility and limits", tr: "Uyumluluk ve sınırlar" },
	summary: { en: "See the tested environments and the remaining compatibility gaps.", tr: "Denenen ortamları ve henüz doğrulanmamış uyumluluk noktalarını gör." },
	body: {
		en: `## Tested

- OpenUI5 1.108.55 and 1.154.0 in Chrome with QUnit.
- JSON models, OData V2 with UI5 MockServer and an OData V4 test double.
- TreeGrid with JSON and OData V2 in client mode.

## Unsupported

- TreeGrid with an OData V4 hierarchy.
- Touch dragging on Board and Schedule. Keyboard movement is available.
- Browsers without CSS \`color-mix()\` and \`:has()\`.

## Not tested

- Safari, Firefox and other UI5 versions.
- Real SAP Gateway or RAP, OData V2 trees over a real service and real MessageManager integration.
- A real screen reader and deployment to ABAP BSP or Launchpad.`,
		tr: `## Denenenler

- Chrome’da OpenUI5 1.108.55 ve 1.154.0 ile QUnit.
- JSON modelleri, UI5 MockServer ile OData V2 ve test için hazırlanmış sahte OData V4 sunucusu.
- JSON ve istemci kipindeki OData V2 ile TreeGrid.

## Desteklenmeyenler

- OData V4 hiyerarşisi ile TreeGrid.
- Board ve Schedule üzerinde dokunarak sürükleme. Klavyeyle taşıma kullanılabilir.
- CSS \`color-mix()\` ve \`:has()\` desteği bulunmayan tarayıcılar.

## Denenmeyenler

- Safari, Firefox ve diğer UI5 sürümleri.
- Gerçek SAP Gateway veya RAP, gerçek hizmet üzerinde OData V2 ağacı ve gerçek MessageManager bağlantısı.
- Gerçek ekran okuyucu ve ABAP BSP veya Launchpad dağıtımı.`
	}
};
