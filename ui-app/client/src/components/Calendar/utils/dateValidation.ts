/**
 * Date validation utilities for the Calendar component.
 * Handles validation of dates against various constraints.
 */

import { isNullValue } from '@fincity/kirun-js';
import { setData } from '../../../context/StoreContext';
import { CalendarValidationProps } from '../components/calendarTypes';
import { getValidDate, processRelativeOrAbsoluteDate } from './dateFormatting';
import { zeroHourDate } from './dateComputation';

/**
 * Parses a date value using formats from props (display format, then storage format).
 * Also handles relative date strings like "+3d" or "-2m".
 */
export function parseDateWithFormatsFromProps(
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
			// Skip epoch parsing when the value clearly contains non-digit characters
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
 * Validates a date and sets it in the store if valid.
 * Returns true if validation passed and data was set.
 */
export function validateRangesAndSetData(
	path: string,
	value: any,
	context: string,
	props: CalendarValidationProps,
): boolean {
	if (!value) {
		setData(path, value, context);
		return true;
	}

	if (props.isMultiSelect) {
		const splits = value.split(props.multipleDateSeparator);
		const dates: (Date | undefined)[] = splits
			.map((e: string) => getValidDate(e, props.storageFormat ?? props.displayDateFormat))
			.map((e: Date | undefined) => validateWithProps(e, props));
		if (dates.every((e: Date | undefined) => !isNullValue(e))) {
			setData(path, splits, context);
		}
		return true;
	}

	const date = validateWithProps(
		getValidDate(value, props.storageFormat ?? props.displayDateFormat),
		props,
	);

	if (date != undefined) {
		setData(path, value, context);
		return true;
	}

	return false;
}

/**
 * Validates a date against all calendar constraints (min/max date, disabled dates,
 * disabled days, temporal ranges, hour/minute/second intervals).
 * Returns the date if valid, undefined otherwise.
 */
export function validateWithProps(
	date: Date | undefined,
	props: CalendarValidationProps,
): Date | undefined {
	if (!date) return undefined;

	if (props.minDate) {
		const minDate = zeroHourDate(parseDateWithFormatsFromProps(props.minDate, props));
		if (minDate && date < minDate) return undefined;
	}

	if (props.maxDate) {
		const maxDate = parseDateWithFormatsFromProps(props.maxDate, props);
		if (maxDate && date > maxDate) return undefined;
	}

	if (props.disableDates) {
		const disableDates = props.disableDates
			.map(e => zeroHourDate(parseDateWithFormatsFromProps(e, props)))
			.filter((e): e is Date => !!e);

		const onlyDate = zeroHourDate(new Date(date.getTime()));

		if (
			disableDates.findIndex((disable: Date) => disable.getTime() === onlyDate!.getTime()) !=
			-1
		)
			return undefined;
	}

	if (props.disableTemporalRanges?.length) {
		const today = zeroHourDate(new Date())!;
		const onlyDate = zeroHourDate(new Date(date.getTime()))!;
		const disableToday = props.disableTemporalRanges.includes('disableToday');
		const disableFuture = props.disableTemporalRanges.includes('disableFuture');
		const disablePast = props.disableTemporalRanges.includes('disablePast');
		const disableWeekend = props.disableTemporalRanges.includes('disableWeekend');
		const weekEndDays = props.weekEndDays?.map(e => parseInt(e, 10));

		if (disableToday && onlyDate.toDateString() === today.toDateString()) return undefined;
		if (disableFuture && onlyDate > today) return undefined;
		if (disablePast && onlyDate < today) return undefined;
		if (disableWeekend && weekEndDays?.length && weekEndDays.includes(onlyDate.getDay()))
			return undefined;
	}

	if (props.disableDays) {
		const disableDays = props.disableDays.map(e => parseInt(e, 10));

		if (disableDays.indexOf(date.getDay()) != -1) return undefined;
	}

	if (!isNullValue(props.hourIntervalFrom)) {
		if (date.getHours() < props.hourIntervalFrom!) return undefined;
	}

	if (!isNullValue(props.hourInterval)) {
		if (props.hourInterval === 0 && date.getHours() != 0) return undefined;
		if ((date.getHours() - props.hourIntervalFrom!) % props.hourInterval! != 0)
			return undefined;
	}

	if (!isNullValue(props.minuteIntervalFrom)) {
		if (date.getMinutes() < props.minuteIntervalFrom!) return undefined;
	}

	if (!isNullValue(props.minuteInterval)) {
		if (props.minuteInterval === 0 && date.getMinutes() != 0) return undefined;
		if ((date.getMinutes() - props.minuteIntervalFrom!) % props.minuteInterval! != 0)
			return undefined;
	}

	if (!isNullValue(props.secondIntervalFrom)) {
		if (date.getSeconds() < props.secondIntervalFrom!) return undefined;
	}

	if (!isNullValue(props.secondInterval)) {
		if (props.secondInterval === 0 && date.getSeconds() != 0) return undefined;
		if ((date.getSeconds() - props.secondIntervalFrom!) % props.secondInterval! != 0)
			return undefined;
	}

	return date;
}

