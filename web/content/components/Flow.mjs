export default {
	children: ["FlowNode", "FlowLink"],
	summary: { en: "Shows quantities moving through steps in a process.", tr: "Miktarların süreç adımları arasındaki akışını gösterir." },
	use: { en: ["Show where incoming work is completed, redirected or held up."], tr: ["Gelen işin nerede tamamlandığını, yön değiştirdiğini veya beklediğini göster."] },
	related: ["Trend", "Stat"],
	samples: [
		{
			title: { en: "Connect two steps", tr: "İki adımı bağla" },
			xml: `<k:Flow height="200" unit="[[orders||sipariş]]" live="false" label="[[Order flow||Sipariş akışı]]">
				<k:nodes>
					<k:FlowNode key="received" label="[[Received||Alındı]]" value="18"/>
					<k:FlowNode key="packed" label="[[Packed||Paketlendi]]" column="1" value="18"/>
				</k:nodes>
				<k:links><k:FlowLink source="received" target="packed" value="18"/></k:links>
			</k:Flow>`
		},
		{
			title: { en: "Inspect a bottleneck", tr: "Darboğazı incele" },
			xml: `<k:Flow height="280" unit="[[orders||sipariş]]" label="[[Dispatch flow||Sevkiyat akışı]]" select=".onSelect">
				<k:nodes>
					<k:FlowNode key="packed" label="[[Packed||Paketlendi]]" value="30"/>
					<k:FlowNode key="sent" label="[[Dispatched||Sevk edildi]]" column="1" value="24"/>
					<k:FlowNode key="waiting" label="[[Waiting||Bekliyor]]" column="1" value="6" state="wait" note="[[Carrier pending||Taşıyıcı bekleniyor]]"/>
				</k:nodes>
				<k:links>
					<k:FlowLink source="packed" target="sent" value="24"/>
					<k:FlowLink source="packed" target="waiting" value="6"/>
				</k:links>
			</k:Flow>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.DispatchFlow", {
				onSelect(event) {
					const flow = event.getSource();
					const node = flow.getNodes().find((node) => node.getKey() === event.getParameter("key"));
					Toast.show(node ? node.getLabel() : "[[Selection cleared||Seçim kaldırıldı]]");
				}
			}));`
		}
	]
};
