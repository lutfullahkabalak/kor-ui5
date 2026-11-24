import Button from "./Button";
import Dialog from "./Dialog";
import Text from "./Text";
import TextField from "./TextField";
import { message } from "./util";

export type ConfirmOptions = {
	title: string;
	text?: string;
	confirmText?: string;
	cancelText?: string;
	danger?: boolean;
	/** Verilirse kullanıcı bunu yazmadan onaylayamaz */
	type?: string;
};

/**
 * Onay kutusu: `if (await Confirm.ask({ title: "Sipariş silinsin mi?", danger: true })) …`
 *
 * @namespace kor.ui
 */
const Confirm = {
	ask(options: ConfirmOptions): Promise<boolean> {
		return new Promise((resolve) => {
			const done = (answer: boolean) => {
				dialog.setOpen(false);
				window.setTimeout(() => dialog.destroy());
				resolve(answer);
			};
			const ok = new Button({ text: options.confirmText ?? message("CONFIRM"), kind: options.danger ? "danger" : "primary", enabled: !options.type, press: () => done(true) });
			const cancel = new Button({ text: options.cancelText ?? message("CANCEL"), press: () => done(false) });
			const dialog = new Dialog({
				title: options.title, width: 440, danger: !!options.danger,
				content: [
					...(options.text ? [new Text({ text: options.text })] : []),
					...(options.type ? [new TextField({ label: message("TYPE_TO_CONFIRM", [options.type]), liveChange: (event) => ok.setEnabled((event.getParameters() as unknown as { value: string }).value.trim() === options.type) })] : [])
				],
				footer: [cancel, ok],
				close: () => done(false)
			});
			dialog.addStyleClass("korConfirm");
			dialog.setOpen(true);
			// Yazma alanı yoksa odak güvenli düğmede başlar
			if (!options.type) window.setTimeout(() => (options.danger ? cancel : ok).focus());
		});
	}
};
export default Confirm;
