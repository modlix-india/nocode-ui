import React from 'react';
import { CalendarValidationProps, getValidDate, toFormat } from './calendarFunctions';

interface CalendarMapProps {
	date: string | number | undefined;
	endDate: string | number | undefined;
	isRangeType: boolean;
	dateType: string;
	componentDesignType: string;
	calendarDesignType: string;
	arrowButtonsHorizontalPlacement: string;
	calendarFormat: string;
	showWeekNumber: boolean;
	highlightToday: boolean;
	weekStartsOn: number;
	lowLightWeekEnds: boolean;
	showPreviousNextMonthDate: boolean;
	timeDesignType: string;
	browsingMonthYear: string;
	onBrowsingMonthYearChange: (value: string) => void;
	onChange: (value: string) => void;
}

export function CalendarMap({
	arrowButtonsHorizontalPlacement,
	browsingMonthYear,
	date,
	displayDateFormat,
	storageFormat,
	onBrowsingMonthYearChange,
	onChange,
}: CalendarMapProps & CalendarValidationProps) {
	let currentDate = new Date();
	if (browsingMonthYear) {
		const [month, year] = browsingMonthYear.split('-').map(e => parseInt(e, 10));
		currentDate.setMonth(month);
		currentDate.setFullYear(year);
	} else if (date) {
		currentDate = getValidDate(date, storageFormat ?? displayDateFormat) ?? new Date();
	}

	const selectedDate = getValidDate(date, storageFormat ?? displayDateFormat);

	const numbers = [];
	const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
	const lastDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();

	function selectDate(dateCounter: number) {
		return () => {
			const selectedDate = new Date(
				currentDate.getFullYear(),
				currentDate.getMonth(),
				dateCounter,
			);
			onChange(toFormat(selectedDate, 'Date', storageFormat ?? displayDateFormat));
		};
	}

	let dateCounter = 1;

	for (let i = 0; i < 6; i++) {
		for (let j = 0; j < 7; j++) {
			if (i === 0 && j < firstDay) {
				numbers.push(<div key={`${currentDate.getMonth()}-${i}-${j}`} />);
			} else if (dateCounter > lastDate) {
				numbers.push(<div key={`${currentDate.getMonth()}-${i}-${j}`} />);
			} else {
				numbers.push(
					<div
						className={`_date ${
							currentDate.getDate() === dateCounter &&
							currentDate.getMonth() === new Date().getMonth() &&
							currentDate.getFullYear() === new Date().getFullYear()
								? '_today'
								: ''
						} ${
							dateCounter == selectedDate?.getDate() &&
							currentDate.getMonth() === selectedDate?.getMonth() &&
							currentDate.getFullYear() === selectedDate?.getFullYear()
								? '_selected'
								: ''
						}`}
						key={`${currentDate.getMonth()}-${i}-${j}`}
						onClick={selectDate(dateCounter)}
					>
						{dateCounter}
					</div>,
				);
				dateCounter++;
			}
		}
	}

	return (
		<>
			<div className="_calenderHeader">
				<ArrowRight
					rotate={180}
					onClick={() => {
						currentDate.setMonth(currentDate.getMonth() - 1);
						onBrowsingMonthYearChange(
							`${currentDate.getMonth()}-${currentDate.getFullYear()}`,
						);
					}}
				/>
				<div className="_monthYear">
					{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
				</div>
				<ArrowRight
					rotate={0}
					onClick={() => {
						currentDate.setMonth(currentDate.getMonth() + 1);
						onBrowsingMonthYearChange(
							`${currentDate.getMonth()}-${currentDate.getFullYear()}`,
						);
					}}
				/>
			</div>
			<div className="_calenderBody">
				<div className="_calendarBodyContainer">
					<div>Sun</div>
					<div>Mon</div>
					<div>Tue</div>
					<div>Wed</div>
					<div>Thu</div>
					<div>Fri</div>
					<div>Sat</div>
					{numbers}
				</div>
			</div>
		</>
	);
}

function ArrowRight({ rotate, onClick }: { rotate: number; onClick: () => void }) {
	return (
		<svg
			width="30"
			height="32"
			viewBox="0 0 44 45"
			fill="none"
			style={{ transform: `rotate(${rotate}deg)` }}
			xmlns="http://www.w3.org/2000/svg"
			onClick={e => {
				e.stopPropagation();
				e.preventDefault();
				onClick();
			}}
		>
			<g filter="url(#filter0_d_0_589)">
				<circle cx="22" cy="20.5" r="20" fill="white" />
				<circle cx="22" cy="20.5" r="19.5" stroke="black" stroke-opacity="0.05" />
			</g>
			<path
				d="M27.6339 20.1427C28.122 20.6169 28.122 21.3869 27.6339 21.8611L20.1353 29.1444C19.6471 29.6185 18.8543 29.6185 18.3661 29.1444C17.878 28.6702 17.878 27.9001 18.3661 27.426L24.982 21L18.37 14.574C17.8819 14.0999 17.8819 13.3298 18.37 12.8556C18.8582 12.3815 19.651 12.3815 20.1392 12.8556L27.6378 20.1389L27.6339 20.1427Z"
				fill="#333333"
				fill-opacity="0.8"
			/>
			<defs>
				<filter
					id="filter0_d_0_589"
					x="0"
					y="0.5"
					width="44"
					height="44"
					filterUnits="userSpaceOnUse"
					color-interpolation-filters="sRGB"
				>
					<feFlood flood-opacity="0" result="BackgroundImageFix" />
					<feColorMatrix
						in="SourceAlpha"
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
						result="hardAlpha"
					/>
					<feOffset dy="2" />
					<feGaussianBlur stdDeviation="1" />
					<feComposite in2="hardAlpha" operator="out" />
					<feColorMatrix
						type="matrix"
						values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"
					/>
					<feBlend
						mode="normal"
						in2="BackgroundImageFix"
						result="effect1_dropShadow_0_589"
					/>
					<feBlend
						mode="normal"
						in="SourceGraphic"
						in2="effect1_dropShadow_0_589"
						result="shape"
					/>
				</filter>
			</defs>
		</svg>
	);
}
