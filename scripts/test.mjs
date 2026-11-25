// QUnit testlerini iki UI5 sürümünde, ayrı bir Chrome'da çalıştırır.
// Chrome başka yerdeyse: CHROME_PATH=/yol/chrome npm test
import { spawn } from "node:child_process";
import puppeteer from "puppeteer-core";

const tests = ["Kor", "Sector", "OData"];
const browser = await puppeteer.launch({
	...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: "chrome" }),
	// CI kapsayıcısında Chrome korumalı alanı açılamaz
	args: process.env.CI ? ["--no-sandbox"] : []
});
let failed = false;

for (const [config, port] of [["ui5.yaml", 8290], ["ui5-latest.yaml", 8291]]) {
	const server = spawn("node_modules/.bin/ui5", ["serve", "--config", config, "--port", String(port)]);
	try {
		await new Promise((resolve, reject) => {
			let log = "";
			const read = (chunk) => {
				log += chunk;
				if (log.includes("Server started")) resolve();
			};
			server.stdout.on("data", read);
			server.stderr.on("data", read);
			server.on("exit", () => reject(new Error(log)));
		});
		for (const test of tests) {
			const page = await browser.newPage();
			const errors = [];
			page.on("pageerror", (error) => errors.push(error.message));
			await page.goto(`http://localhost:${port}/resources/sap/ui/test/starter/Test.qunit.html?testsuite=test-resources/kor/ui/qunit/testsuite.qunit&test=${test}`);
			await page.waitForFunction(() => /completed in/.test(document.getElementById("qunit-testresult")?.innerText ?? ""), { timeout: 90000 });
			const result = await page.evaluate(() => ({
				version: window.sap.ui.version,
				total: document.querySelectorAll("#qunit-tests > li").length,
				failed: [...document.querySelectorAll("#qunit-tests > li.fail")].map((li) => li.innerText)
			}));
			if (!result.total || result.failed.length || errors.length) failed = true;
			console.log(`${result.version} ${test}: ${result.total - result.failed.length}/${result.total}`);
			[...result.failed, ...errors].forEach((text) => console.error(text));
			await page.close();
		}
	} finally {
		server.removeAllListeners("exit");
		server.kill();
	}
}
await browser.close();
process.exit(failed ? 1 : 0);
