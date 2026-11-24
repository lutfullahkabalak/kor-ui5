import "./library";

export type ThemeSettings = { mode: "light" | "dark" | "system"; accent: string; density: "cozy" | "compact"; radius: number };
const settings: ThemeSettings = { mode: "light", accent: "#FF5A1F", density: "cozy", radius: 10 };

function luminance(hex: string): number {
	const [r, g, b] = [1, 3, 5].map((i) => {
		const c = parseInt(hex.slice(i, i + 2), 16) / 255;
		return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
	});
	return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Çalışma anında görünüm ayarı: açık/koyu, kurum rengi, yoğunluk ve köşe.
 * `Theme.set({ accent: "#0B7A5B", mode: "dark" })`
 *
 * @namespace kor.ui
 */
const Theme = {
	get(): ThemeSettings {
		return { ...settings };
	},
	isDark(): boolean {
		return settings.mode === "dark" || (settings.mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
	},
	set(next: Partial<ThemeSettings>): void {
		Object.assign(settings, next);
		if (!/^#[0-9a-f]{6}$/i.test(settings.accent)) throw new Error("kor.ui.Theme: accent #rrggbb olmalı");
		const root = document.documentElement;
		root.dataset.korMode = Theme.isDark() ? "dark" : "light";
		root.dataset.korDensity = settings.density;
		root.style.setProperty("--kor-accent", settings.accent);
		// Eşik: siyah ve beyaz yazının eşit kontrast verdiği ışıklılık
		root.style.setProperty("--kor-on-accent", luminance(settings.accent) > 0.179 ? "#14181A" : "#FFFFFF");
		root.style.setProperty("--kor-radius", `${settings.radius}px`);
		window.dispatchEvent(new CustomEvent("kor:theme"));
	}
};
window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => {
	if (settings.mode === "system") Theme.set({});
});
export default Theme;
