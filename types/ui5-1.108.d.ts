// UI5 1.108 tiplerinde renderer modülleri yoktur
declare module "sap/m/*Renderer" {
	const renderer: object;
	export default renderer;
}
declare module "sap/ui/thirdparty/sinon" {
	const sinon: unknown;
	export default sinon;
}
