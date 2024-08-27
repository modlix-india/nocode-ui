import React from 'react';
import { CalendarAllProps } from './calendarTypes';
import { CalendarMonthTitle } from './CalendarHeader';
import {
	addToToggleSetCurry,
	computeWeekNumberOfYear,
	getStyleObjectCurry,
	getValidDate,
	removeFromToggleSetCurry,
} from './calendarFunctions';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

export function CalendarMonth(
	props: CalendarAllProps & {
		showMonthName: boolean;
		monthDate: Date;
		onSelection: (dt: Date) => void;
	},
) {
	let date = new Date(props.monthDate);
	date.setDate(1);
	const weekStartsOn = parseInt(props.weekStartsOn);

	if (date.getDay() > weekStartsOn) date.setDate(weekStartsOn - date.getDay() + 1);
	else if (date.getDay() < weekStartsOn) date.setDate(weekStartsOn - date.getDay() - 6);

	let curry = getStyleObjectCurry(props.styles, props.hoverStyles, props.disabledStyles);
	const [hovers, setHovers] = React.useState<Set<string>>(new Set());

	const disableds = new Set(props.disableDays?.map(e => `weekLabel-${e}`) ?? []);

	if (props.disableTemporalRanges?.some(e => e === 'disableWeekend')) {
		for (let i of props.weekEndDays ?? []) disableds.add(`weekLabel-${i}`);
	}

	let datesNLabels: Array<React.JSX.Element> = [];

	if (props.showMonthName)
		datesNLabels.push(
			<CalendarMonthTitle
				key="monthLabel"
				{...props}
				month={props.monthDate.toLocaleDateString(props.language, {
					month: props.monthLabels,
				})}
			/>,
		);

	if (props.showWeekNumber) {
		let weekNumberLabel = 'Wk';

		if (props.weekDayLabels === 'narrow') weekNumberLabel = 'N';
		else if (props.weekDayLabels === 'long') weekNumberLabel = 'Week';

		datesNLabels.push(
			<div
				className="_weekLabel _weekNumberLabel"
				key="weekNumberLabel"
				style={curry(
					'weekName',
					hovers.has('weekLabel-wk') ? new Set(['weekName']) : new Set(),
					disableds,
				)}
				onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'weekLabel-wk')}
				onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'weekLabel-wk')}
			>
				<SubHelperComponent definition={props.definition} subComponentName="weekName" />
				{weekNumberLabel}
			</div>,
		);
	}

	let iterationDate = new Date(date);
	for (let i = 0; i < 7; i++) {
		const label = `weekLabel-${iterationDate.getDay()}`;
		datesNLabels.push(
			<div
				className="_weekLabel"
				key={label}
				style={curry(
					'weekName',
					hovers.has(label) ? new Set(['weekName']) : new Set(),
					disableds.has(label) ? new Set(['weekName']) : new Set(),
				)}
				onMouseEnter={addToToggleSetCurry(hovers, setHovers, label)}
				onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, label)}
			>
				<SubHelperComponent definition={props.definition} subComponentName="weekName" />
				{iterationDate.toLocaleDateString(props.language, {
					weekday: props.weekDayLabels,
				})}
			</div>,
		);
		iterationDate.setDate(iterationDate.getDate() + 1);
	}

	iterationDate = new Date(date);
	let wkDate = new Date(props.monthDate);
	wkDate.setDate(1);
	let weekNumber = props.showWeekNumber ? computeWeekNumberOfYear(wkDate) : -1;

	const disabledDates: Array<Date> =
		(props.disableDates
			?.map(date => getValidDate(date, props.storageFormat ?? props.displayDateFormat))
			.filter(e => !!e) as Date[]) ?? [];

	function onClickDate(clickedDate: Date) {
		const theDate = new Date(clickedDate);
		return () => {
			props.onSelection(theDate);
		};
	}

	const dateThisDates: Array<Date> = [];

	if (props.isMultiSelect && props.thisDate) {
		for (let x of props.thisDate.toString().split(props.multipleDateSeparator)) {
			const date = getValidDate(x, props.storageFormat ?? props.displayDateFormat);
			if (date) dateThisDates.push(date);
		}
	} else if (props.thisDate) {
		const date = getValidDate(props.thisDate, props.storageFormat ?? props.displayDateFormat);
		if (date) dateThisDates.push(date);
	}

	const dateThatDate = props.thatDate
		? getValidDate(props.thatDate, props.storageFormat ?? props.displayDateFormat)
		: undefined;

	const disabledDays = props.disableDays?.map(e => parseInt(e)) ?? [];

	const weekendDays = props.weekEndDays?.map(e => parseInt(e)) ?? [];

	for (let i = 0; i < 6; i++) {
		let inDate = new Date(iterationDate);
		let cnt = 0;
		for (let i = 0; i < 7; i++) {
			if (inDate.getMonth() === props.monthDate.getMonth()) cnt++;
			inDate.setDate(inDate.getDate() + 1);
		}

		if (props.showWeekNumber && cnt > 0) {
			datesNLabels.push(
				<div
					className="_weekNumber"
					key={`weeknumber+${weekNumber}`}
					style={curry(
						'weekNumber',
						hovers.has(`weekNumber-${weekNumber}`)
							? new Set([`weekNumber`])
							: new Set(),
						new Set(),
					)}
					onMouseEnter={addToToggleSetCurry(
						hovers,
						setHovers,
						`weekNumber-${weekNumber}`,
					)}
					onMouseLeave={removeFromToggleSetCurry(
						hovers,
						setHovers,
						`weekNumber-${weekNumber}`,
					)}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="weekNumber"
					/>
					{'W' + weekNumber}
				</div>,
			);
			weekNumber++;
		}

		for (let i = 0; cnt > 0 && i < 7; i++) {
			const iterationDateString = iterationDate.toDateString();
			if (
				!props.showPreviousNextMonthDate &&
				iterationDate.getMonth() !== props.monthDate.getMonth()
			) {
				datesNLabels.push(
					<div
						className="_date _dateNotInMonth _dateEmpty"
						key={iterationDate.toDateString()}
						style={curry(
							'emptyDate',
							hovers.has(`emptyDate-${iterationDate.toDateString()}`)
								? new Set(['emptyDate'])
								: new Set(),
							new Set(),
						)}
						onMouseEnter={(
							(dtStr: string) => () =>
								setHovers(
									h =>
										new Set([
											...Array.from(h).filter(
												e => !e.startsWith('emptyDate-'),
											),
											`emptyDate-${dtStr}`,
										]),
								)
						)(iterationDateString)}
						onMouseLeave={(
							(dtStr: string) => () =>
								setHovers(
									h =>
										new Set([
											...Array.from(h).filter(
												e => !e.startsWith('emptyDate-'),
											),
										]),
								)
						)(iterationDateString)}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="emptyDate"
						/>
					</div>,
				);
			} else {
				const [disabled, className, subComponentName, style] = computeClassName({
					date: iterationDate,
					monthDate: props.monthDate,
					thisDates: dateThisDates,
					thatDate: dateThatDate,
					disabledDates,
					disabledDays,
					weekendDays,
					props,
					hovers,
					curry,
				});
				console.log(iterationDate.toDateString(), subComponentName, hovers);
				datesNLabels.push(
					<div
						className={className}
						style={style}
						onClick={!disabled ? onClickDate(iterationDate) : undefined}
						onMouseEnter={(
							(dtStr: string) => () =>
								setHovers(
									h =>
										new Set([
											...Array.from(h).filter(e => !e.startsWith('date-')),
											`date-${dtStr}`,
										]),
								)
						)(iterationDateString)}
						onMouseLeave={(
							(dtStr: string) => () =>
								setHovers(
									h =>
										new Set([
											...Array.from(h).filter(e => !e.startsWith('date-')),
										]),
								)
						)(iterationDateString)}
						key={iterationDate.toDateString()}
						role="button"
						tabIndex={0}
						onKeyDown={!disabled ? onClickDate(iterationDate) : undefined}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName={subComponentName}
						/>
						{iterationDate.getDate()}
					</div>,
				);
			}
			iterationDate.setDate(iterationDate.getDate() + 1);
		}
	}

	return (
		<div
			className={`_month ${props.showWeekNumber ? '_8cols' : '_7cols'} ${props.showMonthName ? '_withMonthName' : ''}`}
			key={props.monthDate.toDateString()}
			style={curry('month', hovers.has('month') ? new Set(['month']) : new Set(), new Set())}
			onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'month')}
			onMouseLeave={() => setHovers(new Set())}
		>
			{datesNLabels}
		</div>
	);
}

