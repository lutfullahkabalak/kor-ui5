export default {
	title: { en: "Models and binding", tr: "Modeller ve bağlama" },
	summary: { en: "Bind controls to UI5 models and choose when to supply an aggregation template.", tr: "Kontrolleri UI5 modellerine bağla ve hangi alt öğelerin şablon istediğini öğren." },
	body: {
		en: `## Properties and normal aggregations

Set a model on the view. A property like \`value="{/draft/customer}"\` reads an absolute model path. In an aggregation template, \`{name}\` is relative to the entry. Below, \`core:Item\` is the template for each entry in \`/warehouses\`.

\`\`\`xml
<k:SelectField xmlns:k="kor.ui" xmlns:core="sap.ui.core"
    label="Warehouse" selectedKey="{/draft/warehouse}"
    items="{path: '/warehouses', templateShareable: false}">
  <core:Item key="{id}" text="{name}"/>
</k:SelectField>
\`\`\`

## Row bindings

[DataGrid](/components/data-grid/) and [LookupField](/components/lookup-field/) read contexts directly from \`rows\`. Supply the path and optional UI5 binding parameters. Set column paths relative to each row. [TreeGrid](/components/tree-grid/) needs a tree binding. For JSON data, give UI5 the child array names.

\`\`\`xml
<k:TreeGrid xmlns:k="kor.ui" rows="{path: '/nodes', parameters: {arrayNames: ['children']}}">
  <k:columns><k:Column label="Cost center" path="name"/></k:columns>
</k:TreeGrid>
\`\`\`

## Filters and saved views

Use [FilterBar](/components/filter-bar/) to produce UI5 filters. Pass the \`filters\` parameter from \`change\` to \`grid.getBinding("rows").filter(filters)\`. [Variants](/components/variants/) uses its targets' \`getState\` and \`setState\` methods. Use \`storageKey\` for browser storage, or bind \`variants\` and save updates from \`change\` in the application.`,
		tr: `## Özellikler ve şablonlu alt öğeler

Modeli görünüme ekle. \`value="{/draft/customer}"\` gibi bir özellik mutlak model yolunu okur. Alt öğe şablonundaki \`{name}\` ise her kayda göre göreli yoldur. Aşağıda \`core:Item\`, \`/warehouses\` altındaki her kayıt için kullanılan şablondur.

\`\`\`xml
<k:SelectField xmlns:k="kor.ui" xmlns:core="sap.ui.core"
    label="Depo" selectedKey="{/draft/warehouse}"
    items="{path: '/warehouses', templateShareable: false}">
  <core:Item key="{id}" text="{name}"/>
</k:SelectField>
\`\`\`

## Satır bağlamaları

[DataGrid](/components/data-grid/) ve [LookupField](/components/lookup-field/) bağlamları doğrudan \`rows\` üzerinden okur. Yolu ve varsa UI5 bağlama parametrelerini ver. Sütun yollarını satıra göre yaz. [TreeGrid](/components/tree-grid/) ağaç bağlaması ister. JSON verisinde alt kayıt dizilerinin adlarını UI5’e bildir.

\`\`\`xml
<k:TreeGrid xmlns:k="kor.ui" rows="{path: '/nodes', parameters: {arrayNames: ['children']}}">
  <k:columns><k:Column label="Maliyet merkezi" path="name"/></k:columns>
</k:TreeGrid>
\`\`\`

## Süzgeçler ve kayıtlı görünümler

UI5 süzgeçleri üretmek için [FilterBar](/components/filter-bar/) kullan. \`change\` olayının \`filters\` parametresini \`grid.getBinding("rows").filter(filters)\` çağrısına ver. [Variants](/components/variants/), hedeflerinin \`getState\` ve \`setState\` metotlarını kullanır. Tarayıcıda saklamak için \`storageKey\` ayarla. Uygulamada saklamak için \`variants\` özelliğini bağla ve \`change\` ile gelen güncellemeleri kaydet.`
	}
};
