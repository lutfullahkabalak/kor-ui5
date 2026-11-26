// web/dist içindeki tüm canlı örnekleri Chrome'da çalıştırır. Kullanım: node scripts/docs-check.mjs [süzgeç] [--shots klasör]
import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import puppeteer from "puppeteer-core";
const dist = path.resolve("web/dist"), filter = process.argv[2]?.startsWith("--") ? "" : process.argv[2] ?? "";
const shots = process.argv.includes("--shots") ? process.argv[process.argv.indexOf("--shots") + 1] : "";
const sub = (process.env.DOCS_BASE ?? "").replace(/\/$/, "");
const local = (u) => (sub && u.startsWith(sub + "/") ? u.slice(sub.length) : u);
const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".json": "application/json", ".svg": "image/svg+xml", ".jpg": "image/jpeg", ".woff2": "font/woff2", ".xml": "application/xml", ".properties": "text/plain", ".zip": "application/zip" };
const server = http.createServer((q, r) => {
	let f = path.join(dist, local(decodeURIComponent(new URL(q.url, "http://x").pathname)));
	if (fs.existsSync(f) && fs.statSync(f).isDirectory()) f = path.join(f, "index.html");
	if (!fs.existsSync(f)) return r.writeHead(404).end();
	r.writeHead(200, { "content-type": (mime[path.extname(f)] ?? "application/octet-stream") + (/html|js|css|json|xml|svg|prop/.test(path.extname(f)) ? "; charset=utf-8" : "") });
	fs.createReadStream(f).pipe(r);
}).listen(0);
const origin = `http://localhost:${server.address().port}`;
const pages = [...fs.readFileSync(path.join(dist, "sitemap.xml"), "utf8").matchAll(/<loc>https:\/\/[^/]+([^<]+)/g)].map((m) => m[1]).filter((u) => u.includes(filter));
// Sitedeki kırık iç bağlantılar
let failed = 0;
const bad = (u, m) => { failed++; console.log(`HATA ${u}: ${m}`); };
for (const u of pages) for (const [, href] of fs.readFileSync(path.join(dist, u, "index.html"), "utf8").matchAll(/(?:href|src)="(\/[^"#?]*)/g)) {
	if (sub && !href.startsWith(sub + "/")) { bad(u, `alt yol eksik ${href}`); continue; }
	const f = path.join(dist, local(href));
	if (!fs.existsSync(href.endsWith("/") ? path.join(f, "index.html") : f)) bad(u, `kırık bağlantı ${href}`);
}
const queue = pages.filter((u) => /components\/.+|playground|^\/$|^\/tr\/$/.test(u));
// Her işçiye ayrı Chrome: arka plandaki sekmede IntersectionObserver çalışmaz
await Promise.all(Array.from({ length: 4 }, async () => {
	const browser = await puppeteer.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }), args: process.env.CI ? ["--no-sandbox"] : [] });
	for (let u; (u = queue.shift()); ) {
		const p = await browser.newPage();
		await p.setViewport({ width: 1360, height: 900 });
		p.on("pageerror", (e) => bad(u, e.message));
		p.on("console", (m) => { if (m.type() === "error" && !/favicon|unload is not allowed/.test(m.text())) bad(u, m.text().slice(0, 300)); });
		await p.goto(origin + sub + u);
		const ok = await p.evaluate(async () => {
			const all = [...document.querySelectorAll(".sample")];
			for (const s of all) {
				s.scrollIntoView();
				for (let i = 0; i < 100 && !s.dataset.sampleState; i++) await new Promise((r) => setTimeout(r, 100));
			}
			await new Promise((r) => setTimeout(r, 500));
			return all.map((s) => [s.id, s.dataset.sampleState, s.querySelector("[data-stage]").innerText.trim().length + s.querySelectorAll("[data-stage] svg, [data-stage] img, [data-stage] input, [data-stage] button").length]);
		});
		for (const [id, state, size] of ok) if (state !== "ok" || !size) bad(u, `örnek ${id}: ${state ?? "yüklenmedi"}${size ? "" : ", boş"}`);
		const w = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
		if (w > 1) bad(u, `yatay taşma ${w}px`);
		if (shots) { fs.mkdirSync(shots, { recursive: true }); await p.evaluate(() => scrollTo(0, 0)); await p.screenshot({ path: path.join(shots, u.replace(/\W+/g, "_") + ".png"), fullPage: true }); }
		await p.close();
	}
	await browser.close();
}));
server.close();
console.log(`${pages.length} sayfa, ${failed} hata`);
process.exit(failed ? 1 : 0);
