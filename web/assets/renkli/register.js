/*!
 * Renkli İkon: SAP-icons adlarının tamamını kapsayan renkli ikon fontu (UI5 >= 1.108).
 *
 * Kullanım:
 *   resourceroots: { "renkli": "<yol>/renkli" }
 *   sap.ui.require(["renkli/register"], function (Renkli) {
 *       // 1) Ayrı koleksiyon: icon="sap-icon://renkli/accept"
 *       // 2) İsteğe bağlı: tüm standart ikonları renkli yap
 *       Renkli.replaceStandardIcons();
 *   });
 */
sap.ui.define([
	"sap/ui/core/IconPool",
	"sap/ui/dom/includeStylesheet"
], function (IconPool, includeStylesheet) {
	"use strict";

	var COLLECTION = "renkli";
	var FAMILY = "RenkliIkon";
	var REPLACE_CLASS = "renkliSap";

	var fontURI = sap.ui.require.toUrl("renkli/fonts");
	if (fontURI.charAt(fontURI.length - 1) !== "/") {
		fontURI += "/";
	}

	IconPool.registerFont({
		collectionName: COLLECTION,
		fontFamily: FAMILY,
		fontURI: fontURI,
		lazy: true
	});

	// @font-face (değiştirme kipi için) ve palet kuralları
	includeStylesheet(sap.ui.require.toUrl("renkli/renkli.css"), "renkli-css");

	return {
		/** Koleksiyon adı: sap-icon://renkli/<ad> */
		collection: COLLECTION,
		/** Font ailesi */
		fontFamily: FAMILY,

		/**
		 * SAP-icons ile çizilen tüm sap.ui.core.Icon'ları (düğmeler, listeler, sekmeler...)
		 * renkli sürümle gösterir. Kod noktaları aynı olduğu için ek bir eşleme gerekmez.
		 * Kontrollerin kendi CSS'iyle çizdiği küçük işaretler (onay kutusu tiki, açılır ok vb.) değişmez.
		 * @param {boolean} [bOn=true] false verilirse standart SAP ikonlarına döner
		 */
		replaceStandardIcons: function (bOn) {
			document.documentElement.classList.toggle(REPLACE_CLASS, bOn !== false);
		},

		/** Değiştirme kipi açık mı */
		isReplacingStandardIcons: function () {
			return document.documentElement.classList.contains(REPLACE_CLASS);
		},

		/**
		 * Fontun meta verisini yükler; bittiğinde getIconInfo(ad, "renkli") eşzamanlı çalışır.
		 * @returns {Promise}
		 */
		ready: function () {
			return Promise.resolve(IconPool.getIconInfo("accept", COLLECTION, "async"));
		}
	};
});
