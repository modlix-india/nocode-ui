const STATIC_FILE_API_PREFIX = 'api/files/static/file';
const STATIC_FILE_API_PREFIX_LENGTH = STATIC_FILE_API_PREFIX.length;

export default function getSrcUrl(url: string) {
	if (window.isDebugMode || !window.cdnPrefix || !url) return url;

	const index = url.indexOf(STATIC_FILE_API_PREFIX);

	if (index == -1) return url;

	return 'https://' + window.cdnPrefix + (window.cdnStripAPIPrefix ? strip(url, index) : url);
}

function strip(url: string, index: number) {
	return url.substring(index + STATIC_FILE_API_PREFIX_LENGTH);
}
