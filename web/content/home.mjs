const c = {
	en: { h: "Enterprise UI5, without the Fiori look.", lead: "Forty controls for OpenUI5 and SAPUI5 1.108+. Native UI5 controls with their own typeface, icons and motion, bound to your models in XML views.", start: "Get started", demo: "Open the demo", gridH: "Ten thousand rows, edited in place", gridT: "DataGrid draws only what is on screen. Select a range to see its total, paste from Excel, and edit cells that write straight back to your model.", planH: "Plan where the work is", planT: "Board, Schedule and Flow show what is stuck, who is late and what comes next. A keyboard alternative is there for every drag.", all: "All components", flowH: "Try it here", grid: "Orders screen of the demo", flow: "Flow screen of the demo", plan: "Production plan screen of the demo" },
	tr: { h: "Fiori görünümü olmadan kurumsal UI5.", lead: "OpenUI5 ve SAPUI5 1.108+ için kırk bileşen. Kendi yazı tipi, simgeleri ve hareketi olan yerel UI5 kontrolleri; XML görünümlerinde modellerinize bağlanır.", start: "Başlayın", demo: "Demoyu açın", gridH: "On bin satır, yerinde düzenleme", gridT: "DataGrid yalnızca ekranda görüneni çizer. Aralık seçince toplamı görürsünüz, Excel'den yapıştırırsınız, düzenlenen hücre doğrudan modele yazılır.", planH: "İş neredeyse plan orada", planT: "Board, Schedule ve Flow neyin takıldığını, kimin geciktiğini ve sıradakini gösterir. Her sürüklemenin klavye karşılığı vardır.", all: "Tüm bileşenler", flowH: "Burada deneyin", grid: "Demonun sipariş ekranı", flow: "Demonun akış ekranı", plan: "Demonun üretim planı ekranı" }
};
function shot(screen, lang, alt, hash = "") {
	const loading = screen === "flow" ? 'fetchpriority="high"' : "";
	return `<a class="shot" href="/demo/?lang=${lang}${hash}">${["light", "dark"].map((mode) =>
		`<img data-shot-mode="${mode}" src="/assets/shots/${screen}-${lang}-${mode}.jpg" width="1440" height="900" alt="${alt}" loading="lazy" ${loading}>`
	).join("")}</a>`;
}

export default {
	title: { en: "Kor: enterprise components for UI5", tr: "Kor: UI5 için kurumsal bileşenler" },
	summary: { en: c.en.lead, tr: c.tr.lead },
	body(lang, { b, sample, comps, groups, compUrl }) {
		const t = c[lang];
		return `<div class="hero"><h1>${t.h}</h1><p class="lead">${t.lead}</p><div class="cta"><a class="go" href="${b}guides/getting-started/">${t.start}</a><a href="/demo/?lang=${lang}">${t.demo}</a><code>npm install kor-ui5</code></div></div>
${shot("flow", lang, t.flow)}
<h2>${t.flowH}</h2>${sample({ ...comps.DataGrid.samples[0] })}
<div class="pair"><div><h2>${t.planH}</h2><p>${t.planT}</p></div>${shot("plan", lang, t.plan, "#plan")}</div>
<h2>${t.all}</h2><div class="homeComps">${groups.map((g) => `<div><h3>${g.title[lang]}</h3>${g.items.filter((n) => comps[n]).map((n) => `<a href="${compUrl(n, lang)}">${n}</a>`).join("")}</div>`).join("")}</div>`;
	}
};
