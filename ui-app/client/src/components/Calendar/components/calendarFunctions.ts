import { isNullValue } from '@fincity/kirun-js';
import { setData } from '../../../context/StoreContext';
import { Dispatch, SetStateAction } from 'react';
import { CalendarAllProps, CalendarMapProps, CalendarValidationProps } from './calendarTypes';

// Will support more formats after the kirun functions are integrated where all the time and date api is implemented.

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

export function validateRangesAndSetData(
	path: string,
	value: any,
	context: string,
	props: CalendarValidationProps,
) {
	if (!value) {
		setData(path, value, context);
		return;
	}

	if (props.isMultiSelect) {
		const splits = value.split(props.multipleDateSeparator);
		const dates: (Date | undefined)[] = splits
			.map((e: string) => getValidDate(e, props.storageFormat ?? props.displayDateFormat))
			.map((e: Date | undefined) => validateWithProps(e, props));
		if (dates.every((e: Date | undefined) => !isNullValue(e))) {
			setData(path, splits, context);
		}
		return;
	}

	const date = validateWithProps(
		getValidDate(value, props.storageFormat ?? props.displayDateFormat),
		props,
	);

	if (date != undefined) {
		setData(path, value, context);
		return;
	}
}

export function validateWithProps(
	date: Date | undefined,
	props: CalendarValidationProps,
): Date | undefined {
	if (!date) return undefined;

	const format = props.storageFormat ?? props.displayDateFormat;

	if (props.minDate) {
		const minDate = zeroHourDate(getValidDate(props.minDate, format));
		if (minDate && date < minDate) return undefined;
	}

	if (props.maxDate) {
		const maxDate = getValidDate(props.maxDate, format);
		if (maxDate && date > maxDate) return undefined;
	}

	if (props.disableDates) {
		const disableDates = props.disableDates.map(e => getValidDate(e, format)).map(zeroHourDate);

		const onlyDate = zeroHourDate(new Date(date.getTime()));

		if (
			disableDates.findIndex(
				(e: Date | undefined) => e && e.getTime() === onlyDate!.getTime(),
			) != -1
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

export function zeroHourDate(date: Date | undefined): Date | undefined {
	if (!date) return date;
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	return date;
}

export function getStyleObjectCurry(styles: any, hoverStyles: any, disabledStyles: any) {
	return (key: string, hovers: Set<string>, disableds: Set<string>) => {
		if (hovers.has(key)) return hoverStyles[key] ?? {};
		if (disableds.has(key)) return disabledStyles[key] ?? {};
		return styles[key] ?? {};
	};
}

export function addToToggleSetCurry(
	set: Set<string>,
	setStateFunction: Dispatch<SetStateAction<Set<string>>>,
	key: string,
) {
	return () => {
		if (set.has(key)) return;
		setStateFunction(new Set([...Array.from(set), key]));
	};
}

export function removeFromToggleSetCurry(
	set: Set<string>,
	setStateFunction: Dispatch<SetStateAction<Set<string>>>,
	key: string,
) {
	return () => {
		if (!set.has(key)) return;
		const newSet = new Set([...Array.from(set)]);
		newSet.delete(key);
		setStateFunction(newSet);
	};
}

export function computeMinMaxDates(
	props: CalendarMapProps & CalendarValidationProps,
): [Date, Date | undefined, Date | undefined] {
	let currentDate = new Date();
	let minimumPossibleDate = processRelativeOrAbsoluteDate(
		props.minDate,
		props.storageFormat ?? props.displayDateFormat,
	);
	let maximumPossibleDate = processRelativeOrAbsoluteDate(
		props.maxDate,
		props.storageFormat ?? props.displayDateFormat,
	);
	if (props.minDate) {
		const minDate = getValidDate(props.minDate, props.storageFormat ?? props.displayDateFormat);
		if (minDate) minimumPossibleDate = minDate;
	}
	if (props.maxDate) {
		const maxDate = getValidDate(props.maxDate, props.storageFormat ?? props.displayDateFormat);
		if (maxDate) maximumPossibleDate = maxDate;
	}

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

const NUMBER_PARTS = new Set(['-', '+', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
export function processRelativeOrAbsoluteDate(
	dateString: string | undefined,
	// "+3y"
	// "-2Years3hours"
	// "-2 years 3 minUTes"
	format: string,
): Date | undefined {
	if (!dateString) return undefined;
	dateString = dateString.trim();
	if (dateString.startsWith('+') || dateString.startsWith('-')) {
		return parseRelativeDate(dateString);
	}
	return getValidDate(dateString, format);
}

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

export function computeWeekNumberOfYear(date: Date): number {
	const firstDayOfYear = new Date(date);
	firstDayOfYear.setMonth(0);
	firstDayOfYear.setDate(1);
	const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / (1000 * 60 * 60 * 24);

	return Math.ceil(pastDaysOfYear / 7) + 1;
}
