import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { CalendarMapProps, CalendarValidationProps } from './calendarTypes';
import {
	computeMinMaxDates,
	getStyleObjectCurry,
	getValidDate,
	toFormat,
	validateWithProps,
	zeroHourDate,
} from './calendarFunctions';
import { CalendarDropdownSelect, CalendarDropdownOption } from './CalendarDropdownSelect';

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

// Using CalendarDropdownOption from CalendarDropdownSelect

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
		language,
		readOnly,
		dropdownLayout = 'singleRow',
		yearLabel = 'Year',
		monthLabel = 'Month',
		dayLabel = 'Day',
		hourLabel = 'Hour',
		minuteLabel = 'Minutes',
		secondLabel = 'Seconds',
		ampmLabel = 'AM/PM',
	} = props;

	const timeDesignType =
		rawTimeDesignType === undefined
			? 'none'
			: String(rawTimeDesignType) === 'None'
				? 'none'
				: rawTimeDesignType;

	const parseIncomingDate = useCallback(
		(value: string | number | undefined) => {
			if (!value) return undefined;

			const displayParsed = getValidDate(value, displayDateFormat);
			if (displayParsed) return displayParsed;

			if (storageFormat && storageFormat !== displayDateFormat) {
				const storageParsed = getValidDate(value, storageFormat);
				if (storageParsed) return storageParsed;
			}

			return undefined;
		},
		[displayDateFormat, storageFormat],
	);

	const isEndDate = isRangeType && dateType === 'endDate';
	const currentDateValue = isEndDate ? thatDate : thisDate;

	// Parse current date - only if value exists
	const currentDate = useMemo(() => {
		return parseIncomingDate(currentDateValue);
	}, [currentDateValue, parseIncomingDate]);

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
				// Clear all if date is invalid
				setSelectedYear(undefined);
				setSelectedMonth(undefined);
				setSelectedDay(undefined);
				setSelectedHour(undefined);
				setSelectedMinute(undefined);
				setSelectedSecond(undefined);
			}
		} else {
			// Clear all if no value
			setSelectedYear(undefined);
			setSelectedMonth(undefined);
			setSelectedDay(undefined);
			setSelectedHour(undefined);
			setSelectedMinute(undefined);
			setSelectedSecond(undefined);
		}
	}, [currentDateValue, parseIncomingDate]);

	// Compute min/max dates
	const [_, minimumPossibleDate, maximumPossibleDate] = computeMinMaxDates(props);

	// Validate dates - ensure they're valid Date objects
	const validMinDate =
		minimumPossibleDate && !isNaN(minimumPossibleDate.getTime())
			? minimumPossibleDate
			: undefined;
	const validMaxDate =
		maximumPossibleDate && !isNaN(maximumPossibleDate.getTime())
			? maximumPossibleDate
			: undefined;

	// Generate available years
	const availableYears = useMemo(() => {
		const years: CalendarDropdownOption[] = [];
		const currentYear = new Date().getFullYear();

		let minYear: number | undefined;
		let maxYear: number | undefined;

		// Get year from valid min date if it exists
		if (validMinDate) {
			const year = validMinDate.getFullYear();
			if (!isNaN(year)) {
				minYear = year;
			}
		}

		// Get year from valid max date if it exists
		if (validMaxDate) {
			const year = validMaxDate.getFullYear();
			if (!isNaN(year)) {
				maxYear = year;
			}
		}

		// Check if user has set date constraints in props
		const hasMinDateConstraint =
			!!props.minDate || props.disableTemporalRanges?.includes('disablePast');
		const hasMaxDateConstraint =
			!!props.maxDate || props.disableTemporalRanges?.includes('disableFuture');

		// Determine start and end years:
		// - If validMinDate/validMaxDate exist, use them (they come from computeMinMaxDates which respects all constraints)
		// - If constraints exist but dates are invalid, use current year as boundary
		// - If no constraints at all, use wide default range
		let startYear: number;
		let endYear: number;

		if (minYear !== undefined) {
			startYear = minYear;
		} else if (hasMinDateConstraint) {
			// Constraint exists but date is invalid - use current year as minimum
			startYear = currentYear;
		} else {
			// No constraints - use wide default range
			startYear = currentYear - 100;
		}

		if (maxYear !== undefined) {
			endYear = maxYear;
		} else if (hasMaxDateConstraint) {
			// Constraint exists but date is invalid - use current year as maximum
			endYear = currentYear;
		} else {
			// No constraints - use wide default range
			endYear = currentYear + 100;
		}

		// Ensure valid range (handle edge cases where min > max)
		const finalStartYear = Math.min(startYear, endYear);
		const finalEndYear = Math.max(startYear, endYear);

		// Generate years in the range
		for (let year = finalStartYear; year <= finalEndYear; year++) {
			if (!isNaN(year)) {
				years.push({
					value: year,
					label: year.toString(),
				});
			}
		}

		// Only use fallback if somehow no years were generated (shouldn't happen)
		if (years.length === 0) {
			console.error('CalendarDropdown: CRITICAL - No years generated', {
				minimumPossibleDate,
				maximumPossibleDate,
				validMinDate,
				validMaxDate,
				minYear,
				maxYear,
				startYear,
				endYear,
				finalStartYear,
				finalEndYear,
				currentYear,
			});
			// Force generate a minimal range as last resort
			for (let year = currentYear - 10; year <= currentYear + 10; year++) {
				years.push({
					value: year,
					label: year.toString(),
				});
			}
		}

		return years;
	}, [validMinDate, validMaxDate, props.minDate, props.maxDate, props.disableTemporalRanges]);

	// Helper to get current value or empty string for placeholder
	const getCurrentValue = (value: number | undefined): string | number => {
		return value !== undefined ? value : '';
	};

	// Generate available months for selected year
	const availableMonths = useMemo(() => {
		const months: CalendarDropdownOption[] = [];
		if (selectedYear === undefined) return months;

		const monthNames = new Intl.DateTimeFormat(language, { month: 'long' }).formatToParts;

		for (let month = 1; month <= 12; month++) {
			const testDate = new Date(selectedYear, month - 1, 1);

			// Check if month is within allowed range
			let isDisabled = false;
			if (validMinDate) {
				const minYear = validMinDate.getFullYear();
				if (
					selectedYear < minYear ||
					(selectedYear === minYear && month < validMinDate.getMonth() + 1)
				) {
					isDisabled = true;
				}
			}
			if (validMaxDate) {
				const maxYear = validMaxDate.getFullYear();
				if (
					selectedYear > maxYear ||
					(selectedYear === maxYear && month > validMaxDate.getMonth() + 1)
				) {
					isDisabled = true;
				}
			}

			// Check if any day in this month is valid
			if (!isDisabled) {
				const lastDay = new Date(selectedYear, month, 0).getDate();
				let hasValidDay = false;
				for (let day = 1; day <= lastDay; day++) {
					const testDayDate = new Date(selectedYear, month - 1, day);
					const validated = validateWithProps(testDayDate, props);
					if (validated) {
						hasValidDay = true;
						break;
					}
				}
				if (!hasValidDay) isDisabled = true;
			}

			const monthName = new Date(selectedYear, month - 1, 1).toLocaleDateString(language, {
				month: props.monthLabels || 'long',
			});

			months.push({
				value: month,
				label: monthName,
				disabled: isDisabled,
			});
		}
		return months;
	}, [selectedYear, validMinDate, validMaxDate, props, language]);

	// Generate available days for selected year/month
	const availableDays = useMemo(() => {
		const days: CalendarDropdownOption[] = [];
		if (selectedYear === undefined || selectedMonth === undefined) return days;

		const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();

		for (let day = 1; day <= lastDay; day++) {
			const testDate = new Date(selectedYear, selectedMonth - 1, day);
			const validated = validateWithProps(testDate, props);

			days.push({
				value: day,
				label: day.toString(),
				disabled: !validated,
			});
		}
		return days;
	}, [selectedYear, selectedMonth, props]);

	// Generate available hours
	const availableHours = useMemo(() => {
		if (timeDesignType === 'none') return [];
		if (selectedYear === undefined || selectedMonth === undefined || selectedDay === undefined)
			return [];

		const hours: CalendarDropdownOption[] = [];
		const is12Hr =
			timeDesignType === 'comboBoxes12Hr' || timeDesignType === 'comboBoxes12HrAndSeconds';
		const hourIntervalFrom = props.hourIntervalFrom ?? 0;
		const hourInterval = props.hourInterval ?? 1;

		if (is12Hr) {
			// For 12hr format, show 1-12 and check both AM/PM versions
			for (let hour12 = 1; hour12 <= 12; hour12++) {
				// Check AM version (0-11, where 12AM = 0)
				const amHour = hour12 === 12 ? 0 : hour12;
				let isValidAm = false;
				if (amHour >= hourIntervalFrom) {
					if (hourInterval === 0 || (amHour - hourIntervalFrom) % hourInterval === 0) {
						const testDate = new Date(
							selectedYear,
							selectedMonth - 1,
							selectedDay,
							amHour,
							0,
							0,
						);
						const validated = validateWithProps(testDate, props);
						if (validated) isValidAm = true;
					}
				}

				// Check PM version (12-23, where 12PM = 12)
				const pmHour = hour12 === 12 ? 12 : hour12 + 12;
				let isValidPm = false;
				if (pmHour >= hourIntervalFrom) {
					if (hourInterval === 0 || (pmHour - hourIntervalFrom) % hourInterval === 0) {
						const testDate = new Date(
							selectedYear,
							selectedMonth - 1,
							selectedDay,
							pmHour,
							0,
							0,
						);
						const validated = validateWithProps(testDate, props);
						if (validated) isValidPm = true;
					}
				}

				// Add hour if either AM or PM version is valid
				if (isValidAm || isValidPm) {
					hours.push({
						value: hour12,
						label: hour12.toString(),
					});
				}
			}
		} else {
			// 24hr format
			for (let hour = 0; hour <= 23; hour++) {
				if (hour < hourIntervalFrom) continue;
				if (hourInterval > 0 && (hour - hourIntervalFrom) % hourInterval !== 0) continue;

				const testDate = new Date(selectedYear, selectedMonth - 1, selectedDay, hour, 0, 0);
				const validated = validateWithProps(testDate, props);

				if (validated) {
					hours.push({
						value: hour,
						label: hour.toString().padStart(2, '0'),
					});
				}
			}
		}
		return hours;
	}, [timeDesignType, selectedYear, selectedMonth, selectedDay, props]);

	// Generate available minutes
	const availableMinutes = useMemo(() => {
		if (timeDesignType === 'none' || timeDesignType === 'dial') return [];
		if (
			selectedYear === undefined ||
			selectedMonth === undefined ||
			selectedDay === undefined ||
			selectedHour === undefined
		)
			return [];

		const minutes: CalendarDropdownOption[] = [];
		const minuteIntervalFrom = props.minuteIntervalFrom ?? 0;
		const minuteInterval = props.minuteInterval ?? 1;

		for (let minute = 0; minute < 60; minute++) {
			if (minute < minuteIntervalFrom) continue;
			if (minuteInterval > 0 && (minute - minuteIntervalFrom) % minuteInterval !== 0)
				continue;

			// Check if this minute is valid with current date
			const testDate = new Date(
				selectedYear,
				selectedMonth - 1,
				selectedDay,
				selectedHour,
				minute,
				0,
			);
			const validated = validateWithProps(testDate, props);

			if (validated) {
				minutes.push({
					value: minute,
					label: minute.toString().padStart(2, '0'),
				});
			}
		}
		return minutes;
	}, [timeDesignType, selectedYear, selectedMonth, selectedDay, selectedHour, props]);

	// Generate available seconds
	const availableSeconds = useMemo(() => {
		if (
			timeDesignType === 'none' ||
			timeDesignType === 'dial' ||
			timeDesignType === 'comboBoxes12Hr' ||
			timeDesignType === 'comboBoxes24Hr'
		)
			return [];
		if (
			selectedYear === undefined ||
			selectedMonth === undefined ||
			selectedDay === undefined ||
			selectedHour === undefined ||
			selectedMinute === undefined
		)
			return [];

		const seconds: CalendarDropdownOption[] = [];
		const secondIntervalFrom = props.secondIntervalFrom ?? 0;
		const secondInterval = props.secondInterval ?? 1;

		// TypeScript narrowing - these are guaranteed to be defined after the check above
		const year = selectedYear;
		const month = selectedMonth;
		const day = selectedDay;
		const hour = selectedHour;
		const minute = selectedMinute;

		for (let second = 0; second < 60; second++) {
			if (second < secondIntervalFrom) continue;
			if (secondInterval > 0 && (second - secondIntervalFrom) % secondInterval !== 0)
				continue;

			// Check if this second is valid with current date
			const testDate = new Date(year, month - 1, day, hour, minute, second);
			const validated = validateWithProps(testDate, props);

			if (validated) {
				seconds.push({
					value: second,
					label: second.toString().padStart(2, '0'),
				});
			}
		}
		return seconds;
	}, [
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		selectedHour,
		selectedMinute,
		props,
	]);

	// Generate AM/PM options for 12hr format
	const availableAmPm = useMemo(() => {
		if (
			timeDesignType === 'none' ||
			timeDesignType === 'comboBoxes24Hr' ||
			timeDesignType === 'comboBoxes24HrAndSeconds' ||
			timeDesignType === 'dial'
		)
			return [];

		return [
			{ value: 'AM', label: 'AM' },
			{ value: 'PM', label: 'PM' },
		];
	}, [timeDesignType]);

	const curry = getStyleObjectCurry(props.styles, props.hoverStyles, props.disabledStyles);

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
		// Reset month and day if they become invalid
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
		// Adjust day if it's invalid for the new month
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
		// For 12hr format, hour is 1-12, need to combine with AM/PM
		const is12Hr =
			timeDesignType === 'comboBoxes12Hr' || timeDesignType === 'comboBoxes12HrAndSeconds';
		let actualHour = hour;

		if (is12Hr && selectedHour !== undefined) {
			// Preserve AM/PM from current selectedHour
			const currentIsPM = selectedHour >= 12;
			if (currentIsPM) {
				actualHour = hour === 12 ? 12 : hour + 12;
			} else {
				actualHour = hour === 12 ? 0 : hour;
			}
		} else if (is12Hr) {
			// Default to AM if no hour selected
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
			// Don't clear hour when AM/PM is cleared, just keep current hour
			return;
		}
		const ampm = typeof value === 'string' ? value : String(value);
		if (ampm !== 'AM' && ampm !== 'PM') return;

		// If no hour selected, default to 12
		let currentHour = selectedHour ?? 12;
		// Convert current hour to 12hr format first
		const hour12 = currentHour === 0 ? 12 : currentHour > 12 ? currentHour - 12 : currentHour;

		let newHour: number;
		if (ampm === 'AM') {
			newHour = hour12 === 12 ? 0 : hour12;
		} else {
			// PM
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

	const updateDate = (
		year: number | undefined,
		month: number | undefined,
		day: number | undefined,
		hour: number | undefined,
		minute: number | undefined,
		second: number | undefined,
	) => {
		// If any required date part is missing, don't update
		if (year === undefined || month === undefined || day === undefined) {
			return;
		}

		// Use defaults for time if not provided
		const finalHour = hour ?? 0;
		const finalMinute = minute ?? 0;
		const finalSecond = second ?? 0;

		const newDate = new Date(year, month - 1, day, finalHour, finalMinute, finalSecond);
		const validated = validateWithProps(newDate, props);

		if (validated) {
			const displayFormatted = toFormat(newDate, 'Date', displayDateFormat);
			if (displayFormatted) {
				props.onChange(displayFormatted, false);
			}
		}
	};

	const renderDropdown = (
		value: string | number | '',
		options: CalendarDropdownOption[],
		onChange: (value: string | number) => void,
		subComponentName: string,
		placeholder?: string,
	) => {
		return (
			<CalendarDropdownSelect
				value={value}
				onChange={onChange}
				options={options}
				placeholder={placeholder}
				readOnly={readOnly}
				className={`_${subComponentName}`}
				subComponentName={subComponentName}
				definition={definition}
				curry={curry}
			/>
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

				{/* Year Dropdown */}
				<div
					className="_yearDropdownWrapper"
					style={curry('yearDropdownWrapper', new Set(), new Set())}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="yearDropdownWrapper"
					/>
					{renderDropdown(
						getCurrentValue(selectedYear),
						availableYears,
						handleYearChange,
						'yearDropdown',
						yearLabel,
					)}
				</div>

				{/* Month Dropdown */}
				<div
					className="_monthDropdownWrapper"
					style={curry('monthDropdownWrapper', new Set(), new Set())}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="monthDropdownWrapper"
					/>
					{renderDropdown(
						getCurrentValue(selectedMonth),
						availableMonths,
						handleMonthChange,
						'monthDropdown',
						monthLabel,
					)}
				</div>

				{/* Day Dropdown */}
				<div
					className="_dayDropdownWrapper"
					style={curry('dayDropdownWrapper', new Set(), new Set())}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="dayDropdownWrapper"
					/>
					{renderDropdown(
						getCurrentValue(selectedDay),
						availableDays,
						handleDayChange,
						'dayDropdown',
						dayLabel,
					)}
				</div>

				{/* Time Dropdowns in same row if singleRow layout */}
				{!isTwoRows && timeDesignType !== 'none' && timeDesignType !== 'dial' && (
					<>
						{/* Hour Dropdown */}
						{availableHours.length > 0 && (
							<div
								className="_hourDropdownWrapper"
								style={curry('hourDropdownWrapper', new Set(), new Set())}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName="hourDropdownWrapper"
								/>
								{renderDropdown(
									selectedHour !== undefined
										? timeDesignType === 'comboBoxes12Hr' ||
											timeDesignType === 'comboBoxes12HrAndSeconds'
											? selectedHour === 0
												? 12
												: selectedHour > 12
													? selectedHour - 12
													: selectedHour
											: selectedHour
										: '',
									availableHours,
									handleHourChange,
									'hourDropdown',
									hourLabel,
								)}
							</div>
						)}

						{/* Minute Dropdown */}
						{availableMinutes.length > 0 && (
							<div
								className="_minuteDropdownWrapper"
								style={curry('minuteDropdownWrapper', new Set(), new Set())}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName="minuteDropdownWrapper"
								/>
								{renderDropdown(
									getCurrentValue(selectedMinute),
									availableMinutes,
									handleMinuteChange,
									'minuteDropdown',
									minuteLabel,
								)}
							</div>
						)}

						{/* Second Dropdown */}
						{availableSeconds.length > 0 && (
							<div
								className="_secondDropdownWrapper"
								style={curry('secondDropdownWrapper', new Set(), new Set())}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName="secondDropdownWrapper"
								/>
								{renderDropdown(
									getCurrentValue(selectedSecond),
									availableSeconds,
									handleSecondChange,
									'secondDropdown',
									secondLabel,
								)}
							</div>
						)}

						{/* AM/PM Dropdown */}
						{availableAmPm.length > 0 && (
							<div
								className="_ampmDropdownWrapper"
								style={curry('ampmDropdownWrapper', new Set(), new Set())}
							>
								<SubHelperComponent
									definition={definition}
									subComponentName="ampmDropdownWrapper"
								/>
								{renderDropdown(
									selectedHour !== undefined
										? selectedHour >= 12
											? 'PM'
											: 'AM'
										: '',
									availableAmPm,
									handleAmPmChange,
									'ampmDropdown',
									ampmLabel,
								)}
							</div>
						)}
					</>
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

					{/* Hour Dropdown */}
					{availableHours.length > 0 && (
						<div
							className="_hourDropdownWrapper"
							style={curry('hourDropdownWrapper', new Set(), new Set())}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="hourDropdownWrapper"
							/>
							{renderDropdown(
								selectedHour !== undefined
									? timeDesignType === 'comboBoxes12Hr' ||
										timeDesignType === 'comboBoxes12HrAndSeconds'
										? selectedHour === 0
											? 12
											: selectedHour > 12
												? selectedHour - 12
												: selectedHour
										: selectedHour
									: '',
								availableHours,
								handleHourChange,
								'hourDropdown',
								hourLabel,
							)}
						</div>
					)}

					{/* Minute Dropdown */}
					{availableMinutes.length > 0 && (
						<div
							className="_minuteDropdownWrapper"
							style={curry('minuteDropdownWrapper', new Set(), new Set())}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="minuteDropdownWrapper"
							/>
							{renderDropdown(
								getCurrentValue(selectedMinute),
								availableMinutes,
								handleMinuteChange,
								'minuteDropdown',
								minuteLabel,
							)}
						</div>
					)}

					{/* Second Dropdown */}
					{availableSeconds.length > 0 && (
						<div
							className="_secondDropdownWrapper"
							style={curry('secondDropdownWrapper', new Set(), new Set())}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="secondDropdownWrapper"
							/>
							{renderDropdown(
								getCurrentValue(selectedSecond),
								availableSeconds,
								handleSecondChange,
								'secondDropdown',
								secondLabel,
							)}
						</div>
					)}

					{/* AM/PM Dropdown */}
					{availableAmPm.length > 0 && (
						<div
							className="_ampmDropdownWrapper"
							style={curry('ampmDropdownWrapper', new Set(), new Set())}
						>
							<SubHelperComponent
								definition={definition}
								subComponentName="ampmDropdownWrapper"
							/>
							{renderDropdown(
								selectedHour !== undefined
									? selectedHour >= 12
										? 'PM'
										: 'AM'
									: '',
								availableAmPm,
								handleAmPmChange,
								'ampmDropdown',
								ampmLabel,
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
