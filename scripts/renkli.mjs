// Renkli ikon paketini doküman sitesine kopyalar. Kaynak: ../openui5-custom/icons (orada `npm run build` ile üretilir).
// Kullanım: npm run renkli [-- kaynak-klasör]. Çıktı izlenir: CI kaynak depoya erişmez.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const src = path.resolve(process.argv[2] ?? path.join(root, "../openui5-custom/icons"));
const dst = path.join(root, "web/assets/renkli");
for (const f of ["renkli/register.js", "renkli/fonts/RenkliIkon.json", "svg"]) if (!fs.existsSync(path.join(src, f))) throw new Error(`Bulunamadı: ${path.join(src, f)}`);
fs.rmSync(dst, { recursive: true, force: true });
fs.cpSync(path.join(src, "renkli"), dst, { recursive: true, filter: (f) => !f.endsWith(".DS_Store") });
fs.cpSync(path.join(src, "svg"), path.join(dst, "svg"), { recursive: true, filter: (f) => !f.endsWith(".DS_Store") });
const n = Object.keys(JSON.parse(fs.readFileSync(path.join(dst, "fonts/RenkliIkon.json")))).length;
console.log(`${n} ikon kopyalandı: ${path.relative(root, dst)}`);
