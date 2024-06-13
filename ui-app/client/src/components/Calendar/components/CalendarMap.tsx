import React from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { CalendarHeader } from './CalendarHeader';
import { computeMinMaxDates, getValidDate } from './calendarFunctions';
import { CalendarMapProps, CalendarValidationProps } from './calendarTypes';

export function CalendarMap(
	props: CalendarMapProps &
		CalendarValidationProps & {
			browsingMonthYear: string;
			onBrowsingMonthYearChange: (value: string) => void;
			onChange: (value: string | number | undefined) => void;
		},
) {
	const {
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
		definition,
	} = props;

	const isEndDate = isRangeType && dateType === 'endDate';

	let [currentDate, minimumPossibleDate, maximumPossibleDate] = computeMinMaxDates(props);

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

	const [hovers, setHovers] = React.useState<Set<string>>(() => new Set());
	const [disableds, setDisableds] = React.useState<Set<string>>(() => new Set());

	return (
		<>
			<CalendarHeader
				currentDate={currentDate}
				minimumPossibleDate={minimumPossibleDate}
				maximumPossibleDate={maximumPossibleDate}
				{...props}
			/>
			<div className="_calendarBody">
				<SubHelperComponent definition={definition} subComponentName="calendarBody" />
			</div>
		</>
	);
}
