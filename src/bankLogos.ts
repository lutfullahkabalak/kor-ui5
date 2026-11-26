/**
 * Banka logosu kaydı. Kor banka logosu dağıtmaz: logolar bankaların tescilli markasıdır
 * ve dünya bankalarını kapsayan açık lisanslı bir küme yoktur. Uygulama kullanma hakkı
 * olduğu logoları buraya kaydeder veya kendi logo sunucusunu bağlar; kaydı olmayan her
 * banka BIC'inden üretilen işaret ve ülke bayrağıyla gösterilir.
 */

/** Kaydedilen logo: adres veya ayrıntı */
export type BankLogoEntry = string | { src?: string; name?: string; color?: string };
/** Bir bankanın bilinen kimliği */
export type BankInfo = {
	/** Uygulamanın kendi anahtarı */
	key: string;
	/** 11 haneli BIC ("TGBATRISXXX"); bilinmiyorsa boş */
	bic: string;
	/** BIC'in ilk 8 hanesi */
	bic8: string;
	/** BIC'in banka kısmı, 4 harf */
	bank: string;
	/** ISO ülke kodu, küçük harf ("tr"): BIC'ten, yoksa IBAN'dan */
	country: string;
	/** Banka adı */
	name: string;
};
export type BankLogoProvider = string | ((info: BankInfo) => string | undefined);

const entries: Record<string, BankLogoEntry> = {};
let provider: BankLogoProvider | undefined;
let version = 0;

const BIC = /^([A-Z]{4})([A-Z]{2})([A-Z0-9]{2})([A-Z0-9]{3})?$/;

/** BIC ve IBAN'dan banka kimliğini çıkarır; geçersiz BIC yok sayılır */
export function bankInfo(bic = "", iban = "", name = "", key = ""): BankInfo {
	const clean = bic.replace(/\s/g, "").toUpperCase();
	const match = BIC.exec(clean);
	const ibanCountry = /^[A-Z]{2}\d{2}/.exec(iban.replace(/\s/g, "").toUpperCase())?.[0].slice(0, 2) ?? "";
	return {
		key: key.trim(),
		bic: match ? `${clean.slice(0, 8)}${match[4] ?? "XXX"}` : "",
		bic8: match ? clean.slice(0, 8) : "",
		bank: match ? match[1] : "",
		country: (match ? match[2] : ibanCountry).toLowerCase(),
		name: name.trim()
	};
}

/**
 * Logoları kaydeder. Anahtar uygulamanın anahtarı, 11 haneli BIC veya 8 haneli BIC olabilir.
 * Değer adres veya `{ src, name, color }` olur; `src` olmadan yalnız ad ve renk verilebilir.
 */
export function registerBankLogos(map: Record<string, BankLogoEntry>): void {
	for (const [k, v] of Object.entries(map)) entries[k.trim().toUpperCase()] = v;
	version++;
}
/** Kaydı boşaltır (testler ve dil/kiracı değişimi için) */
export function clearBankLogos(): void {
	for (const k of Object.keys(entries)) delete entries[k];
	provider = undefined;
	version++;
}
/**
 * Kaydı olmayan bankalar için logo sunucusu. Şablon yer tutucuları: {bic}, {bic8}, {bank},
 * {country}, {key}; örnek "https://logo.example.com/banks/{bic8}.svg". İşlev de verilebilir.
 * Adres bulunamazsa (404) BankLogo üretilen işarete döner.
 */
export function setBankLogoProvider(value?: BankLogoProvider): void {
	provider = value;
	version++;
}
/** Kayıt her değiştiğinde artar; BankLogo yeniden çizmek için kullanır */
export function bankLogoVersion(): number {
	return version;
}

/** Kayıttaki girdi: önce uygulama anahtarı, sonra BIC 11, sonra BIC 8 */
export function findBankLogo(info: BankInfo): { src: string; name: string; color: string } | undefined {
	for (const k of [info.key.toUpperCase(), info.bic, info.bic8]) {
		const hit = k ? entries[k] : undefined;
		if (hit) return typeof hit === "string" ? { src: hit, name: "", color: "" } : { src: hit.src ?? "", name: hit.name ?? "", color: hit.color ?? "" };
	}
	if (!provider || !(info.bic || info.key)) return undefined;
	const src =
		typeof provider === "function"
			? provider(info)
			: provider.replace(/\{(bic8|bic|bank|country|key)\}/g, (_, part: keyof BankInfo) => encodeURIComponent(info[part]));
	return src ? { src, name: "", color: "" } : undefined;
}
