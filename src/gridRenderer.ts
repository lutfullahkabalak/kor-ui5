import type RenderManager from "sap/ui/core/RenderManager";
import type DataGrid from "./DataGrid";
import { message } from "./util";

type GridLike = DataGrid & { gridRole(): string };

/** DataGrid ve TreeGrid'in ortak çizimi */
const gridRenderer = {
	apiVersion: 2 as const,
	render(rm: RenderManager, c: GridLike) {
		const id = c.getId();
		rm.openStart("div", c).class("korGrid").style("height", c.getHeight()).openEnd();
		rm.openStart("div", `${id}-scroll`).class("korGridScroll").attr("tabindex", "0").attr("role", c.gridRole()).attr("aria-label", c.getLabel()).attr("aria-colcount", c.getColumns().length);
		if (c.getSelectionMode() === "Multi") rm.attr("aria-multiselectable", "true");
		rm.openEnd();
		rm.openStart("div", `${id}-canvas`).class("korGridCanvas").attr("role", "presentation").openEnd();
		rm.openStart("div", `${id}-head`).class("korGridHead").attr("role", "row").attr("aria-rowindex", "1").openEnd().close("div");
		rm.openStart("div", `${id}-body`).class("korGridBody").attr("role", "rowgroup").openEnd().close("div");
		rm.close("div");
		rm.openStart("div", `${id}-none`).class("korGridNone").attr("hidden", "hidden").openEnd().text(c.getNoData() || message("NO_DATA")).close("div");
		rm.close("div");
		if (c.getSummary()) rm.openStart("div", `${id}-foot`).class("korGridFoot").attr("aria-live", "polite").openEnd().close("div");
		rm.close("div");
	}
};
export default gridRenderer;
