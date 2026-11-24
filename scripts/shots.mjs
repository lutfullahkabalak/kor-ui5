// Önce npm run build, ardından node scripts/shots.mjs.
import fs from "node:fs/promises";
import { createServer } from "node:http";
import path from "node:path";
import puppeteer from "puppeteer-core";

const root = path.resolve(import.meta.dirname, "..");
const site = path.join(root, "site");
const output = path.join(root, "web/assets/shots");
const types = {
	".html": "text/html; charset=utf-8",
	".js": "text/javascript; charset=utf-8",
	".css": "text/css; charset=utf-8",
	".xml": "application/xml; charset=utf-8",
	".properties": "text/plain; charset=utf-8",
	".json": "application/json",
	".woff2": "font/woff2",
	".svg": "image/svg+xml"
};

await fs.access(path.join(site, "index.html")).catch(() => {
	throw new Error("Önce kökte npm run build çalıştır.");
});
await fs.mkdir(output, { recursive: true });

const server = createServer(async (request, response) => {
	try {
		const pathname = new URL(request.url, "http://localhost").pathname;
		const file = path.resolve(site, "." + (pathname === "/" ? "/index.html" : pathname));
		if (!file.startsWith(site + path.sep)) {
			response.writeHead(404).end();
			return;
		}
		const data = await fs.readFile(file);
		response.writeHead(200, { "content-type": types[path.extname(file)] ?? "application/octet-stream" }).end(data);
	} catch {
		response.writeHead(404).end();
	}
});
await new Promise((resolve, reject) => {
	server.once("error", reject);
	server.listen(0, "127.0.0.1", resolve);
});

let browser;
try {
	browser = await puppeteer.launch({
		...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }),
		args: process.env.CI ? ["--no-sandbox"] : []
	});
	const page = await browser.newPage();
	await page.setViewport({ width: 1440, height: 900, deviceScaleFactor: 1 });
	await page.emulateMediaFeatures([{ name: "prefers-reduced-motion", value: "reduce" }]);
	const errors = [];
	page.on("pageerror", (error) => errors.push(error.message));
	page.on("console", (message) => {
		if (message.type() === "error" && !/favicon|unload is not allowed/.test(message.text())) errors.push(message.text());
	});
	const origin = `http://127.0.0.1:${server.address().port}`;
	for (const [screen, hash, selector] of [["flow", "akis", ".korFlow"], ["plan", "plan", ".korTask"]]) {
		for (const lang of ["en", "tr"]) {
			for (const mode of ["light", "dark"]) {
				const name = `${screen}-${lang}-${mode}.jpg`;
				await page.goto(`${origin}/?lang=${lang}&mode=${mode}#${hash}`);
				await page.waitForSelector(selector, { visible: true });
				await page.evaluate(async () => {
					await document.fonts.ready;
					await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
				});
				const matched = await page.evaluate((lang, mode) =>
					document.documentElement.lang === lang && document.documentElement.dataset.korMode === mode, lang, mode);
				if (!matched || errors.length) throw new Error(`${name}: ${errors.join("\n") || "Dil veya görünüm beklenenden farklı"}`);
				await page.screenshot({ path: path.join(output, name), type: "jpeg", quality: 82 });
				console.log(name);
			}
		}
	}
} finally {
	await browser?.close();
	server.close();
}
