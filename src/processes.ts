// Üretim süreçleri ve sektör ürünleri için simge adları
export const processIcons: Record<string, string> = {
	// Tekstil
	spinning: "spool", weaving: "grid-3x3", knitting: "blend", dyeing: "droplets", printing: "paint-roller", cutting: "scissors", sewing: "shirt", washing: "washing-machine", ironing: "flame",
	// Otomotiv ve metal
	pressing: "anvil", stamping: "hammer", welding: "zap", painting: "spray-can", casting: "flame", machining: "cog", drilling: "drill", grinding: "disc", bending: "ruler", bolting: "bolt", robot: "bot", assembly: "wrench",
	// Gıda ve ilaç
	receiving: "truck", milling: "wheat", mixing: "blend", cooking: "cooking-pot", baking: "croissant", cooling: "snowflake", filling: "pill-bottle", tableting: "tablets", sterilizing: "thermometer", brewing: "flask-conical",
	// Elektronik
	smt: "circuit-board", soldering: "plug-zap", chip: "cpu", wiring: "cable", charging: "battery-charging",
	// Mobilya ve yapı
	sawing: "axe", sanding: "layers-2", upholstery: "armchair", molding: "cylinder",
	// Ortak
	inspection: "scan-eye", testing: "gauge", lab: "microscope", measuring: "ruler-dimension-line", weighing: "weight", labeling: "scan-line", packing: "package", palletizing: "boxes", storage: "warehouse", shipping: "truck", recycling: "recycle", maintenance: "wrench"
};
export const processIcon = (name: string): string => processIcons[name] ?? (name || "factory");

const products: Record<string, string> = { textile: "shirt", automotive: "car", food: "croissant", beverage: "milk", pharma: "pill", electronics: "cpu", furniture: "sofa", metal: "nut", packaging: "package", chemical: "flask-conical", construction: "brick-wall", energy: "battery-charging" };
export const productIcon = (sector: string): string => products[sector] ?? "box";
