sap.ui.define([
  "sap/ui/core/Core",
  "sap/ui/core/mvc/Controller",
  "sap/ui/model/json/JSONModel",
  "kor/ui/Toast"
], (Core, Controller, JSONModel, Toast) => {
  const statusKeys = { open: "statusOpen", packing: "statusPacking", sent: "statusSent" };

  return Controller.extend("kor.example.orders.controller.Orders", {
    onInit() {
      const language = Core.getConfiguration().getLanguage().startsWith("tr") ? "tr" : "en";
      this.getView().setModel(new JSONModel({
        language,
        open: false,
        draft: {},
        states: { open: "info", packing: "wait", sent: "success" }
      }), "ui");
      document.title = this.text("appTitle");
    },
    text(key, args) {
      return this.getOwnerComponent().getModel("i18n").getResourceBundle().getText(key, args);
    },
    statusText(status) {
      return this.text(statusKeys[status]);
    },
    onLanguage(event) {
      const url = new URL(location.href);
      url.searchParams.set("lang", event.getParameter("key"));
      location.assign(url);
    },
    onOrder(event) {
      const context = event.getParameter("context");
      const ui = this.getView().getModel("ui");
      this.orderPath = context.getPath();
      ui.setProperty("/draft", { ...context.getObject() });
      ui.setProperty("/open", true);
    },
    onClose() {
      this.getView().getModel("ui").setProperty("/open", false);
      this.orderPath = undefined;
    },
    onSave() {
      if (!this.orderPath || !this.byId("deliveryForm").validate()) return;
      const order = this.getView().getModel("ui").getProperty("/draft");
      this.getView().getModel().setProperty(this.orderPath, { ...order });
      this.onClose();
      Toast.show(this.text("saved", [order.id]));
    }
  });
});
