export default {
	title: { en: "Accessibility", tr: "Erişilebilirlik" },
	summary: { en: "Give controls clear names and test the complete task with the keyboard.", tr: "Kontrollere anlaşılır adlar ver ve işlemi baştan sona klavyeyle dene." },
	body: {
		en: `## Label what users can operate

- Use a meaningful \`label\` on fields and on controls such as DataGrid, Board and Schedule.
- Give icon-only [buttons](/components/button/) a \`label\`. On a standalone [Icon](/components/icon/), supply \`alt\` when the icon conveys information.
- Use [Status](/components/status/) text to state the condition. The shape and color reinforce the text.

## Check focus and keyboard behavior

- Open and dismiss a [Dialog](/components/dialog/) using only the keyboard. Check which control receives focus on return.
- Use F4 in [LookupField](/components/lookup-field/). Confirm you can choose a row and resume typing after dismissal.
- Move a focused [Board](/components/board/) card with Ctrl and the horizontal arrows. Use arrows on a focused [Schedule](/components/schedule/) task.
- Hold Space on [HoldButton](/components/hold-button/) or press Enter twice.

Kor CSS reduces its animations when the user requests reduced motion. Keyboard interactions and RTL rendering have been checked in Chrome. A real screen reader is **not tested**.`,
		tr: `## Etkileşimli kontrollere ad ver

- Alanlara ve DataGrid, Board, Schedule gibi kontrollere anlamlı bir \`label\` ver.
- Yalnız simge içeren [düğmelere](/components/button/) \`label\` ver. Tek başına kullanılan [Icon](/components/icon/) bilgi taşıyorsa \`alt\` özelliğini doldur.
- Durumu [Status](/components/status/) metninde belirt. Şekil ve renk metni destekler.

## Odağı ve klavye kullanımını denetle

- Bir [Dialog](/components/dialog/) penceresini yalnız klavyeyle açıp kapat. Dönüşte odağın hangi kontrole geçtiğine bak.
- [LookupField](/components/lookup-field/) alanında F4 tuşuna bas. Satır seçebildiğini ve pencere kapanınca yazmaya devam edebildiğini kontrol et.
- Odaktaki [Board](/components/board/) kartını Ctrl ve yatay oklarla taşı. Odaktaki [Schedule](/components/schedule/) işi için ok tuşlarını kullan.
- [HoldButton](/components/hold-button/) için Boşluk tuşunu basılı tut veya Enter’a iki kez bas.

Kullanıcı hareketi azaltmayı seçtiğinde Kor CSS animasyonları azaltır. Klavye etkileşimleri ve sağdan sola çizim Chrome’da denendi. Gerçek ekran okuyucu **denenmedi**.`
	}
};
