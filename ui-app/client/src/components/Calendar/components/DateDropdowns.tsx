import React from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { CalendarDropdownSelect } from './CalendarDropdownSelect';
import { DropdownOption } from '../hooks/useDropdownOptions';
import { StyleCurryFunction } from '../utils/styleHelpers';

export interface DateDropdownsProps {
	selectedYear: number | undefined;
	selectedMonth: number | undefined;
	selectedDay: number | undefined;
	availableYears: DropdownOption[];
	availableMonths: DropdownOption[];
	availableDays: DropdownOption[];
	onYearChange: (value: string | number) => void;
	onMonthChange: (value: string | number) => void;
	onDayChange: (value: string | number) => void;
	curry: StyleCurryFunction;
	definition: any;
	readOnly?: boolean;
	labels: {
		year: string;
		month: string;
		day: string;
	};
}

/**
 * Component for rendering date selection dropdowns (year, month, day).
 * Extracted from CalendarDropdown to reduce duplication and improve maintainability.
 */
export function DateDropdowns({
	selectedYear,
	selectedMonth,
	selectedDay,
	availableYears,
	availableMonths,
	availableDays,
	onYearChange,
	onMonthChange,
	onDayChange,
	curry,
	definition,
	readOnly,
	labels,
}: DateDropdownsProps): React.ReactElement {
	const renderDropdown = (
		value: string | number | '',
		options: DropdownOption[],
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

	// Helper to get current value or empty string for placeholder
	const getCurrentValue = (value: number | undefined): string | number => {
		return value !== undefined ? value : '';
	};

	return (
		<>
			{/* Year Dropdown */}
			<div
				className="_yearDropdownWrapper"
				style={curry('yearDropdownWrapper', new Set(), new Set())}
			>
				<SubHelperComponent definition={definition} subComponentName="yearDropdownWrapper" />
				{renderDropdown(
					getCurrentValue(selectedYear),
					availableYears,
					onYearChange,
					'yearDropdown',
					labels.year,
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
					onMonthChange,
					'monthDropdown',
					labels.month,
				)}
			</div>

			{/* Day Dropdown */}
			<div
				className="_dayDropdownWrapper"
				style={curry('dayDropdownWrapper', new Set(), new Set())}
			>
				<SubHelperComponent definition={definition} subComponentName="dayDropdownWrapper" />
				{renderDropdown(
					getCurrentValue(selectedDay),
					availableDays,
					onDayChange,
					'dayDropdown',
					labels.day,
				)}
			</div>
		</>
	);
}

