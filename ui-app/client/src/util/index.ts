import { getData } from '../context/StoreContext';

const pageNameRegex = /(?:\/page\/)([\w\d]+)/;
export const pathBreaker = (location: string) => {
	const regexResult = pageNameRegex.exec(location);
	let pagename = regexResult
		? regexResult[1]
		: location.substring(
				1,
				location.indexOf('/', 1) === -1
					? location.length
					: location.indexOf('/', 1),
		  );
	if (pagename === '/') pagename = '';
	const index = regexResult
		? regexResult.index + 6 + pagename.length + 1
		: pagename.length + 2;
	const appDetails = location
		.substring(0, regexResult ? regexResult.index : 0)
		.split('/')
		.filter(e => !!e);
	let appname;
	let clientcode;
	if (appDetails.length) {
		appDetails.length > 1
			? ([appname, clientcode] = appDetails)
			: ([appname] = appDetails);
	}
	return {
		appname,
		clientcode,
		pagename: pagename ? pagename : undefined,
	};
};
