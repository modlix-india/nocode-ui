const STATIC_FILE_API_PREFIX = 'api/files/static/file';
const STATIC_FILE_API_PREFIX_LENGTH = STATIC_FILE_API_PREFIX.length;

export default function getSrcUrl(urlAny: any) {
	if (globalThis.isDebugMode || !globalThis.cdnPrefix || !urlAny) return urlAny;
	let url = typeof urlAny !== 'string' ? '' + urlAny : urlAny;

	const index = url.indexOf(STATIC_FILE_API_PREFIX);

	if (index == -1) return url;

	if (globalThis.cdnStripAPIPrefix) {
		url = url.substring(index + STATIC_FILE_API_PREFIX_LENGTH);
	}

	// In some CDNs, the '+' character is not recognized as a space.
	if (globalThis.cdnReplacePlus) {
		url = url.replaceAll('+', '%20');
	}

	if (globalThis.cdnResizeOptionsType == 'cloudflare') {
		const qIndex = url.indexOf('?');
		if (qIndex != -1) {
			const paramPart = url.substring(qIndex);
			const front = url.substring(0, qIndex);
			if (
				front.endsWith('png') ||
				front.endsWith('jpg') ||
				front.endsWith('jpeg') ||
				front.endsWith('webp') ||
				front.endsWith('avif')
			)
				url = `/cdn-cgi/image/${paramPart.replaceAll('&', ',')}` + front;
		}
	}

	return 'https://' + globalThis.cdnPrefix + url;
}
