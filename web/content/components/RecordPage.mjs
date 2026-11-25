export default {
	children: ["RecordSection"],
	summary: { en: "Lays out a record with a header and sections.", tr: "Kaydı başlık ve bölümlerle düzenler." },
	use: { en: ["Use it as the main page of a business object."], tr: ["Bir iş nesnesinin ana sayfası olarak kullan."] },
	related: ["Details", "Breadcrumbs"],
	samples: [
		{
			title: { en: "Order page", tr: "Sipariş sayfası" },
			xml: `<k:RecordPage height="420px" title="[[Order 4711||Sipariş 4711]]" subtitle="Deniz Tekstil" state="info" statusText="[[In production||Üretimde]]">
				<k:actions><k:Button text="[[Edit||Düzenle]]" icon="pencil"/></k:actions>
				<k:summary><k:Details columns="3"><k:Detail label="[[Total||Toplam]]" value="18.400 TRY"/><k:Detail label="[[Delivery||Teslimat]]" value="12.12.2026"/></k:Details></k:summary>
				<k:RecordSection key="items" title="[[Items||Kalemler]]"><k:Skeleton/></k:RecordSection>
				<k:RecordSection key="docs" title="[[Documents||Belgeler]]"><k:List><k:ListItem icon="file-text" title="[[Contract||Sözleşme]]"/><k:ListItem icon="file-text" title="[[Drawing||Çizim]]"/></k:List></k:RecordSection>
				<k:RecordSection key="log" title="[[History||Geçmiş]]"><k:Activity><k:ActivityItem person="Ada Yılmaz" text="[[created the order||siparişi oluşturdu]]" time="09:12"/></k:Activity></k:RecordSection>
			</k:RecordPage>`
		}
	]
};
