import React, { useMemo, useState, useEffect } from 'react';
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
		timeDesignType,
		language,
		readOnly,
		dropdownLayout = 'singleRow',
	} = props;

	const isEndDate = isRangeType && dateType === 'endDate';
	const currentDateValue = isEndDate ? thatDate : thisDate;

	// Parse current date
	const currentDate = useMemo(() => {
		if (currentDateValue) {
			const date = getValidDate(currentDateValue, displayDateFormat);
			if (date) return date;
		}
		return new Date();
	}, [currentDateValue, displayDateFormat]);

	const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());
	const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1);
	const [selectedDay, setSelectedDay] = useState<number>(currentDate.getDate());
	const [selectedHour, setSelectedHour] = useState<number>(currentDate.getHours());
	const [selectedMinute, setSelectedMinute] = useState<number>(currentDate.getMinutes());
	const [selectedSecond, setSelectedSecond] = useState<number>(currentDate.getSeconds());

	// Sync selected values when currentDateValue changes
	useEffect(() => {
		if (currentDateValue) {
			const date = getValidDate(currentDateValue, displayDateFormat);
			if (date) {
				setSelectedYear(date.getFullYear());
				setSelectedMonth(date.getMonth() + 1);
				setSelectedDay(date.getDate());
				setSelectedHour(date.getHours());
				setSelectedMinute(date.getMinutes());
				setSelectedSecond(date.getSeconds());
			}
		}
	}, [currentDateValue, displayDateFormat]);

	// Compute min/max dates
	const [_, minimumPossibleDate, maximumPossibleDate] = computeMinMaxDates(props);

	// Generate available years
	const availableYears = useMemo(() => {
		const years: CalendarDropdownOption[] = [];
		const minYear = minimumPossibleDate?.getFullYear() ?? 1900;
		const maxYear = maximumPossibleDate?.getFullYear() ?? new Date().getFullYear() + 100;

		for (let year = minYear; year <= maxYear; year++) {
			years.push({
				value: year,
				label: year.toString(),
			});
		}
		return years;
	}, [minimumPossibleDate, maximumPossibleDate]);

	// Generate available months for selected year
	const availableMonths = useMemo(() => {
		const months: CalendarDropdownOption[] = [];
		const monthNames = new Intl.DateTimeFormat(language, { month: 'long' }).formatToParts;

		for (let month = 1; month <= 12; month++) {
			const testDate = new Date(selectedYear, month - 1, 1);

			// Check if month is within allowed range
			let isDisabled = false;
			if (minimumPossibleDate) {
				const minYear = minimumPossibleDate.getFullYear();
				if (
					selectedYear < minYear ||
					(selectedYear === minYear && month < minimumPossibleDate.getMonth() + 1)
				) {
					isDisabled = true;
				}
			}
			if (maximumPossibleDate) {
				const maxYear = maximumPossibleDate.getFullYear();
				if (
					selectedYear > maxYear ||
					(selectedYear === maxYear && month > maximumPossibleDate.getMonth() + 1)
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
	}, [selectedYear, minimumPossibleDate, maximumPossibleDate, props, language]);

	// Generate available days for selected year/month
	const availableDays = useMemo(() => {
		const days: CalendarDropdownOption[] = [];
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

		const seconds: CalendarDropdownOption[] = [];
		const secondIntervalFrom = props.secondIntervalFrom ?? 0;
		const secondInterval = props.secondInterval ?? 1;

		for (let second = 0; second < 60; second++) {
			if (second < secondIntervalFrom) continue;
			if (secondInterval > 0 && (second - secondIntervalFrom) % secondInterval !== 0)
				continue;

			// Check if this second is valid with current date
			const testDate = new Date(
				selectedYear,
				selectedMonth - 1,
				selectedDay,
				selectedHour,
				selectedMinute,
				second,
			);
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
		const year = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(year)) return;
		setSelectedYear(year);
		// Reset month and day if they become invalid
		const newDate = new Date(year, selectedMonth - 1, selectedDay);
		if (newDate.getFullYear() !== year || newDate.getMonth() + 1 !== selectedMonth) {
			setSelectedMonth(1);
			setSelectedDay(1);
		}
		updateDate(year, selectedMonth, selectedDay, selectedHour, selectedMinute, selectedSecond);
	};

	const handleMonthChange = (value: string | number) => {
		const month = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(month)) return;
		setSelectedMonth(month);
		// Adjust day if it's invalid for the new month
		const lastDay = new Date(selectedYear, month, 0).getDate();
		if (selectedDay > lastDay) {
			setSelectedDay(lastDay);
			updateDate(selectedYear, month, lastDay, selectedHour, selectedMinute, selectedSecond);
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
	};

	const handleDayChange = (value: string | number) => {
		const day = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(day)) return;
		setSelectedDay(day);
		updateDate(selectedYear, selectedMonth, day, selectedHour, selectedMinute, selectedSecond);
	};

	const handleHourChange = (value: string | number) => {
		const hour = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(hour)) return;
		// For 12hr format, hour is 1-12, need to combine with AM/PM
		const is12Hr =
			timeDesignType === 'comboBoxes12Hr' || timeDesignType === 'comboBoxes12HrAndSeconds';
		let actualHour = hour;

		if (is12Hr) {
			// Preserve AM/PM from current selectedHour
			const currentIsPM = selectedHour >= 12;
			if (currentIsPM) {
				actualHour = hour === 12 ? 12 : hour + 12;
			} else {
				actualHour = hour === 12 ? 0 : hour;
			}
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
		const minute = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(minute)) return;
		setSelectedMinute(minute);
		updateDate(selectedYear, selectedMonth, selectedDay, selectedHour, minute, selectedSecond);
	};

	const handleSecondChange = (value: string | number) => {
		const second = typeof value === 'string' ? parseInt(value, 10) : value;
		if (isNaN(second)) return;
		setSelectedSecond(second);
		updateDate(selectedYear, selectedMonth, selectedDay, selectedHour, selectedMinute, second);
	};

	const handleAmPmChange = (value: string | number) => {
		const ampm = typeof value === 'string' ? value : String(value);
		if (ampm !== 'AM' && ampm !== 'PM') return;
		let newHour = selectedHour;
		// Convert current hour to 12hr format first
		const hour12 =
			selectedHour === 0 ? 12 : selectedHour > 12 ? selectedHour - 12 : selectedHour;

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
		year: number,
		month: number,
		day: number,
		hour: number,
		minute: number,
		second: number,
	) => {
		const newDate = new Date(year, month - 1, day, hour, minute, second);
		const validated = validateWithProps(newDate, props);

		if (validated) {
			const formatted = toFormat(newDate, 'Date', storageFormat ?? displayDateFormat);
			if (formatted) {
				props.onChange(formatted, false);
			}
		}
	};

	const renderDropdown = (
		value: string | number,
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
						selectedYear,
						availableYears,
						handleYearChange,
						'yearDropdown',
						'Year',
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
						selectedMonth,
						availableMonths,
						handleMonthChange,
						'monthDropdown',
						'Month',
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
						selectedDay,
						availableDays,
						handleDayChange,
						'dayDropdown',
						'Day',
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
									timeDesignType === 'comboBoxes12Hr' ||
										timeDesignType === 'comboBoxes12HrAndSeconds'
										? selectedHour === 0
											? 12
											: selectedHour > 12
												? selectedHour - 12
												: selectedHour
										: selectedHour,
									availableHours,
									handleHourChange,
									'hourDropdown',
									'Hour',
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
									selectedMinute,
									availableMinutes,
									handleMinuteChange,
									'minuteDropdown',
									'Minute',
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
									selectedSecond,
									availableSeconds,
									handleSecondChange,
									'secondDropdown',
									'Second',
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
									selectedHour >= 12 ? 'PM' : 'AM',
									availableAmPm,
									handleAmPmChange,
									'ampmDropdown',
									'AM/PM',
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
								timeDesignType === 'comboBoxes12Hr' ||
									timeDesignType === 'comboBoxes12HrAndSeconds'
									? selectedHour === 0
										? 12
										: selectedHour > 12
											? selectedHour - 12
											: selectedHour
									: selectedHour,
								availableHours,
								handleHourChange,
								'hourDropdown',
								'Hour',
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
								selectedMinute,
								availableMinutes,
								handleMinuteChange,
								'minuteDropdown',
								'Minute',
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
								selectedSecond,
								availableSeconds,
								handleSecondChange,
								'secondDropdown',
								'Second',
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
								selectedHour >= 12 ? 'PM' : 'AM',
								availableAmPm,
								handleAmPmChange,
								'ampmDropdown',
								'AM/PM',
							)}
						</div>
					)}
				</div>
			)}
		</div>
	);
}
