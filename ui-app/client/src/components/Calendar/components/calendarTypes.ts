// {
//     name: 'disableTodayFuture',
//     displayName: 'Disable Today and Future Dates',
// },
// { name: 'disableTodayPast', displayName: 'Disable Today and Past Dates' },
// { name: 'disableToday', displayName: 'Disable Today' },
// { name: 'disableFuture', displayName: 'Disable Future Dates' },
// { name: 'disablePast', displayName: 'Disable Past Dates' },

type Days = '0' | '1' | '2' | '3' | '4' | '5' | '6';

export interface CalendarValidationProps {
	isMultiSelect: boolean;
	minDate?: string;
	maxDate?: string;
	disableDates?: Array<string>;
	disableTemporalRange?:
		| 'disableTodayFuture'
		| 'disableTodayPast'
		| 'disableToday'
		| 'disableFuture'
		| 'disablePast';
	disableDays?: Array<Days>;
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

export interface CalendarMapProps {
	thisDate: string | number | undefined;
	thatDate: string | number | undefined;
	isRangeType: boolean;
	dateType: 'startDate' | 'endDate';
	componentDesignType: 'simpleCalendar' | 'fullCalendar';
	calendarDesignType: '_defaultCalendar' | '_bigCalendar' | '_smallCalendar';
	arrowButtonsHorizontalPlacement: '_left' | '_right' | '_either';
	calendarFormat:
		| 'showCurrentMonth'
		| 'showCurrentMonthAndNext'
		| 'showCurrentMonthAndPrevious'
		| 'showPreviousCurrentAndNextMonth'
		| 'showCurrentAndNextTwoMonths'
		| 'showCurrentAndPreviousTwoMonths'
		| 'showFourMonths'
		| 'showSixMonths'
		| 'showTwelveMonths'
		| 'showCurrentYear';
	showWeekNumber: boolean;
	highlightToday: boolean;
	weekStartsOn: Days;
	lowLightWeekEnds: boolean;
	showPreviousNextMonthDate: boolean;
	timeDesignType:
		| 'none'
		| 'comboBoxes12Hr'
		| 'comboBoxes24Hr'
		| 'dial'
		| 'comboBoxes12HrAndSeconds'
		| 'comboBoxes24HrAndSeconds';
	monthLabels: 'long' | 'short' | 'narrow';
	weekDayLabels: 'long' | 'short' | 'narrow';
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
	definition: any;
}

export interface CalendarAllProps extends CalendarMapProps, CalendarValidationProps {
	currentDate: Date;
	minimumPossibleDate?: Date | undefined;
	maximumPossibleDate?: Date | undefined;
}
