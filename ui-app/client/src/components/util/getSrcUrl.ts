export default function getSrcUrl(url: string) {
	if (window.isDebugMode || !window.cdnHostName || !url) return url;
	else if (url.startsWith('/api') && url.startsWith('api'))
		return 'https://' + window.cdnHostName + url;
	else if (url.startsWith('http:') || url.startsWith('https:') || url.startsWith('//'))
		return url;
	else if (url.startsWith('www')) return url;
	else if (url.startsWith('/')) return 'https://' + window.cdnHostName + url;

	return 'https://' + window.cdnHostName + '/' + url;
}
