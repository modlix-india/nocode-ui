import React, { useMemo } from 'react';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import {
	addToToggleSetCurry,
	getStyleObjectCurry,
	removeFromToggleSetCurry,
} from './calendarFunctions';
import { CalendarAllProps } from './calendarTypes';

export function CalendarHeader(props: CalendarAllProps) {
	const {
		currentDate,
		styles,
		hoverStyles,
		disabledStyles,
		definition,
		leftArrowImage,
		rightArrowImage,
		arrowButtonsHorizontalPlacement,
		calendarFormat,
		monthLabels,
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
			style={getStyleObject('leftArrow', hovers, disableds) ?? {}}
			onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'leftArrow')}
			onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'leftArrow')}
		>
			<SubHelperComponent definition={definition} subComponentName="leftArrow" zIndex={7} />
			{leftArrowImage ? <img src={leftArrowImage} /> : <ArrowRight rotate={180} />}
		</div>,
		<div
			key="rightArrow"
			className={`_rightArrow`}
			style={getStyleObject('rightArrow', hovers, disableds) ?? {}}
			onMouseEnter={addToToggleSetCurry(hovers, setHovers, 'rightArrow')}
			onMouseLeave={removeFromToggleSetCurry(hovers, setHovers, 'rightArrow')}
		>
			<SubHelperComponent definition={definition} subComponentName="rightArrow" zIndex={7} />
			{rightArrowImage ? <img src={rightArrowImage} /> : <ArrowRight rotate={0} />}
		</div>,
	];

	let position = 0;
	if (arrowButtonsHorizontalPlacement === '_right') position = 2;
	else if (arrowButtonsHorizontalPlacement === '_either') position = 1;
	header.splice(position, 0, <CalendarTitle key="title" {...props} />);

	return (
		<div
			className="_calendarHeader"
			style={getStyleObject('calendarHeader', hovers, disableds) ?? {}}
		>
			{header}
			<SubHelperComponent definition={definition} subComponentName="calendarHeader" />
		</div>
	);
}

function CalendarTitle(props: CalendarAllProps) {
	return <></>;
}

function ArrowRight({ rotate }: { rotate: number }) {
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
