(() => {
	const body = document.body, t = JSON.parse(body.dataset.t), lang = body.dataset.lang, root = document.documentElement;
	// Sitenin kökü: "/" veya "/kor-ui5/"
	const base = new URL("..", document.currentScript.src).pathname;
	const $$ = (s, e = document) => [...e.querySelectorAll(s)];
	const store = (k, v) => { try { localStorage.setItem(k, v); } catch { /* depolama kapalı */ } };

	// Görünüm
	document.querySelector("[data-theme]").onclick = () => {
		const mode = root.dataset.korMode === "dark" ? "light" : "dark";
		root.dataset.korMode = mode;
		store("kor-mode", mode);
		if (window.sap?.ui?.require) sap.ui.require(["kor/ui/Theme"], (Theme) => Theme.set({ mode }));
	};
	// Küçük ekranda menü
	const menu = document.querySelector("[data-menu]");
	if (menu) menu.onclick = () => menu.setAttribute("aria-expanded", String(document.querySelector(".side").classList.toggle("sideOpen")));
	document.querySelector(".side [aria-current]")?.scrollIntoView({ block: "nearest" });

	// Kopyalama
	const copy = async (button, text) => {
		try { await navigator.clipboard.writeText(text); } catch { return; }
		button.textContent = t.copied;
		setTimeout(() => (button.textContent = t.copy), 1400);
	};
	$$("[data-copy-block]").forEach((b) => { b.textContent = t.copy; b.onclick = () => copy(b, b.previousElementSibling.textContent); });

	// Arama
	const find = document.querySelector(".find"), input = find.querySelector("input"), list = find.querySelector(".findList");
	const fold = (s) => s.replace(/[İI]/g, "i").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/ı/g, "i");
	let pages;
	const draw = () => {
		const q = fold(input.value.trim());
		const hits = pages.map((p) => ({ p, s: fold(p.t).startsWith(q) ? 0 : fold(p.t).includes(q) ? 1 : fold(p.d).includes(q) ? 2 : 9 })).filter((x) => x.s < 9).sort((a, b) => a.s - b.s).slice(0, 12);
		list.replaceChildren(...hits.map(({ p }) => {
			const a = document.createElement("a"), b = document.createElement("strong"), s = document.createElement("span");
			a.href = base + p.u.slice(1); b.textContent = p.t; s.textContent = p.d; a.append(b, s);
			return a;
		}));
		if (!hits.length) list.textContent = t.none;
	};
	const openFind = async () => {
		if (find.open) return;
		find.showModal();
		pages ??= await (await fetch(`${base}assets/index-${lang}.json`)).json();
		draw();
	};
	document.querySelector("[data-search]").onclick = openFind;
	input.oninput = () => pages && draw();
	find.onclick = (e) => e.target === find && find.close();
	find.onkeydown = (e) => {
		const links = $$("a", list), at = links.indexOf(document.activeElement);
		if (e.key === "ArrowDown") { e.preventDefault(); links[Math.min(at + 1, links.length - 1)]?.focus(); }
		if (e.key === "ArrowUp") { e.preventDefault(); at > 0 ? links[at - 1].focus() : input.focus(); }
		if (e.key === "Enter" && document.activeElement === input) links[0]?.click();
	};
	document.addEventListener("keydown", (e) => {
		const typing = e.target.closest?.("input, textarea, select, [contenteditable], [role=textbox], [role=grid]");
		if (e.key === "/" && !typing && !e.defaultPrevented) { e.preventDefault(); openFind(); }
	});

	// Canlı örnekler
	const samples = $$(".sample");
	if (!samples.length || !body.dataset.live) return;
	const code = (s, k) => s.querySelector(`[data-code=${k}] code`)?.textContent ?? "";
	const NS = 'xmlns="kor.ui" xmlns:k="kor.ui" xmlns:mvc="sap.ui.core.mvc" xmlns:core="sap.ui.core" xmlns:layout="sap.ui.layout" xmlns:m="sap.m" displayBlock="true"';
	// Denetleyici kodu gerçek sap.ui.define biçimindedir; burada modül adı olmadan çözülür
	const controller = (src) => new Promise((ok, fail) => {
		if (!src.replace(/\/\/.*|\s/g, "")) return ok(null);
		let called = false;
		const define = (deps, factory) => { called = true; sap.ui.require(deps, (...a) => { try { ok(factory(...a)); } catch (e) { fail(e); } }, fail); };
		// Gerçek sap nesnesini gölgeler; yalnızca sap.ui.define değişir
		const shadow = Object.create(sap, { ui: { value: Object.create(sap.ui, { define: { value: define } }) } });
		try { new Function("sap", src)(shadow); } catch (e) { return fail(e); }
		if (!called) ok(null);
	});
	let serial = 0;
	async function run(s) {
		const stage = s.querySelector("[data-stage]"), mine = ++serial;
		s.run = mine;
		try {
			const xml = code(s, "xml");
			const [XMLView, JSONModel] = await new Promise((ok, fail) => sap.ui.require(["sap/ui/core/mvc/XMLView", "sap/ui/model/json/JSONModel", "kor/ui/library"], (...a) => ok(a), fail));
			const C = await controller(code(s, "js"));
			const definition = /^\s*<mvc:View/.test(xml) ? xml : `<mvc:View ${NS}>${xml}</mvc:View>`;
			const json = JSON.parse(s.querySelector("[data-model]").textContent);
			const model = new JSONModel(json);
			model.setSizeLimit(20000);
			const view = await XMLView.create({ definition, ...(C ? { controller: new C() } : {}), models: model });
			if (s.run !== mine) return view.destroy();
			s.view?.destroy();
			s.view = view;
			stage.replaceChildren();
			const host = document.createElement("div");
			stage.append(host);
			view.placeAt(host);
			s.dataset.sampleState = "ok";
		} catch (e) {
			s.dataset.sampleState = "error";
			const p = document.createElement("pre");
			p.className = "sampleError";
			p.setAttribute("role", "alert");
			p.textContent = String(e?.message ?? e);
			s.view?.destroy();
			s.view = null;
			stage.replaceChildren(p);
			console.error(`[sample ${s.id}]`, e);
		}
	}
	const pack = (o) => btoa(String.fromCharCode(...new TextEncoder().encode(JSON.stringify(o)))).replaceAll("+", "-").replaceAll("/", "_");
	const unpack = (h) => JSON.parse(new TextDecoder().decode(Uint8Array.from(atob(h.replaceAll("-", "+").replaceAll("_", "/")), (c) => c.charCodeAt(0))));
	samples.forEach((s) => {
		const first = {};
		if (s.id === "pg" && location.hash.startsWith("#c=")) {
			try {
				const p = unpack(location.hash.slice(3));
				s.querySelector("[data-code=xml] code").textContent = p.xml;
				s.querySelector("[data-code=js] code").textContent = p.js;
				s.querySelector("[data-model]").textContent = p.data;
			} catch { /* bozuk bağlantı: varsayılan örnek kalır */ }
		}
		$$("[data-code]", s).forEach((p) => (first[p.dataset.code] = p.querySelector("code").innerHTML));
		$$("[data-tab]", s).forEach((b) => (b.onclick = () => {
			$$("[data-tab]", s).forEach((x) => x.setAttribute("aria-selected", String(x === b)));
			$$("[data-code]", s).forEach((p) => (p.hidden = p.dataset.code !== b.dataset.tab));
		}));
		s.querySelector("[data-run]").onclick = () => run(s);
		s.querySelector("[data-reset]").onclick = () => {
			$$("[data-code]", s).forEach((p) => (p.querySelector("code").innerHTML = first[p.dataset.code]));
			run(s);
		};
		const c = s.querySelector("[data-copy]");
		c.onclick = () => copy(c, s.querySelector("[data-code]:not([hidden]) code").textContent);
		const o = s.querySelector("[data-open]");
		if (o) o.onclick = () => open(`${base}${lang === "tr" ? "tr/" : ""}playground/#c=${pack({ xml: code(s, "xml"), js: code(s, "js"), data: s.querySelector("[data-model]").textContent })}`);
		// Kod alanında Ctrl/⌘+Enter çalıştırır
		s.addEventListener("keydown", (e) => e.key === "Enter" && (e.metaKey || e.ctrlKey) && e.target.closest("code") && (e.preventDefault(), run(s)));
	});
	window.korBoot = () => sap.ui.require(["kor/ui/Theme"], (Theme) => {
		Theme.set({ mode: root.dataset.korMode });
		// Sıradan çalıştır: ekranda olanlar önce
		const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); run(e.target); } }), { rootMargin: "400px" });
		samples.forEach((s) => io.observe(s));
	});
	const boot = document.createElement("script");
	boot.id = "sap-ui-bootstrap";
	boot.src = body.dataset.live;
	Object.entries({ "theme": "sap_horizon", "language": lang, "async": "true", "compat-version": "edge", "libs": "kor.ui", "resourceroots": JSON.stringify({ "kor.ui": `${base}resources/kor/ui/` }) }).forEach(([k, v]) => boot.setAttribute("data-sap-ui-" + (k === "compat-version" ? "compatVersion" : k), v));
	boot.onload = () => { sap.ui.getCore().attachInit(window.korBoot); };
	boot.onerror = () => samples.forEach((s) => { const w = s.querySelector(".sampleWait"); if (w) w.textContent = t.failed; });
	document.head.append(boot);
})();
