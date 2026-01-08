/**
 * Date formatting utilities for the Calendar component.
 * Handles conversion between different date formats and parsing.
 */

/**
 * Converts a date from one format to another.
 * Supports various date formats including epoch timestamps.
 */
export function toFormat(
	date: string | number | Date,
	fromFormat: string,
	toFormat: string,
): string | number | undefined {
	if (!date) return undefined;

	const dateObject =
		fromFormat === 'Date'
			? (date as Date)
			: getValidDate(
					typeof date === 'string' ? (date as string) : (date as number),
					fromFormat,
				);
	if (!dateObject) return undefined;

	if (toFormat === 'x') return dateObject.getTime();
	else if (toFormat === 'X') return Math.floor(dateObject.getTime() / 1000);

	const year = dateObject.getFullYear();
	const month = dateObject.getMonth() + 1;
	const day = dateObject.getDate();
	const hour = dateObject.getHours();
	const minute = dateObject.getMinutes();
	const second = dateObject.getSeconds();

	let formattedDate = toFormat.replace('YYYY', year.toString().padStart(4, '0'));
	formattedDate = formattedDate.replace('MM', month.toString().padStart(2, '0'));
	formattedDate = formattedDate.replace('DD', day.toString().padStart(2, '0'));
	formattedDate = formattedDate.replace('HH', hour.toString().padStart(2, '0'));
	let smallhh = hour > 12 ? hour - 12 : hour;
	if (smallhh === 0) smallhh = 12;
	formattedDate = formattedDate.replace('hh', smallhh.toString().padStart(2, '0'));
	formattedDate = formattedDate.replace('mm', minute.toString().padStart(2, '0'));
	formattedDate = formattedDate.replace('ss', second.toString().padStart(2, '0'));
	formattedDate = formattedDate.replace('A', hour < 12 ? 'AM' : 'PM');

	return formattedDate;
}

/**
 * Parses a date string or number according to the specified format.
 * Returns undefined if the date is invalid.
 */
export function getValidDate(
	inDate: string | number | undefined,
	format: string,
): Date | undefined {
	if (!inDate) return undefined;

	if (format === 'x')
		return new Date(typeof inDate === 'string' ? parseInt(inDate as string, 10) : inDate);
	else if (format === 'X')
		return new Date(
			(typeof inDate === 'string' ? parseInt(inDate as string, 10) : inDate) * 1000,
		);

	const date = inDate.toString();

	const [dateFormat, timeFormat, ampmFormat] = format.split(' ');

	const [datePart, timePart, ampmPart] = date.split(' ').filter(e => e);

	if (!datePart) return undefined;

	let [day, month, year] = datePart.split('/').map(e => parseInt(e, 10));
	if (dateFormat.startsWith('MM')) [day, month] = [month, day];

	if (year < 1000 || year > 9999) return undefined;
	if (month < 1 || month > 12) return undefined;
	if (day < 1 || day > 31) return undefined;

	let [hour, minute, second] = [0, 0, 0];

	if (timeFormat) {
		if (!timePart || (ampmFormat && !ampmPart)) return undefined;

		const timeParts = timePart?.split(':');
		const timeFormatParts = timeFormat.split(':');

		if (timeParts.length != timeFormatParts.length) return undefined;

		if (timeParts[1].length != 2 || (timeParts[2] && timeParts[2].length != 2))
			return undefined;

		[hour = 0, minute = 0, second = 0] = timeParts.map(e => parseInt(e, 10));

		if (timeFormat.startsWith('hh')) {
			if (hour < 1 || hour > 12) return undefined;
			if (!ampmPart) return undefined;
			if (ampmPart.toUpperCase() === 'PM') hour += 12;
			else if (hour == 12) hour = 0;
			if (hour === 24) hour = 0;
		} else if (timeFormat.startsWith('HH')) {
			if (hour < 0 || hour > 23) return undefined;
		}

		if (minute < 0 || minute > 59) return undefined;
		if (second < 0 || second > 59) return undefined;
	} else if (timePart) return undefined;

	if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour) || isNaN(minute) || isNaN(second))
		return undefined;

	return new Date(year, month - 1, day, hour, minute, second);
}

