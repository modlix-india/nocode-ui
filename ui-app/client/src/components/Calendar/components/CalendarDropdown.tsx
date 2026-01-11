import React, { useState, useEffect, useCallback } from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { CalendarMapProps, CalendarValidationProps } from './calendarTypes';
import { computeMinMaxDates } from '../utils/dateComputation';
import { getStyleObjectCurry } from '../utils/styleHelpers';
import {
	toFormat,
	applyDefaultTime,
	formatHasTimeComponent,
	DefaultTimeWhenNone,
} from '../utils/dateFormatting';
import { validateWithProps } from '../utils/dateValidation';
import { useDateParsing } from '../hooks/useDateParsing';
import {
	useYearOptions,
	useMonthOptions,
	useDayOptions,
	useHourOptions,
	useMinuteOptions,
	useSecondOptions,
	useAmPmOptions,
	TimeDesignType,
} from '../hooks/useDropdownOptions';
import { DateDropdowns } from './DateDropdowns';
import { TimeDropdowns } from './TimeDropdowns';

export interface CalendarDropdownProps extends CalendarMapProps, CalendarValidationProps {
	browsingMonthYear: string;
	onBrowsingMonthYearChange: (value: string) => void;
	onChange: (value: string | number | undefined, close: boolean) => void;
	onClearOtherDate?: () => void;
	styles: any;
	hoverStyles: any;
	disabledStyles: any;
	definition: any;
	dropdownLayout?: 'singleRow' | 'twoRows';
	yearLabel?: string;
	monthLabel?: string;
	dayLabel?: string;
	hourLabel?: string;
	minuteLabel?: string;
	secondLabel?: string;
	ampmLabel?: string;
}

