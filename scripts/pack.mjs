// dist/ çıktısından iki teslim üretir:
//  npm/   UI5 projelerinin bağımlılık olarak alacağı paket (derlenmiş JS + tipler, TypeScript derlemesi istemez)
//  site/  GitHub Pages'e konacak demo (OpenUI5 CDN'den gelir)
import fs from "node:fs";
import path from "node:path";
const lib = "dist/resources/kor/ui";
for (const dir of ["npm", "site"]) fs.rmSync(dir, { recursive: true, force: true });

const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]));
// src/kor/ui yerine src: UI5 kütüphane projesi ad alanı klasörü istemez
for (const file of walk(lib)) {
	const rel = path.relative(lib, file);
	// Kaynak olarak -dbg sürümü gider; önyükleme paketini tüketen projenin derlemesi üretir
	if (/library-preload|\.map$|resources\.json$/.test(rel)) continue;
	// Yalnızca derlenmiş JS ve tipler; TypeScript kaynağı pakete girmez
	if (rel.endsWith(".ts") && !rel.endsWith(".d.ts")) continue;
	if (rel.endsWith(".js") && !rel.endsWith("-dbg.js") && fs.existsSync(file.replace(/\.js$/, "-dbg.js"))) continue;
	const out = path.join("npm/src", rel.replace(/-dbg\.js$/, ".js"));
	fs.mkdirSync(path.dirname(out), { recursive: true });
	if (rel.endsWith(".js")) fs.writeFileSync(out, fs.readFileSync(file, "utf8").replace(/\n?\/\/# sourceMappingURL=.*$/m, ""));
	else fs.copyFileSync(file, out);
}
// Tip başvuruları paketteki klasöre çevrilir
fs.writeFileSync("npm/index.d.ts", fs.readFileSync("dist/index.d.ts", "utf8").replaceAll("./resources/kor/ui/", "./src/"));
fs.copyFileSync("ui5-dist.yaml", "npm/ui5.yaml");
for (const f of ["README.md", "README.tr.md", "LICENSE", "NOTICE", "CHANGELOG.md"]) fs.copyFileSync(f, `npm/${f}`);
const pkg = JSON.parse(fs.readFileSync("package.json", "utf8"));
const keep = Object.fromEntries(["name", "version", "description", "license", "author", "homepage", "repository", "bugs", "keywords"].flatMap((k) => (pkg[k] === undefined ? [] : [[k, pkg[k]]])));
fs.writeFileSync("npm/package.json", JSON.stringify({ ...keep, files: ["src", "ui5.yaml", "index.d.ts", "README.tr.md", "NOTICE", "CHANGELOG.md"], types: "index.d.ts" }, null, 2));

fs.cpSync(lib, "site/resources/kor/ui", { recursive: true });
fs.cpSync("dist/test-resources/kor/ui/demo", "site", { recursive: true });
const html = fs.readFileSync("site/index.html", "utf8")
	.replace("../../../../resources/sap-ui-core.js", "https://sdk.openui5.org/1.108.55/resources/sap-ui-core.js")
	.replace("../../../../resources/kor/ui/kor.css", "resources/kor/ui/kor.css")
	.replace('{"kor.ui.demo": "./"}', '{"kor.ui": "resources/kor/ui/", "kor.ui.demo": "./"}');
fs.writeFileSync("site/index.html", html);
// Kaynak ve eşleme dosyaları sitede gereksiz
for (const file of walk("site")) if (/\.(ts|map)$|-dbg\.js$|library-preload|resources\.json$/.test(file) && !/library-preload\.js$/.test(file)) fs.rmSync(file);
// Derleme zinciri kullanmayanlar için hazır dosyalar (ör. ABAP BSP)
fs.rmSync("release", { recursive: true, force: true });
fs.cpSync(lib, "release/kor/ui", { recursive: true });
for (const file of walk("release")) if (/\.(ts|map)$/.test(file)) fs.rmSync(file);
for (const f of ["LICENSE", "NOTICE"]) fs.copyFileSync(f, `release/${f}`);
console.log("npm/, site/ ve release/ hazır");
