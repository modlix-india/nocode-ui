import React from 'react';

interface CalendarMapProps {
	isRangeType: boolean;
	minDate: string;
	maxDate: string;
	colorScheme: string;
	dateType: string;
	numberOfDaysInRange: number;
	disableDates: Array<string>;
	disableTemporalRange: boolean;
	disableDays: Array<string>;
	componentDesignType: string;
	calendarDesignType: string;
	arrowButtonsHorizontalPlacement: string;
	calendarFormat: string;
	showWeekNumber: boolean;
	highlightToday: boolean;
	weekStartsOn: number;
	lowLightWeekEnds: boolean;
	showPreviousNextMonthDate: boolean;
	secondInterval: number;
	minuteInterval: number;
	timeDesignType: string;
	isMultiSelect: boolean;
	multipleDateSeparator: string;
	disableTextEntry: boolean;
}

export function CalendarMap({
	minDate,
	maxDate,
	colorScheme,
	dateType,
	numberOfDaysInRange,
	disableDates,
	disableTemporalRange,
	disableDays,
	componentDesignType,
	calendarDesignType,
	arrowButtonsHorizontalPlacement,
	calendarFormat,
	showWeekNumber,
	highlightToday,
	weekStartsOn,
	lowLightWeekEnds,
	showPreviousNextMonthDate,
	secondInterval,
	minuteInterval,
	timeDesignType,
	isMultiSelect,
	multipleDateSeparator,
	disableTextEntry,
}: CalendarMapProps) {
	return <></>;
}

// Will support more formats after the kirun functions are integrated where all the time and date api is implemented.

export function toFormat(date: string, fromFormat: string, toFormat: string): string | undefined {
	if (!date) return undefined;

	const dateObject = getValidDate(date, fromFormat);
	if (!dateObject) return undefined;

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
	formattedDate = formattedDate.replace(
		'hh',
		hour > 12 ? (hour - 12).toString().padStart(2, '0') : hour.toString().padStart(2, '0'),
	);
	formattedDate = formattedDate.replace('mm', minute.toString().padStart(2, '0'));
	formattedDate = formattedDate.replace('ss', second.toString().padStart(2, '0'));
	formattedDate = formattedDate.replace('A', hour < 12 ? 'AM' : 'PM');

	return formattedDate;
}

export function getValidDate(date: string, format: string): Date | undefined {
	if (!date) return undefined;

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
