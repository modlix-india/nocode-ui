import React from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { CalendarDropdownSelect } from './CalendarDropdownSelect';
import { DropdownOption, TimeDesignType } from '../hooks/useDropdownOptions';
import { StyleCurryFunction } from '../utils/styleHelpers';

export interface TimeDropdownsProps {
	selectedHour: number | undefined;
	selectedMinute: number | undefined;
	selectedSecond: number | undefined;
	availableHours: DropdownOption[];
	availableMinutes: DropdownOption[];
	availableSeconds: DropdownOption[];
	availableAmPm: DropdownOption[];
	timeDesignType: TimeDesignType;
	onHourChange: (value: string | number) => void;
	onMinuteChange: (value: string | number) => void;
	onSecondChange: (value: string | number) => void;
	onAmPmChange: (value: string | number) => void;
	curry: StyleCurryFunction;
	definition: any;
	readOnly?: boolean;
	labels: {
		hour: string;
		minute: string;
		second: string;
		ampm: string;
	};
}

/**
 * Component for rendering time selection dropdowns (hour, minute, second, AM/PM).
 * Extracted from CalendarDropdown to reduce duplication and improve maintainability.
 */
export function TimeDropdowns({
	selectedHour,
	selectedMinute,
	selectedSecond,
	availableHours,
	availableMinutes,
	availableSeconds,
	availableAmPm,
	timeDesignType,
	onHourChange,
	onMinuteChange,
	onSecondChange,
	onAmPmChange,
	curry,
	definition,
	readOnly,
	labels,
}: TimeDropdownsProps): React.ReactElement | null {
	if (timeDesignType === 'none' || timeDesignType === 'dial') {
		return null;
	}

	const is12Hr =
		timeDesignType === 'comboBoxes12Hr' || timeDesignType === 'comboBoxes12HrAndSeconds';

	// Convert 24hr selectedHour to 12hr display value
	const getDisplayHour = (): string | number => {
		if (selectedHour === undefined) return '';
		if (!is12Hr) return selectedHour;
		if (selectedHour === 0) return 12;
		if (selectedHour > 12) return selectedHour - 12;
		return selectedHour;
	};

	// Get AM/PM based on selectedHour
	const getAmPm = (): string => {
		if (selectedHour === undefined) return '';
		return selectedHour >= 12 ? 'PM' : 'AM';
	};

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

	return (
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
						getDisplayHour(),
						availableHours,
						onHourChange,
						'hourDropdown',
						labels.hour,
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
						selectedMinute !== undefined ? selectedMinute : '',
						availableMinutes,
						onMinuteChange,
						'minuteDropdown',
						labels.minute,
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
						selectedSecond !== undefined ? selectedSecond : '',
						availableSeconds,
						onSecondChange,
						'secondDropdown',
						labels.second,
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
					{renderDropdown(getAmPm(), availableAmPm, onAmPmChange, 'ampmDropdown', labels.ampm)}
				</div>
			)}
		</>
	);
}

