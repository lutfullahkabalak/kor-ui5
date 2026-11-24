import ResourceBundle from "sap/base/i18n/ResourceBundle";
import Core from "sap/ui/core/Core";

export const language = Core.getConfiguration().getLanguage().toLowerCase().startsWith("tr") ? "tr" : "en";
export const bundle = ResourceBundle.create({
	url: sap.ui.require.toUrl("kor/ui/demo/i18n.properties"),
	locale: language,
	supportedLocales: ["tr", ""],
	fallbackLocale: "",
	async: false
}) as ResourceBundle;

export function t(key: string, ...values: string[]): string {
	return bundle.getText(key, values.length ? values : undefined) ?? key;
}
