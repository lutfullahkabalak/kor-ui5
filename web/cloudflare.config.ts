import { defineConfig } from "cf/config";

export default defineConfig({
	worker: {
		name: "korui5",
		compatibilityDate: "2026-11-01",
		assets: { htmlHandling: "auto-trailing-slash", notFoundHandling: "404-page" },
		domains: ["korui5.abapnews.com"]
	}
});
