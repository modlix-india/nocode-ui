import { Location as ReactLocation } from 'react-router-dom';

export interface URLDetails {
	queryParameters: any;
	pathParts?: Array<string> | undefined;
	pageName?: string | undefined;
	appName?: string | undefined;
	clientCode?: string | undefined;
};

export function processLocation(location: ReactLocation | Location) {
	const details: URLDetails = { queryParameters: {} };

	if (location.search) {
		details.queryParameters = location.search
			.split('&')
			.map(e => {
				if (e.startsWith('?')) e = e.substring(1);
				const two = e.split('=');
				if (two.length === 0) return undefined;
				if (two.length === 1) return { key: decodeURIComponent(two[0]), value: '' };
				return { key: decodeURIComponent(two[0]), value: decodeURIComponent(two[1]) };
			})
			.reduce((a: any, c) => {
				if (!c) return a;

				a[c.key] = c.value;
				return a;
			}, {});
	}

	if (location.pathname) {
		const pathParts = location.pathname
			.split('/')
			.filter(e => e !== '')
			.map(e => decodeURIComponent(e));

		const ind = pathParts.indexOf('page');
		if (ind === -1) {
			details.pathParts = pathParts;
			details.pageName = pathParts[0];
		} else {
			if (ind > 0) details.appName = pathParts[0];
			if (ind > 1) details.clientCode = pathParts[1];
			details.pageName = pathParts[ind + 1];
			details.pathParts = pathParts.slice(ind + 1);
		}
	}
	return details;
}
