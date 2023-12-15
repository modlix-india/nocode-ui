export default function getSrcUrl(url: string) {
	if (window.isDebugMode || !window.cdnPrefix || !url) return url;
	else if (url.startsWith('/api') && url.startsWith('api'))
		return 'https://' + window.cdnPrefix + url;
	else if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('//'))
		return url;
	else if (url.startsWith('www')) return url;
	else if (url.startsWith('/')) return 'https://' + window.cdnPrefix + url;

	return 'https://' + window.cdnPrefix + '/' + url;
}
