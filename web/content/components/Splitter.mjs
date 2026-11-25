export default {
	summary: { en: "Divides space into two adjustable panes.", tr: "Alanı ayarlanabilir iki bölmeye ayırır." },
	use: { en: ["Use it for list and preview layouts on large screens."], tr: ["Geniş ekranda liste ve önizleme için kullan."] },
	related: ["ColumnLayout", "Stack"],
	samples: [
		{
			title: { en: "List and preview", tr: "Liste ve önizleme" },
			xml: `<k:Splitter height="220px" position="35">
				<k:start><k:List><k:ListItem title="[[Invoice 101||Fatura 101]]"/><k:ListItem title="[[Invoice 102||Fatura 102]]"/></k:List></k:start>
				<k:end><k:Empty icon="file-text" title="[[Preview||Önizleme]]" text="[[Drag the divider.||Aradaki çizgiyi sürükle.]]"/></k:end>
			</k:Splitter>`
		}
	]
};
