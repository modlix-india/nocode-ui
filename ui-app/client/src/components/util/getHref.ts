import { Location as ReactLocation } from 'react-router-dom';
import { processLocation } from '../../util/locationProcessor';
import { getDataFromPath } from '../../context/StoreContext';

type LocationLike = Pick<Location, 'pathname' | 'search'>;

globalThis.domainAppCode = 'appbuilder';
globalThis.domainClientCode = 'SYSTEM';

export function getHref(linkPath: string = '', location: ReactLocation | Location | LocationLike) {
	if (typeof linkPath !== 'string') return undefined;

	if (linkPath.startsWith('\\')) {
		return urlPrefixRemoval(linkPath.substring(1));
	}

	const processedLocation = processLocation(location);
	let prefix: string = '';
	let midfix: string = '';
	let url: string = '';
	if (
		linkPath?.startsWith('data:') ||
		linkPath?.startsWith('http:') ||
		linkPath?.startsWith('https:') ||
		linkPath?.startsWith('//') ||
		linkPath?.startsWith('www') ||
		linkPath?.startsWith('mailto:') ||
		linkPath?.startsWith('tel:') ||
		linkPath?.startsWith('#')
	) {
		return linkPath;
	}

	if (location.pathname.includes('/page')) {
		const appCode = processedLocation.appName ? '/' + processedLocation.appName : '';
		const clientCode = processedLocation.clientCode ? '/' + processedLocation.clientCode : '';
		prefix = appCode + clientCode;
	}

	if (linkPath?.startsWith('/')) {
		if (linkPath?.startsWith('/api/')) {
			url = prefix + '' + linkPath;
		} else if (location.pathname.includes('/page/')) {
			url = prefix + '/page' + linkPath;
		} else {
			url = linkPath;
		}
	} else {
		let length = '/page/'.length;
		midfix = location.pathname.substring(
			location.pathname.indexOf('/page/') + length,
			location.pathname.length,
		);
		if (midfix !== '' && !midfix.endsWith('/')) {
			midfix += '/';
		}

		if (linkPath?.startsWith('api')) {
			if (location.pathname.includes('/page/')) {
				url = prefix + '/' + midfix + linkPath;
			} else {
				url = linkPath;
			}
		} else if (location.pathname.includes('/page/')) {
			url = prefix + '/page/' + midfix + linkPath;
		} else {
			url = linkPath;
		}
	}

	return urlPrefixRemoval(url);
}

function urlPrefixRemoval(url: string) {
	if (!globalThis.domainAppCode || !globalThis.domainClientCode) {
		return url;
	}

	let index = url.indexOf('/page');
	if (index === -1) return url;

	const { appCode, clientCode } = getDataFromPath('Store.url', []) ?? {};

	if (appCode !== undefined || clientCode !== undefined) return url;

	const prefix = `/${globalThis.domainAppCode}/${globalThis.domainClientCode}/page`;

	url = encodeRequestParmaeters(url);

	if (url.startsWith(prefix)) {
		return url.substring(prefix.length);
	}

	return url;
}

function encodeRequestParmaeters(url: string) {
	const qindex = url.indexOf('?');
	if (qindex !== -1) {
		const params = url.substring(qindex + 1).split('&');

		url =
			url.substring(0, qindex + 1) +
			params
				.map(e => {
					if (!e) return;
					const [pname, pvalue] = e.split('=');
					if (pvalue == undefined) return pname;
					return pname + '=' + encodeURIComponent(pvalue ?? '');
				})
				.join('&');
	}
	return url;
}
