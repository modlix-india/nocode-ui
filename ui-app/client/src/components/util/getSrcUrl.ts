const STATIC_FILE_API_PREFIX = 'api/files/static/file';
const STATIC_FILE_API_PREFIX_LENGTH = STATIC_FILE_API_PREFIX.length;

export default function getSrcUrl(url: string) {
	if (window.isDebugMode || !window.cdnPrefix || !url) return url;

	const index = url.indexOf(STATIC_FILE_API_PREFIX);

	if (index == -1) return url;

	if (window.cdnStripAPIPrefix) {
		url = url.substring(index + STATIC_FILE_API_PREFIX_LENGTH);
	}

	// In some CDNs, the '+' character is not recognized as a space.
	if (window.cdnReplacePlus) {
		url = url.replaceAll('+', '%20');
	}

	return 'https://' + window.cdnPrefix + url;
}
