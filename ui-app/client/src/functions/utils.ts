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

export function onMouseDownDragStartCurry(
	startX: number,
	startY: number,
	onDrag?: (newX: number, newY: number, diffX: number, diffY: number, e: MouseEvent) => void,
	onDragEnd?: (newX: number, newY: number, diffX: number, diffY: number, e: MouseEvent) => void,
): (e: React.MouseEvent) => void {
	return (e: React.MouseEvent) => {
		if (e.buttons !== 1) return;
		e.preventDefault();
		e.stopPropagation();

		const { clientX, clientY } = e;
		let lastData = { newX: 0, newY: 0, diffX: 0, diffY: 0 };
		const onMouseMove = (ie: MouseEvent) => {
			ie.preventDefault();
			ie.stopPropagation();
			if (ie.buttons !== 1) {
				document.body.removeEventListener('mousemove', onMouseMove);
				document.body.removeEventListener('mouseup', onMouseUp);
				document.body.removeEventListener('mouseleave', onMouseUp);
				return;
			}

			const diffX = ie.clientX - clientX;
			const diffY = ie.clientY - clientY;
			lastData = { newX: startX + diffX, newY: startY + diffY, diffX, diffY };
			onDrag?.(startX + diffX, startY + diffY, diffX, diffY, ie);
		};
		const onMouseUp = (ie: MouseEvent) => {
			if (ie.buttons !== 1) return;
			ie.preventDefault();
			ie.stopPropagation();
			document.body.removeEventListener('mousemove', onMouseMove);
			document.body.removeEventListener('mouseup', onMouseUp);
			document.body.removeEventListener('mouseleave', onMouseUp);
			if (ie.type === 'mouseleave') return;
			onDragEnd?.(lastData.newX, lastData.newY, lastData.diffX, lastData.diffY, ie);
		};
		document.body.addEventListener('mousemove', onMouseMove);
		document.body.addEventListener('mouseup', onMouseUp);
		document.body.addEventListener('mouseleave', onMouseUp);
	};
}

export function roundTo(num: number | string, digits: number): number | string {
	const isString = typeof num === 'string';
	const v = isString ? parseFloat(num) : num;
	const factor = Math.pow(10, digits);
	if (isString) return (Math.round(v * factor) / factor).toString();
	return Math.round(v * factor) / factor;
}
