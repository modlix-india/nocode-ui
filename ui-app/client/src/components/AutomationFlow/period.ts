/**
 * ISO 8601 periods as a WAIT stores them ("P2D", "PT3H", "P1DT12H"), and the
 * words a card shows for them ("2 days", "1 day and 12 hours").
 */

export type PeriodUnit = 'days' | 'hours' | 'minutes';

export interface PeriodParts {
	weeks: number;
	days: number;
	hours: number;
	minutes: number;
	seconds: number;
}

const PERIOD_RE =
	/^P(?:(\d+(?:\.\d+)?)W)?(?:(\d+(?:\.\d+)?)D)?(?:T(?:(\d+(?:\.\d+)?)H)?(?:(\d+(?:\.\d+)?)M)?(?:(\d+(?:\.\d+)?)S)?)?$/i;

/** The parts of a period, or undefined when it is not one (empty, malformed, months or years). */
export function parsePeriod(period: string | undefined | null): PeriodParts | undefined {
	if (!period || typeof period !== 'string') return undefined;
	const m = PERIOD_RE.exec(period.trim());
	if (!m || period.trim().toUpperCase() === 'P' || period.trim().toUpperCase().endsWith('T'))
		return undefined;
	const n = (s: string | undefined) => (s ? Number(s) : 0);
	return { weeks: n(m[1]), days: n(m[2]), hours: n(m[3]), minutes: n(m[4]), seconds: n(m[5]) };
}

/** Total minutes in a period (seconds rounded down). */
export function periodMinutes(period: string | undefined | null): number | undefined {
	const p = parsePeriod(period);
	if (!p) return undefined;
	return (
		p.weeks * 7 * 24 * 60 +
		p.days * 24 * 60 +
		p.hours * 60 +
		p.minutes +
		Math.floor(p.seconds / 60)
	);
}

const plural = (n: number, one: string) => `${n} ${one}${n === 1 ? '' : 's'}`;

/** "2 days", "1 day and 12 hours", "30 minutes". The raw text when it does not parse. */
export function periodToWords(period: string | undefined | null): string {
	const p = parsePeriod(period);
	if (!p) return period ? String(period) : '';
	const parts: string[] = [];
	if (p.weeks) parts.push(plural(p.weeks, 'week'));
	if (p.days) parts.push(plural(p.days, 'day'));
	if (p.hours) parts.push(plural(p.hours, 'hour'));
	if (p.minutes) parts.push(plural(p.minutes, 'minute'));
	if (p.seconds) parts.push(plural(p.seconds, 'second'));
	if (!parts.length) return '0 minutes';
	if (parts.length === 1) return parts[0];
	return `${parts.slice(0, -1).join(', ')} and ${parts[parts.length - 1]}`;
}

/** A number and a unit as a period: (2, 'days') -> "P2D", (3, 'hours') -> "PT3H". */
export function toPeriod(amount: number, unit: PeriodUnit): string {
	const n = Math.max(0, Math.round(Number(amount) || 0));
	if (unit === 'days') return `P${n}D`;
	if (unit === 'hours') return `PT${n}H`;
	return `PT${n}M`;
}

/**
 * A period as the one number and unit the wait panel edits. Picks the largest
 * unit that holds it exactly, so "P2D" is 2 days and "PT90M" is 90 minutes.
 */
export function fromPeriod(period: string | undefined | null): {
	amount: number;
	unit: PeriodUnit;
} {
	const total = periodMinutes(period);
	if (total === undefined || total === 0) return { amount: total === 0 ? 0 : 1, unit: 'days' };
	if (total % (24 * 60) === 0) return { amount: total / (24 * 60), unit: 'days' };
	if (total % 60 === 0) return { amount: total / 60, unit: 'hours' };
	return { amount: total, unit: 'minutes' };
}
