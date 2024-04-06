import React, { useMemo } from 'react';

import { Gradient } from '../common';
import { isNullValue } from '@fincity/kirun-js';

export default function GradientComponent({
	gradient,
	gradientUnits,
}: {
	gradient: Gradient;
	gradientUnits: string;
}) {
	const gradientString = gradient.gradient?.toLowerCase();

	if (gradientString.indexOf('linear') !== -1) {
		return (
			<LinearGradient
				hashCode={gradient.hashCode}
				gradient={gradientString}
				gradientUnits={gradientUnits}
			/>
		);
	} else if (gradientString.indexOf('radial') !== -1) {
		return (
			<RadialGradient
				hashCode={gradient.hashCode}
				gradient={gradientString}
				gradientUnits={gradientUnits}
			/>
		);
	}

	return <></>;
}

function makeGradientParts(gradient: string, type: string) {
	const ind = gradient.indexOf(type);
	if (ind === -1) return [];
	let parts = [];
	let str = '';
	let countBracket = 1;
	for (let i = ind + 16; i < gradient.length; i++) {
		if (gradient[i] === '(') countBracket++;
		else if (gradient[i] === ')') {
			countBracket--;
			if (countBracket === 0) break;
		}
		if (gradient[i] === ',' && countBracket === 1) {
			parts.push(str);
			str = '';
		} else str += gradient[i];
	}
	parts.push(str);
	return parts;
}

function makeStops(
	parts: string[],
	i: number,
): { key: string; stopColor: string; offset?: string }[] {
	const stopValues = [];

	for (; i < parts.length; i++) {
		let stop = parts[i].trim().split(' ');
		if (stop.length > 2)
			stop = [stop.slice(0, stop.length - 1).join(' '), stop[stop.length - 1]];
		if (stop.length === 1) {
			stopValues.push({ key: parts[i], stopColor: stop[0] });
		} else if (stop.length === 2) {
			stopValues.push({ key: parts[i], stopColor: stop[0], offset: stop[1] });
		} else if (stop.length === 3) {
			stopValues.push({ key: parts[i] + 'start', stopColor: stop[0], offset: stop[1] });
			stopValues.push({ key: parts[i] + 'end', stopColor: stop[0], offset: stop[2] });
		}
	}

	if (!stopValues.length) return [];

	if (!stopValues[0]?.offset) {
		stopValues[0].offset = '0%';
	}

	if (!stopValues[stopValues.length - 1]?.offset) {
		stopValues[stopValues.length - 1].offset = '100%';
	}

	for (i = 1; i < stopValues.length - 1; i++) {
		if (stopValues[i]?.offset) continue;

		let startValue = parseFloat(stopValues[i - 1].offset ?? '');
		for (let j = i + 1; j < stopValues.length; j++) {
			if (stopValues[j]?.offset) {
				const endValue = parseFloat(stopValues[j].offset ?? '');
				const diff = endValue - startValue;
				const inc = diff / (j - i + 2);
				startValue += inc;
				for (let k = i; k < j; k++) {
					stopValues[k].offset = `${startValue + inc * (k - i)}%`;
				}
				i = j - 1;
				break;
			}
		}
	}

	return stopValues;
}

