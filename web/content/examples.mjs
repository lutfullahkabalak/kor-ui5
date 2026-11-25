const repo = "https://github.com/lutfullahkabalak/kor-ui5";
const copy = {
	en: {
		title: "Examples",
		summary: "Explore a full demo and a small project you can run locally.",
		demo: "Kor demo",
		demoText: "Follow orders from quote to payment, move cards on the work board and reschedule production. The component gallery shows inputs, dialogs and feedback in use.",
		orders: "Orders",
		ordersText: "Open an order from a JSON-bound DataGrid and edit its delivery details in a Sheet. The project uses the published kor-ui5 package and includes English and Turkish resource bundles.",
		apps: "More applications",
		appsText: "Six standalone applications: a TypeScript starter, OData V2 editing, approvals, production planning, a dashboard and a page without a build step.",
		gallery: "Open the gallery",
		live: "Open live example",
		source: "View source",
		zip: "Download project ZIP"
	},
	tr: {
		title: "Örnekler",
		summary: "Kapsamlı demoyu incele ve küçük sipariş projesini yerelde çalıştır.",
		demo: "Kor demosu",
		demoText: "Siparişleri teklif aşamasından tahsilata kadar izle, iş panosunda kart taşı ve üretim planını güncelle. Bileşen galerisinde giriş alanlarını, pencereleri ve geri bildirimleri dene.",
		orders: "Siparişler",
		ordersText: "JSON verisine bağlı DataGrid’den bir sipariş aç ve Sheet panelinde teslimat bilgilerini düzenle. Proje yayımlanmış kor-ui5 paketini kullanır, İngilizce ve Türkçe çeviri dosyalarını içerir.",
		apps: "Diğer uygulamalar",
		appsText: "Tek başına çalışan altı uygulama: TypeScript başlangıcı, OData V2 düzenleme, onaylar, üretim planı, pano ve derlemesiz sayfa.",
		gallery: "Galeriyi aç",
		live: "Canlı örneği aç",
		source: "Kaynak kodu gör",
		zip: "Proje ZIP’ini indir"
	}
};

function body(lang) {
	const t = copy[lang];
	return `<h1>${t.title}</h1><p class="lead">${t.summary}</p>
<section aria-labelledby="demo"><h2 id="demo">${t.demo}</h2><p>${t.demoText}</p>
<p class="rel"><a href="/demo/?lang=${lang}">${t.live}</a><a href="${repo}/tree/main/test/demo">${t.source}</a></p></section>
<section aria-labelledby="orders"><h2 id="orders">${t.orders}</h2><p>${t.ordersText}</p>
<p class="rel"><a href="/examples/orders/app/?lang=${lang}">${t.live}</a><a href="${repo}/tree/main/web/examples/orders">${t.source}</a><a href="/examples/orders/orders.zip" download>${t.zip}</a></p></section>
<section aria-labelledby="apps"><h2 id="apps">${t.apps}</h2><p>${t.appsText}</p>
<p class="rel"><a href="https://lutfullahkabalak.github.io/kor-ui5-examples/${lang === "tr" ? "tr/" : ""}">${t.gallery}</a><a href="https://github.com/lutfullahkabalak/kor-ui5-examples">${t.source}</a></p></section>`;
}

export default {
	summary: { en: copy.en.summary, tr: copy.tr.summary },
	body: { en: body("en"), tr: body("tr") }
};
