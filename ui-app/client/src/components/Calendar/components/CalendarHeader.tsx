import React, { useMemo } from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import {
	addToToggleSetCurry,
	getStyleObjectCurry,
	removeFromToggleSetCurry,
} from './calendarFunctions';
import { CalendarAllProps } from './calendarTypes';

export interface CalendarHeaderProps extends CalendarAllProps {
	onMonthClick: () => void;
	onYearClick: () => void;
	onPreviousClick: () => void;
	onNextClick: () => void;
}

export function CalendarHeaderForBrowsing(
	props: CalendarHeaderProps & { from: number; to: number | undefined },
) {
	let content;
	if (props.to === undefined) {
		content = <CalendarYearTitle {...props} year={props.from} onClick={props.onYearClick} />;
	} else {
		content = (
			<>
				<CalendarYearTitle {...props} year={props.from} onClick={props.onYearClick} />
				-
				<CalendarYearTitle {...props} year={props.to} onClick={props.onYearClick} />
			</>
		);
	}
	return <CalendarHeader {...props}>{content}</CalendarHeader>;
}

export function CalendarHeaderForMonth(props: CalendarHeaderProps) {
	return (
		<CalendarHeader {...props}>
			<CalendarTitle {...props} />
		</CalendarHeader>
	);
}

export function CalendarHeader(props: CalendarHeaderProps & { children: React.ReactNode }) {
	const {
		styles,
		hoverStyles,
		disabledStyles,
		definition,
		leftArrowImage,
		rightArrowImage,
		arrowButtonsHorizontalPlacement,
	} = props;

	const [hovers, setHovers] = React.useState<Set<string>>(() => new Set());
	const [disableds, setDisableds] = React.useState<Set<string>>(() => new Set());

	const getStyleObject = useMemo(
		() => getStyleObjectCurry(styles, hoverStyles, disabledStyles),
		[styles, hoverStyles, disabledStyles],
	);

	const header = [
		<div
			key="leftArrow"
			className={`_leftArrow`}
			style={getStyleObject('leftArrow', hovers, disableds)}
			onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'leftArrow')}
			onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'leftArrow')}
			onClick={props.onPreviousClick}
		>
			<SubHelperComponent definition={definition} subComponentName="leftArrow" zIndex={7} />
			{leftArrowImage ? <img src={leftArrowImage} /> : <ArrowRight rotate={180} />}
		</div>,
		<div
			key="rightArrow"
			className={`_rightArrow`}
			style={getStyleObject('rightArrow', hovers, disableds)}
			onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'rightArrow')}
			onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'rightArrow')}
			onClick={props.onNextClick}
		>
			<SubHelperComponent definition={definition} subComponentName="rightArrow" zIndex={7} />
			{rightArrowImage ? <img src={rightArrowImage} /> : <ArrowRight rotate={0} />}
		</div>,
	];

	let position = 2;
	if (arrowButtonsHorizontalPlacement === '_right') position = 0;
	else if (arrowButtonsHorizontalPlacement === '_either') position = 1;
	header.splice(
		position,
		0,
		<div
			key="title"
			className="_calendarHeaderTitle"
			style={getStyleObject('calendarHeaderTitle', hovers, disableds)}
			onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'calendarHeaderTitle')}
			onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'calendarHeaderTitle')}
		>
			{props.children}
		</div>,
	);

	return (
		<div
			className="_calendarHeader"
			style={getStyleObject('calendarHeader', hovers, disableds)}
			onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'calendarHeader')}
			onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'calendarHeader')}
		>
			<SubHelperComponent definition={definition} subComponentName="calendarHeader" />
			{header}
		</div>
	);
}

