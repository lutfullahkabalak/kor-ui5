// Kor dokümantasyon sitesi: src/*.ts metadata + web/content -> web/dist (en kökte, tr /tr altında)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { groups, guides } from "./content/nav.mjs";

const here = import.meta.dirname, root = path.dirname(here), out = path.join(here, "dist");
const UI5 = "https://sdk.openui5.org/1.108.55/resources/sap-ui-core.js";
const ORIGIN = "https://korui5.abapnews.com", REPO = "https://github.com/lutfullahkabalak/kor-ui5";
const version = JSON.parse(fs.readFileSync(path.join(root, "package.json"))).version;
const apiEn = JSON.parse(fs.readFileSync(path.join(here, "content/api-en.json")));
const T = {
	en: { docs: "Documentation", components: "Components", guides: "Guides", demo: "Demo", playground: "Playground", examples: "Examples", search: "Search", api: "API", props: "Properties", aggs: "Aggregations", associations: "Associations", events: "Events", methods: "Methods", name: "Name", type: "Type", def: "Default", desc: "Description", use: "When to use", avoid: "When not to use", keyboard: "Keyboard", related: "Related", samples: "Examples", source: "Source", run: "Run", copy: "Copy", copied: "Copied", open: "Open in playground", theme: "Switch light or dark", menu: "Menu", home: "Home", inherits: "Also has everything from", data: "Data", notFound: "Page not found", notFoundText: "The address may have changed. Start from the component list.", skip: "Skip to content", loading: "Loading the example", none: "No results", pgText: "Edit the view and the controller, then press Run. Nothing leaves your browser.", compText: "Every control, with live examples and its full API.", failed: "The example could not start. Check your network connection and reload.", reset: "Reset" },
	tr: { docs: "Dokümantasyon", components: "Bileşenler", guides: "Kılavuzlar", demo: "Demo", playground: "Deneme alanı", examples: "Örnekler", search: "Ara", api: "API", props: "Özellikler", aggs: "Alt öğeler", associations: "İlişkiler", events: "Olaylar", methods: "Metotlar", name: "Ad", type: "Tür", def: "Varsayılan", desc: "Açıklama", use: "Ne zaman kullanılır", avoid: "Ne zaman kullanılmaz", keyboard: "Klavye", related: "İlgili", samples: "Örnekler", source: "Kaynak kod", run: "Çalıştır", copy: "Kopyala", copied: "Kopyalandı", open: "Deneme alanında aç", theme: "Açık veya koyu görünüme geç", menu: "Menü", home: "Ana sayfa", inherits: "Şunun tüm üyelerini de taşır:", data: "Veri", notFound: "Sayfa bulunamadı", notFoundText: "Adres değişmiş olabilir. Bileşen listesinden başlayabilirsiniz.", skip: "İçeriğe geç", loading: "Örnek yükleniyor", none: "Sonuç yok", pgText: "Görünümü ve denetleyiciyi düzenleyip Çalıştır düğmesine basın. Hiçbir şey tarayıcınızdan çıkmaz.", compText: "Her bileşen, canlı örnekleri ve tam API'siyle.", failed: "Örnek başlatılamadı. Ağ bağlantısını denetleyip sayfayı yenileyin.", reset: "Sıfırla" }
};
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const inline = (s) => esc(s).replace(/`([^`]+)`/g, "<code>$1</code>").replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
// İçerik dosyasındaki girinti örnek koda taşınmasın: ilk satır dışındakilerin ortak girintisi silinir
const dedent = (s) => {
	const [first, ...rest] = s.trim().split("\n");
	const cut = Math.min(...rest.filter((l) => l.trim()).map((l) => /^\t*/.exec(l)[0].length), 99);
	return [first, ...rest.map((l) => l.slice(cut))].join("\n");
};
const pick = (v, lang) => (v && typeof v === "object" && "en" in v ? v[lang] : v);
const loc = (s, lang) => s.replace(/\[\[([\s\S]*?)\|\|([\s\S]*?)\]\]/g, (_, en, tr) => (lang === "en" ? en : tr));
const slug = (n) => n.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
const base = (lang) => (lang === "en" ? "/" : "/tr/");
const compUrl = (n, lang) => `${base(lang)}components/${slug(n)}/`;
// DOCS_BASE: site alt yolda yayınlanıyorsa (github.io/kor-ui5) bağlantılara eklenir
const sub = (process.env.DOCS_BASE ?? "").replace(/\/$/, "");
const missingContent = [];

// ---- API: kaynak dosyadaki metadata okunur
const doc = (node) => (ts.getJSDocCommentsAndTags(node)[0]?.comment ?? "").toString().replace(/\s+/g, " ").trim();
function api(name) {
	const file = path.join(root, `src/${name}.ts`);
	const sf = ts.createSourceFile(file, fs.readFileSync(file, "utf8"), ts.ScriptTarget.Latest, true);
	const res = { name, text: "", parent: "", properties: [], aggregations: [], associations: [], events: [], methods: [] };
	const members = (obj) => obj.properties.filter((p) => p.name);
	const prop = (obj, key) => members(obj).find((p) => p.name.getText() === key)?.initializer;
	const raw = (n) => (n ? n.getText().replace(/^"(.*)"$/, "$1") : "");
	for (const st of sf.statements) {
		if (ts.isClassDeclaration(st) && st.name?.text === name) {
			res.text = doc(st);
			res.parent = st.heritageClauses?.[0]?.types[0].expression.getText() ?? "";
			for (const m of st.members) {
				const key = m.name?.getText();
				if (key === "metadata") {
					let obj = m.initializer;
					while (!ts.isObjectLiteralExpression(obj)) obj = obj.expression;
					for (const kind of ["properties", "aggregations", "associations", "events"]) {
						const list = prop(obj, kind);
						if (!list) continue;
						for (const p of members(list)) {
							const v = p.initializer, n = p.name.getText();
							if (kind === "events") {
								const ps = ts.isObjectLiteralExpression(v) && prop(v, "parameters");
								res.events.push({ name: n, text: doc(p), params: ps ? members(ps).map((x) => `${x.name.getText()}: ${raw(prop(x.initializer, "type")) || "any"}`) : [] });
							} else {
								const t = ts.isStringLiteral(v) ? v.text : raw(prop(v, "type"));
								const multi = (kind === "aggregations" || kind === "associations") && raw(prop(v, "multiple")) !== "false";
								res[kind].push({ name: n, text: doc(p), type: t.replace("kor.ui.", "") + (multi ? "[]" : ""), def: ts.isObjectLiteralExpression(v) ? raw(prop(v, "defaultValue")) : "" });
							}
						}
					}
				} else if (ts.isMethodDeclaration(m) && doc(m) && !m.modifiers?.some((x) => [ts.SyntaxKind.PrivateKeyword, ts.SyntaxKind.ProtectedKeyword].includes(x.kind)) && !/^(on|init$|exit$|render|handleEvent$|get\w*Role$)/.test(key)) res.methods.push({ name: key, text: doc(m), sig: `${key}(${m.parameters.map((p) => p.getText()).join(", ")})${m.type ? ": " + m.type.getText() : ""}` });
			}
		}
		// Theme, Toast, Confirm: düz nesne
		if (ts.isVariableStatement(st)) for (const d of st.declarationList.declarations) {
			if (d.name.getText() !== name || !d.initializer || !ts.isObjectLiteralExpression(d.initializer)) continue;
			res.text = doc(st);
			for (const m of d.initializer.properties) if (ts.isMethodDeclaration(m)) res.methods.push({ name: m.name.getText(), text: doc(m), sig: `${m.name.getText()}(${m.parameters.map((p) => p.getText()).join(", ")})${m.type ? ": " + m.type.getText() : ""}` });
		}
		if (ts.isFunctionDeclaration(st) && st.modifiers?.some((x) => x.kind === ts.SyntaxKind.ExportKeyword) && st.name) res.methods.push({ name: st.name.text, text: doc(st), sig: `${st.name.text}(${st.parameters.map((p) => p.getText()).join(", ")})${st.type ? ": " + st.type.getText() : ""}` });
		if (ts.isTypeAliasDeclaration(st) && st.modifiers?.some((x) => x.kind === ts.SyntaxKind.ExportKeyword)) (res.types ??= []).push(st.getText().replace(/^export /, ""));
	}
	return res;
}
const missingApi = new Set();
const desc = (key, text, lang) => {
	if (lang === "tr") return inline(text);
	if (!apiEn[key]) missingApi.add(key);
	return inline(apiEn[key] ?? "");
};
function apiHtml(name, lang, level = 3) {
	const a = api(name), t = T[lang], h = `h${level}`;
	const table = (head, rows) => `<div class="tableWrap" tabindex="0"><table><thead><tr>${head.map((x) => `<th scope="col">${x}</th>`).join("")}</tr></thead><tbody>${rows.map((r) => `<tr>${r.map((c, i) => `<td${i === 0 ? ' class="apiName"' : ""}>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
	const code = (s) => (s ? `<code>${esc(s)}</code>` : "");
	let s = "";
	if (/^(DataGrid|Button|TextField|SelectField)$/.test(a.parent)) s += `<p>${t.inherits} <a href="${compUrl(a.parent, lang)}">${a.parent}</a></p>`;
	if (a.properties.length) s += `<${h}>${t.props}</${h}>` + table([t.name, t.type, t.def, t.desc], a.properties.map((p) => [code(p.name), code(p.type), code(p.def), desc(`${name}.${p.name}`, p.text, lang)]));
	if (a.aggregations.length) s += `<${h}>${t.aggs}</${h}>` + table([t.name, t.type, t.desc], a.aggregations.map((p) => [code(p.name), code(p.type), desc(`${name}.${p.name}`, p.text, lang)]));
	if (a.associations.length) s += `<${h}>${t.associations}</${h}>` + table([t.name, t.type, t.desc], a.associations.map((p) => [code(p.name), code(p.type), desc(`${name}.${p.name}`, p.text, lang)]));
	if (a.events.length) s += `<${h}>${t.events}</${h}>` + table([t.name, t.type, t.desc], a.events.map((p) => [code(p.name), p.params.map(code).join("<br>"), desc(`${name}.${p.name}`, p.text, lang)]));
	if (a.methods.length) s += `<${h}>${t.methods}</${h}>` + table([t.name, t.desc], a.methods.map((m) => [code(m.sig), desc(`${name}.${m.name}${a.events.some((e) => e.name === m.name) ? "()" : ""}`, m.text, lang)]));
	if (a.types) s += `<pre class="code"><code>${hi(a.types.join("\n"), "js")}</code></pre>`;
	return s;
}

// ---- Kod renklendirme (küçük, bağımlılıksız)
function hi(code, kind) {
	const rules = kind === "xml"
		? [[/^<!--[\s\S]*?-->/, "c"], [/^"[^"]*"/, "s"], [/^<\/?[\w:.-]+|^\/?>/, "k"], [/^[\w:.-]+(?==)/, "a"]]
		: [[/^\/\/[^\n]*|^\/\*[\s\S]*?\*\//, "c"], [/^"(?:\\.|[^"\\\n])*"|^'(?:\\.|[^'\\\n])*'|^`[^`]*`/, "s"], [/^(?:const|let|return|new|function|if|else|for|of|import|from|export|default|class|extends|this|true|false|null|async|await|type)\b/, "k"], [/^\d+(?:\.\d+)?/, "n"]];
	let o = "", rest = code;
	while (rest) {
		const r = rules.map(([re, c]) => [re.exec(rest)?.[0], c]).find(([m]) => m);
		if (r) { o += `<span class="t-${r[1]}">${esc(r[0])}</span>`; rest = rest.slice(r[0].length); }
		else { const m = /^[A-Za-z_$][\w$]*|^[\s\S]/.exec(rest)[0]; o += esc(m); rest = rest.slice(m.length); }
	}
	return o;
}
const guessKind = (l) => (/xml|html/.test(l) ? "xml" : "js");

// ---- Canlı örnek
function sampleHtml(s, id, lang, big) {
	const t = T[lang], xml = dedent(loc(s.xml, lang)), js = s.js ? dedent(loc(s.js, lang)) : "";
	// [[en||tr]] işaretleri JSON içinde de çözülür
	const data = s.data ? loc(JSON.stringify(s.data), lang) : "";
	const tabs = [["xml", "View.xml", xml], ["js", "Controller.js", js || "// sap.ui.define([\"sap/ui/core/mvc/Controller\"], (Controller) => Controller.extend(\"sample.Main\", {}));"]];
	const shown = tabs.filter(([k]) => k === "xml" || js || big);
	return `<section class="sample${big ? " sampleBig" : ""}" id="${id}">
${s.title ? `<h3>${esc(pick(s.title, lang))}</h3>` : ""}${s.text ? `<p>${inline(pick(s.text, lang))}</p>` : ""}
<div class="sampleBox"><div class="sampleStage" data-stage${s.height ? ` style="min-height:${s.height}"` : ""}><p class="sampleWait">${t.loading}</p></div>
<div class="sampleCode"><div class="sampleBar"><div role="tablist" class="sampleTabs">${shown.map(([k, l], i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-tab="${k}">${l}</button>`).join("")}</div><div class="sampleTools"><button type="button" data-run>${t.run}</button><button type="button" data-reset>${t.reset}</button><button type="button" data-copy>${t.copy}</button>${big ? "" : `<button type="button" data-open>${t.open}</button>`}</div></div>
${shown.map(([k, l, c], i) => `<pre class="code" data-code="${k}"${i ? " hidden" : ""}><code contenteditable="plaintext-only" spellcheck="false" role="textbox" aria-multiline="true" aria-label="${l}">${hi(c, k)}</code></pre>`).join("")}</div></div>
<script type="application/json" data-model>${data.replace(/</g, "\\u003c") || "{}"}</script></section>`;
}

// ---- Markdown altkümesi (kılavuzlar): ##, ###, listeler, ```kod```, tablo, paragraf
function md(src) {
	const lines = src.trim().split("\n"); let o = "", i = 0; const toc = [];
	const id = (s) => s.toLowerCase().replace(/[`*]/g, "").replace(/[^\p{L}\p{N}]+/gu, "-").replace(/^-|-$/g, "");
	while (i < lines.length) {
		const l = lines[i]; let m;
		if (!l.trim()) { i++; continue; }
		if ((m = /^```(\w*)/.exec(l))) { const b = []; i++; while (i < lines.length && !lines[i].startsWith("```")) b.push(lines[i++]); i++; o += `<div class="codeBox"><pre class="code"><code>${m[1] === "bash" ? esc(b.join("\n")) : hi(b.join("\n"), guessKind(m[1]))}</code></pre><button type="button" data-copy-block></button></div>`; continue; }
		if ((m = /^(#{2,3}) (.*)/.exec(l))) { if (m[1].length === 2) toc.push([id(m[2]), m[2]]); o += `<h${m[1].length} id="${id(m[2])}">${inline(m[2])}</h${m[1].length}>`; i++; continue; }
		if (/^[-\d]+\.? /.test(l) && /^(-|\d+\.) /.test(l)) { const tag = l.startsWith("-") ? "ul" : "ol"; o += `<${tag}>`; while (i < lines.length && /^(-|\d+\.) /.test(lines[i])) o += `<li>${inline(lines[i++].replace(/^(-|\d+\.) /, ""))}</li>`; o += `</${tag}>`; continue; }
		if (l.startsWith("|")) { const rows = []; while (i < lines.length && lines[i].startsWith("|")) rows.push(lines[i++].split("|").slice(1, -1).map((c) => c.trim())); const [h, , ...b] = rows; o += `<div class="tableWrap" tabindex="0"><table><thead><tr>${h.map((c) => `<th scope="col">${inline(c)}</th>`).join("")}</tr></thead><tbody>${b.map((r) => `<tr>${r.map((c) => `<td>${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`; continue; }
		const p = []; while (i < lines.length && lines[i].trim() && !/^(#|```|- |\d+\. |\|)/.test(lines[i])) p.push(lines[i++]);
		if (!p.length) p.push(lines[i++]);
		o += `<p>${inline(p.join(" "))}</p>`;
	}
	return { html: o, toc };
}

// ---- İçerik yükle
const load = async (dir, name) => { const f = path.join(here, "content", dir, name + ".mjs"); return fs.existsSync(f) ? (await import(f)).default : null; };
const comps = {}, guidePages = {};
for (const n of groups.flatMap((g) => g.items)) { const c = await load("components", n); c ? (comps[n] = c) : missingContent.push(n); }
for (const n of guides) { const c = await load("guides", n); c ? (guidePages[n] = c) : missingContent.push(n); }
const home = await load(".", "home"), examples = await load(".", "examples");

// ---- Sayfa
const urls = [], index = { en: [], tr: [] };
// SEO: son değişiklik tarihi git geçmişinden (sitemap lastmod, dateModified). Git yoksa derleme tarihi.
const modOf = (files) => {
	try { return execFileSync("git", ["log", "-1", "--format=%cs", "--", ...files], { cwd: root, encoding: "utf8" }).trim() || null; } catch { return null; }
};
const today = new Date().toISOString().slice(0, 10);
const NEWS = "https://abapnews.com/";
const publisher = { "@type": "Organization", "@id": `${NEWS}#organization`, name: "abap news", url: NEWS };
const crumbs = (lang, items) => ({ "@type": "BreadcrumbList", itemListElement: items.map(([name, u], i) => ({ "@type": "ListItem", position: i + 1, name, item: ORIGIN + u })) });
const pageMeta = {};
function page(lang, rel, { title, text, body, nav = true, live = false, toc = [], section = "docs", head = "", ld = [], files = [], noindex = false }) {
	const t = T[lang], b = base(lang), other = lang === "en" ? "tr" : "en";
	const url = `${ORIGIN}${b}${rel}`, modified = (files.length && modOf(files)) || today;
	pageMeta[`${b}${rel}`] = { rel, modified };
	const graph = ld.length ? `<script type="application/ld+json">${JSON.stringify({ "@context": "https://schema.org", "@graph": ld.map((x) => (typeof x === "function" ? x({ url, modified }) : x)) }).replaceAll("<", "\\u003c")}</script>` : "";
	const social = `<meta property="og:url" content="${url}"><meta property="og:site_name" content="Kor"><meta property="og:locale" content="${lang === "en" ? "en_US" : "tr_TR"}"><meta property="og:locale:alternate" content="${lang === "en" ? "tr_TR" : "en_US"}"><meta property="og:image:width" content="1440"><meta property="og:image:height" content="900"><meta property="og:image:alt" content="${lang === "en" ? "Kor controls in a UI5 app" : "Bir UI5 uygulamasında Kor bileşenleri"}"><meta name="twitter:card" content="summary_large_image"><meta name="theme-color" content="#ffffff" media="(prefers-color-scheme: light)"><meta name="theme-color" content="#15191c" media="(prefers-color-scheme: dark)">${noindex ? '<meta name="robots" content="noindex">' : ""}`;
	const link = (u, l, on) => `<a href="${u}"${on ? ' aria-current="page"' : ""}>${esc(l)}</a>`;
	const side = nav ? `<nav class="side" id="side" aria-label="${t.menu}">${Object.keys(guidePages).length ? `<h2>${t.guides}</h2>${Object.entries(guidePages).map(([k, g]) => link(`${b}guides/${k}/`, pick(g.title, lang), rel === `guides/${k}/`)).join("")}` : ""}${groups.map((g) => `<h2>${g.title[lang]}</h2>${g.items.filter((n) => comps[n]).map((n) => link(compUrl(n, lang), n, rel === `components/${slug(n)}/`)).join("")}`).join("")}</nav>` : "";
	const html = `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title><meta name="description" content="${esc(text)}">
<link rel="canonical" href="${ORIGIN}${b}${rel}"><link rel="alternate" hreflang="en" href="${ORIGIN}/${rel}"><link rel="alternate" hreflang="tr" href="${ORIGIN}/tr/${rel}"><link rel="alternate" hreflang="x-default" href="${ORIGIN}/${rel}">
<meta property="og:title" content="${esc(title)}"><meta property="og:description" content="${esc(text)}"><meta property="og:image" content="${ORIGIN}/img/akis-light.jpg"><meta property="og:type" content="website">${social}${graph}
<link rel="icon" href="/assets/icon.svg"><link rel="stylesheet" href="/resources/kor/ui/kor.css" id="kor-ui-css"><link rel="stylesheet" href="/assets/docs.css?v=${stamp}">
<script>try{var m=localStorage.getItem("kor-mode")}catch(e){}document.documentElement.dataset.korMode=m||(matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light")</script>${head}</head>
<body class="kor" data-lang="${lang}"${live ? ` data-live="${UI5}"` : ""} data-t='${esc(JSON.stringify({ copied: t.copied, copy: t.copy, none: t.none, failed: t.failed })).replaceAll("'", "&#39;")}'>
<a class="skip" href="#main">${t.skip}</a>
<header class="top">${nav ? `<button type="button" class="topMenu" data-menu aria-controls="side" aria-expanded="false">${t.menu}</button>` : ""}<a class="brand" href="${b}">kor</a><nav class="topNav" aria-label="${t.docs}">${guidePages["getting-started"] ? link(`${b}guides/getting-started/`, t.guides, section === "guides") : ""}${link(`${b}components/`, t.components, section === "components")}${examples ? link(`${b}examples/`, t.examples, section === "examples") : ""}${link(`${b}playground/`, t.playground, section === "playground")}${link(`/demo/?lang=${lang}`, t.demo)}</nav>
<button type="button" class="topSearch" data-search>${t.search}<kbd>/</kbd></button><a class="topLang" href="${base(other)}${rel}" hreflang="${other}" lang="${other}">${other === "tr" ? "Türkçe" : "English"}</a><button type="button" class="topIcon" data-theme aria-label="${t.theme}" title="${t.theme}"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 4a8 8 0 0 1 0 16z" fill="currentColor"/></svg></button><a class="topIcon topGit" href="${REPO}" aria-label="GitHub">GitHub</a></header>
<div class="${nav ? "layout" : "wide"}">${side}<main id="main" tabindex="-1">${body}</main>${toc.length ? `<aside class="toc">${toc.map(([i, l]) => `<a href="#${i}">${esc(l.replace(/`/g, ""))}</a>`).join("")}</aside>` : ""}</div>
<footer class="foot"><span>Kor ${version} · Apache-2.0</span><a href="${REPO}">GitHub</a><a href="https://www.npmjs.com/package/kor-ui5">npm</a><a href="${NEWS}">abap news</a><span>${lang === "en" ? "Not affiliated with SAP. SAP, SAP Fiori and SAPUI5 are trademarks of SAP SE." : "SAP ile bağlantılı değildir. SAP, SAP Fiori ve SAPUI5, SAP SE'nin ticari markalarıdır."}</span></footer>
<dialog class="find" aria-label="${t.search}"><input type="search" placeholder="${t.search}" aria-label="${t.search}" autocomplete="off"><div class="findList"></div></dialog>
<script src="/assets/docs.js?v=${stamp}" defer></script></body></html>`;
	const f = path.join(out, b.slice(1), rel.endsWith(".html") ? rel : path.join(rel, "index.html"));
	fs.mkdirSync(path.dirname(f), { recursive: true });
	fs.writeFileSync(f, html);
	if (!rel.endsWith(".html") && !noindex) { urls.push(`${b}${rel}`); index[lang].push({ u: b + rel, t: title.replace(/ · Kor$/, ""), d: text }); }
}

// ---- Çıktı
fs.rmSync(out, { recursive: true, force: true });
const stamp = Date.now().toString(36);
fs.cpSync(path.join(here, "assets"), path.join(out, "assets"), { recursive: true });
// Renkli ikon paketi indirilebilir zip olarak da sunulur (kaynak: npm run renkli)
if (fs.existsSync(path.join(here, "assets/renkli"))) execFileSync("zip", ["-qrX", path.join(out, "assets/renkli.zip"), "renkli", "-x", "*.DS_Store"], { cwd: path.join(here, "assets") });
fs.cpSync(path.join(root, "docs/img"), path.join(out, "img"), { recursive: true });
if (!fs.existsSync(path.join(root, "site"))) throw new Error("Önce kökte `npm run build` çalıştır (site/ gerekli)");
fs.cpSync(path.join(root, "site/resources"), path.join(out, "resources"), { recursive: true });
fs.cpSync(path.join(root, "site"), path.join(out, "demo"), { recursive: true, filter: (f) => !f.startsWith(path.join(root, "site/resources")) });
const demoHtml = path.join(out, "demo/index.html");
fs.writeFileSync(demoHtml, fs.readFileSync(demoHtml, "utf8").replaceAll("resources/kor/ui/", "/resources/kor/ui/").replaceAll("//resources/kor", "/resources/kor"));
// İndirilebilir örnek projeler: zip + çalışır kopya (webapp)
for (const e of fs.readdirSync(path.join(here, "examples"), { withFileTypes: true }).filter((d) => d.isDirectory())) {
	const src = path.join(here, "examples", e.name), dst = path.join(out, "examples", e.name);
	fs.mkdirSync(dst, { recursive: true });
	execFileSync("zip", ["-qrX", path.join(dst, e.name + ".zip"), e.name, "-x", "*/node_modules/*", "*/dist/*", "*.DS_Store"], { cwd: path.join(here, "examples") });
	fs.cpSync(path.join(src, "webapp"), path.join(dst, "app"), { recursive: true });
	const f = path.join(dst, "app/index.html");
	fs.writeFileSync(f, fs.readFileSync(f, "utf8").replace(/src="[^"]*sap-ui-core\.js"/, `src="${UI5}"`).replace(/(data-sap-ui-resource-?roots=')\{/, '$1{"kor.ui": "/resources/kor/ui/", '));
}
for (const lang of ["en", "tr"]) {
	const t = T[lang], b = base(lang);
	for (const [n, c] of Object.entries(comps)) {
		const toc = [["samples", t.samples], ["api", t.api], ...(c.children ?? []).map((x) => [slug(x), x])];
		const list = (title, v) => (v ? `<div><h3>${title}</h3><ul>${v[lang].map((x) => `<li>${inline(x)}</li>`).join("")}</ul></div>` : "");
		page(lang, `components/${slug(n)}/`, {
			title: `${n} · ${lang === "en" ? "UI5 control" : "UI5 bileşeni"} · Kor`, text: c.summary[lang].replace(/`/g, ""), live: true, section: "components", toc,
			files: [`web/content/components/${n}.mjs`, `src/${n}.ts`],
			ld: [({ url, modified }) => ({ "@type": "TechArticle", "@id": url + "#article", headline: `${n} ${lang === "en" ? "control for UI5" : "UI5 bileşeni"}`, description: c.summary[lang].replace(/`/g, ""), url, inLanguage: lang, dateModified: modified, image: `${ORIGIN}/img/akis-light.jpg`, isPartOf: { "@id": `${ORIGIN}/#website` }, about: { "@id": `${ORIGIN}/#software` }, publisher, proficiencyLevel: "Expert" }),
				crumbs(lang, [[t.home, b], [t.components, `${b}components/`], [n, compUrl(n, lang)]])],
			body: `<h1>${n}</h1><p class="lead">${inline(c.summary[lang])}</p><p class="meta"><code>kor/ui/${n}</code><a href="${REPO}/blob/main/src/${n}.ts">${t.source}</a></p>
<div class="advice">${list(t.use, c.use)}${list(t.avoid, c.avoid)}</div>
<h2 id="samples">${t.samples}</h2>${c.samples.map((s, i) => sampleHtml(s, `s${i + 1}`, lang)).join("")}
${c.html ? c.html[lang] ?? c.html : ""}
${c.keyboard ? `<h2 id="keyboard">${t.keyboard}</h2><dl class="keys">${c.keyboard.map(([k, v]) => `<div><dt>${k.split(", ").map((x) => `<kbd>${esc(x)}</kbd>`).join(" ")}</dt><dd>${inline(v[lang])}</dd></div>`).join("")}</dl>` : ""}
<h2 id="api">${t.api}</h2>${apiHtml(n, lang)}${(c.children ?? []).map((x) => `<h2 id="${slug(x)}">${x}</h2><p>${desc(x, api(x).text, lang)}</p>${apiHtml(x, lang)}`).join("")}
${c.related ? `<h2>${t.related}</h2><p class="rel">${c.related.filter((x) => comps[x]).map((x) => `<a href="${compUrl(x, lang)}">${x}</a>`).join("")}</p>` : ""}`
		});
		desc(n, "", "en");
	}
	for (const [k, g] of Object.entries(guidePages)) {
		const m = md(loc(g.body[lang], lang));
		// Bağlantılar dil önekini kendisi alır: içerikte /components/... yazılır
		const html = lang === "tr" ? m.html.replace(/href="\/(?=components|guides|examples|playground)/g, 'href="/tr/') : m.html;
		// İsteğe bağlı: canlı örnekler ve sayfaya özel ek HTML (renkli ikon galerisi gibi)
		const extra = (g.samples ? `<h2 id="samples">${t.samples}</h2>${g.samples.map((s, i) => sampleHtml(s, `s${i + 1}`, lang)).join("")}` : "") + (g.html ? g.html(lang) : "");
		const toc = [...m.toc, ...(g.samples ? [["samples", t.samples]] : []), ...(g.toc ? g.toc[lang] : [])];
		page(lang, `guides/${k}/`, { title: `${g.title[lang]} · Kor`, text: g.summary[lang], toc, files: [`web/content/guides/${k}.mjs`],
			ld: [({ url, modified }) => ({ "@type": "TechArticle", "@id": url + "#article", headline: pick(g.title, lang), description: g.summary[lang].replace(/`/g, ""), url, inLanguage: lang, dateModified: modified, image: `${ORIGIN}/img/akis-light.jpg`, isPartOf: { "@id": `${ORIGIN}/#website` }, about: { "@id": `${ORIGIN}/#software` }, publisher }),
				crumbs(lang, [[t.home, b], [t.guides, `${b}guides/getting-started/`], [pick(g.title, lang), `${b}guides/${k}/`]])], section: "guides", live: !!g.samples, head: g.head ?? "", body: `<h1>${esc(g.title[lang])}</h1><p class="lead">${inline(g.summary[lang])}</p>${html}${extra}` });
	}
	page(lang, "components/", { title: `${t.components} · Kor`, text: t.compText, section: "components", files: ["web/content/nav.mjs"],
		ld: [crumbs(lang, [[t.home, b], [t.components, `${b}components/`]]), { "@type": "ItemList", name: t.components, itemListElement: Object.keys(comps).map((n, i) => ({ "@type": "ListItem", position: i + 1, name: n, url: ORIGIN + compUrl(n, lang) })) }], body: `<h1>${t.components}</h1><p class="lead">${t.compText}</p>${groups.map((g) => `<h2>${g.title[lang]}</h2><ul class="compList">${g.items.filter((n) => comps[n]).map((n) => `<li><a href="${compUrl(n, lang)}">${n}</a><span>${inline(comps[n].summary[lang])}</span></li>`).join("")}</ul>`).join("")}` });
	page(lang, "playground/", { title: `${t.playground} · Kor`, text: t.pgText, nav: false, live: true, section: "playground", body: `<h1>${t.playground}</h1><p class="lead">${t.pgText}</p>${sampleHtml({ ...comps.Button.samples[0], title: null }, "pg", lang, true)}` });
	if (examples) page(lang, "examples/", { title: `${t.examples} · Kor`, text: examples.summary[lang], nav: false, section: "examples", body: examples.body[lang] });
	page(lang, "", { title: home.title[lang], text: home.summary[lang], nav: false, live: true, section: "home",
		ld: [{ "@type": "WebSite", "@id": `${ORIGIN}/#website`, url: `${ORIGIN}/`, name: "Kor", description: home.summary.en, inLanguage: ["en", "tr"], publisher },
			{ "@type": "SoftwareSourceCode", "@id": `${ORIGIN}/#software`, name: "Kor (kor-ui5)", description: home.summary[lang], url: `${ORIGIN}${b}`, codeRepository: REPO, programmingLanguage: ["TypeScript", "JavaScript"], runtimePlatform: "OpenUI5, SAPUI5 1.108+", license: "https://www.apache.org/licenses/LICENSE-2.0", version, image: `${ORIGIN}/img/akis-light.jpg`, sameAs: [REPO, "https://www.npmjs.com/package/kor-ui5"], publisher },
			publisher], body: home.body(lang, { b, t, sample: (s) => sampleHtml(s, "hero", lang), comps, groups, compUrl, version }) });
	page(lang, "404.html", { title: `${t.notFound} · Kor`, text: t.notFoundText, nav: false, noindex: true, body: `<h1>${t.notFound}</h1><p class="lead">${t.notFoundText}</p><p class="rel"><a href="${b}components/">${t.components}</a></p>` });
	fs.writeFileSync(path.join(out, `assets/index-${lang}.json`), JSON.stringify(index[lang]));
}
// Cloudflare Web Analytics (çerezsiz). Worker yanıtlarına otomatik eklenmediği için her sayfaya elle konur; demo ve örnekler dahil.
// Yerelde yüklenmez: yerel ziyaretleri saymasın, docs:check CORS hatası görmesin.
const BEACON = `<script>if(!/^(localhost|127\\.|\\[::1\\])/.test(location.hostname)){var s=document.createElement("script");s.defer=true;s.src="https://static.cloudflareinsights.com/beacon.min.js";s.setAttribute("data-cf-beacon",'{"token": "ff875ae36f5b4dc08ef7ee8d37c61391"}');document.head.appendChild(s)}</script>`;
for (const f of fs.globSync(`${out}/**/*.html`)) {
	const h = fs.readFileSync(f, "utf8");
	if (!h.includes("cloudflareinsights")) fs.writeFileSync(f, h.replace("</head>", `${BEACON}</head>`));
}
if (sub) for (const f of fs.globSync(`${out}/**/*.html`)) fs.writeFileSync(f, fs.readFileSync(f, "utf8")
	.replace(/(href|src)="\/(?!\/)/g, `$1="${sub}/`)
	.replaceAll('"/resources/kor/ui/"', `"${sub}/resources/kor/ui/"`));
// Sitemap: lastmod + iki dilin karşılıkları (hreflang). Ana sayfa ve bileşen sayfaları önce.
const alt = (rel) => ["en", "tr", "x-default"].map((h) => `<xhtml:link rel="alternate" hreflang="${h}" href="${ORIGIN}${h === "tr" ? "/tr/" : "/"}${rel}"/>`).join("");
fs.writeFileSync(path.join(out, "sitemap.xml"), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urls.map((u) => `<url><loc>${ORIGIN}${u}</loc><lastmod>${pageMeta[u].modified}</lastmod>${alt(pageMeta[u].rel)}</url>`).join("\n")}\n</urlset>\n`);
// IndexNow anahtarı (herkese açık olması gerekir; abapnews.com ile aynı). Gönderim: node scripts/indexnow.mjs
export const INDEXNOW_KEY = "70457ebca81228a75ef1efde8c3f9899";
if (!sub) fs.writeFileSync(path.join(out, `${INDEXNOW_KEY}.txt`), INDEXNOW_KEY);
// llms.txt: yapay zekâ araçları için kısa site haritası (llmstxt.org biçimi)
fs.writeFileSync(path.join(out, "llms.txt"), `# Kor (kor-ui5)\n\n> ${home.summary.en} Open source (Apache-2.0), installed with \`npm install kor-ui5\`. Not affiliated with SAP.\n\n- Source: ${REPO}\n- npm: https://www.npmjs.com/package/kor-ui5\n- Turkish docs: ${ORIGIN}/tr/\n\n## Guides\n\n${Object.entries(guidePages).map(([k, g]) => `- [${g.title.en}](${ORIGIN}/guides/${k}/): ${g.summary.en.replace(/\`/g, "")}`).join("\n")}\n\n${groups.map((g) => `## ${g.title.en}\n\n${g.items.filter((n) => comps[n]).map((n) => `- [${n}](${ORIGIN}${compUrl(n, "en")}): ${comps[n].summary.en.replace(/\`/g, "")}`).join("\n")}`).join("\n\n")}\n\n## Optional\n\n- [Examples](${ORIGIN}/examples/)\n- [Playground](${ORIGIN}/playground/)\n- [Demo app](${ORIGIN}/demo/)\n`);
// Sondaki eğik çizgi eksikse kalıcı (301) yönlendirme: Cloudflare'in kendi yönlendirmesi geçici (307)
if (!sub) fs.writeFileSync(path.join(out, "_redirects"), urls.filter((u) => u.length > 1 && !u.endsWith("tr/")).map((u) => `${u.slice(0, -1)} ${u} 301`).concat(["/tr /tr/ 301", "/demo /demo/ 301"]).join("\n") + "\n");
fs.writeFileSync(path.join(out, "robots.txt"), `User-agent: *\nAllow: /\nSitemap: ${ORIGIN}/sitemap.xml\n`);
console.log(`${urls.length} sayfa yazıldı. İçeriği eksik: ${missingContent.length} (${missingContent.join(", ")})`);
console.log(`api-en.json eksik: ${missingApi.size}${missingApi.size ? "\n  " + [...missingApi].join(", ") : ""}`);
