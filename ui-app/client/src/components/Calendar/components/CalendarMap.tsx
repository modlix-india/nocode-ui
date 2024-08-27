import React from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import {
	CalendarHeaderForBrowsing,
	CalendarHeaderForMonth,
	CalendarMonthTitle,
	CalendarYearTitle,
} from './CalendarHeader';
import {
	addToToggleSetCurry,
	computeMinMaxDates,
	getStyleObjectCurry,
	getValidDate,
	removeFromToggleSetCurry,
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
			onChange: (value: string | number | undefined, close: boolean) => void;
			onClearOtherDate?: () => void;
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

	const [browseMonths, setBrowseMonths] = React.useState<number | undefined>();
	const [browseYears, setBrowseYears] = React.useState<number | undefined>();

	const newProps = { ...props, currentDate, minimumPossibleDate, maximumPossibleDate };

	const [count, nextDate] = computeMonthCounts(currentDate, props.calendarFormat);

	function onPreviousClick() {
		if (browseMonths || browseYears) {
			if (browseMonths) {
				if (!minimumPossibleDate || browseMonths > minimumPossibleDate.getFullYear())
					setBrowseMonths(browseMonths - 1);
			} else {
				if (!minimumPossibleDate || browseYears! > minimumPossibleDate.getFullYear())
					setBrowseYears(browseYears! - count * 10);
			}
			return;
		}
		const newDate = new Date(currentDate);
		newDate.setMonth(newDate.getMonth() - count);
		onBMYChange(`${newDate.getMonth() + 1}-${newDate.getFullYear()}`);
	}

	function onNextClick() {
		if (browseMonths || browseYears) {
			if (browseMonths) {
				if (!maximumPossibleDate || browseMonths < maximumPossibleDate.getFullYear())
					setBrowseMonths(browseMonths + 1);
			} else {
				if (!maximumPossibleDate || browseYears! < maximumPossibleDate.getFullYear())
					setBrowseYears(browseYears! + count * 10);
			}
			return;
		}
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

	const onDateSelection = (date: Date) => {
		if (props.isMultiSelect) {
			let finDate = toFormat(
				date,
				'Date',
				props.storageFormat ?? props.displayDateFormat,
			)!.toString();
			if (props.thisDate) {
				const splits = props.thisDate.toString().split(props.multipleDateSeparator);
				const index = splits.indexOf(finDate);
				if (index >= 0) splits.splice(index, 1);
				else splits.push(finDate);
				finDate = splits.join(props.multipleDateSeparator);
			}
			props.onChange(finDate, false);
		} else if (props.isRangeType) {
			let startDate = props.thisDate;
			let endDate = props.thatDate;

			let wipeEndDate = false;
			if (startDate && endDate) {
				startDate = endDate = undefined;
				wipeEndDate = true;
			}
			if (isEndDate && startDate && endDate) [startDate, endDate] = [endDate, startDate];

			let start = getValidDate(startDate, storageFormat ?? displayDateFormat);
			let end = getValidDate(endDate, storageFormat ?? displayDateFormat);
			if (startDate || isEndDate) {
				end = date;
				endDate = toFormat(date, 'Date', storageFormat ?? displayDateFormat);
			} else {
				start = date;
				startDate = toFormat(date, 'Date', storageFormat ?? displayDateFormat);
			}

			if (start && end && start > end) [startDate, endDate] = [endDate, startDate];

			if (startDate && endDate)
				props.onChange(
					startDate && endDate && isEndDate
						? `${endDate}${props.multipleDateSeparator}${startDate}`
						: `${startDate}${props.multipleDateSeparator}${endDate}`,
					true,
				);
			else {
				props.onChange(
					toFormat(date, 'Date', props.storageFormat ?? props.displayDateFormat),
					false,
				);
				if (wipeEndDate && props.onClearOtherDate) props.onClearOtherDate();
			}
		} else {
			props.onChange(
				toFormat(date, 'Date', props.storageFormat ?? props.displayDateFormat),
				true,
			);
		}
	};

	let months: Array<React.JSX.Element> = makeMonths(nextDate, count, onDateSelection, newProps);

	let monthSelector =
		!browseMonths && !browseYears && props.showMonthSelectionInHeader ? (
			<CalendarMonthsInHeader {...newProps} onBrowsingMonthYearChange={onBMYChange} />
		) : null;

	let header: React.JSX.Element;
	let browseBody: React.JSX.Element | undefined = undefined;

	const curry = getStyleObjectCurry(props.styles, props.hoverStyles, props.disabledStyles);
	const [hovers, setHovers] = React.useState<Set<string>>(new Set());

	if (browseMonths || browseYears) {
		header = (
			<CalendarHeaderForBrowsing
				{...newProps}
				from={(browseMonths ?? browseYears)!}
				to={browseMonths ? undefined : browseYears! + count * 10}
				onYearClick={() => {
					setBrowseYears(undefined);
					setBrowseMonths(undefined);
				}}
				onMonthClick={() => {}}
				onPreviousClick={onPreviousClick}
				onNextClick={onNextClick}
			/>
		);

		if (browseMonths) {
			const from = new Date();
			from.setFullYear(browseMonths);
			from.setMonth(0);
			const monthNames: React.JSX.Element[] = [];
			for (let i = 0; i < 12; i++) {
				const monthDate = new Date(from);
				if (
					minimumPossibleDate &&
					monthDate.getFullYear() === minimumPossibleDate.getFullYear()
				) {
					if (i < minimumPossibleDate.getMonth()) continue;
				}
				if (
					maximumPossibleDate &&
					monthDate.getFullYear() === maximumPossibleDate.getFullYear()
				) {
					if (i > maximumPossibleDate.getMonth()) continue;
				}
				monthDate.setMonth(i);
				monthNames.push(
					<CalendarMonthTitle
						key={monthDate.toDateString()}
						{...newProps}
						month={monthDate.toLocaleDateString(props.language, {
							month: props.monthLabels,
						})}
						onClick={() => {
							onBMYChange(`${i + 1}-${browseMonths}`);
							setBrowseMonths(undefined);
							setBrowseYears(undefined);
						}}
					/>,
				);
			}
			browseBody = (
				<div
					className="_calendarBodyBrowseMonths"
					style={curry('calendarBodyBrowseMonths', hovers, new Set())}
					onMouseEnter={addToToggleSetCurry(
						hovers,
						setHovers,
						'calendarBodyBrowseMonths',
					)}
					onMouseLeave={removeFromToggleSetCurry(
						hovers,
						setHovers,
						'calendarBodyBrowseMonths',
					)}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="calendarBodyBrowseMonths"
					/>
					{monthNames}
				</div>
			);
		} else {
			const yearNumbers: React.JSX.Element[] = [];
			for (let i = 0; i < count * 10; i++) {
				const year = browseYears! + i;
				if (maximumPossibleDate && year > maximumPossibleDate.getFullYear()) break;
				if (minimumPossibleDate && year < minimumPossibleDate.getFullYear()) continue;
				yearNumbers.push(
					<CalendarYearTitle
						key={year}
						{...newProps}
						year={year}
						onClick={() => {
							setBrowseMonths(year);
							setBrowseYears(undefined);
						}}
					/>,
				);
			}
			browseBody = (
				<div
					className="_calendarBodyBrowseYears"
					style={curry('calendarBodyBrowseYears', hovers, new Set())}
					onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'calendarBodyBrowseYears')}
					onMouseLeave={removeFromToggleSetCurry(
						hovers,
						setHovers,
						'calendarBodyBrowseYears',
					)}
				>
					<SubHelperComponent
						definition={definition}
						subComponentName="calendarBodyBrowseYears"
					/>
					{yearNumbers}
				</div>
			);
		}
	} else {
		header = (
			<CalendarHeaderForMonth
				{...newProps}
				onYearClick={() => props.browseYears && setBrowseYears(currentDate.getFullYear())}
				onMonthClick={() =>
					props.browseMonths && setBrowseMonths(currentDate.getFullYear())
				}
				onPreviousClick={onPreviousClick}
				onNextClick={onNextClick}
			/>
		);
	}

	let subComponent =
		!browseMonths && !browseYears ? (
			<SubHelperComponent definition={definition} subComponentName="calendarBodyMonths" />
		) : undefined;

	return (
		<>
			{header}
			{monthSelector}
			<div
				className={`_calendarBodyMonths _months _${count}cols`}
				style={curry('calendarBodyMonths', hovers, new Set())}
				onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'calendarBodyMonths')}
				onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'calendarBodyMonths')}
			>
				<SubHelperComponent definition={definition} subComponentName="calendarBodyMonths" />
				{subComponent}
				{months}
				{browseBody}
			</div>
		</>
	);
}

function computeMonthCounts(currentDate: Date, calendarFormat: string): [number, Date] {
	let nextDate = new Date(currentDate);
	let count = 0;

	switch (calendarFormat) {
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

	return [count, nextDate];
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
