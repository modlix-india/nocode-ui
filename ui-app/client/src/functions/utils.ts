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

/**
 * Keep a pointer drag alive while the pointer is over an iframe.
 *
 * A drag follows the pointer with listeners on this document, and an iframe is a
 * document of its own: the moment the pointer is over one, `mousemove` stops
 * arriving and the `mouseup` that should have ended the drag is delivered to the
 * frame instead. The drag does not end, it freezes -- still armed, still stuck
 * to the pointer. Nothing about that is an edge case for a resizable Grid or the
 * chat's page preview: both drag ACROSS a frame by design.
 *
 * A transparent element pinned over the viewport, above everything, takes those
 * events in THIS document, so the listeners keep firing wherever the pointer
 * goes. It carries the drag cursor too, because from mousedown on, the pointer
 * is over the shield and whatever the element beneath would have shown no longer
 * applies.
 *
 * Returns the teardown. Call it on every path that ends the drag, including the
 * ones that end it without a mouseup.
 */
export function startDragShield(cursor?: string): () => void {
	if (typeof document === 'undefined' || !document.body) return () => {};

	const shield = document.createElement('div');
	shield.dataset.dragShield = 'true';
	// Insets rather than 100vw/100vh: on a page with a scrollbar those overflow
	// the viewport and the shield itself would add a scrollbar mid-drag.
	// Max z-index because a popup, or the editor's floating bars, are allowed to
	// be above the page and the shield has to be above THEM until the drag ends.
	shield.style.cssText =
		'position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147483647;background:transparent;';
	if (cursor && cursor !== 'auto') shield.style.cursor = cursor;
	document.body.appendChild(shield);

	let released = false;
	return () => {
		if (released) return;
		released = true;
		shield.remove();
	};
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
		// Read off the grip while the event is still live: the handler runs
		// synchronously, but the element can be gone by the time the drag ends.
		const grip = e.currentTarget as HTMLElement | null;
		const releaseShield = startDragShield(
			grip && typeof window !== 'undefined'
				? window.getComputedStyle(grip).cursor
				: undefined,
		);

		let lastData = { newX: 0, newY: 0, diffX: 0, diffY: 0 };
		const stop = () => {
			document.body.removeEventListener('mousemove', onMouseMove);
			document.body.removeEventListener('mouseup', onMouseUp);
			document.body.removeEventListener('mouseleave', onMouseUp);
			releaseShield();
		};
		const onMouseMove = (ie: MouseEvent) => {
			ie.preventDefault();
			ie.stopPropagation();
			if (ie.buttons !== 1) {
				stop();
				onDragEnd?.(lastData.newX, lastData.newY, lastData.diffX, lastData.diffY, ie);
				return;
			}

			const diffX = ie.clientX - clientX;
			const diffY = ie.clientY - clientY;
			lastData = { newX: startX + diffX, newY: startY + diffY, diffX, diffY };
			onDrag?.(startX + diffX, startY + diffY, diffX, diffY, ie);
		};
		const onMouseUp = (ie: MouseEvent) => {
			ie.preventDefault();
			ie.stopPropagation();

			stop();
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
