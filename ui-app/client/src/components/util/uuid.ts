export default function UUID() {
	let dt = new Date().getTime();
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (dt + Math.random() * 16) % 16 | 0;
		dt = Math.floor(dt / 16);
		return (c == 'x' ? r : (r & 0x3) | 0x8).toString(16);
	});
}

export function flattenUUID(key: string): string {
	let x = '';
	for (let i = 0; i < key.length; i++)
		x +=
			(key[i] >= 'a' && key[i] <= 'z') ||
			(key[i] >= 'A' && key[i] <= 'Z') ||
			(key[i] >= '0' && key[i] <= '9') ||
			key[i] == '_'
				? key[i]
				: '';

	return x;
}
