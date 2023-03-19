export default function duplicate(obj: any): any {
	if (!obj) return obj;
	if (structuredClone) return structuredClone(obj);
	return duplicate(obj);
}
