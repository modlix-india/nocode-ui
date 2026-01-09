/**
 * Date computation utilities for the Calendar component.
 * Handles min/max date calculations and week number computation.
 */

import { CalendarMapProps, CalendarValidationProps } from '../components/calendarTypes';
import { getValidDate, processRelativeOrAbsoluteDate } from './dateFormatting';

/**
 * Resets time components of a date to zero (midnight).
 * Returns the modified date or undefined if input is undefined.
 */
export function zeroHourDate(date: Date | undefined): Date | undefined {
	if (!date) return date;
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	date.setMilliseconds(0);
	return date;
}

/**
 * Parses a date value using formats from props.
 * Internal helper used by computeMinMaxDates.
 */
function parseDateWithFormatsFromProps(
	value: string | number | undefined,
	props: CalendarValidationProps,
): Date | undefined {
	if (value === undefined || value === null) return undefined;

	const valueString = typeof value === 'string' ? value.trim() : undefined;

	if (valueString && (valueString.startsWith('+') || valueString.startsWith('-'))) {
		const relative = processRelativeOrAbsoluteDate(
			valueString,
			props.storageFormat ?? props.displayDateFormat,
		);
		if (relative && !isNaN(relative.getTime())) {
			return relative;
		}
	}

	const formatsToTry: string[] = [];

	if (props.displayDateFormat) {
		formatsToTry.push(props.displayDateFormat);
	}

	if (props.storageFormat && props.storageFormat !== props.displayDateFormat) {
		formatsToTry.push(props.storageFormat);
	}

	for (const format of formatsToTry) {
		if (
			(format === 'x' || format === 'X') &&
			typeof value === 'string' &&
			/[^\d]/.test(valueString ?? '')
		) {
			continue;
		}

		const parsed = getValidDate(value, format);
		if (parsed && !isNaN(parsed.getTime())) {
			return parsed;
		}
	}

	if (typeof value === 'string') {
		const fallback = processRelativeOrAbsoluteDate(
			value,
			props.storageFormat ?? props.displayDateFormat,
		);
		if (fallback && !isNaN(fallback.getTime())) {
			return fallback;
		}
	}

	return undefined;
}

/**
 * Computes the current date and minimum/maximum possible dates based on props.
 * Takes into account minDate, maxDate, and disableTemporalRanges.
 */
export function computeMinMaxDates(
	props: CalendarMapProps & CalendarValidationProps,
): [Date, Date | undefined, Date | undefined] {
	const currentDate = new Date();

	let minimumPossibleDate = parseDateWithFormatsFromProps(props.minDate, props);
	let maximumPossibleDate = parseDateWithFormatsFromProps(props.maxDate, props);

	if (props.disableTemporalRanges?.length) {
		const today = zeroHourDate(new Date())!;
		const disableToday = props.disableTemporalRanges.includes('disableToday');
		const disableFuture = props.disableTemporalRanges.includes('disableFuture');
		const disablePast = props.disableTemporalRanges.includes('disablePast');

		if (disablePast) {
			minimumPossibleDate = zeroHourDate(new Date(today))!;
			if (disableToday) minimumPossibleDate.setDate(minimumPossibleDate.getDate() + 1);
		}

		if (disableFuture) {
			maximumPossibleDate = zeroHourDate(new Date(today))!;
			maximumPossibleDate.setDate(maximumPossibleDate.getDate() + 1);
			maximumPossibleDate.setSeconds(maximumPossibleDate.getSeconds() - 1);
			if (disableToday) maximumPossibleDate.setDate(maximumPossibleDate.getDate() - 1);
		}
	}

	return [currentDate, minimumPossibleDate, maximumPossibleDate];
}

/**
 * Computes the ISO week number of the year for a given date.
 */
export function computeWeekNumberOfYear(date: Date): number {
	const firstDayOfYear = new Date(date);
	firstDayOfYear.setMonth(0);
	firstDayOfYear.setDate(1);
	const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);

	return Math.ceil(pastDaysOfYear / 7) + 1;
}

