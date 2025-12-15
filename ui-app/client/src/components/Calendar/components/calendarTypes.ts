type Days = '0' | '1' | '2' | '3' | '4' | '5' | '6';

type LabelType = 'long' | 'short' | 'narrow';

type TemporalRange = 'disableToday' | 'disableFuture' | 'disablePast' | 'disableWeekend';

export interface CalendarValidationProps {
	isMultiSelect: boolean;
	minDate?: string;
	maxDate?: string;
	disableDates?: Array<string>;
	disableTemporalRanges?: Array<TemporalRange>;
	disableDays?: Array<Days>;
	weekEndDays: Array<Days>;
	hourIntervalFrom?: number;
	hourInterval?: number;
	secondIntervalFrom?: number;
	secondInterval?: number;
	minuteIntervalFrom?: number;
	minuteInterval?: number;
	storageFormat?: string;
	displayDateFormat: string;
	multipleDateSeparator: string;
	minNumberOfDaysInRange?: number;
	maxNumberOfDaysInRange?: number;
}

export interface CalendarMapProps {
	thisDate: string | number | undefined;
	thatDate: string | number | undefined;
	isRangeType: boolean;
	dateType: 'startDate' | 'endDate';
	componentDesignType: 'simpleCalendar' | 'fullCalendar' | 'dropDownCalendar';
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
	lowLightWeekEnd: boolean;
	showPreviousNextMonthDate: boolean;
	timeDesignType:
		| 'none'
		| 'comboBoxes12Hr'
		| 'comboBoxes24Hr'
		| 'dial'
		| 'comboBoxes12HrAndSeconds'
		| 'comboBoxes24HrAndSeconds';
	monthLabels: LabelType;
	weekDayLabels: LabelType;
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
	headerMonthsLabels: LabelType;
	headerMonthsCount: number;
	browseYears: boolean;
	browseMonths: boolean;
}

export interface CalendarIntermediateAllProps extends CalendarMapProps, CalendarValidationProps {
	currentDate: Date;
	minimumPossibleDate: Date | undefined;
	maximumPossibleDate: Date | undefined;
}

export interface CalendarAllProps extends Readonly<CalendarIntermediateAllProps> {}
