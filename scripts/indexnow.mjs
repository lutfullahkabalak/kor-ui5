// Yayından sonra canlı sitemap'teki adresleri IndexNow'a bildirir (Bing, Yandex, Seznam, Naver; Google kullanmaz).
// Kullanım: cd web && npx cf deploy ./dist && cd .. && node scripts/indexnow.mjs
const HOST = "korui5.abapnews.com", KEY = "70457ebca81228a75ef1efde8c3f9899";
const xml = await (await fetch(`https://${HOST}/sitemap.xml`)).text();
const urlList = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
const res = await fetch("https://api.indexnow.org/indexnow", {
	method: "POST", headers: { "Content-Type": "application/json; charset=utf-8" },
	body: JSON.stringify({ host: HOST, key: KEY, keyLocation: `https://${HOST}/${KEY}.txt`, urlList })
});
console.log(`IndexNow: ${urlList.length} adres, HTTP ${res.status}`);
if (res.status >= 400) process.exitCode = 1;
