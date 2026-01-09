import { useMemo } from 'react';
import { CalendarValidationProps } from '../components/calendarTypes';
import { validateWithProps } from '../utils/dateValidation';

export interface DropdownOption {
	value: string | number;
	label: string;
	disabled?: boolean;
}

export interface UseYearOptionsParams {
	validMinDate: Date | undefined;
	validMaxDate: Date | undefined;
	minDate?: string;
	maxDate?: string;
	disableTemporalRanges?: string[];
}

/**
 * Hook to generate available year options for dropdown.
 */
export function useYearOptions(params: UseYearOptionsParams): DropdownOption[] {
	const { validMinDate, validMaxDate, minDate, maxDate, disableTemporalRanges } = params;

	return useMemo(() => {
		const years: DropdownOption[] = [];
		const currentYear = new Date().getFullYear();

		let minYear: number | undefined;
		let maxYear: number | undefined;

		if (validMinDate) {
			const year = validMinDate.getFullYear();
			if (!isNaN(year)) {
				minYear = year;
			}
		}

		if (validMaxDate) {
			const year = validMaxDate.getFullYear();
			if (!isNaN(year)) {
				maxYear = year;
			}
		}

		const hasMinDateConstraint = !!minDate || disableTemporalRanges?.includes('disablePast');
		const hasMaxDateConstraint = !!maxDate || disableTemporalRanges?.includes('disableFuture');

		let startYear: number;
		let endYear: number;

		if (minYear !== undefined) {
			startYear = minYear;
		} else if (hasMinDateConstraint) {
			startYear = currentYear;
		} else {
			startYear = currentYear - 100;
		}

		if (maxYear !== undefined) {
			endYear = maxYear;
		} else if (hasMaxDateConstraint) {
			endYear = currentYear;
		} else {
			endYear = currentYear + 100;
		}

		const finalStartYear = Math.min(startYear, endYear);
		const finalEndYear = Math.max(startYear, endYear);

		for (let year = finalStartYear; year <= finalEndYear; year++) {
			if (!isNaN(year)) {
				years.push({
					value: year,
					label: year.toString(),
				});
			}
		}

		if (years.length === 0) {
			for (let year = currentYear - 10; year <= currentYear + 10; year++) {
				years.push({
					value: year,
					label: year.toString(),
				});
			}
		}

		return years;
	}, [validMinDate, validMaxDate, minDate, maxDate, disableTemporalRanges]);
}

export interface UseMonthOptionsParams {
	selectedYear: number | undefined;
	validMinDate: Date | undefined;
	validMaxDate: Date | undefined;
	language?: string;
	monthLabels?: 'long' | 'short' | 'narrow';
	validationProps: CalendarValidationProps;
}

/**
 * Hook to generate available month options for dropdown.
 */
export function useMonthOptions(params: UseMonthOptionsParams): DropdownOption[] {
	const { selectedYear, validMinDate, validMaxDate, language, monthLabels, validationProps } =
		params;

	return useMemo(() => {
		const months: DropdownOption[] = [];
		if (selectedYear === undefined) return months;

		for (let month = 1; month <= 12; month++) {
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

			if (!isDisabled) {
				const lastDay = new Date(selectedYear, month, 0).getDate();
				let hasValidDay = false;
				for (let day = 1; day <= lastDay; day++) {
					const testDayDate = new Date(selectedYear, month - 1, day);
					const validated = validateWithProps(testDayDate, validationProps);
					if (validated) {
						hasValidDay = true;
						break;
					}
				}
				if (!hasValidDay) isDisabled = true;
			}

			const monthName = new Date(selectedYear, month - 1, 1).toLocaleDateString(language, {
				month: monthLabels || 'long',
			});

			months.push({
				value: month,
				label: monthName,
				disabled: isDisabled,
			});
		}
		return months;
	}, [selectedYear, validMinDate, validMaxDate, language, monthLabels, validationProps]);
}

export interface UseDayOptionsParams {
	selectedYear: number | undefined;
	selectedMonth: number | undefined;
	validationProps: CalendarValidationProps;
}

/**
 * Hook to generate available day options for dropdown.
 */
