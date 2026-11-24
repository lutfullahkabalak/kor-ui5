export default {
	summary: { en: "Anchors a small panel to an existing control.", tr: "Küçük bir paneli ekrandaki bir kontrolün yanında açar." },
	use: { en: ["Keep short detail or quick actions next to their trigger."], tr: ["Kısa bilgiyi ya da hızlı işlemi açan düğmenin yanında göster."] },
	related: ["Tooltip", "Sheet"],
	samples: [
		{
			title: { en: "Anchored detail", tr: "Düğmenin yanında ayrıntı" },
			xml: `<k:Button text="[[Show dispatch time||Çıkış saatini göster]]" press=".onOpen">
				<k:dependents>
					<k:Popover id="details" title="[[Dispatch||Sevkiyat]]">
						<k:Text text="[[Pickup begins at noon.||Teslim alma öğle saatinde başlıyor.]]"/>
					</k:Popover>
				</k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => Controller.extend("sample.DispatchPopover", {
				onOpen(event) {
					this.byId("details").openBy(event.getSource());
				}
			}));`
		},
		{
			title: { en: "Quick action", tr: "Hızlı işlem" },
			xml: `<k:Button text="[[Show dispatch options||Sevkiyat seçenekleri]]" press=".onOpen">
				<k:dependents>
					<k:Popover id="details" title="[[Dispatch||Sevkiyat]]">
						<k:content><k:Text text="[[A driver needs to check in.||Sürücünün giriş kaydı yapması gerekiyor.]]"/></k:content>
						<k:footer><k:Button text="[[Notify driver||Sürücüye bildir]]" press=".onNotify"/></k:footer>
					</k:Popover>
				</k:dependents>
			</k:Button>`,
			js: `sap.ui.define(["sap/ui/core/mvc/Controller", "kor/ui/Toast"], (Controller, Toast) => Controller.extend("sample.DispatchPopover", {
				onOpen(event) {
					this.byId("details").openBy(event.getSource());
				},
				onNotify() {
					this.byId("details").close();
					Toast.show("[[Driver notified||Sürücüye bildirildi]]");
				}
			}));`
		}
	]
};
