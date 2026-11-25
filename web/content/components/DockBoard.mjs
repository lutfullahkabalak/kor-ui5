export default {
	children: ["Dock","DockTruck"],
	summary: { en: "Runs the docks of a warehouse.", tr: "Deponun rampalarını yönetir." },
	use: { en: ["Use it on a yard or warehouse screen."], tr: ["Saha veya depo ekranında kullan."] },
	related: ["LoadPlan", "Schedule"],
	samples: [
		{
			title: { en: "Assign a truck", tr: "Aracı rampaya al" },
			xml: `<k:DockBoard docks="{path: '/docks', templateShareable: false}" queue="{path: '/queue', templateShareable: false}" assign=".onAssign">
				<k:docks><k:Dock key="{key}" name="{name}" plate="{plate}" text="{text}" state="{state}" progress="{progress}"/></k:docks>
				<k:queue><k:DockTruck key="{plate}" plate="{plate}" text="{text}" time="{time}"/></k:queue>
			</k:DockBoard>`,
			data: {
				"docks": [
					{
						"key": "1",
						"name": "R1",
						"plate": "34 ABC 12",
						"text": "Atlas",
						"state": "loading",
						"progress": 65
					},
					{
						"key": "2",
						"name": "R2",
						"plate": "",
						"text": "",
						"state": "",
						"progress": 0
					},
					{
						"key": "3",
						"name": "R3",
						"plate": "16 KL 908",
						"text": "Marmara",
						"state": "unloading",
						"progress": 30
					},
					{
						"key": "4",
						"name": "R4",
						"plate": "",
						"text": "",
						"state": "closed",
						"progress": 0
					}
				],
				"queue": [
					{
						"plate": "06 TIR 44",
						"text": "[[Ankara, 18 pallets||Ankara, 18 palet]]",
						"time": "[[25 min||25 dk]]"
					},
					{
						"plate": "35 EGE 7",
						"text": "[[İzmir, 9 pallets||İzmir, 9 palet]]",
						"time": "[[10 min||10 dk]]"
					}
				]
			},
			js: `sap.ui.define(["sap/ui/core/mvc/Controller"], (Controller) => Controller.extend("sample.Yard", {
				onAssign(event) {
					const model = this.getView().getModel(), data = model.getData();
					const { truck, dock } = event.getParameters();
					const found = data.queue.find((item) => item.plate === truck);
					Object.assign(data.docks.find((item) => item.key === dock), { plate: truck, text: found.text, state: "loading" });
					data.queue = data.queue.filter((item) => item !== found);
					model.refresh(true);
				}
			}));`
		}
	]
};