export function useDayOptions(params: UseDayOptionsParams): DropdownOption[] {
	const { selectedYear, selectedMonth, validationProps } = params;

	return useMemo(() => {
		const days: DropdownOption[] = [];
		if (selectedYear === undefined || selectedMonth === undefined) return days;

		const lastDay = new Date(selectedYear, selectedMonth, 0).getDate();

		for (let day = 1; day <= lastDay; day++) {
			const testDate = new Date(selectedYear, selectedMonth - 1, day);
			const validated = validateWithProps(testDate, validationProps);

			days.push({
				value: day,
				label: day.toString(),
				disabled: !validated,
			});
		}
		return days;
	}, [selectedYear, selectedMonth, validationProps]);
}

export type TimeDesignType =
	| 'none'
	| 'comboBoxes12Hr'
	| 'comboBoxes24Hr'
	| 'dial'
	| 'comboBoxes12HrAndSeconds'
	| 'comboBoxes24HrAndSeconds';

export interface UseHourOptionsParams {
	timeDesignType: TimeDesignType;
	selectedYear?: number | undefined;
	selectedMonth?: number | undefined;
	selectedDay?: number | undefined;
	hourIntervalFrom?: number;
	hourInterval?: number;
	validationProps?: CalendarValidationProps;
}

/**
 * Hook to generate available hour options for dropdown.
 * Shows options even when date parts are not selected.
 */
export function useHourOptions(params: UseHourOptionsParams): DropdownOption[] {
	const {
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		hourIntervalFrom = 0,
		hourInterval = 1,
		validationProps,
	} = params;

	return useMemo(() => {
		if (timeDesignType === 'none' || timeDesignType === 'dial') return [];

		const hours: DropdownOption[] = [];
		const is12Hr =
			timeDesignType === 'comboBoxes12Hr' || timeDesignType === 'comboBoxes12HrAndSeconds';
		const hasDateParts =
			selectedYear !== undefined &&
			selectedMonth !== undefined &&
			selectedDay !== undefined;

		if (is12Hr) {
			for (let hour12 = 1; hour12 <= 12; hour12++) {
				// If we have date parts, validate against them
				if (hasDateParts && validationProps) {
					const amHour = hour12 === 12 ? 0 : hour12;
					let isValidAm = false;
					if (amHour >= hourIntervalFrom) {
						if (
							hourInterval === 0 ||
							(amHour - hourIntervalFrom) % hourInterval === 0
						) {
							const testDate = new Date(
								selectedYear,
								selectedMonth - 1,
								selectedDay,
								amHour,
								0,
								0,
							);
							const validated = validateWithProps(testDate, validationProps);
							if (validated) isValidAm = true;
						}
					}

					const pmHour = hour12 === 12 ? 12 : hour12 + 12;
					let isValidPm = false;
					if (pmHour >= hourIntervalFrom) {
						if (
							hourInterval === 0 ||
							(pmHour - hourIntervalFrom) % hourInterval === 0
						) {
							const testDate = new Date(
								selectedYear,
								selectedMonth - 1,
								selectedDay,
								pmHour,
								0,
								0,
							);
							const validated = validateWithProps(testDate, validationProps);
							if (validated) isValidPm = true;
						}
					}

					if (isValidAm || isValidPm) {
						hours.push({
							value: hour12,
							label: hour12.toString(),
						});
					}
				} else {
					// No date parts - just apply interval logic
					const amHour = hour12 === 12 ? 0 : hour12;
					const pmHour = hour12 === 12 ? 12 : hour12 + 12;

					const amValid =
						amHour >= hourIntervalFrom &&
						(hourInterval === 0 || (amHour - hourIntervalFrom) % hourInterval === 0);
					const pmValid =
						pmHour >= hourIntervalFrom &&
						(hourInterval === 0 || (pmHour - hourIntervalFrom) % hourInterval === 0);

					if (amValid || pmValid) {
						hours.push({
							value: hour12,
							label: hour12.toString(),
						});
					}
				}
			}
		} else {
			// 24-hour format
			for (let hour = 0; hour <= 23; hour++) {
				if (hour < hourIntervalFrom) continue;
				if (hourInterval > 0 && (hour - hourIntervalFrom) % hourInterval !== 0) continue;

				if (hasDateParts && validationProps) {
					const testDate = new Date(
						selectedYear,
						selectedMonth - 1,
						selectedDay,
						hour,
						0,
						0,
					);
					const validated = validateWithProps(testDate, validationProps);
					if (validated) {
						hours.push({
							value: hour,
							label: hour.toString().padStart(2, '0'),
						});
					}
				} else {
					hours.push({
						value: hour,
						label: hour.toString().padStart(2, '0'),
					});
				}
			}
		}
		return hours;
	}, [
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		hourIntervalFrom,
		hourInterval,
		validationProps,
	]);
}

