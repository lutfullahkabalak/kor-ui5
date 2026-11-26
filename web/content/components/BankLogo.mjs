const guide = {
	en: `<h2>Bringing your own logos</h2>
<p>Kor does not ship bank logos. They are trademarks of each bank, and no openly licensed set covers the world's banks. Without a logo, every bank still gets a mark made from its BIC or name and its country flag, so lists never show a gap.</p>
<p>Register the logos you have the right to use, keyed by BIC (8 or 11 characters) or by your own key, before the view renders:</p>
<pre><code>import { registerBankLogos, setBankLogoProvider } from "kor/ui/bankLogos";
registerBankLogos({
  TGBATRIS: { src: "logos/garanti.svg", name: "Garanti BBVA" },
  "TR-00062": "logos/garanti.svg"
});
// or point to your own logo server; a 404 falls back to the mark
setBankLogoProvider("https://logo.example.com/banks/{bic8}.svg");</code></pre>
<p>Placeholders: <code>{bic}</code>, <code>{bic8}</code>, <code>{bank}</code>, <code>{country}</code>, <code>{key}</code>. Only http(s), relative and image data URLs are drawn. The IBAN is read for its country only and is never written to the page.</p>`,
	tr: `<h2>Kendi logolarınız</h2>
<p>Kor banka logosu dağıtmaz. Logolar her bankanın tescilli markasıdır ve dünya bankalarını kapsayan açık lisanslı bir küme yoktur. Logo yoksa her banka yine BIC'inden veya adından üretilen işaret ve ülke bayrağıyla gösterilir; listede boşluk kalmaz.</p>
<p>Kullanma hakkınız olan logoları görünüm çizilmeden önce BIC (8 veya 11 hane) ya da kendi anahtarınızla kaydedin:</p>
<pre><code>import { registerBankLogos, setBankLogoProvider } from "kor/ui/bankLogos";
registerBankLogos({
  TGBATRIS: { src: "logos/garanti.svg", name: "Garanti BBVA" },
  "TR-00062": "logos/garanti.svg"
});
// veya kendi logo sunucunuz; 404 gelirse işarete döner
setBankLogoProvider("https://logo.example.com/banks/{bic8}.svg");</code></pre>
<p>Yer tutucular: <code>{bic}</code>, <code>{bic8}</code>, <code>{bank}</code>, <code>{country}</code>, <code>{key}</code>. Yalnız http(s), göreli ve resim data adresleri çizilir. IBAN yalnız ülkesi için okunur, sayfaya yazılmaz.</p>`
};

export default {
	summary: { en: "Shows a bank's logo, or a mark and flag for any bank in the world.", tr: "Bankanın logosunu, yoksa dünyadaki her banka için işaret ve bayrak gösterir." },
	use: { en: ["In payment, account and statement lists, next to the bank name or BIC.", "Give a BIC so the country flag and your registered logo are found."], tr: ["Ödeme, hesap ve hesap özeti listelerinde, banka adı veya BIC yanında.", "Ülke bayrağı ve kaydettiğiniz logo bulunsun diye BIC verin."] },
	related: ["Flag", "BankCard", "Statement"],
	samples: [
		{
			title: { en: "From a BIC", tr: "BIC'ten" },
			xml: `<k:Stack row="true" gap="16" align="center">
				<k:BankLogo bic="DEUTDEFF"/>
				<k:BankLogo bic="BNPAFRPP"/>
				<k:BankLogo bic="MUFGJPJT" shape="circle"/>
				<k:BankLogo bic="EQBLKENA" size="56"/>
				<k:BankLogo name="Kor Bank" iban="TR33 0006 1005 1978 6457 8413 26"/>
			</k:Stack>`
		},
		{
			title: { en: "Your own logo", tr: "Kendi logonuz" },
			xml: `<k:Stack row="true" gap="16" align="center">
				<k:BankLogo name="Kor Bank" bic="KORBTRIS" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='M3 10 12 4l9 6M5 10v8M9 10v8M15 10v8M19 10v8M3 20h18' fill='none' stroke='%23FF5A1F' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E"/>
				<k:BankLogo name="Kor Bank" bic="KORBTRIS" shape="circle" showFlag="false"/>
			</k:Stack>`
		}
	],
	html: guide
};
