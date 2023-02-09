import React, { Fragment, useEffect, useRef, useState } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	getDataFromLocation,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getTranslations } from '../util/getTranslations';
import { Component } from '../../types/common';
import useDefinition from '../util/useDefinition';
import { isNullValue } from '@fincity/kirun-js';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import CalendarStyle from './CalendarStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './calendarProperties';
import { dateProcessor } from '../util/dateProcessor';
import UUID from '../util/uuid';

const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
const monthLabels = [
	'January',
	'February',
	'March',
	'April',
	'May',
	'June',
	'July',
	'August',
	'September',
	'October',
	'November',
	'December',
];
const monthRange = [
	['January', 'February', 'March'],
	['April', 'May', 'June'],
	['July', 'August', 'September'],
	['October', 'November', 'December'],
];

const toTimeMap: { [key: string]: string } = {
	TOAMPM: 'toAmPm',
	TOHRS: 'toHrs',
	TOMINS: 'toMinutes',
};

const fromTimeMap: { [key: string]: string } = {
	AMPM: 'fromAmPm',
	HRS: 'fromHrs',
	MINS: 'fromMinutes',
};

const getDropdownData = (range: number) => {
	return Array.from(new Array(range), (x, i) => i + 1 + '');
};

type DateDetails = {
	fromAmPm?: string;
	toAmPm?: string;
	fromMinutes?: string;
	fromHrs?: string;
	toMinutes?: string;
	toHrs?: string;
	from?: string;
	to?: string;
	currentMonth?: number;
	currentYear?: number;
	nextMonth?: number;
	nextYear?: number;
};
function Calendar(props: ComponentProps) {
	const [value, setvalue] = useState<{ to?: string; from: string }>();
	const [selectedDateDetails, setSelectedDateDetails] = React.useState<DateDetails>({});
	const [timeDisplay, setTimeDisplay] = React.useState<
		'AMPM' | 'HRS' | 'MINS' | '' | 'TOAMPM' | 'TOHRS' | 'TOMINS'
	>();
	const [displayMode, setDisplayMode] = useState<'DATE' | 'MONTH' | 'YEAR'>();
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [currentMainDate, setCurrentMainDate] = useState(
		dateProcessor(new Date())?.add('months', 1),
	);

	const {
		definition: { bindingPath },
		definition,
		pageDefinition: { translations },
		locationHistory,
		context,
	} = props;

	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);

	const {
		properties: {
			defaultValue,
			readOnly,
			dateFormat,
			dateOnly,
			timeOnly,
			minDate,
			maxDate,
			yearAndMonthSelector,
			isDateRange,
			is24hour,
			calendarIcon,
			calendarDateRangeIcon,
			closeOnMouseLeave,
		} = {},
		stylePropertiesWithPseudoStates,
		key,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const computedStyles = processComponentStylePseudoClasses(
		{ isCalendarOpen, readOnly },
		stylePropertiesWithPseudoStates,
	);

	if (!bindingPath) throw new Error('Definition requires bindingpath');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	useEffect(() => {
		if (isNullValue(value)) return;
		let toHrs = value?.to ? new Date(value.to)?.getHours() : 0;
		let fromHrs = value?.from ? new Date(value.from)?.getHours() : 0;
		toHrs = !is24hour && toHrs > 12 ? toHrs - 12 : toHrs === 0 && !is24hour ? 12 : toHrs;
		fromHrs =
			!is24hour && fromHrs > 12 ? fromHrs - 12 : fromHrs === 0 && !is24hour ? 12 : fromHrs;
		const obj = {
			to: value?.to ?? '',
			from: value?.from ?? '',
			toHrs: toHrs + '',
			toMinutes: value?.to ? new Date(value.to)?.getMinutes() + '' : '',
			fromHrs: fromHrs + '',
			fromMinutes: value?.from ? new Date(value.from)?.getMinutes() + '' : '',
			toAmPm: is24hour
				? ''
				: value?.to
				? new Date(value.to)?.getHours() > 12
					? 'PM'
					: 'AM'
				: '',
			fromAmPm: is24hour
				? ''
				: value?.from
				? new Date(value.from)?.getHours() > 12
					? 'PM'
					: 'AM'
				: '',
			currentMonth: selectedDateDetails?.currentMonth
				? selectedDateDetails?.currentMonth
				: new Date(selectedDateDetails?.from ?? value?.from ?? 0).getMonth(),
			currentYear: selectedDateDetails?.currentYear
				? selectedDateDetails?.currentYear
				: new Date(selectedDateDetails?.from ?? value?.from ?? 0).getFullYear(),
			nextMonth: selectedDateDetails?.nextMonth
				? selectedDateDetails?.nextMonth
				: new Date(selectedDateDetails?.from ?? value?.from ?? 0).getMonth() + 1,
			nextYear: selectedDateDetails?.nextMonth
				? selectedDateDetails?.nextYear
				: dateProcessor(new Date(selectedDateDetails?.from ?? value?.from ?? 0))
						.add('months', 1)
						.getFullYear(),
		};
		setSelectedDateDetails(obj);
	}, [value]);

	useEffect(
		() =>
			addListenerAndCallImmediately(
				(_, value) => {
					if (isNullValue(value)) {
						!isNullValue(defaultValue)
							? setvalue(defaultValue)
							: setvalue({
									from: dateProcessor(new Date()).format(dateFormat),
									...{
										to: isDateRange
											? dateProcessor(new Date()).format(dateFormat)
											: null,
									},
							  });
						return;
					}
				},
				pageExtractor,
				bindingPathPath,
			),
		[],
	);

	const handleBubbling = (event: any) => {
		event.stopPropagation();
	};

	const handleTimeClose = () => {
		setTimeDisplay('');
	};

	const clearTemporarySelections = () => {
		setSelectedDateDetails({
			from: '',
			to: '',
			fromAmPm: '',
			fromHrs: '',
			fromMinutes: '',
			toAmPm: '',
			toHrs: '',
			toMinutes: '',
		});
	};

	const handleCloseCalendar = () => {
		clearTemporarySelections();
		setIsCalendarOpen(false);
		handleTimeClose();
	};

	useEffect(() => {
		console.log('picard', selectedDateDetails);
	}, [selectedDateDetails]);

	useEffect(() => {
		if (isCalendarOpen) {
			document.addEventListener('click', handleCloseCalendar);
		}
		return () => document.removeEventListener('click', handleCloseCalendar);
	}, [isCalendarOpen]);

	const handleTimeChange = (
		time: string,
		selector: 'AMPM' | 'HRS' | 'MINS' | '' | 'TOAMPM' | 'TOHRS' | 'TOMINS',
		isTo: boolean,
	) => {
		let x = {};

		switch (selector) {
			case 'AMPM' || 'TOAMPM':
				x = isTo ? { toAmPm: time } : { fromAmPm: time };
				break;
			case 'HRS' || 'TOHRS':
				x = isTo ? { toHrs: time } : { fromHrs: time };
				break;
			case 'MINS' || 'TOMINS':
				x = isTo ? { toMinutes: time } : { fromMinutes: time };
				break;
		}

		const obj = { ...selectedDateDetails, ...x };
		setSelectedDateDetails(obj);
	};

	const handleDateChange = (day: string) => {
		//clearing if date range is already selected
		if (isDateRange && selectedDateDetails?.from && selectedDateDetails?.to) {
			setSelectedDateDetails({ ...selectedDateDetails, from: '', to: '' });
		}
		// Adding as startdate or enddate if startdate already exists
		selectedDateDetails?.from
			? isDateRange
				? //if date range and from already exists add as to
				  setSelectedDateDetails({
						...selectedDateDetails,
						to: dateProcessor(day)?.format(dateFormat),
				  })
				: //if date range and from does not exists add as from
				  setSelectedDateDetails({
						...selectedDateDetails,
						from: dateProcessor(day)?.format(dateFormat),
				  })
			: //if not date range and from already exists add as from
			  setSelectedDateDetails({
					...selectedDateDetails,
					from: dateProcessor(day)?.format(dateFormat),
			  });
	};

	const handleConfirm = () => {
		const { from, fromAmPm, fromHrs, fromMinutes, to, toAmPm, toHrs, toMinutes } =
			selectedDateDetails!;
		const tempFrom = new Date(from ?? '').setHours(
			is24hour
				? Number(fromHrs ?? 0)
				: fromAmPm === 'PM'
				? Number(fromHrs ?? 0 + 12)
				: Number(fromHrs ?? 0),
			Number(fromMinutes ?? 0),
		);
		const tempTo = new Date(to ?? '').setHours(
			is24hour
				? Number(toHrs ?? 0)
				: toAmPm === 'PM'
				? Number(toHrs ?? 0 + 12)
				: Number(toHrs ?? 0),
			Number(toMinutes ?? 0),
		);

		setData(
			bindingPathPath,
			isDateRange
				? {
						from: dateProcessor(tempFrom).format(dateFormat),
						to: dateProcessor(tempTo).format(dateFormat),
				  }
				: { from: dateProcessor(tempFrom).format(dateFormat) },
			context.pageName,
		);
		handleCloseCalendar();
	};

	const handleYearSelect = (year: number) => {
		const { from } = selectedDateDetails!;
		setSelectedDateDetails({
			...selectedDateDetails,
			from: dateProcessor(new Date(from ?? '').setFullYear(year)).format(dateFormat),
		});
		setDisplayMode('DATE');
	};
	const handleMonthSelect = (month: number) => {
		const { from } = selectedDateDetails!;
		setSelectedDateDetails({
			...selectedDateDetails,
			from: dateProcessor(new Date(from ?? '').setMonth(month)).format(dateFormat),
		});
		setDisplayMode('DATE');
	};

	const bottomButton = () => {
		return (
			<div className="bottomButtons">
				<button className="buttonCancel" onClick={handleCloseCalendar}>
					CANCEL
				</button>
				<button className="buttonConfirm" onClick={handleConfirm}>
					OK
				</button>
			</div>
		);
	};

	const getLabel = (e: string): 'AMPM' | 'HRS' | 'MINS' | '' | 'TOAMPM' | 'TOHRS' | 'TOMINS' => {
		if (e === 'AMPM') return 'AMPM';
		if (e === 'MINS') return 'MINS';
		if (e === 'HRS') return 'HRS';
		if (e === 'TOAMPM') return 'TOAMPM';
		if (e === 'TOMINS') return 'TOMINS';
		if (e === 'TOHRS') return 'TOHRS';
		return '';
	};

	const getTimeSelectors = (isTo: boolean) => (
		<div className="timePicker">
			{(isTo ? ['TOAMPM', 'TOHRS', 'TOMINS'] : ['HRS', 'MINS', 'AMPM'])
				.filter(e => (is24hour ? e !== 'AMPM' && e !== 'TOAMPM' : e))
				.map((e: string) => (
					<div
						className={`container ${timeDisplay === e && !readOnly ? 'focussed' : ''} ${
							readOnly ? 'disabled' : ''
						}`}
						key={e}
					>
						<div className="labelContainer" onClick={() => setTimeDisplay(getLabel(e))}>
							<label className="label">
								{isTo
									? selectedDateDetails[toTimeMap[e] as keyof DateDetails]
									: selectedDateDetails[fromTimeMap[e] as keyof DateDetails]}
							</label>
							<i className="fa-solid fa-angle-down" />
						</div>
						{timeDisplay === e ? (
							<div
								className="dropdowncontainer"
								onMouseLeave={closeOnMouseLeave ? () => handleTimeClose : undefined}
							>
								{(e === 'HRS' || e === 'TOHRS'
									? is24hour
										? ['0', ...getDropdownData(23)]
										: getDropdownData(12)
									: e === 'MINS' || e === 'TOMINS'
									? getDropdownData(60)
									: ['AM', 'PM']
								).map(time => (
									<div
										key={time}
										className="dropdownItem"
										onClick={() => handleTimeChange(time, e, isTo)}
									>
										{time}
									</div>
								))}
							</div>
						) : null}
					</div>
				))}
		</div>
	);

	const generateWeeks = (
		month: number,
		year: number,
	): Array<
		Array<{
			date: Date;
			isSelected: boolean;
			isInBetween: boolean;
			isFrom: boolean;
			isOutOfRange: boolean;
		}>
	> => {
		const { from, to } = selectedDateDetails!;
		const dateObjs = {
			from: new Date(from!),
			to: new Date(to!),
			maxDate: new Date(maxDate),
			minDate: new Date(minDate),
		};
		const fromString = `${dateObjs.from.getDate()}-${dateObjs.from.getMonth()}-${dateObjs.from.getFullYear()}`;
		const toString = `${dateObjs.to.getDate()}-${dateObjs.to.getMonth()}-${dateObjs.to.getFullYear()}`;
		const calendarRows = [];
		let loopDay = new Date(year, month, 1);
		let lastDay = new Date(year, month + 1, 0);
		let loopWeek = [];
		while (loopDay <= lastDay) {
			let obj = {
				date: loopDay,
				isSelected: false,
				isInBetween: false,
				isFrom: false,
				isOutOfRange: false,
			};
			if (loopDay.getDate() === 1 || loopDay.getDay() === 0) loopWeek = Array(7).fill(null);
			if (
				(month === dateObjs.from?.getMonth() && year === dateObjs.from?.getFullYear()) ||
				(month === dateObjs.to?.getMonth() && year === dateObjs.to?.getFullYear())
			) {
				if (
					fromString === `${loopDay.getDate()}-${month}-${year}` ||
					toString === `${loopDay.getDate()}-${month}-${year}`
				) {
					obj.isSelected = true;
					obj.isFrom =
						fromString === `${loopDay.getDate()}-${month}-${year}` ? true : false;
				}
			}

			if (dateObjs.from < loopDay && loopDay < dateObjs.to) {
				obj.isInBetween = true;
			}

			if (loopDay > new Date(minDate) && loopDay < new Date(maxDate)) {
				obj.isOutOfRange = true;
			}

			loopWeek[loopDay.getDay()] = obj;
			if (loopDay.getDay() === 6 || loopDay.getDate() === lastDay.getDate()) {
				calendarRows.push(loopWeek);
			}
			loopDay = new Date(year, month, loopDay.getDate() + 1);
		}
		return calendarRows;
	};

	const handlePrevClick = () => {
		const { currentMonth, currentYear, nextMonth, nextYear } = selectedDateDetails!;
		const obj = {
			...selectedDateDetails,
			currentMonth: currentMonth! - 1 == -1 ? 11 : currentMonth! - 1,
			currentYear: currentMonth! - 1 == -1 ? currentYear! - 1 : currentYear,
			nextMonth: nextMonth! - 1 == -1 ? 11 : nextMonth! - 1,
			nextYear: nextMonth! - 1 == -1 ? nextYear! - 1 : nextYear,
		};
		setSelectedDateDetails(obj);
	};

	const handleNextClick = () => {
		const { currentMonth, currentYear, nextMonth, nextYear } = selectedDateDetails!;
		const obj = {
			...selectedDateDetails,
			currentMonth: currentMonth! == 11 ? 0 : currentMonth! + 1,
			currentYear: currentMonth! == 11 ? currentYear! + 1 : currentYear,
			nextMonth: nextMonth! == 11 ? 0 : nextMonth! + 1,
			nextYear: nextMonth == 11 ? nextYear! + 1 : nextYear,
		};
		setSelectedDateDetails(obj);
	};

	const generateMonth = (month: number, year: number, isFirstMonth: boolean) => {
		const prev = <span onClick={handlePrevClick} className="fa fa-arrow-left iconLeft"></span>;
		const next = (
			<span onClick={handleNextClick} className="fa fa-arrow-right iconRight"></span>
		);
		const header = (
			<div className="calendarHeader">
				{!isDateRange ? (
					<>
						{prev} {next}
					</>
				) : isFirstMonth ? (
					prev
				) : (
					next
				)}
				<div className="currentDate">
					<span
						className="currentDateText"
						onClick={
							!isDateRange
								? () => setDisplayMode(displayMode === 'DATE' ? 'MONTH' : 'DATE')
								: undefined
						}
					>
						{monthLabels[month]}
					</span>
					<span
						className="currentDateText"
						onClick={
							!isDateRange
								? () => setDisplayMode(displayMode === 'YEAR' ? 'DATE' : 'YEAR')
								: undefined
						}
					>
						{year}
					</span>
				</div>
			</div>
		);

		const datesByWeeks = (
			<div>
				{header}
				<table className="calendarMainData">
					<thead>
						<tr className="calendarRow">
							{daysOfWeek.map(e => (
								<th className="calendarCol" key={e}>
									{e}
								</th>
							))}
						</tr>
					</thead>
					<tbody>
						{generateWeeks(month, year).map(weeks => (
							<tr className="calendarRow" key={`${UUID()}-${month}-${year}`}>
								{weeks.map(date => (
									<td
										className={`calendarCol ${
											date?.isSelected
												? isDateRange
													? date?.isFrom
														? 'selectedDayStart'
														: 'selectedDayEnd'
													: 'selectedDay'
												: ''
										} ${date?.isInBetween ? 'selectedDays' : ''} ${
											date?.isOutOfRange ? 'notAllowed' : ''
										} ${!date?.date ? 'notVisible' : ''}`}
										key={`${date?.date?.getDate() ?? UUID()}-${month}-${year}`}
									>
										{date?.date?.getDate()}
									</td>
								))}
							</tr>
						))}
					</tbody>
				</table>
				{getTimeSelectors(!isFirstMonth)}
			</div>
		);

		return datesByWeeks;
	};

	const renderCalendar = () => {
		const { currentMonth, currentYear, nextMonth, nextYear } = selectedDateDetails || {};
		const startYear = 1970;
		const endYear = 2099;
		const yearsRange = Array.from(
			{ length: Math.ceil((endYear - startYear + 1) / 5) },
			(_, i) => {
				const innerArrayStart = startYear + i * 5;
				const innerArrayEnd = Math.min(innerArrayStart + 4, endYear);
				return Array.from(
					{ length: innerArrayEnd - innerArrayStart + 1 },
					(_, j) => innerArrayStart + j,
				);
			},
		);

		return (
			<div className={`calendarPopupDiv ${isDateRange ? 'range' : ''}`}>
				<div className={isDateRange ? 'caldendarMainCardWrapper' : ''}>
					{generateMonth(currentMonth!, currentYear!, true)}
					{isDateRange ? generateMonth(nextMonth!, nextYear!, false) : null}
				</div>
			</div>
		);
	};

	return (
		<div
			className="comp compCalendar"
			style={computedStyles?.comp ?? {}}
			onClick={handleBubbling}
		>
			<HelperComponent definition={definition} />
			{renderCalendar()}
		</div>
	);
}

const component: Component = {
	name: 'Calendar',
	displayName: 'Calendar',
	description: 'Calendar component',
	component: Calendar,
	styleComponent: CalendarStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['focus', 'hover', 'disabled'],
};

export default component;
