import React from 'react';
import { CalendarValidationProps, getValidDate, toFormat } from './calendarFunctions';

interface CalendarMapProps {
	thisDate: string | number | undefined;
	thatDate: string | number | undefined;
	isRangeType: boolean;
	dateType: string;
	componentDesignType: string;
	calendarDesignType: string;
	arrowButtonsHorizontalPlacement: string;
	calendarFormat: string;
	showWeekNumber: boolean;
	highlightToday: boolean;
	weekStartsOn: number;
	lowLightWeekEnds: boolean;
	showPreviousNextMonthDate: boolean;
	timeDesignType: string;
	browsingMonthYear: string;
	onBrowsingMonthYearChange: (value: string) => void;
	onChange: (value: string | number | undefined) => void;
	monthLabels: string;
	weekDayLabels: string;
	styles: any;
	hoverStyles: any;
	disabledStyles: any;
	language?: string;
	dayEvents: any;
	dayEventsDateFormat?: string;
	showMonthSelectionInHeader?: boolean;
	leftArrowImage?: string;
	rightArrowImage?: string;
	readOnly?: boolean;
}

export function CalendarMap({
	isMultiSelect,
	minDate,
	maxDate,
	disableDates,
	disableTemporalRange,
	disableDays,
	hourIntervalFrom,
	hourInterval,
	secondIntervalFrom,
	secondInterval,
	minuteIntervalFrom,
	minuteInterval,
	storageFormat,
	displayDateFormat,
	multipleDateSeparator,
	numberOfDaysInRange,
	thisDate,
	thatDate,
	isRangeType,
	dateType,
	componentDesignType,
	calendarDesignType,
	arrowButtonsHorizontalPlacement,
	calendarFormat,
	showWeekNumber,
	highlightToday,
	weekStartsOn,
	lowLightWeekEnds,
	showPreviousNextMonthDate,
	timeDesignType,
	browsingMonthYear,
	onBrowsingMonthYearChange,
	onChange,
	monthLabels,
	weekDayLabels,
	styles,
	hoverStyles,
	disabledStyles,
	language,
	dayEvents,
	dayEventsDateFormat,
	showMonthSelectionInHeader,
	leftArrowImage,
	rightArrowImage,
	readOnly,
}: CalendarMapProps & CalendarValidationProps) {
	const isEndDate = isRangeType && dateType === 'endDate';
	let currentDate = new Date();
	if (browsingMonthYear) {
		const [month, year] = browsingMonthYear.split('-').map(e => parseInt(e, 10));
		currentDate.setMonth(month);
		currentDate.setFullYear(year);
	} else if (thisDate || thatDate) {
		currentDate =
			getValidDate(isEndDate ? thatDate : thisDate, storageFormat ?? displayDateFormat) ??
			new Date();
	}

	const selectedStartDate = getValidDate(
		isEndDate ? thatDate : thisDate,
		storageFormat ?? displayDateFormat,
	);
	const selectedEndDate = getValidDate(
		isEndDate ? thisDate : thatDate,
		storageFormat ?? displayDateFormat,
	);

	const header = [
		<div key="leftArrow" className="_leftArrow">
			{' '}
		</div>,
		<div key="rightArrow" className="_rightArrow">
			{' '}
		</div>,
	];

	return (
		<>
			<div className="_calenderHeader"></div>
			<div className="_calenderBody"></div>
		</>
	);
}

function ArrowRight({ rotate }: { rotate: number; onClick: () => void }) {
	return (
		<svg
			width="30"
			height="32"
			viewBox="0 0 44 45"
			fill="none"
			style={{ transform: `rotate(${rotate}deg)` }}
			xmlns="http://www.w3.org/2000/svg"
		>
			<path
				d="M27.6339 20.1427C28.122 20.6169 28.122 21.3869 27.6339 21.8611L20.1353 29.1444C19.6471 29.6185 18.8543 29.6185 18.3661 29.1444C17.878 28.6702 17.878 27.9001 18.3661 27.426L24.982 21L18.37 14.574C17.8819 14.0999 17.8819 13.3298 18.37 12.8556C18.8582 12.3815 19.651 12.3815 20.1392 12.8556L27.6378 20.1389L27.6339 20.1427Z"
				fill="currentColor"
				fillOpacity="0.8"
			/>
		</svg>
	);
}
