import { isNullValue } from '@fincity/kirun-js';

export function pathFromParams(url: string, params: any): string {
	if (isNullValue(params)) return url;

	Object.entries(params).forEach(([k, v]) => {
		url = url.replace(new RegExp(`{${k}}`, 'ig'), '' + v);
	});

	return url;
}

export function queryParamsSerializer(
	params: any,
	prefix: string = '',
): [boolean, string] | undefined {
	if (params === undefined) return undefined;

	const typeOfParams = typeof params;
	if (Array.isArray(params)) {
		prefix =
			prefix !== '' ? prefix.substring(0, prefix.length - 1) : prefix;
		return [
			true,
			params
				.map((v, i) => queryParamsSerializer(v, `${prefix}[${i}].`))
				.filter(e => e != undefined)
				.map((bs, i) => (bs![0] ? bs![1] : `${prefix}[${i}]=${bs![1]}`))
				.join('&'),
		];
	} else if (typeOfParams === 'object') {
		return [
			true,
			Object.entries(params)
				.map(([k, v]) => {
					const x = queryParamsSerializer(v, `${prefix}${k}.`);
					if (x === undefined) return undefined;
					return x[0] ? x[1] : `${prefix}${k}=${x[1]}`;
				})
				.filter(e => e != undefined)
				.join('&'),
		];
	} else {
		return [false, encodeURIComponent('' + params)];
	}
}