type DATE_SUBCOMPONENT_NAMES =
	| 'date'
	| 'prevNextMonthDate'
	| 'weekendLowLightDate'
	| 'todayDate'
	| 'selectedDate';

const SUBCOMPONENT_PREFRENCE: Record<DATE_SUBCOMPONENT_NAMES, number> = {
	date: 1,
	prevNextMonthDate: 2,
	weekendLowLightDate: 3,
	todayDate: 4,
	selectedDate: 6,
};

function computeClassName({
	date,
	monthDate,
	thisDates,
	thatDate,
	disabledDates,
	disabledDays,
	weekendDays,
	props,
	hovers,
	curry,
}: {
	date: Date;
	monthDate: Date;
	thisDates: Array<Date> | undefined;
	thatDate: Date | undefined;
	disabledDates: Date[];
	disabledDays: number[];
	weekendDays: number[];
	props: CalendarAllProps;
	hovers: Set<string>;
	curry: (style: string, hovers: Set<string>, disableds: Set<string>) => React.CSSProperties;
}): [boolean, string, DATE_SUBCOMPONENT_NAMES, React.CSSProperties] {
	let className = '_date';
	let subComponentName: DATE_SUBCOMPONENT_NAMES = 'date';
	if (date.getMonth() !== monthDate.getMonth()) {
		className += ' _dateNotInMonth';
		subComponentName = 'prevNextMonthDate';
	}

	let isSelected = false;

	if (props.isRangeType && thisDates?.length && thatDate) {
		let startDate = thisDates[0],
			endDate = thatDate;
		if (startDate > endDate) [startDate, endDate] = [endDate, startDate];

		if (date.toDateString() === startDate.toDateString()) {
			className += ' _dateStart';
			isSelected = true;
		}
		if (date.toDateString() === endDate.toDateString()) {
			className += ' _dateEnd';
			isSelected = true;
		} else if (date > startDate && date < endDate) {
			className += ' _dateInRange';
			isSelected = true;
		}
	}

	let disabled = false;
	if (props.minimumPossibleDate && date < props.minimumPossibleDate) {
		className += ' _dateDisabled';
		disabled = true;
	}
	if (props.maximumPossibleDate && date > props.maximumPossibleDate) {
		className += ' _dateDisabled';
		disabled = true;
	}

	if (disabledDates.some(disabledDate => disabledDate.toDateString() === date.toDateString())) {
		className += ' _dateDisabled';
		disabled = true;
	}

	if (disabledDays.some(e => e === date.getDay())) {
		className += ' _dateDisabled';
		disabled = true;
	}

	if (
		props.disableTemporalRanges?.some(e => e === 'disableToday') &&
		date.toDateString() === new Date().toDateString()
	) {
		className += ' _dateDisabled';
		disabled = true;
	}

	if (props.highlightToday && date.toDateString() === new Date().toDateString()) {
		className += ' _dateToday';
		if (SUBCOMPONENT_PREFRENCE.todayDate > SUBCOMPONENT_PREFRENCE[subComponentName]) {
			subComponentName = 'todayDate';
		}
	}

	if (weekendDays.some(e => e === date.getDay())) {
		if (props.disableTemporalRanges?.some(e => e === 'disableWeekend')) {
			className += ' _dateDisabled';
			disabled = true;
		}

		if (props.lowLightWeekEnd && weekendDays.some(e => e === date.getDay())) {
			className += ' _dateWeekend';
			if (
				SUBCOMPONENT_PREFRENCE.weekendLowLightDate >
				SUBCOMPONENT_PREFRENCE[subComponentName]
			) {
				subComponentName = 'weekendLowLightDate';
			}
		}
	}

	if (!disabled) className += ' _dateSelectable';

	if (isSelected || thisDates?.some(thisDate => thisDate.toDateString() === date.toDateString()))
		className += ' _dateSelected';

	if (
		isSelected &&
		SUBCOMPONENT_PREFRENCE.selectedDate > SUBCOMPONENT_PREFRENCE[subComponentName]
	) {
		subComponentName = 'selectedDate';
	}

	const style = curry(
		subComponentName,
		hovers.has(`date-${date.toDateString()}`) && !disabled
			? new Set([subComponentName])
			: new Set(),
		disabled ? new Set([subComponentName]) : new Set(),
	);

	return [disabled, className, subComponentName, style];
}
