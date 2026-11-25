export default {
	children: ["Detail"],
	summary: { en: "Shows the fields of a record as labels and values.", tr: "Kaydın alanlarını etiket ve değer olarak gösterir." },
	use: { en: ["Use it for read only record data."], tr: ["Salt okunur kayıt verisi için kullan."] },
	related: ["Form", "RecordPage"],
	samples: [
		{
			title: { en: "Order details", tr: "Sipariş ayrıntıları" },
			xml: `<k:Details columns="3">
				<k:Detail label="[[Order||Sipariş]]" value="4500012345" copyable="true"/>
				<k:Detail label="[[Customer||Müşteri]]" value="Deniz Tekstil"/>
				<k:Detail label="[[Status||Durum]]"><k:Status text="[[Released||Onaylandı]]" state="success"/></k:Detail>
				<k:Detail label="[[Address||Adres]]" value="Organize Sanayi Bölgesi 12, Bursa" icon="map-pin" wide="true"/>
			</k:Details>`
		}
	]
};
