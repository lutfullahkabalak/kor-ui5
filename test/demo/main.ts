import XMLView from "sap/ui/core/mvc/XMLView";
import Theme from "kor/ui/Theme";
import { t } from "./i18n";

const mode = new URLSearchParams(location.search).get("mode");
Theme.set({ mode: mode === "dark" || mode === "system" ? mode : "light" });
document.title = t("pageTitle");
void XMLView.create({ viewName: "kor.ui.demo.Main" }).then((view) => view.placeAt("content"));
