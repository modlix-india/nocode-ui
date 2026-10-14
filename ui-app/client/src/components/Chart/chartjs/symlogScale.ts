import { LinearScale } from 'chart.js';

/**
 * A zero safe logarithmic axis ("symlog").
 *
 * Chart.js' own logarithmic scale cannot place 0 or negative values (log(0) is -Infinity),
 * so a series that is 0 for some points breaks into pieces or disappears, and an area fill
 * to the origin has nowhere to go. Counts (deals, leads, visits) are 0 all the time.
 *
 * This scale maps a value v to sign(v) * log10(1 + |v|): 0 stays at 0, large values are
 * compressed like a log axis, and negatives mirror the positives. Data is not changed, so
 * tooltips and labels still show the real numbers.
 */

const MIN_TICK_GAP = 0.1; // in log10 units: closer ticks than this would overlap

export function symlog(value: number): number {
	return Math.sign(value) * Math.log10(1 + Math.abs(value));
}

export function symexp(value: number): number {
	return Math.sign(value) * (Math.pow(10, Math.abs(value)) - 1);
}

/**
 * Rounds a positive bound up to the next "nice" value (1, 2, 3 or 5 times a power of ten).
 * Zero and negative input is returned unchanged.
 */
export function niceSymlogBound(value: number): number {
	if (!(value > 0) || !Number.isFinite(value)) return value;
	const exp = Math.floor(Math.log10(value));
	const base = Math.pow(10, exp);
	for (const m of [1, 2, 3, 5, 10]) {
		const candidate = m * base;
		// Tolerate floating point noise (e.g. 0.3 stored as 0.30000000000000004)
		if (candidate >= value * (1 - 1e-9)) return Number(candidate.toPrecision(12));
	}
	return 10 * base;
}

/**
 * Tick values for a symlog axis between min and max: 0 (when in range), then 1 and 3 per
 * decade on each side, plus both bounds. A tick that would sit too close to a bound is
 * dropped in favour of the bound.
 */
export function buildSymlogTickValues(min: number, max: number): number[] {
	if (!Number.isFinite(min) || !Number.isFinite(max)) return [];
	if (min > max) [min, max] = [max, min];

	const majors: number[] = [];
	if (min <= 0 && max >= 0) majors.push(0);

	const addSide = (sign: 1 | -1) => {
		for (let exp = 0; exp < 16; exp++) {
			for (const m of [1, 3]) {
				const v = sign * m * Math.pow(10, exp);
				if (sign > 0 ? v > max : v < min) return;
				if (v >= min && v <= max) majors.push(v);
			}
		}
	};
	addSide(1);
	addSide(-1);

	const symMin = symlog(min);
	const symMax = symlog(max);
	const inner = majors.filter(
		v =>
			(v === min || Math.abs(symlog(v) - symMin) >= MIN_TICK_GAP) &&
			(v === max || Math.abs(symMax - symlog(v)) >= MIN_TICK_GAP),
	);

	const values = new Set<number>([min, ...inner, max]);
	return Array.from(values).sort((a, b) => a - b);
}

function formatSymlogTick(this: any, value: number | string): string {
	const num = typeof value === 'number' ? value : Number(value);
	if (!Number.isFinite(num)) return String(value ?? '');
	try {
		return new Intl.NumberFormat(this?.chart?.options?.locale, {
			maximumFractionDigits: Math.abs(num) >= 10 ? 0 : 2,
		}).format(num);
	} catch {
		return String(num);
	}
}

export class SymlogScale extends LinearScale {
	static id = 'symlog';

	static defaults: any = {
		ticks: {
			callback: formatSymlogTick,
		},
	};

	private _symStart: number = 0;
	private _symRange: number = 1;

	buildTicks(): any[] {
		const { minDefined, maxDefined } = this.getUserBounds();
		if (this.options.bounds === 'ticks') {
			if (!maxDefined && this.max > 0) this.max = niceSymlogBound(this.max);
			if (!minDefined && this.min < 0) this.min = -niceSymlogBound(-this.min);
		}

		const ticks = buildSymlogTickValues(this.min, this.max).map(value => ({ value }));

		// start/end are runtime fields of Chart.js' LinearScaleBase that its typings do not expose
		const self = this as any;
		if (this.options.reverse) {
			ticks.reverse();
			self.start = this.max;
			self.end = this.min;
		} else {
			self.start = this.min;
			self.end = this.max;
		}
		return ticks;
	}

	configure(): void {
		super.configure();
		const self = this as any;
		this._symStart = symlog(self._startValue);
		const range = symlog(self._endValue) - this._symStart;
		this._symRange = range === 0 ? 1 : range;
	}

	getPixelForValue(value: any): number {
		if (value === undefined || value === null || Number.isNaN(+value)) return NaN;
		return this.getPixelForDecimal((symlog(+value) - this._symStart) / this._symRange);
	}

	getValueForPixel(pixel: number): number {
		return symexp(this._symStart + this.getDecimalForPixel(pixel) * this._symRange);
	}
}
