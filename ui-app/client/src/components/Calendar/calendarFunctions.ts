import { isNullValue } from '@fincity/kirun-js';
import { setData } from '../../context/StoreContext';

export interface CalendarValidationProps {
	isMultiSelect: boolean;
	minDate?: string;
	maxDate?: string;
	disableDates?: Array<string>;
	disableTemporalRange?: string;
	disableDays?: Array<string>;
	hourIntervalFrom?: number;
	hourInterval?: number;
	secondIntervalFrom?: number;
	secondInterval?: number;
	minuteIntervalFrom?: number;
	minuteInterval?: number;
	storageFormat?: string;
	displayDateFormat: string;
	multipleDateSeparator: string;
	numberOfDaysInRange?: number;
}

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
		const dates = value
			.split(props.multipleDateSeparator)
			.map((e: string) => getValidDate(e, props.storageFormat ?? props.displayDateFormat))
			.map((e: Date | undefined) => validateWithProps(e, props));

		if (dates.findIndex((e: Date | undefined) => isNullValue(e)) != -1) {
			setData(path, value, context);
			return;
		}

		setData(path, dates.length ? dates : undefined, context);
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

	if (props.disableTemporalRange) {
		const today = zeroHourDate(new Date())!;
		const onlyDate = zeroHourDate(new Date(date.getTime()))!;

		if (props.disableTemporalRange === 'disableTodayFuture' && onlyDate >= today)
			return undefined;
		if (props.disableTemporalRange === 'disableTodayPast' && onlyDate <= today)
			return undefined;
		if (props.disableTemporalRange === 'disableToday' && onlyDate.getTime() === today.getTime())
			return undefined;
		if (props.disableTemporalRange === 'disableFuture' && onlyDate > today) return undefined;
		if (props.disableTemporalRange === 'disablePast' && onlyDate < today) return undefined;
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

function zeroHourDate(date: Date | undefined): Date | undefined {
	if (!date) return date;
	date.setHours(0);
	date.setMinutes(0);
	date.setSeconds(0);
	return date;
}
