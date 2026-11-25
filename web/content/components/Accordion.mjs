export default {
	children: ["AccordionItem"],
	summary: { en: "Expands and collapses sections of content.", tr: "İçerik bölümlerini açıp kapatır." },
	use: { en: ["Hide secondary content that some users need."], tr: ["Her kullanıcıya gerekmeyen içeriği katla."] },
	related: ["Tabs", "Card"],
	samples: [
		{
			title: { en: "Delivery questions", tr: "Teslimat soruları" },
			xml: `<k:Accordion multiple="false">
				<k:AccordionItem title="[[Delivery||Teslimat]]" text="[[Address and carrier||Adres ve taşıyıcı]]" icon="truck" open="true"><k:Text text="[[Delivered to the Gebze warehouse.||Gebze deposuna teslim edilir.]]"/></k:AccordionItem>
				<k:AccordionItem title="[[Documents||Belgeler]]" icon="file-text" count="3" state="info"><k:Text text="[[Invoice, waybill and certificate.||Fatura, irsaliye ve sertifika.]]"/></k:AccordionItem>
			</k:Accordion>`
		}
	]
};