const NUMBER_PARTS = new Set(['-', '+', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);

/**
 * Processes a date string that may be relative (e.g., "+3d", "-2m") or absolute.
 * Relative dates are calculated from the current date.
 */
export function processRelativeOrAbsoluteDate(
	dateString: string | undefined,
	format: string,
): Date | undefined {
	if (!dateString) return undefined;
	dateString = dateString.trim();
	if (dateString.startsWith('+') || dateString.startsWith('-')) {
		return parseRelativeDate(dateString);
	}
	return getValidDate(dateString, format);
}

/**
 * Parses a relative date string like "+1d", "-2months", "+1year -1d".
 * Supports: y/year, m/month, d/day, h/hour, mi/minute, s/second
 */
export function parseRelativeDate(dateString: string): Date {
	dateString = dateString.toLowerCase();

	let from = 0;
	let isNumberPart = true;
	const parts = [];
	for (let i = 0; i < dateString.length; i++) {
		if (
			dateString[i] === ' ' ||
			(isNumberPart && NUMBER_PARTS.has(dateString[i])) ||
			(!isNumberPart && !NUMBER_PARTS.has(dateString[i]))
		)
			continue;
		if (i > from) parts.push(dateString.substring(from, i));
		isNumberPart = !isNumberPart;
		from = i;
	}

	if (from < dateString.length) parts.push(dateString.substring(from));

	return makeDateFromParts(parts);
}

/**
 * Creates a Date from parsed relative date parts.
 */
export function makeDateFromParts(parts: string[]): Date {
	const date = new Date();
	let timeUsed: boolean = false;
	for (let i = 0; i < parts.length; i += 2) {
		const number = Math.abs(parseInt(parts[i], 10));
		const unit = parts[i + 1];
		const factor =
			parts[i].startsWith('-') || parts[i].startsWith('+') ? parseInt(parts[i][0] + '1') : 1;
		const fullSetFactor = parts[i].startsWith('-') || parts[i].startsWith('+') ? 1 : 0;
		if (isNaN(number)) continue;
		if (unit.startsWith('y'))
			date.setFullYear(date.getFullYear() * fullSetFactor + number * factor);
		else if (unit.startsWith('mi')) {
			date.setMinutes(date.getMinutes() * fullSetFactor + number * factor);
			timeUsed = true;
		} else if (unit.startsWith('h')) {
			date.setHours(date.getHours() * fullSetFactor + number * factor);
			timeUsed = true;
		} else if (unit.startsWith('d'))
			date.setDate(date.getDate() * fullSetFactor + number * factor);
		else if (unit.startsWith('m'))
			date.setMonth(date.getMonth() * fullSetFactor + number * factor);
		else if (unit.startsWith('s')) {
			date.setSeconds(date.getSeconds() * fullSetFactor + number * factor);
			timeUsed = true;
		}
	}
	if (!timeUsed) {
		date.setHours(0);
		date.setMinutes(0);
		date.setSeconds(0);
	}
	return date;
}

export type DefaultTimeWhenNone = 'startOfDay' | 'endOfDay' | 'now';

/**
 * Checks if a date format string contains time components.
 */
export function formatHasTimeComponent(format: string): boolean {
	if (!format) return false;
	// Check for time-related format tokens
	return (
		format.includes('HH') ||
		format.includes('hh') ||
		format.includes('mm') ||
		format.includes('ss') ||
		format.includes('A') ||
		format === 'x' || // Milliseconds since epoch
		format === 'X' // Seconds since epoch
	);
}

/**
 * Applies the default time to a date based on the defaultTimeWhenNone setting.
 * Used when the storage format has a time component but Time Type is set to 'none'.
 *
 * @param date - The date to apply the default time to
 * @param defaultTimeWhenNone - The default time setting ('startOfDay', 'endOfDay', 'now')
 * @returns A new Date with the appropriate time set
 */
export function applyDefaultTime(
	date: Date,
	defaultTimeWhenNone: DefaultTimeWhenNone = 'startOfDay',
): Date {
	const result = new Date(date);

	switch (defaultTimeWhenNone) {
		case 'startOfDay':
			result.setHours(0, 0, 0, 0);
			break;
		case 'endOfDay':
			result.setHours(23, 59, 59, 999);
			break;
		case 'now':
			const now = new Date();
			result.setHours(now.getHours(), now.getMinutes(), now.getSeconds(), now.getMilliseconds());
			break;
		default:
			result.setHours(0, 0, 0, 0);
	}

	return result;
}

