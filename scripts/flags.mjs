// Bayrakları flag-icons'tan (MIT) src/assets/flags altına kopyalar ve src/flags.ts ad tablosunu üretir.
// SVG klasörü izlenmez; npm install (postinstall) ve npm run build bunu çalıştırır.
import fs from "node:fs";
const from = "node_modules/flag-icons";
const to = "src/assets/flags";
fs.rmSync(to, { recursive: true, force: true });
for (const shape of ["4x3", "1x1"]) fs.cpSync(`${from}/flags/${shape}`, `${to}/${shape}`, { recursive: true });
fs.copyFileSync(`${from}/LICENSE`, "src/assets/FlagIcons-MIT.txt");
const countries = JSON.parse(fs.readFileSync(`${from}/country.json`, "utf8"));
const names = Object.fromEntries(countries.map((c) => [c.code, c.name]).sort(([a], [b]) => a.localeCompare(b)));
const missing = fs.readdirSync(`${to}/4x3`).map((f) => f.replace(/\.svg$/, "")).filter((c) => c !== "xx" && !names[c]);
if (missing.length) throw new Error(`Adı olmayan bayrak: ${missing.join(", ")}`);
const iso = countries.filter((c) => c.iso).map((c) => c.code).sort();
fs.writeFileSync("src/flags.ts", `// Üretilmiştir: scripts/flags.mjs (flag-icons, MIT)\n/** Bayrak kodu → İngilizce ad (ülke, bölge ve kuruluşlar) */\nexport const flagNames: Record<string, string> = ${JSON.stringify(names).replace(/,"/g, ',\n"')};\n/** ISO 3166-1 ülke kodları */\nexport const isoCodes: string[] = ${JSON.stringify(iso)};\n`);
console.log(`${Object.keys(names).length} bayrak, ${iso.length} ISO ülkesi`);
