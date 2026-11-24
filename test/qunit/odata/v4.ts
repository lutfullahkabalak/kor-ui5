/* Test için küçük OData V4 sunucusu: gecikmeli yanıt, $filter/$orderby/$skip/$top/$count ve PATCH. */
import sinon from "sap/ui/thirdparty/sinon";

type Row = Record<string, unknown>;
type Xhr = { url: string; method: string; requestBody: string; respond(status: number, headers: Record<string, string>, body: string): void; async: boolean; aborted?: boolean; onSend?: () => void };
const metadata = `<?xml version="1.0" encoding="utf-8"?><edmx:Edmx Version="4.0" xmlns:edmx="http://docs.oasis-open.org/odata/ns/edmx"><edmx:DataServices><Schema Namespace="kor" xmlns="http://docs.oasis-open.org/odata/ns/edm"><EntityType Name="Order"><Key><PropertyRef Name="Id"/></Key><Property Name="Id" Type="Edm.String" Nullable="false"/><Property Name="Firm" Type="Edm.String"/><Property Name="Amount" Type="Edm.Decimal" Precision="13" Scale="2"/><Property Name="Due" Type="Edm.Date"/><Property Name="Qty" Type="Edm.Int32"/></EntityType><EntityContainer Name="C"><EntitySet Name="Orders" EntityType="kor.Order"/></EntityContainer></Schema></edmx:DataServices></edmx:Edmx>`;

function matcher(filter: string): (row: Row) => boolean {
	const js = filter
		.replace(/contains\((\w+),'((?:[^']|'')*)'\)/g, (_, f: string, v: string) => `String(r.${f}).includes(${JSON.stringify(v.replace(/''/g, "'"))})`)
		.replace(/\b([A-Z]\w*) (eq|ge|le) '([^']*)'/g, (_, f: string, o: string, v: string) => `r.${f}${{ eq: "===", ge: ">=", le: "<=" }[o]}${JSON.stringify(v)}`)
		.replace(/\b([A-Z]\w*) (eq|ge|le) ([\d.]+)/g, (_, f: string, o: string, v: string) => `Number(r.${f})${{ eq: "===", ge: ">=", le: "<=" }[o]}${v}`)
		.replace(/\band\b/g, "&&").replace(/\bor\b/g, "||");
	// Yalnızca testin kendi süzgeçleri çalışır
	return new Function("r", `return ${js}`) as (row: Row) => boolean;
}

export default class V4Server {
	readonly log: string[] = [];
	fail = false;
	private readonly undo: () => void;
	private readonly fake: { restore(): void };
	constructor(readonly root: string, readonly rows: Row[], private readonly delay = 50) {
		const s = sinon as unknown as { useFakeXMLHttpRequest(): { restore(): void; onCreate: (x: Xhr) => void }; FakeXMLHttpRequest: { useFilters: boolean; addFilter(fn: (method: string, url: string) => boolean): void; filters: unknown[] } };
		const fake = s.useFakeXMLHttpRequest();
		const type = (fake as unknown as { useFilters: boolean; filters: unknown[]; addFilter(fn: (m: string, u: string) => boolean): void });
		// MockServer modülü kendi dışındaki adresleri gerçek ağa salan kalıcı bir süzgeç ekler
		const before = type.filters;
		this.undo = () => (type.filters = before);
		type.filters = [];
		type.useFilters = true;
		type.addFilter((_, url) => !url.startsWith(root));
		fake.onCreate = (xhr) => {
			xhr.onSend = () => {
				window.setTimeout(() => {
					if (!xhr.aborted) this.answer(xhr);
				}, this.delay);
			};
		};
		this.fake = fake;
	}
	stop(): void {
		this.undo();
		this.fake.restore();
	}
	private answer(xhr: Xhr): void {
		const json = (status: number, body: unknown) => xhr.respond(status, { "Content-Type": "application/json;IEEE754Compatible=true", "OData-Version": "4.0" }, body === undefined ? "" : JSON.stringify(body));
		const url = new URL(xhr.url, location.href);
		const path = url.pathname.slice(this.root.length);
		this.log.push(`${xhr.method} ${path}${decodeURIComponent(url.search.replace(/\+/g, "%20"))}`);
		if (path === "$metadata") {
			xhr.respond(200, { "Content-Type": "application/xml", "OData-Version": "4.0" }, metadata);
			return;
		}
		const one = /^Orders\('(.*)'\)$/.exec(decodeURIComponent(path));
		if (one) {
			const row = this.rows.find((r) => r.Id === one[1])!;
			if (xhr.method === "PATCH") {
				if (this.fail) {
					json(400, { error: { code: "X", message: "Reddedildi" } });
					return;
				}
				Object.assign(row, JSON.parse(xhr.requestBody) as Row);
			}
			json(200, { "@odata.context": "$metadata#Orders/$entity", ...row });
			return;
		}
		let list = [...this.rows];
		const q = (name: string) => url.searchParams.get(name);
		if (q("$filter")) list = list.filter(matcher(q("$filter")!));
		if (q("$orderby")) {
			const [field, dir] = q("$orderby")!.split(" ");
			const num = (v: unknown) => (Number.isNaN(Number(v)) ? String(v) : Number(v));
			list.sort((a, b) => (num(a[field]) < num(b[field]) ? -1 : 1) * (dir === "desc" ? -1 : 1));
		}
		const skip = Number(q("$skip") ?? 0);
		const top = Number(q("$top") ?? 1e9);
		const select = q("$select")?.split(",");
		const page = list.slice(skip, skip + top).map((r) => (select ? Object.fromEntries(select.map((f) => [f, r[f]])) : r));
		json(200, { "@odata.context": "$metadata#Orders", ...(q("$count") === "true" ? { "@odata.count": String(list.length) } : {}), value: page });
	}
}
