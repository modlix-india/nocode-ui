import React from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { CalendarHeader } from './CalendarHeader';
import {
	computeMinMaxDates,
	getStyleObjectCurry,
	getValidDate,
	toFormat,
} from './calendarFunctions';
import {
	CalendarAllProps,
	CalendarIntermediateAllProps,
	CalendarMapProps,
	CalendarValidationProps,
} from './calendarTypes';
import { CalendarMonth } from './CalendarMonth';

export function CalendarMap(
	props: CalendarMapProps &
		CalendarValidationProps & {
			browsingMonthYear: string;
			onBrowsingMonthYearChange: (value: string) => void;
			onChange: (value: string | number | undefined) => void;
		},
) {
	const {
		storageFormat,
		displayDateFormat,
		thisDate,
		thatDate,
		isRangeType,
		dateType,
		browsingMonthYear,
		onBrowsingMonthYearChange,
		definition,
	} = props;

	const isEndDate = isRangeType && dateType === 'endDate';

	let [currentDate, minimumPossibleDate, maximumPossibleDate] = computeMinMaxDates(props);

	if (browsingMonthYear) {
		const [month, year] = browsingMonthYear.split('-').map(e => parseInt(e, 10));
		currentDate.setMonth(month - 1);
		currentDate.setFullYear(year);
	} else if (thisDate || thatDate) {
		currentDate =
			getValidDate(isEndDate ? thatDate : thisDate, storageFormat ?? displayDateFormat) ??
			new Date();
	}

	const [browseMonths, setBrowseMonths] = React.useState(false);
	const [browseYears, setBrowseYears] = React.useState(false);

	const newProps = { ...props, currentDate, minimumPossibleDate, maximumPossibleDate };

	let nextDate = new Date(currentDate);
	let count = 0;

	switch (props.calendarFormat) {
		case 'showCurrentYear':
			nextDate.setMonth(0);
			count = 12;
			break;
		case 'showCurrentMonth':
			count = 1;
			break;
		case 'showCurrentMonthAndNext':
			count = 2;
			break;
		case 'showCurrentMonthAndPrevious':
			nextDate.setMonth(nextDate.getMonth() - 1);
			count = 2;
			break;
		case 'showPreviousCurrentAndNextMonth':
			nextDate.setMonth(nextDate.getMonth() - 1);
			count = 3;
			break;
		case 'showCurrentAndPreviousTwoMonths':
			nextDate.setMonth(nextDate.getMonth() - 2);
			count = 3;
			break;
		case 'showCurrentAndNextTwoMonths':
			count = 3;
			break;
		case 'showFourMonths':
			nextDate.setMonth(nextDate.getMonth() - 2);
			count = 4;
			break;
		case 'showSixMonths':
			nextDate.setMonth(nextDate.getMonth() - 2);
			count = 6;
			break;
		case 'showTwelveMonths':
			nextDate.setMonth(nextDate.getMonth() - 5);
			count = 12;
			break;
	}

	function onPreviousClick() {
		if (browseMonths || browseYears) return;
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() - count);
		onBMYChange(`${newDate.getMonth() + 1}-${newDate.getFullYear()}`);
	}

	function onNextClick() {
		if (browseMonths || browseYears) return;
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() + count);
		onBMYChange(`${newDate.getMonth() + 1}-${newDate.getFullYear()}`);
	}

	function onBMYChange(value: string) {
		let [month, year] = value.split('-').map(e => parseInt(e, 10));
		month--;
		if (minimumPossibleDate) {
			const minYear = minimumPossibleDate.getFullYear();
			const minString = `${minimumPossibleDate.getMonth() + 1}-${minYear}`;
			if (year < minYear) value = minString;
			else {
				const diff = month - minimumPossibleDate.getMonth();
				if (year === minYear && month < minimumPossibleDate.getMonth() && diff <= 0)
					value = minString;
			}
		}

		if (maximumPossibleDate) {
			const maxYear = maximumPossibleDate.getFullYear();
			const maxString = `${maximumPossibleDate.getMonth() + 1}-${maxYear}`;
			if (year > maxYear) value = maxString;
			else {
				const diff = maximumPossibleDate.getMonth() - month;
				if (year === maxYear && month > maximumPossibleDate.getMonth() && diff <= 0)
					value = maxString;
			}
		}
		onBrowsingMonthYearChange(value);
	}

	function onDateSelection(date: Date) {
		if (!isRangeType) {
			props.onChange(toFormat(date, 'Date', props.storageFormat ?? props.displayDateFormat));
			return;
		}
	}

	let months: Array<React.JSX.Element> = makeMonths(nextDate, count, onDateSelection, newProps);

	let monthSelector = props.showMonthSelectionInHeader ? (
		<CalendarMonthsInHeader {...newProps} onBrowsingMonthYearChange={onBMYChange} />
	) : null;

	return (
		<>
			<CalendarHeader
				{...newProps}
				onBrowsingMonthYearChange={onBMYChange}
				onYearClick={() => setBrowseYears(!browseYears)}
				onMonthClick={() => setBrowseMonths(!browseMonths)}
				onPreviousClick={onPreviousClick}
				onNextClick={onNextClick}
			/>
			{monthSelector}
			<div className={`_calendarBody _months _${count}cols`}>
				<SubHelperComponent definition={definition} subComponentName="calendarBody" />
				{months}
			</div>
		</>
	);
}