export interface UseMinuteOptionsParams {
	timeDesignType: TimeDesignType;
	selectedYear?: number | undefined;
	selectedMonth?: number | undefined;
	selectedDay?: number | undefined;
	selectedHour?: number | undefined;
	minuteIntervalFrom?: number;
	minuteInterval?: number;
	validationProps?: CalendarValidationProps;
}

/**
 * Hook to generate available minute options for dropdown.
 * Shows options even when date/hour parts are not selected.
 */
export function useMinuteOptions(params: UseMinuteOptionsParams): DropdownOption[] {
	const {
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		selectedHour,
		minuteIntervalFrom = 0,
		minuteInterval = 1,
		validationProps,
	} = params;

	return useMemo(() => {
		if (timeDesignType === 'none' || timeDesignType === 'dial') return [];

		const minutes: DropdownOption[] = [];
		const hasAllParts =
			selectedYear !== undefined &&
			selectedMonth !== undefined &&
			selectedDay !== undefined &&
			selectedHour !== undefined;

		for (let minute = 0; minute < 60; minute++) {
			if (minute < minuteIntervalFrom) continue;
			if (minuteInterval > 0 && (minute - minuteIntervalFrom) % minuteInterval !== 0)
				continue;

			if (hasAllParts && validationProps) {
				const testDate = new Date(
					selectedYear,
					selectedMonth - 1,
					selectedDay,
					selectedHour,
					minute,
					0,
				);
				const validated = validateWithProps(testDate, validationProps);
				if (validated) {
					minutes.push({
						value: minute,
						label: minute.toString().padStart(2, '0'),
					});
				}
			} else {
				minutes.push({
					value: minute,
					label: minute.toString().padStart(2, '0'),
				});
			}
		}
		return minutes;
	}, [
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		selectedHour,
		minuteIntervalFrom,
		minuteInterval,
		validationProps,
	]);
}

export interface UseSecondOptionsParams {
	timeDesignType: TimeDesignType;
	selectedYear?: number | undefined;
	selectedMonth?: number | undefined;
	selectedDay?: number | undefined;
	selectedHour?: number | undefined;
	selectedMinute?: number | undefined;
	secondIntervalFrom?: number;
	secondInterval?: number;
	validationProps?: CalendarValidationProps;
}

/**
 * Hook to generate available second options for dropdown.
 * Shows options even when date/time parts are not selected.
 */
export function useSecondOptions(params: UseSecondOptionsParams): DropdownOption[] {
	const {
		timeDesignType,
		selectedYear,
		selectedMonth,
		selectedDay,
		selectedHour,
		selectedMinute,
		secondIntervalFrom = 0,
		secondInterval = 1,
		validationProps,
	} = params;

	return useMemo(() => {
		if (
			timeDesignType === 'none' ||
			timeDesignType === 'dial' ||
			timeDesignType === 'comboBoxes12Hr' ||
			timeDesignType === 'comboBoxes24Hr'
		)
			return [];

		const seconds: DropdownOption[] = [];
		const hasAllParts =
			selectedYear !== undefined &&
			selectedMonth !== undefined &&
			selectedDay !== undefined &&
			selectedHour !== undefined &&
			selectedMinute !== undefined;

		for (let second = 0; second < 60; second++) {
			if (second < secondIntervalFrom) continue;
			if (secondInterval > 0 && (second - secondIntervalFrom) % secondInterval !== 0)
				continue;

			if (hasAllParts && validationProps) {
				const testDate = new Date(
					selectedYear,
					selectedMonth - 1,
					selectedDay,
					selectedHour,
					selectedMinute,
					second,
				);
				const validated = validateWithProps(testDate, validationProps);
				if (validated) {
					seconds.push({
						value: second,
						label: second.toString().padStart(2, '0'),
					});
				}
			} else {
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
		secondIntervalFrom,
		secondInterval,
		validationProps,
	]);
}

/**
 * Hook to generate AM/PM options for 12-hour format.
 */
export function useAmPmOptions(timeDesignType: TimeDesignType): DropdownOption[] {
	return useMemo(() => {
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
}
