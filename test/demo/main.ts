import XMLView from "sap/ui/core/mvc/XMLView";
import Theme from "kor/ui/Theme";

Theme.set({ mode: new URLSearchParams(location.search).get("mode") === "dark" ? "dark" : "light" });
void XMLView.create({ viewName: "kor.ui.demo.Main" }).then((view) => view.placeAt("content"));