function LinearGradient({
	gradient,
	hashCode,
	gradientUnits,
}: {
	hashCode: number;
	gradient: string;
	gradientUnits: string;
}) {
	gradient = gradient.replace(/[\t\r\n]/g, '').replace(/\s+/g, ' ');

	const parts = useMemo(() => makeGradientParts(gradient, 'linear-gradient('), [hashCode]);

	const { deg, stops } = useMemo(() => {
		let deg = 180;
		let i = 0;

		if (parts[i].indexOf('deg') !== -1) {
			deg = parseFloat(parts[i]);
			i++;
		} else if (parts[i].indexOf('to') !== -1) {
			const to = parts[i].substring(parts[i].indexOf('to') + 2);
			i++;
			switch (to.trim()) {
				case 'left':
					deg = 270;
					break;
				case 'right':
					deg = 90;
					break;
				case 'top':
					deg = 0;
					break;
				case 'bottom':
					deg = 180;
					break;
				case 'left top':
					deg = 315;
					break;
				case 'right top':
					deg = 45;
					break;
				case 'left bottom':
					deg = 225;
					break;
				case 'right bottom':
					deg = 135;
					break;
				default:
					i--;
					break;
			}
		} else if (parts[i].indexOf('rad') !== -1) {
			deg = (parseFloat(parts[i]) * 180) / Math.PI;
			i++;
		} else if (parts[i].indexOf('grad') !== -1) {
			deg = parseFloat(parts[i]) * 0.9;
			i++;
		} else if (parts[i].indexOf('turn') !== -1) {
			deg = parseFloat(parts[i]) * 360;
			i++;
		}

		if (deg < 0) deg += 360;

		const stops = makeStops(parts, i).map((stop, index) => (
			<stop key={index} offset={stop.offset} stopColor={stop.stopColor} />
		));

		return { deg, stops };
	}, [parts]);

	const [x1, y1, x2, y2] = useMemo(() => {
		let [x1, y1, x2, y2] = [50, 50, 50, -50];

		const r1 = Math.sqrt(x1 * x1 + y1 * y1);
		const r2 = Math.sqrt(x2 * x2 + y2 * y2);
		const theta1 = Math.atan2(y1, x1);
		const theta2 = Math.atan2(y2, x2);

		const rad = (deg * Math.PI) / 180;

		x1 = Math.round(r1 * Math.cos(theta1 + rad) * 100) / 100;
		y1 = Math.round(r1 * Math.sin(theta1 + rad) * 100) / 100;
		x2 = Math.round(r2 * Math.cos(theta2 + rad) * 100) / 100;
		y2 = Math.round(r2 * Math.sin(theta2 + rad) * 100) / 100;

		return [x1 + 50, y1 + 50, x2 + 50, y2 + 50];
	}, [deg]);

	return (
		<linearGradient
			id={`gradient_${Math.abs(hashCode)}`}
			x1={x1 + '%'}
			y1={y1 + '%'}
			x2={x2 + '%'}
			y2={y2 + '%'}
			gradientUnits={gradientUnits}
		>
			{stops}
		</linearGradient>
	);
}

function RadialGradient({
	gradient,
	hashCode,
	gradientUnits,
}: {
	hashCode: number;
	gradient: string;
	gradientUnits: string;
}) {
	gradient = gradient.replace(/[\t\r\n]/g, '').replace(/\s+/g, ' ');

	const parts = useMemo(() => makeGradientParts(gradient, 'radial-gradient('), [hashCode]);

	const { cx, cy, r, stops } = useMemo(() => {
		let i = 0;

		let cx = 50;
		let cy = 50;
		let r = 50;

		let acx = undefined;
		let acy = undefined;

		if (parts[i].trim() === 'circle' || parts[i].trim() === 'ellipse') {
			i++;
		} else if (parts[i].indexOf('at') !== -1) {
			const at = parts[i].split('at');

			if (at.length > 1) {
				const [x, y] = at[1].trim().split(' ');
				if (x === 'left') acx = 0;
				else if (x === 'center') acx = 50;
				else if (x === 'right') acx = 100;
				else if (x === 'top') acy = 0;
				else if (x === 'bottom') acy = 100;
				else acx = parseFloat(x);

				if (y !== undefined) {
					if (y === 'top') acy = 0;
					else if (y === 'center') acy = 50;
					else if (y === 'bottom') acy = 100;
					else acy = parseFloat(y);
				}
			}
		} else {
			const [x, y] = parts[i].split(' ');

			if (x === 'left') acx = 0;
			else if (x === 'center') acx = 50;
			else if (x === 'right') acx = 100;
			else if (x === 'top') acy = 0;
			else if (x === 'bottom') acy = 100;
			else acx = parseFloat(x);

			if (y !== undefined) {
				if (y === 'top') acy = 0;
				else if (y === 'center') acy = 50;
				else if (y === 'bottom') acy = 100;
				else acy = parseFloat(y);
			}
		}

		if (acx != undefined && !isNaN(acx)) {
			cx = acx;
			i++;
		}
		if (acy != undefined && !isNaN(acy)) {
			cy = acy;
			i++;
		}
		if (acx != undefined && acy != undefined && !isNaN(acx) && !isNaN(acy)) {
			cx = acx;
			cy = acy;
			i++;
		}

		const stops = makeStops(parts, i).map((stop, index) => (
			<stop key={index} offset={stop.offset} stopColor={stop.stopColor} />
		));

		return { cx, cy, r, stops };
	}, [parts]);

	return (
		<radialGradient
			cx={`${cx}%`}
			cy={`${cy}%`}
			r={`${r}%`}
			id={`gradient_${Math.abs(hashCode)}`}
			gradientUnits={gradientUnits}
		>
			{stops}
		</radialGradient>
	);
}
