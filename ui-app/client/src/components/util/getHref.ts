import { Location, useLocation } from 'react-router-dom';
import { processLocation } from '../../Engine/RenderEngineContainer';

export function getHref(linkPath: String, location: Location) {
	const processedLocation = processLocation(location);
	let prefix = '';
	let midfix = '';
	let url = '';
	if (location.pathname.includes('/page')) {
		prefix = processedLocation.appName
			? '/' + processedLocation.appName
			: '' + processedLocation.clientCode
			? '/' + processedLocation.clientCode
			: '';
	} else {
		// ??
	}

	if (!linkPath.startsWith('/')) {
		let length = '/page/'.length;
		midfix = location.pathname.substring(
			location.pathname.indexOf('/page/') + length,
			location.pathname.length,
		);
		if (midfix !== '') {
			midfix += '/';
		}
		url = prefix + '/' + midfix + linkPath;
	} else {
		if (linkPath.startsWith('/api/') || linkPath.startsWith('api/')) {
			url = prefix + '/' + linkPath;
		} else {
			url = prefix + '/page/' + linkPath;
		}
	}

	if (!url.startsWith('/')) {
		url = '/' + url;
	}
}
