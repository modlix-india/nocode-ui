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
	level: number = 0,
): [boolean, string] | undefined {
	if (params === undefined) return undefined;

	const typeOfParams = typeof params;
	if (Array.isArray(params)) {
		prefix = prefix !== '' ? prefix.substring(0, prefix.length - 1) : prefix;
		return [
			true,
			params
				.map((v, i) => queryParamsSerializer(v, `${prefix}[${i}].`), level + 1)
				.filter(e => e != undefined)
				.map((bs, i) => {
					if (bs![0]) return bs![1];

					return level == 1 ? `${prefix}=${bs![1]}` : `${prefix}[${i}]=${bs![1]}`;
				})
				.join('&'),
		];
	} else if (typeOfParams === 'object') {
		return [
			true,
			Object.entries(params)
				.map(([k, v]) => {
					const x = queryParamsSerializer(v, `${prefix}${k}.`, level + 1);
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

export function camelCaseToUpperSpaceCase(str: string) {
	if (str.trim().length <= 0) return str;

	const retStr = str.replace(/([A-Z])/g, ' $1');
	return retStr.substring(0, 1).toUpperCase() + retStr.substring(1);
}

export function hashCodeString(str: string | undefined, radix?: number): string {
	return hashCode(str).toString(radix ?? 16);
}

export function hashCode(str: string | undefined): number {
	if (!str || !str.length) return 0;

	let hash = 0,
		chr;

	for (let i = 0; i < str.length; i++) {
		chr = str.charCodeAt(i);
		hash = (hash << 5) - hash + chr;
		hash |= 0;
	}

	return hash;
}
