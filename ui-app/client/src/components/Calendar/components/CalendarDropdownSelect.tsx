import React, { CSSProperties, useMemo, useRef, useState, useEffect } from 'react';
import { isNullValue } from '@fincity/kirun-js';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

export interface CalendarDropdownOption {
	value: string | number;
	label: string;
	disabled?: boolean;
}

export interface CalendarDropdownSelectProps {
	value: string | number;
	onChange: (value: string | number) => void;
	options: CalendarDropdownOption[];
	placeholder?: string;
	readOnly?: boolean;
	className?: string;
	style?: CSSProperties;
	subComponentName?: string;
	definition?: any;
	curry?: (key: string, hovers: Set<string>, disableds: Set<string>) => CSSProperties;
}

export function CalendarDropdownSelect({
	value,
	onChange,
	options: originalOptions,
	placeholder,
	readOnly = false,
	className = '',
	style,
	subComponentName,
	definition,
	curry,
}: CalendarDropdownSelectProps) {
	const options = originalOptions.filter(opt => !opt.disabled);

	const label = useMemo(() => {
		if (!isNullValue(value)) {
			const selectedOption = options.find(opt => opt.value === value);
			if (selectedOption) {
				return <span className="_selectedOption">{selectedOption.label}</span>;
			}
		}
		return <span className="_selectedOption _placeholder">{placeholder ?? ''}</span>;
	}, [value, options, placeholder]);

	const [open, setOpen] = useState(false);
	const [currentOption, setCurrentOption] = useState(0);

	const dropDown = useRef<HTMLDivElement>(null);
	const ddBody = useRef<HTMLDivElement>(null);

	// Find current option index when value changes
	useEffect(() => {
		if (!isNullValue(value)) {
			const index = options.findIndex(opt => opt.value === value);
			if (index >= 0) {
				setCurrentOption(index);
			}
		}
	}, [value, options]);

	const setCurrentOptionWithScroll = (num: number) => {
		setCurrentOption(num);
		if (!ddBody.current) return;
		const optionElements = ddBody.current.querySelectorAll('._calendarDropdownOption');
		if (optionElements[num]) {
			optionElements[num].scrollIntoView({ block: 'nearest' });
		}
	};

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (readOnly) return;

		if (e.key === 'ArrowUp') {
			e.preventDefault();
			e.stopPropagation();
			setCurrentOptionWithScroll((options.length + currentOption - 1) % options.length);
			if (!open) setOpen(true);
		} else if (e.key === 'ArrowDown') {
			e.preventDefault();
			e.stopPropagation();
			setCurrentOptionWithScroll((currentOption + 1) % options.length);
			if (!open) setOpen(true);
		} else if (e.key === 'Enter') {
			e.preventDefault();
			e.stopPropagation();
			if (options[currentOption]) {
				onChange(options[currentOption].value);
				setOpen(false);
			}
		} else if (e.key === 'Escape') {
			e.preventDefault();
			e.stopPropagation();
			setOpen(false);
		}
	};

	const handleClick = (option: CalendarDropdownOption) => {
		if (readOnly || option.disabled) return;
		setOpen(false);
		setTimeout(() => dropDown.current?.blur(), 0);
		onChange(option.value);
	};

	const handleContainerClick = () => {
		if (!readOnly) {
			setOpen(true);
		}
	};

	const handleBlur = () => {
		// Delay to allow click events to process
		setTimeout(() => {
			setOpen(false);
		}, 200);
	};

	let body: React.ReactNode = null;
	if (open && !readOnly) {
		const dropdownBodyStyle: CSSProperties = {};
		if (dropDown.current) {
			const rect = dropDown.current.getBoundingClientRect();
			if (rect.top + 300 > document.body.clientHeight) {
				dropdownBodyStyle.bottom = document.body.clientHeight - rect.top;
			} else {
				dropdownBodyStyle.top = rect.top + rect.height;
			}
			dropdownBodyStyle.right = document.body.clientWidth - rect.right;
			dropdownBodyStyle.minWidth = rect.width;
		}

		const dropdownBodyClassName = subComponentName
			? `_calendarDropdownBody _${subComponentName}Body`
			: '_calendarDropdownBody';

		const bodyStyle = curry
			? { ...dropdownBodyStyle, ...curry('calendarDropdownBody', new Set(), new Set()) }
			: dropdownBodyStyle;

		body = (
			<div className={dropdownBodyClassName} ref={ddBody} style={bodyStyle}>
				{definition && (
					<SubHelperComponent
						definition={definition}
						subComponentName="calendarDropdownBody"
					/>
				)}
				{options.map((option, i) => {
					const isSelected = !isNullValue(value) && option.value === value;
					const isHovered = i === currentOption;

					const optionStyle = curry
						? curry(
								'calendarDropdownOption',
								isHovered ? new Set(['calendarDropdownOption']) : new Set(),
								new Set(),
							)
						: {};

					return (
						<div
							key={`${option.value}-${i}`}
							className={`_calendarDropdownOption ${
								isHovered ? '_hovered' : ''
							} ${isSelected ? '_selected' : ''} ${option.disabled ? '_disabled' : ''}`}
							onClick={() => handleClick(option)}
							onMouseOver={() => setCurrentOptionWithScroll(i)}
							style={optionStyle}
						>
							{option.label}
						</div>
					);
				})}
			</div>
		);
	}

	const computedStyle = curry
		? curry(
				subComponentName || '',
				new Set(),
				readOnly ? new Set([subComponentName || '']) : new Set(),
			)
		: style || {};

	const selectClassName = `_calendarDropdownSelect ${className} ${readOnly ? '_readOnly' : ''}`;

	return (
		<div
			tabIndex={readOnly ? -1 : 0}
			ref={dropDown}
			className={selectClassName}
			role="combobox"
			aria-expanded={open}
			aria-readonly={readOnly}
			onClick={handleContainerClick}
			onFocus={() => !readOnly && setOpen(true)}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
			style={computedStyle}
		>
			{label}
			<svg
				width="8"
				height="4"
				viewBox="0 0 8 4"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="_calendarDropdownArrow"
			>
				<path
					d="M4.56629 3.80476C4.56548 3.80476 4.5647 3.80505 4.56408 3.80556C4.25163 4.06508 3.74506 4.06481 3.43301 3.80476L0.234347 1.13914C0.00444266 0.947547 -0.0630292 0.662241 0.0619187 0.412339C0.186867 0.162436 0.476746 5.68513e-09 0.80161 9.5591e-09L7.19894 8.58465e-08C7.52131 8.96907e-08 7.81369 0.162437 7.93863 0.412339C8.06358 0.662241 7.99361 0.947547 7.76621 1.13914L4.5685 3.80396C4.56788 3.80448 4.5671 3.80476 4.56629 3.80476Z"
					fill="#CCCCCC"
				/>
			</svg>
			{body}
		</div>
	);
}