export function CalendarDropdown(props: CalendarDropdownProps) {
	const {
		storageFormat,
		displayDateFormat,
		thisDate,
		thatDate,
		isRangeType,
		dateType,
		definition,
		timeDesignType: rawTimeDesignType,
		defaultTimeWhenNone = 'startOfDay',
		readOnly,
		dropdownLayout = 'singleRow',
		yearLabel = 'Year',
		monthLabel = 'Month',
		dayLabel = 'Day',
		hourLabel = 'Hour',
		minuteLabel = 'Minutes',
		secondLabel = 'Seconds',
		ampmLabel = 'AM/PM',
		reverseYearOrder,
		reverseMonthOrder,
		reverseDayOrder,
		reverseHourOrder,
		reverseMinuteOrder,
		reverseSecondOrder,
	} = props;

	// Normalize timeDesignType
	const timeDesignType: TimeDesignType =
		rawTimeDesignType === undefined
			? 'none'
			: String(rawTimeDesignType) === 'None'
				? 'none'
				: (rawTimeDesignType as TimeDesignType);

	// Use the date parsing hook
	const parseIncomingDate = useDateParsing(displayDateFormat, storageFormat);

	const isEndDate = isRangeType && dateType === 'endDate';
	
	// Memoize currentDateValue to ensure React detects changes properly
	// When dateType is 'endDate', thisDate contains the end date value (from bindingPath2)
	// When dateType is 'startDate', thisDate contains the start date value (from bindingPath1)
	// So we always use thisDate regardless of dateType
	const currentDateValue = React.useMemo(() => {
		return thisDate;
	}, [thisDate]);

	// Parse current date
	const currentDate = React.useMemo(() => {
		return parseIncomingDate(currentDateValue);
	}, [currentDateValue, parseIncomingDate]);

	// State for selected values - initialize from currentDate
	const [selectedYear, setSelectedYear] = useState<number | undefined>(
		currentDate?.getFullYear(),
	);
	const [selectedMonth, setSelectedMonth] = useState<number | undefined>(
		currentDate ? currentDate.getMonth() + 1 : undefined,
	);
	const [selectedDay, setSelectedDay] = useState<number | undefined>(currentDate?.getDate());
	const [selectedHour, setSelectedHour] = useState<number | undefined>(currentDate?.getHours());
	const [selectedMinute, setSelectedMinute] = useState<number | undefined>(
		currentDate?.getMinutes(),
	);
	const [selectedSecond, setSelectedSecond] = useState<number | undefined>(
		currentDate?.getSeconds(),
	);

	// Sync selected values when currentDateValue changes
	// This effect handles both initial load and subsequent updates
	useEffect(() => {
		if (currentDateValue) {
			const date = parseIncomingDate(currentDateValue);
			if (date) {
				setSelectedYear(date.getFullYear());
				setSelectedMonth(date.getMonth() + 1);
				setSelectedDay(date.getDate());
				setSelectedHour(date.getHours());
				setSelectedMinute(date.getMinutes());
				setSelectedSecond(date.getSeconds());
			} else {
				clearAllSelections();
			}
		} else {
			clearAllSelections();
		}
	}, [currentDateValue, parseIncomingDate]);

	const clearAllSelections = () => {
		setSelectedYear(undefined);
		setSelectedMonth(undefined);
		setSelectedDay(undefined);
		setSelectedHour(undefined);
		setSelectedMinute(undefined);
		setSelectedSecond(undefined);
	};

	// Compute min/max dates
	const [, minimumPossibleDate, maximumPossibleDate] = computeMinMaxDates(props);

	// Validate dates
	const validMinDate =
		minimumPossibleDate && !isNaN(minimumPossibleDate.getTime())
			? minimumPossibleDate
			: undefined;
	const validMaxDate =
		maximumPossibleDate && !isNaN(maximumPossibleDate.getTime())
			? maximumPossibleDate
			: undefined;

	// Create validation props for hooks
	const validationProps: CalendarValidationProps = React.useMemo(
		() => ({
			isMultiSelect: props.isMultiSelect,
			minDate: props.minDate,
			maxDate: props.maxDate,
			disableDates: props.disableDates,
			disableTemporalRanges: props.disableTemporalRanges,
			disableDays: props.disableDays,
			weekEndDays: props.weekEndDays,
			hourIntervalFrom: props.hourIntervalFrom,
			hourInterval: props.hourInterval,
			secondIntervalFrom: props.secondIntervalFrom,
			secondInterval: props.secondInterval,
			minuteIntervalFrom: props.minuteIntervalFrom,
			minuteInterval: props.minuteInterval,
			storageFormat: props.storageFormat,
			displayDateFormat: props.displayDateFormat,
			multipleDateSeparator: props.multipleDateSeparator,
		}),
		[props],
	);

	// Use dropdown options hooks
	const availableYears = useYearOptions({
		validMinDate,
		validMaxDate,
		minDate: props.minDate,
		maxDate: props.maxDate,
		disableTemporalRanges: props.disableTemporalRanges,
		reverseYearOrder,
	});

	const availableMonths = useMonthOptions({
		selectedYear,
		validMinDate,
		validMaxDate,
		language: props.language,
		monthLabels: props.monthLabels,
		validationProps,
		reverseMonthOrder,
	});

	const availableDays = useDayOptions({
		selectedYear,
		selectedMonth,
		validationProps,
		reverseDayOrder
	});

	const availableHours = useHourOptions({
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		hourIntervalFrom: props.hourIntervalFrom,
		hourInterval: props.hourInterval,
		validationProps,
		reverseHourOrder,
	});

	const availableMinutes = useMinuteOptions({
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		selectedHour,
		minuteIntervalFrom: props.minuteIntervalFrom,
		minuteInterval: props.minuteInterval,
		validationProps,
		reverseMinuteOrder,
	});

	const availableSeconds = useSecondOptions({
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		selectedHour,
		selectedMinute,
		secondIntervalFrom: props.secondIntervalFrom,
		secondInterval: props.secondInterval,
		validationProps,
		reverseSecondOrder,
	});

	const availableAmPm = useAmPmOptions(timeDesignType);

	// Style curry function
	const curry = getStyleObjectCurry(props.styles, props.hoverStyles, props.disabledStyles);

	// Check if we need to apply default time (when timeDesignType is 'none' but format has time)
	const storageFormatToUse = storageFormat || displayDateFormat;
	const needsDefaultTime =
		timeDesignType === 'none' && formatHasTimeComponent(storageFormatToUse);

	// Update date and notify parent
	const updateDate = useCallback(
		(
			year: number | undefined,
			month: number | undefined,
			day: number | undefined,
			hour: number | undefined,
			minute: number | undefined,
			second: number | undefined,
		) => {
			if (year === undefined || month === undefined || day === undefined) {
				return;
			}

			let newDate: Date;

			if (needsDefaultTime) {
				// When time dropdowns are hidden but format needs time, apply default time
				const baseDate = new Date(year, month - 1, day, 0, 0, 0);
				newDate = applyDefaultTime(baseDate, defaultTimeWhenNone as DefaultTimeWhenNone);
			} else {
				const finalHour = hour ?? 0;
				const finalMinute = minute ?? 0;
				const finalSecond = second ?? 0;
				newDate = new Date(year, month - 1, day, finalHour, finalMinute, finalSecond);
			}

			const validated = validateWithProps(newDate, validationProps);

			if (validated) {
				const displayFormatted = toFormat(newDate, 'Date', displayDateFormat);
				if (displayFormatted) {
					props.onChange(displayFormatted, false);
				}
			}
		},
		[displayDateFormat, validationProps, props.onChange, needsDefaultTime, defaultTimeWhenNone],
	);

	// Change handlers
	const handleYearChange = (value: string | number) => {
		if (value === '' || value === undefined) {
			setSelectedYear(undefined);
			setSelectedMonth(undefined);
			setSelectedDay(undefined);
			updateDate(
				undefined,
				undefined,
				undefined,
				selectedHour,
				selectedMinute,
				selectedSecond,
			);
			return;
		}
		const year = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(year)) return;
		setSelectedYear(year);

		if (selectedMonth !== undefined && selectedDay !== undefined) {
			const newDate = new Date(year, selectedMonth - 1, selectedDay);
			if (newDate.getFullYear() !== year || newDate.getMonth() + 1 !== selectedMonth) {
				setSelectedMonth(1);
				setSelectedDay(1);
				updateDate(year, 1, 1, selectedHour, selectedMinute, selectedSecond);
			} else {
				updateDate(
					year,
					selectedMonth,
					selectedDay,
					selectedHour,
					selectedMinute,
					selectedSecond,
				);
			}
		}
	};

	const handleMonthChange = (value: string | number) => {
		if (value === '' || value === undefined) {
			setSelectedMonth(undefined);
			setSelectedDay(undefined);
			updateDate(
				selectedYear,
				undefined,
				undefined,
				selectedHour,
				selectedMinute,
				selectedSecond,
			);
			return;
		}
		const month = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(month) || selectedYear === undefined) return;
		setSelectedMonth(month);

		if (selectedDay !== undefined) {
			const lastDay = new Date(selectedYear, month, 0).getDate();
			if (selectedDay > lastDay) {
				setSelectedDay(lastDay);
				updateDate(
					selectedYear,
					month,
					lastDay,
					selectedHour,
					selectedMinute,
					selectedSecond,
				);
			} else {
				updateDate(
					selectedYear,
					month,
					selectedDay,
					selectedHour,
					selectedMinute,
					selectedSecond,
				);
			}
		}
	};

	const handleDayChange = (value: string | number) => {
		if (value === '' || value === undefined) {
			setSelectedDay(undefined);
			updateDate(
				selectedYear,
				selectedMonth,
				undefined,
				selectedHour,
				selectedMinute,
				selectedSecond,
			);
			return;
		}
		const day = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(day) || selectedYear === undefined || selectedMonth === undefined) return;
		setSelectedDay(day);
		updateDate(selectedYear, selectedMonth, day, selectedHour, selectedMinute, selectedSecond);
	};

	const handleHourChange = (value: string | number) => {
		if (value === '' || value === undefined) {
			setSelectedHour(undefined);
			updateDate(
				selectedYear,
				selectedMonth,
				selectedDay,
				undefined,
				selectedMinute,
				selectedSecond,
			);
			return;
		}
		const hour = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(hour)) return;

		const is12Hr =
			timeDesignType === 'comboBoxes12Hr' || timeDesignType === 'comboBoxes12HrAndSeconds';
		let actualHour = hour;

		if (is12Hr && selectedHour !== undefined) {
			const currentIsPM = selectedHour >= 12;
			if (currentIsPM) {
				actualHour = hour === 12 ? 12 : hour + 12;
			} else {
				actualHour = hour === 12 ? 0 : hour;
			}
		} else if (is12Hr) {
			actualHour = hour === 12 ? 0 : hour;
		}

		setSelectedHour(actualHour);
		updateDate(
			selectedYear,
			selectedMonth,
			selectedDay,
			actualHour,
			selectedMinute,
			selectedSecond,
		);
	};

	const handleMinuteChange = (value: string | number) => {
		if (value === '' || value === undefined) {
			setSelectedMinute(undefined);
			updateDate(
				selectedYear,
				selectedMonth,
				selectedDay,
				selectedHour,
				undefined,
				selectedSecond,
			);
			return;
		}
		const minute = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(minute)) return;
		setSelectedMinute(minute);
		updateDate(selectedYear, selectedMonth, selectedDay, selectedHour, minute, selectedSecond);
	};

	const handleSecondChange = (value: string | number) => {
		if (value === '' || value === undefined) {
			setSelectedSecond(undefined);
			updateDate(
				selectedYear,
				selectedMonth,
				selectedDay,
				selectedHour,
				selectedMinute,
				undefined,
			);
			return;
		}
		const second = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(second)) return;
		setSelectedSecond(second);
		updateDate(selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute, second);
	};

	const handleAmPmChange = (value: string | number) => {
		if (value === '' || value === undefined) {
			return;
		}
		const ampm = typeof value === 'string' ? value : String(value);
		if (ampm !== 'AM' && ampm !== 'PM') return;

		let currentHour = selectedHour ?? 12;
		const hour12 = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;

		let newHour: number;
		if (ampm === 'AM') {
			newHour = hour12 === 12 ? 0 : hour12;
		} else {
			newHour = hour12 === 12 ? 12 : hour12 + 12;
		}
		setSelectedHour(newHour);
		updateDate(
			selectedYear,
			selectedMonth,
			selectedDay,
			newHour,
			selectedMinute,
			selectedSecond,
		);
	};

	const isTwoRows = dropdownLayout === 'twoRows';
	const hasTimeDropdowns =
		timeDesignType !== 'none' &&
		timeDesignType !== 'dial' &&
		(availableHours.length > 0 ||
			availableMinutes.length > 0 ||
			availableSeconds.length > 0 ||
			availableAmPm.length > 0);

	const dateLabels = { year: yearLabel, month: monthLabel, day: dayLabel };
	const timeLabels = {
		hour: hourLabel,
		minute: minuteLabel,
		second: secondLabel,
		ampm: ampmLabel,
	};

	return (
		<div
			className="_calendarDropdownContainer"
			style={curry('calendarDropdownContainer', new Set(), new Set())}
		>
			<SubHelperComponent
				definition={definition}
				subComponentName="calendarDropdownContainer"
			/>

			{/* Date Dropdowns Row */}
			<div
				className={`_calendarDropdownRow _dateRow ${isTwoRows ? '_twoRows' : ''}`}
				style={curry('calendarDropdownRow', new Set(), new Set())}
			>
				<SubHelperComponent
					definition={definition}
					subComponentName="calendarDropdownRow"
				/>

				<DateDropdowns
					selectedYear={selectedYear}
					selectedMonth={selectedMonth}
					selectedDay={selectedDay}
					availableYears={availableYears}
					availableMonths={availableMonths}
					availableDays={availableDays}
					onYearChange={handleYearChange}
					onMonthChange={handleMonthChange}
					onDayChange={handleDayChange}
					curry={curry}
					definition={definition}
					readOnly={readOnly}
					labels={dateLabels}
				/>

				{/* Time Dropdowns in same row if singleRow layout */}
				{!isTwoRows && (
					<TimeDropdowns
						selectedHour={selectedHour}
						selectedMinute={selectedMinute}
						selectedSecond={selectedSecond}
						availableHours={availableHours}
						availableMinutes={availableMinutes}
						availableSeconds={availableSeconds}
						availableAmPm={availableAmPm}
						timeDesignType={timeDesignType}
						onHourChange={handleHourChange}
						onMinuteChange={handleMinuteChange}
						onSecondChange={handleSecondChange}
						onAmPmChange={handleAmPmChange}
						curry={curry}
						definition={definition}
						readOnly={readOnly}
						labels={timeLabels}
					/>
				)}
			</div>

			{/* Time Dropdowns Row (separate row if twoRows layout) */}
			{isTwoRows && hasTimeDropdowns && (
				<div
					className="_calendarDropdownRow _timeRow _twoRows"
					style={curry('calendarDropdownRow', new Set(), new Set())}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="calendarDropdownRow"
					/>

					<TimeDropdowns
						selectedHour={selectedHour}
						selectedMinute={selectedMinute}
						selectedSecond={selectedSecond}
						availableHours={availableHours}
						availableMinutes={availableMinutes}
						availableSeconds={availableSeconds}
						availableAmPm={availableAmPm}
						timeDesignType={timeDesignType}
						onHourChange={handleHourChange}
						onMinuteChange={handleMinuteChange}
						onSecondChange={handleSecondChange}
						onAmPmChange={handleAmPmChange}
						curry={curry}
						definition={definition}
						readOnly={readOnly}
						labels={timeLabels}
					/>
				</div>
			)}
		</div>
	);
}
