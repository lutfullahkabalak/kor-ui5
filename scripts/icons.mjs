// src/icons.ts dosyasını lucide-static'ten üretir (ISC lisansı). Yeni simge için listeye ekle, çalıştır.
import fs from "node:fs";
const names = `activity arrow-down arrow-left arrow-right arrow-up arrow-up-right ban bell blocks book-open box calendar calendar-range chart-no-axes-column check check-check chevron-down chevron-left chevron-right chevrons-up-down circle circle-alert circle-check circle-dashed circle-dot circle-x clock columns-3 command copy corner-down-left credit-card download ellipsis external-link eye factory file-text funnel git-branch grip-vertical hand-coins house inbox info kanban key landmark languages layers layout-grid link list lock mail map-pin menu message-square minus moon octagon-alert package package-check palette panel-left panel-right paperclip pencil play plus printer receipt refresh-cw route save search send settings shield-check sliders-horizontal sparkles square-check-big star sun table-2 timer trash-2 trending-down trending-up triangle-alert truck undo-2 upload user users wallet warehouse waves workflow x zap`.split(" ");
const read = (name) => {
	const svg = fs.readFileSync(`node_modules/lucide-static/icons/${name}.svg`, "utf8");
	return [...svg.matchAll(/<(path|circle|rect|line|polyline|polygon|ellipse)\s([^>]*?)\/>/g)].map(([, tag, attrs]) => [tag, Object.fromEntries([...attrs.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v]))]);
};
const out = Object.fromEntries(names.map((n) => [n, read(n)]));
fs.writeFileSync("src/icons.ts", `// Üretilmiştir: scripts/icons.mjs (lucide-static, ISC)\nexport type IconNode = [string, Record<string, string>];\nexport const icons: Record<string, IconNode[]> = ${JSON.stringify(out).replace(/\],"/g, '],\n"')} as unknown as Record<string, IconNode[]>;\n`);