function CalendarMonthsInHeader(
	props: CalendarAllProps & { onBrowsingMonthYearChange: (value: string) => void },
) {
	let [hoverContainer, setHoverContainer] = React.useState<boolean>(false);
	let [hoverMonth, setHoverMonth] = React.useState<number | undefined>();

	const curry = getStyleObjectCurry(props.styles, props.hoverStyles, props.disabledStyles);

	const monthsContainerStyles = curry(
		'calendarHeaderMonthsContainer',
		hoverContainer ? new Set(['calendarHeaderMonthsContainer']) : new Set(),
		new Set(),
	);

	const monthNameStyles = curry('calendarHeaderMonths', new Set(), new Set());
	const monthNameHoverStyles = curry(
		'calendarHeaderMonths',
		new Set(['calendarHeaderMonths']),
		new Set(),
	);

	const parentKey = props.currentDate.toDateString();

	let months: Array<React.JSX.Element> = [];
	const stepper = Math.floor(Math.abs(12 / props.headerMonthsCount)) || 1;
	for (let i = -5, cnt = 0; i <= 6 && cnt < props.headerMonthsCount; i += stepper, cnt++) {
		const iterationDate = new Date(props.currentDate);
		iterationDate.setDate(1);
		iterationDate.setMonth(iterationDate.getMonth() + i);
		const monthYear = `${iterationDate.getMonth() + 1}-${iterationDate.getFullYear()}`;

		months.push(
			<div
				key={parentKey + '-' + monthYear}
				className="_calendarHeaderMonths"
				style={i === hoverMonth ? monthNameHoverStyles : monthNameStyles}
				onMouseEnter={() => setHoverMonth(i)}
				onMouseLeave={() => setHoverMonth(undefined)}
				onClick={() => props.onBrowsingMonthYearChange(monthYear)}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="calendarHeaderMonths"
				/>
				{iterationDate.toLocaleDateString(props.language, {
					month: props.headerMonthsLabels,
				})}
			</div>,
		);
	}

	return (
		<div
			key={parentKey}
			className="_calendarHeaderMonthsContainer"
			style={monthsContainerStyles}
			onMouseEnter={() => setHoverContainer(true)}
			onMouseLeave={() => setHoverContainer(false)}
		>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="calendarHeaderMonthsContainer"
			/>
			{months}
		</div>
	);
}

function makeMonths(
	date: Date,
	count: number,
	onSelection: (date: Date) => void,
	props: CalendarIntermediateAllProps,
) {
	let months: Array<React.JSX.Element> = [];
	for (let i = 0; i < count; i++) {
		const nextDate = new Date(date);
		nextDate.setMonth(nextDate.getMonth() + i);
		months.push(
			<CalendarMonth
				key={nextDate.toDateString()}
				{...props}
				showMonthName={count != 1}
				monthDate={nextDate}
				onSelection={onSelection}
			/>,
		);
	}
	return months;
}
