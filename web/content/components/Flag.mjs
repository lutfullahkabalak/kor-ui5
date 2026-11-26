import { readFileSync } from "node:fs";

// Bayrak listesi üretilen src/flags.ts dosyasından okunur
const source = readFileSync(new URL("../../../src/flags.ts", import.meta.url), "utf8");
const names = JSON.parse(/flagNames: Record<string, string> = (\{[\s\S]*?\});/.exec(source)[1]);
const codes = Object.keys(names);
const all = codes.map((code) => `<k:Flag code="${code}" size="24" alt="${names[code].replace(/"/g, "&quot;")} (${code})"/>`).join("");
const list = '<ul class="iconNames">' + codes.map((code) => `<li><code>${code}</code> ${names[code]}</li>`).join("") + "</ul>";

export default {
	summary: { en: "Shows the flag of any country, region or organization.", tr: "Herhangi bir ülkenin, bölgenin veya kuruluşun bayrağını gösterir." },
	use: {
		en: ["Next to a country, currency, phone prefix or language. Every ISO 3166-1 country is included, plus UK nations, some regions and organizations such as eu and un.", "Set decorative when the country name is written next to the flag, so screen readers do not read it twice."],
		tr: ["Ülke, para birimi, telefon kodu veya dil yanında. ISO 3166-1 ülkelerinin tümü, İngiltere'nin ülkeleri, bazı bölgeler ve eu, un gibi kuruluşlar vardır.", "Ülke adı yanında yazıyorsa decorative ver; ekran okuyucu iki kez okumasın."]
	},
	avoid: { en: ["Do not use a flag alone to mean a language: many languages are spoken in many countries."], tr: ["Bayrağı tek başına dil anlamında kullanma: çoğu dil birçok ülkede konuşulur."] },
	related: ["BankLogo", "Icon"],
	samples: [
		{
			title: { en: "Shapes", tr: "Biçimler" },
			xml: `<k:Stack row="true" gap="14" align="center">
				<k:Flag code="TR" size="24"/>
				<k:Flag code="de" size="24" shape="square"/>
				<k:Flag code="jp" size="24" shape="circle"/>
				<k:Flag code="gb-sct" size="24"/>
				<k:Flag code="eu" size="24"/>
				<k:Flag code="??" size="24"/>
			</k:Stack>`
		},
		{
			title: { en: "Next to a name", tr: "Ad yanında" },
			xml: `<k:Stack gap="8">
				<k:Stack row="true" gap="8" align="center"><k:Flag code="br" decorative="true"/><k:Text text="[[Brazil||Brezilya]] · BRL"/></k:Stack>
				<k:Stack row="true" gap="8" align="center"><k:Flag code="ke" decorative="true"/><k:Text text="[[Kenya||Kenya]] · KES"/></k:Stack>
				<k:Stack row="true" gap="8" align="center"><k:Flag code="nz" decorative="true"/><k:Text text="[[New Zealand||Yeni Zelanda]] · NZD"/></k:Stack>
			</k:Stack>`
		},
		{
			title: { en: `All ${codes.length} flags`, tr: `${codes.length} bayrağın tümü` },
			xml: `<k:Stack columns="repeat(auto-fill, minmax(36px, 1fr))" gap="10">${all}</k:Stack>`
		}
	],
	html: { en: "<h2>Flag codes</h2>" + list, tr: "<h2>Bayrak kodları</h2>" + list }
};
