export default {
	title: { en: "OData V2 and V4", tr: "OData V2 ve V4" },
	summary: { en: "Connect the grid and lookup field to OData list bindings.", tr: "Tabloyu ve değer yardımı alanını OData liste bağlamalarına bağla." },
	body: {
		en: `## V4 list binding

Supply a collection path on \`rows\`. Request \`$count\` when your service supports it so the grid can show the known total. Sort and filter through the UI5 binding. For a directly submitted edit, UI5 sends PATCH. The grid restores the old cell value on rejection.

\`\`\`xml
<k:DataGrid xmlns:k="kor.ui" rows="{path: '/Orders', parameters: {$count: true}}">
  <k:columns><k:Column label="Amount" path="Amount" type="number" editable="true"/></k:columns>
</k:DataGrid>
\`\`\`

## V2 list binding

Use a \`TwoWay\` model for editing and submit deferred changes with \`submitChanges\`. \`defaultCountMode: "Inline"\` is recommended when supported by the service. Decimal values that come from OData as strings remain strings after editing. V2 \`Edm.DateTime\` values used as dates are read and written as UTC days.

## Search and hierarchy

[LookupField](/components/lookup-field/) uses a list binding for suggestions and another for the dialog. Text filters use OData contains or substringof, with case sensitivity determined by the server. JSON and OData V2 client-mode hierarchies work with [TreeGrid](/components/tree-grid/). OData V4 hierarchies are unsupported.

Mock-server tests cover paging, counts, sorting, filtering, selection and editing in Chrome. A real SAP Gateway or RAP service is **not tested**.`,
		tr: `## V4 liste bağlaması

\`rows\` üzerinde koleksiyon yolunu ver. Hizmet destekliyorsa \`$count\` iste, böylece tablo toplam satır sayısını gösterebilir. Sıralama ve süzme UI5 bağlamasıyla yapılır. Değişiklik doğrudan gönderildiğinde UI5 bir PATCH isteği yapar. İstek reddedilirse tablo hücreyi önceki değerine döndürür.

\`\`\`xml
<k:DataGrid xmlns:k="kor.ui" rows="{path: '/Orders', parameters: {$count: true}}">
  <k:columns><k:Column label="Tutar" path="Amount" type="number" editable="true"/></k:columns>
</k:DataGrid>
\`\`\`

## V2 liste bağlaması

Düzenleme için \`TwoWay\` model kullan ve ertelenen değişiklikleri \`submitChanges\` ile gönder. Hizmet destekliyorsa \`defaultCountMode: "Inline"\` önerilir. OData’dan metin olarak gelen Decimal değerleri düzenlemeden sonra da metin kalır. Tarih olarak kullanılan V2 \`Edm.DateTime\` değerleri UTC günü olarak okunur ve yazılır.

## Arama ve hiyerarşi

[LookupField](/components/lookup-field/) öneriler ve değer yardımı penceresi için ayrı liste bağlamaları kullanır. Metin süzgeçleri OData contains veya substringof gönderir. Büyük küçük harf duyarlılığı sunucuya bağlıdır. JSON ve OData V2 istemci kipi hiyerarşileri [TreeGrid](/components/tree-grid/) ile çalışır. OData V4 hiyerarşileri desteklenmez.

Chrome’da sahte sunucularla sayfalama, toplam sayısı, sıralama, süzme, seçim ve düzenleme denendi. Gerçek SAP Gateway veya RAP hizmeti **denenmedi**.`
	}
};