function CalendarTitle(
	props: CalendarAllProps & { onMonthClick: () => void; onYearClick: () => void },
) {
	if (props.calendarFormat === 'showCurrentYear') {
		return (
			<CalendarYearTitle
				{...props}
				year={props.currentDate.getFullYear()}
				onClick={props.onYearClick}
			/>
		);
	} else if (props.calendarFormat === 'showCurrentMonth') {
		return (
			<>
				<CalendarMonthTitle
					{...props}
					month={props.currentDate.toLocaleDateString(props.language, {
						month: props.monthLabels,
					})}
					onClick={props.onMonthClick}
				/>
				<CalendarYearTitle
					{...props}
					year={props.currentDate.getFullYear()}
					onClick={props.onYearClick}
				/>
			</>
		);
	}

	let fromDate, toDate;

	if (props.calendarFormat === 'showCurrentMonthAndNext') {
		fromDate = props.currentDate;
		toDate = new Date(fromDate);
		toDate.setMonth(fromDate.getMonth() + 1);
	} else if (props.calendarFormat === 'showCurrentMonthAndPrevious') {
		fromDate = new Date(props.currentDate);
		fromDate.setMonth(fromDate.getMonth() - 1);
		toDate = props.currentDate;
	} else if (props.calendarFormat === 'showPreviousCurrentAndNextMonth') {
		fromDate = new Date(props.currentDate);
		fromDate.setMonth(fromDate.getMonth() - 1);
		toDate = new Date(props.currentDate);
		toDate.setMonth(toDate.getMonth() + 1);
	} else if (props.calendarFormat === 'showCurrentAndPreviousTwoMonths') {
		fromDate = new Date(props.currentDate);
		fromDate.setMonth(fromDate.getMonth() - 2);
		toDate = props.currentDate;
	} else if (props.calendarFormat === 'showCurrentAndNextTwoMonths') {
		fromDate = props.currentDate;
		toDate = new Date(props.currentDate);
		toDate.setMonth(toDate.getMonth() + 2);
	} else if (props.calendarFormat === 'showFourMonths') {
		fromDate = new Date(props.currentDate);
		fromDate.setMonth(fromDate.getMonth() - 2);
		toDate = new Date(props.currentDate);
		toDate.setMonth(toDate.getMonth() + 1);
	} else if (props.calendarFormat === 'showSixMonths') {
		fromDate = new Date(props.currentDate);
		fromDate.setMonth(fromDate.getMonth() - 2);
		toDate = new Date(props.currentDate);
		toDate.setMonth(toDate.getMonth() + 3);
	} else if (props.calendarFormat === 'showTwelveMonths') {
		fromDate = new Date(props.currentDate);
		fromDate.setMonth(fromDate.getMonth() - 5);
		toDate = new Date(props.currentDate);
		toDate.setMonth(toDate.getMonth() + 6);
	} else {
		throw new Error('Invalid calendar format');
	}

	return (
		<>
			<CalendarMonthTitle
				{...props}
				month={fromDate.toLocaleDateString(props.language, {
					month: props.monthLabels,
				})}
				onClick={props.onMonthClick}
			/>
			<CalendarYearTitle
				{...props}
				year={fromDate.getFullYear()}
				onClick={props.onYearClick}
			/>
			-
			<CalendarMonthTitle
				{...props}
				month={toDate.toLocaleDateString(props.language, {
					month: props.monthLabels,
				})}
				onClick={props.onMonthClick}
			/>
			<CalendarYearTitle {...props} year={toDate.getFullYear()} onClick={props.onYearClick} />
		</>
	);
}

export function CalendarYearTitle(props: CalendarAllProps & { year: number; onClick: () => void }) {
	const [hover, setHover] = React.useState<boolean>(false);

	const yearStyles = getStyleObjectCurry(props.styles, props.hoverStyles, props.disabledStyles)(
		'yearNumber',
		hover ? new Set(['yearNumber']) : new Set(),
		new Set(),
	);

	return (
		<div
			className="_yearNumber"
			style={yearStyles}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onClick={props.onClick}
		>
			<SubHelperComponent definition={props.definition} subComponentName="yearNumber" />
			{props.year}
		</div>
	);
}

export function CalendarMonthTitle(
	props: CalendarAllProps & { month: string; onClick?: () => void },
) {
	const [hover, setHover] = React.useState<boolean>(false);

	const monthStyles = getStyleObjectCurry(props.styles, props.hoverStyles, props.disabledStyles)(
		'monthName',
		hover ? new Set(['monthName']) : new Set(),
		new Set(),
	);

	return (
		<div
			className="_monthName"
			style={monthStyles}
			onMouseEnter={() => setHover(true)}
			onMouseLeave={() => setHover(false)}
			onClick={props.onClick}
		>
			<SubHelperComponent definition={props.definition} subComponentName="monthName" />
			{props.month}
		</div>
	);
}

function ArrowRight({ rotate }: Readonly<{ rotate: number }>) {
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="17"
			height="17"
			viewBox="-4 0 17 17"
			style={{ transform: `rotate(${rotate}deg)` }}
		>
			<path
				id="Path_291"
				data-name="Path 291"
				d="M27.634,20.143a1.191,1.191,0,0,1,0,1.718l-7.5,7.283a1.278,1.278,0,0,1-1.769,0,1.191,1.191,0,0,1,0-1.718L24.982,21,18.37,14.574a1.191,1.191,0,0,1,0-1.718,1.278,1.278,0,0,1,1.769,0l7.5,7.283Z"
				transform="translate(-18 -12.5)"
			/>
		</svg>
	);
}
