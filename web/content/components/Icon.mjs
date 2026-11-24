import { readFileSync } from "node:fs";
import ts from "typescript";

const source = ts.createSourceFile("icons.ts", readFileSync(new URL("../../../src/icons.ts", import.meta.url), "utf8"), ts.ScriptTarget.Latest, true);
let dictionary = source.statements.find(ts.isVariableStatement).declarationList.declarations[0].initializer;
while (ts.isAsExpression(dictionary)) dictionary = dictionary.expression;
const names = dictionary.properties.map((property) => property.name.text).sort();
const list = '<ul class="iconNames">' + names.map((name) => '<li><code>' + name + '</code></li>').join("") + '</ul>';

export default {
	summary: { en: "Renders a Kor icon or a UI5 icon URI.", tr: "Kor simgesini veya UI5 simge adresini çizer." },
	use: { en: ["Support a label with a familiar visual cue or give a standalone icon an accessible description."], tr: ["Etiketi tanıdık bir simgeyle destekle veya tek başına kullanılan simgeye erişilebilir açıklama ver."] },
	related: ["Button", "Status"],
	samples: [
		{
			title: { en: "A decorative icon", tr: "Süs amaçlı simge" },
			xml: `<k:Stack row="true" gap="8" align="center">
				<k:Icon name="truck" size="20"/>
				<k:Text text="[[Delivery by road||Karayoluyla teslimat]]"/>
			</k:Stack>`
		},
		{
			title: { en: "Use a UI5 icon", tr: "UI5 simgesi kullan" },
			xml: `<k:Stack row="true" gap="8" align="center">
				<k:Icon name="sap-icon://attachment" size="24" alt="[[Attachment||Ek dosya]]"/>
				<k:Text text="packing-slip.pdf"/>
			</k:Stack>`
		}
	],
	html: { en: '<h2>Kor icon names</h2>' + list, tr: '<h2>Kor simge adları</h2>' + list }
};
