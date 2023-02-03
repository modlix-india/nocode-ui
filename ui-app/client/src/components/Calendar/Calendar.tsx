import React, { Fragment, useEffect, useRef, useState } from "react";
import {
	addListener,
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
import CalendarStyle from "./CalendarStyle";
import { propertiesDefinition, stylePropertiesDefinition } from "./calendarProperties";
import { dateProcessor } from "../util/dateProcessor";

function Calendar(props: ComponentProps) {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [currentDate, setCurrentDate] = useState(new Date());
    const [currentMainDate, setCurrentMainDate] = useState(dateProcessor(new Date())?.add("months", 1));
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
    const [selectedHour, setSelectedHour] = useState('');
    const [selectedMinute, setSelectedMinute] = useState('');
    const [ampmSelected, setAmpmSelected] = useState("AM");
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedHourRange, setSelectedHourRange] = useState('');
    const [selectedMinuteRange, setSelectedMinuteRange] = useState('');
    const [ampmSelectedRange, setAmpmSelectedRange] = useState("AM");
    const [showDropdown, setShowDropdown] = useState('');
    const [showDropdownRange, setShowDropdownRange] = useState('');
    const [showYears, setShowYears] = useState(false);

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
            readOnlyTime,
            closeOnMouseLeave
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

    const [value, setvalue] = useState<any>('');
    if (!bindingPath) throw new Error('Definition requires bindingpath');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
    useEffect(() => {
		const initValue = getDataFromLocation(bindingPath, locationHistory, pageExtractor);
		if (!isNullValue(defaultValue) && isNullValue(initValue)) {
			setData(bindingPathPath, defaultValue, context.pageName);
		}
		setvalue(initValue ?? defaultValue ?? '');
        if(isDateRange) {
            setStartDate(initValue?.from ?? defaultValue?.from ?? new Date());
            let curr = initValue ? new Date(dateProcessor(initValue?.from)?.format(dateFormat)) : defaultValue ? new Date(dateProcessor(defaultValue?.from)?.format(dateFormat)) : new Date();
            let currNext = initValue ? new Date(dateProcessor(initValue?.to)?.format(dateFormat)) : defaultValue ? new Date(dateProcessor(defaultValue?.to)?.format(dateFormat)) : new Date();
            setCurrentDate(curr);
            setCurrentMainDate(currNext.getDate() - curr.getDate() > 30 ? currNext : dateProcessor(curr)?.add("months", 1));
            setEndDate(initValue?.to ?? defaultValue?.to ?? new Date());
            let hours = initValue ? initValue?.from?.getHours() : defaultValue ? (is24hour ? new Date(defaultValue?.from)?.getHours() : (`0${new Date(defaultValue?.from)?.getHours() % 12}`)) : new Date()?.getHours()
            setSelectedHour(hours);
            let minutes = initValue ? initValue?.from?.getMinutes() : defaultValue ? new Date(defaultValue?.from)?.getMinutes() : new Date()?.getMinutes()
            setSelectedMinute(minutes);
            let ampm = initValue ? (initValue?.from?.getHours() > 12 ? "PM" : "AM") : defaultValue ? (new Date(defaultValue?.from)?.getHours() > 12 ? "PM" : "AM") : (new Date)?.getHours() > 12 ? "PM" : "AM";  
            setAmpmSelected(ampm);
            let hoursRange = initValue ? initValue?.to?.getHours() : defaultValue ? (is24hour ? new Date(defaultValue?.to)?.getHours() : (`0${new Date(defaultValue?.to)?.getHours() % 12}`)) : new Date()?.getHours()
            setSelectedHourRange(hoursRange);
            let minutesRange = initValue ? initValue?.to?.getMinutes() : defaultValue ? new Date(defaultValue?.to)?.getMinutes() : new Date()?.getMinutes()
            setSelectedMinuteRange(minutesRange);
            let ampmRange = initValue ? (initValue?.to?.getHours() > 12 ? "PM" : "AM") : defaultValue ? (new Date(defaultValue?.to)?.getHours() > 12 ? "PM" : "AM") : (new Date)?.getHours() > 12 ? "PM" : "AM";  
            setAmpmSelectedRange(ampmRange);
        }
        else {
            setStartDate(initValue ?? defaultValue ?? new Date());
            setCurrentDate(initValue ? new Date(dateProcessor(initValue)?.format(dateFormat)) : defaultValue ? new Date(dateProcessor(defaultValue)?.format(dateFormat)) : new Date());
            let hours = initValue ? initValue?.getHours() : defaultValue ? (is24hour ? new Date(defaultValue)?.getHours() : (`0${new Date(defaultValue)?.getHours() % 12}`)) : new Date()?.getHours()
            setSelectedHour(hours);
            let minutes = initValue ? initValue?.getMinutes() : defaultValue ? new Date(defaultValue)?.getMinutes() : new Date()?.getMinutes()
            setSelectedMinute(minutes);
            let ampm = initValue ? (initValue?.getHours() > 12 ? "PM" : "AM") : defaultValue ? (new Date(defaultValue)?.getHours() > 12 ? "PM" : "AM") : (new Date)?.getHours() > 12 ? "PM" : "AM";  
            setAmpmSelected(ampm);
        }
	}, []);

    useEffect(
		() =>
			addListener(
				(_, value) => {
					if (value === undefined || value === null) {
						setvalue('');
						return;
					}
					setvalue(value);
				},
				pageExtractor,
				bindingPathPath,
			),
		[],
	);


	const handleBubbling = (event: any) => {
		event.stopPropagation();
	};

    const handleCloseCalendar = () => {
        setIsCalendarOpen(false);    
        handleClose();
    };

	useEffect(() => {
		if (isCalendarOpen) {
			document.addEventListener('click', handleCloseCalendar);
		}
		return () => document.removeEventListener('click', handleCloseCalendar);
	}, [isCalendarOpen]);

    const handleHourClick = (hour: number, setSelectedHour: any) => {
        setSelectedHour(hour?.toString());
        handleClose();
    }

    const handleMinuteClick = (minute: any, setSelectedMinute: any) => {
        setSelectedMinute(minute);
        handleClose();
    }

    const handleAmPmClick = (ampm: any, setAmpmSelected: any) => {
        setAmpmSelected(ampm);
        handleClose();
    }

    const handleClose = () => {
		setShowDropdown('');
        setShowDropdownRange('');
	};


    const handleStartDaySelect = (day: any) => {
        if(startDate && endDate){
            setStartDate("");
            setEndDate("");
        }
        if(!startDate){
            setStartDate(dateProcessor(day)?.format(dateFormat));
        }
        else if(!endDate){
            if(Date.parse(startDate).valueOf() > Date.parse(day).valueOf()){
                setStartDate(dateProcessor(day)?.format(dateFormat));
            }
            else{
                setEndDate(dateProcessor(day)?.format(dateFormat));
            }
        }
    }

    const handleEndDateSelect = (day: any) => {
        if(startDate && endDate){
            setStartDate("");
            setEndDate("");
        }
        if(!startDate){
            setStartDate(dateProcessor(day)?.format(dateFormat));
        }
        else if(!endDate){
            if(Date.parse(startDate).valueOf() > Date.parse(day).valueOf()){
                setStartDate(dateProcessor(day)?.format(dateFormat));
            }
            else{
                setEndDate(dateProcessor(day)?.format(dateFormat));
            }
        }
    }

    const handleConfirm = () => {
        if(isDateRange) {
            let start = new Date(Date.parse(startDate));
            let end = new Date(Date.parse(endDate));

            start.setHours(ampmSelected == "PM" ? Number(selectedHour) + 12 : Number(selectedHour), Number(selectedMinute));
            end.setHours(ampmSelectedRange == "PM" ? Number(selectedHourRange) + 12 : Number(selectedHourRange) , Number(selectedMinuteRange));
            let processedStartDate = dateProcessor(start)?.format(dateFormat);
            let processedEndDate = dateProcessor(end)?.format(dateFormat);
            setvalue({
                from: processedStartDate,
                to: processedEndDate
            });
        }
        else {
            let date = new Date(Date.parse(startDate));

            date?.setHours(ampmSelected == "PM" ? Number(selectedHour) + 12 : Number(selectedHour) , Number(selectedMinute));
            let processedDate = dateProcessor(date)?.format(dateFormat);
            setvalue(processedDate);
        }
        setIsCalendarOpen(false);
    }

    const handleCancel = () => {
        setIsCalendarOpen(false);
    }

    const handleYearSelect = (year: any) => {
        setCurrentDate(new Date(currentDate.setFullYear(year)));
        setShowYears(false);
    }

    const BottomButton = (handleConfirm: any, handleCancel: any) => {
        return (
            <div className="bottomButtons">
                <div className="buttonCancel" onClick={handleCancel}>CANCEL</div>
                <div className="buttonConfirm" onClick={handleConfirm}>OK</div>
            </div>
        )
    }

    const TimeComp = (dropdownData: any, handleClick: any, TAG: any, selected: any, setSelected: any, showDropdown: any, setShowDropdown: any) => {
        return(
            <div
				className={`container ${showDropdown && !readOnlyTime ? 'focussed' : ''} ${
					readOnlyTime ? 'disabled' : ''
				} `}
			>
				<div
					className={`labelcontainer ${readOnlyTime ? 'disabled' : ''}`}
					onClick={() => setShowDropdown(TAG)}
				>
					<label className={`label ${readOnlyTime ? 'disabled' : ''}`}>
						{getTranslations(
							 selected,
							translations,
						)}
					</label>
					<i className="fa-solid fa-angle-down"></i>
				</div>
				{showDropdown === TAG && (
					<div
						className="dropdowncontainer"
						onMouseLeave={() => closeOnMouseLeave && handleClose()}
					>
						{dropdownData?.map((each: any, index: any) => (
							<div
								onClick={() => handleClick(each!, setSelected)}
								className="dropdownItem"
								key={`${each}_${index}`}
							>
								{each}
							</div>
						))}
					</div>
				)}
			</div>
        )
    }

    const renderTime = (showDropdown: any, setShowDropdown: any, selectedHour: any, selectedMinute: any, ampmSelected: any, setSelectedHour: any, setSelectedMinute: any, setAmpmSelected: any) => {

        const hours = [];
        for (let i = (is24hour ? 0 : 1); i <= (is24hour ? 23 : 12); i++) {
            hours.push(i < 10 ? `0${i}` : `${i}`);
        }

        const minutes = [];
        for (let i = 0; i <= 60; i++) {
            minutes.push(i < 10 ? `0${i}` : `${i}`);
        }

        const ampms = ["AM", "PM"];

        return (
            <div className={`timePicker ${is24hour ? `longTime` : ``}`}>
                {TimeComp(hours, handleHourClick, "Hours", selectedHour, setSelectedHour, showDropdown, setShowDropdown)}
                {TimeComp(minutes, handleMinuteClick, "Minutes", selectedMinute, setSelectedMinute, showDropdown, setShowDropdown)}
                {!is24hour ? TimeComp(ampms, handleAmPmClick, "AmPm", ampmSelected, setAmpmSelected, showDropdown, setShowDropdown) : null}
            </div>
        )
    }

    const renderCalendar = () => {

    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    let currentMonthNext = currentMainDate.getMonth();
    let currentYearNext = currentMainDate.getFullYear();
    let currentMonthDuplicate = currentMonth;
    let currYearDuplicate = currentYear;
    let currentMonthNextDuplicate = currentMonthNext;
    let currentYearNextDuplicate = currentYearNext;

    // Get the first and last day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const firstDayOfMonthNext = new Date(currentYearNext, currentMonthNext, 1);
    const lastDayOfMonthNext = new Date(currentYearNext, currentMonthNext + 1, 0);

    const startYear = 1970;
    const endYear = 2099;
    const numOfYears = endYear - startYear + 1;
    const numOfInnerArrays = Math.ceil(numOfYears / 5);

    const yearRange = Array.from({ length: numOfInnerArrays }, (_, i) => {
        const innerArrayStart = startYear + i * 5;
        const innerArrayEnd = Math.min(innerArrayStart + 4, endYear);
        return Array.from({ length: innerArrayEnd - innerArrayStart + 1 }, (_, j) => innerArrayStart + j);
    });

    const handlePrevClick = () => {
        let prevMonth = currentMonthDuplicate === 0 ? 11 : currentMonthDuplicate - 1;
        let prevYear = currentMonthDuplicate === 0 ? currYearDuplicate - 1 : currYearDuplicate;
        let prevMonthNext = currentMonthNextDuplicate === 0 ? 11 : currentMonthNextDuplicate - 1;
        let prevYearNext = currentMonthNextDuplicate === 0 ? currentYearNextDuplicate - 1 : currentYearNextDuplicate;
        setCurrentDate(new Date(prevYear, prevMonth, 1));
        setCurrentMainDate(new Date(prevYearNext, prevMonthNext, 1));
    }

    const handleNextClick = () => {
        let nextMonth = currentMonthDuplicate === 11 ? 0 : currentMonthDuplicate + 1;
        let nextYear = currentMonthDuplicate === 11 ? currYearDuplicate + 1 : currYearDuplicate;
        let nextMonthNext = currentMonthNextDuplicate === 11 ? 0 : currentMonthNextDuplicate + 1;
        let nextYearNext = currentMonthNextDuplicate === 11 ? currentYearNextDuplicate + 1 : currentYearNextDuplicate;
        setCurrentDate(new Date(nextYear, nextMonth, 1));
        setCurrentMainDate(new Date(nextYearNext, nextMonthNext, 1));
    }

    let calendarRows = [];
    let currentWeek = [];
    let currentDay = firstDayOfMonth;
    let lastDay = lastDayOfMonth.getDate();
    while (currentDay <= lastDayOfMonth) {
        if(currentDay.getDate() === 1 || currentDay.getDay() === 0) currentWeek = Array(7).fill(null)
        currentWeek[currentDay.getDay()] = currentDay;
        if (currentDay.getDay() === 6 || currentDay.getDate() === lastDay) {
            calendarRows.push(currentWeek);
        }   
        currentDay = new Date(currentYear, currentMonth, currentDay.getDate() + 1);
        if (currentDay.getDate() === 1) {
            currentDay = new Date(currentYear, currentMonth + 1, 1);
            currentMonth = currentDay.getMonth();
            currentYear = currentDay.getFullYear();
        }
    }

    let calendarRowsNext = [];
    let currentWeekNext = [];
    let currentDayNext = firstDayOfMonthNext;
    let lastDayNext = lastDayOfMonthNext.getDate();
    while (currentDayNext <= lastDayOfMonthNext) {
        if(currentDayNext.getDate() === 1 || currentDayNext.getDay() === 0) currentWeekNext = Array(7).fill(null)
        currentWeekNext[currentDayNext.getDay()] = currentDayNext;
        if (currentDayNext.getDay() === 6 || currentDayNext.getDate() === lastDayNext) {
            calendarRowsNext.push(currentWeekNext);
        }   
        currentDayNext = new Date(currentYearNext, currentMonthNext, currentDayNext.getDate() + 1);
        if (currentDayNext.getDate() === 1) {
            currentDayNext = new Date(currentYearNext, currentMonthNext + 1, 1);
            currentMonthNext = currentDayNext.getMonth();
            currentYearNext = currentDayNext.getFullYear();
        }
    }

    return (
        <div className={`calendarPopupDiv ${isDateRange ? `range` : ``}`}>
            <div className="calendarMainCard">
                <div className={isDateRange ? "caldendarMainCardWrapper" : ""}>
                    <div>
                        <div className="calendarHeader">
                            <span onClick={handlePrevClick} className="fa fa-arrow-left iconLeft"></span>
                            {isDateRange ? null : (
                                <span onClick={handleNextClick} className="fa fa-arrow-right iconRight"></span>
                            )}
                            <div className="currentDate">
                                <span className="currentDateText" onClick={() => isDateRange ? null : setShowYears(!showYears)}>{currentDate.toLocaleString('default', { month: 'long' })} {currentDate?.getFullYear()}</span>
                            </div>
                        </div>
                        <table className={`calendarMainData`}>
                            {yearAndMonthSelector && showYears && !isDateRange ? (
                                <div className="yearSubDiv">
                                    {yearRange?.map((years, index) => (
                                        <tr key={index} className={`calendarCol ${showYears ? `yearDropDown` : ``}`}>
                                            {years?.map((year, yearIndex) => (
                                                <td className={`calendarRow`} key={`${index}_${yearIndex}`} onClick={() => handleYearSelect(year)}>{year}</td>
                                            ))}
                                        </tr>
                                    ))}
                            </div>
                            ) : (
                            <Fragment>
                                <thead>
                                    <tr className="calendarCol">
                                        {daysOfWeek.map((day, index) => (
                                            <th className="calendarRow" key={index}>{day}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {calendarRows.map((week, index) => (
                                        <tr key={index} className="calendarCol">
                                            {week.map((day, dayIndex) => (
                                                <Fragment>
                                                    {isDateRange ? (
                                                        <td key={`${index}_${dayIndex}`} className={`calendarRow ${new Date(Date?.parse(startDate))?.setHours(0,0,0,0)?.valueOf() == day?.setHours(0,0,0,0)?.valueOf() ? `selectedDayStart` : ``} ${new Date(Date?.parse(endDate))?.setHours(0,0,0,0)?.valueOf() == day?.setHours(0,0,0,0)?.valueOf() ? `selectedDayEnd` : ``} ${new Date(Date?.parse(startDate))?.setHours(1,0,0,0)?.valueOf() < day?.setHours(0,0,0,0)?.valueOf() && new Date(Date?.parse(endDate))?.setHours(0,0,0,0)?.valueOf() > day?.setHours(0,0,0,0)?.valueOf() ? `selectedDays` : ``} ${day?.getDate() ? `` : `notVisible`} ${new Date(Date?.parse(minDate))?.setHours(0,0,0,0)?.valueOf() > day?.setHours(0,0,0,0)?.valueOf()  ? `notAllowed` : ``} ${new Date(Date?.parse(maxDate))?.setHours(0,0,0,0)?.valueOf() < day?.setHours(0,0,0,0)?.valueOf()  ? `notAllowed` : ``}`} onClick={() => new Date(Date?.parse(minDate))?.setHours(0,0,0,0)?.valueOf() > day?.setHours(0,0,0,0)?.valueOf() || new Date(Date?.parse(maxDate))?.setHours(0,0,0,0)?.valueOf() < day?.setHours(0,0,0,0)?.valueOf() ? null : handleStartDaySelect(dateProcessor(day)?.format(dateFormat))}>{day?.getDate()}</td>
                                                    ):(
                                                        <td key={`${index}_${dayIndex}`} className={`calendarRow ${new Date(Date.parse(startDate))?.setHours(0,0,0,0)?.valueOf() == day?.setHours(0,0,0,0)?.valueOf() ? `selectedDay` : ``} ${day?.getDate() ? `` : `notVisible`} ${new Date(Date?.parse(minDate))?.setHours(0,0,0,0)?.valueOf() > day?.setHours(0,0,0,0)?.valueOf()  ? `notAllowed` : ``} ${new Date(Date?.parse(maxDate))?.setHours(0,0,0,0)?.valueOf() < day?.setHours(0,0,0,0)?.valueOf()  ? `notAllowed` : ``}`} onClick={() => new Date(Date?.parse(minDate))?.setHours(0,0,0,0)?.valueOf() > day?.setHours(0,0,0,0)?.valueOf() || new Date(Date?.parse(maxDate))?.setHours(0,0,0,0)?.valueOf() < day?.setHours(0,0,0,0)?.valueOf() ? null : setStartDate(day)}>{day?.getDate()}</td>
                                                    )}
                                                </Fragment>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </Fragment>
                            )}
                        </table>
                    </div>
                    {isDateRange ? (
                        <div>
                        <div className="calendarHeader">
                            <span onClick={handleNextClick} className="fa fa-arrow-right iconRight"></span>
                            <div className="currentEndDate">
                                <span className="currentDateText">{currentMainDate?.toLocaleString('default', { month: 'long' })} {currentMainDate?.getFullYear()}</span>
                            </div>
                        </div>
                        <table className="calendarMainData">
                            <thead>
                                <tr className="calendarCol">
                                    {daysOfWeek.map((day, index) => (
                                        <th className="calendarRow" key={index}>{day}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {calendarRowsNext.map((week, index) => (
                                    <tr key={index} className="calendarCol">
                                        {week.map((day, dayIndex) => (
                                            <td key={`${index}_${dayIndex}`} className={`calendarRow ${new Date(Date?.parse(startDate))?.setHours(0,0,0,0)?.valueOf() == day?.setHours(0,0,0,0)?.valueOf() ? `selectedDayStart` : ``} ${new Date(Date?.parse(endDate))?.setHours(0,0,0,0)?.valueOf() == day?.setHours(0,0,0,0)?.valueOf() ? `selectedDayEnd` : ``} ${new Date(Date?.parse(startDate))?.setHours(1,0,0,0)?.valueOf() < day?.setHours(0,0,0,0)?.valueOf() && new Date(Date?.parse(endDate))?.setHours(0,0,0,0)?.valueOf() > day?.setHours(0,0,0,0)?.valueOf() ? `selectedDays` : ``} ${day?.getDate() ? `` : `notVisible`} ${new Date(Date?.parse(minDate))?.setHours(0,0,0,0)?.valueOf() > day?.setHours(0,0,0,0)?.valueOf()  ? `notAllowed` : ``} ${new Date(Date?.parse(maxDate))?.setHours(0,0,0,0)?.valueOf() < day?.setHours(0,0,0,0)?.valueOf()  ? `notAllowed` : ``}`} onClick={() => new Date(Date?.parse(minDate))?.setHours(0,0,0,0)?.valueOf() > day?.setHours(0,0,0,0)?.valueOf() || new Date(Date?.parse(maxDate))?.setHours(0,0,0,0)?.valueOf() < day?.setHours(0,0,0,0)?.valueOf() ? null : handleEndDateSelect(dateProcessor(day)?.format(dateFormat))}>{day?.getDate()}</td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    ) : null}
                </div>
            </div>
            <div className="buttonAndTimePicker">
                {dateOnly && timeOnly ? renderTime(showDropdown, setShowDropdown, selectedHour, selectedMinute, ampmSelected, setSelectedHour, setSelectedMinute, setAmpmSelected) : null}
                {isDateRange ? null : BottomButton(handleConfirm, handleCancel)}
                {isDateRange && dateOnly && timeOnly ? renderTime(showDropdownRange, setShowDropdownRange, selectedHourRange, selectedMinuteRange, ampmSelectedRange, setSelectedHourRange, setSelectedMinuteRange, setAmpmSelectedRange) : null}
            </div>
            {isDateRange ? (
                <div className="buttonAndTimePickerRange">
                    {BottomButton(handleConfirm, handleCancel)}
                </div>
            ) : null}
        </div>
        );
    }

    return(
        <div className="comp compCalendar" style={computedStyles?.comp ?? {}} onClick={handleBubbling}>
            <HelperComponent definition={definition}/>
                <div className={`calendarDiv ${errorMessage ? 'error' : ''} ${isCalendarOpen && !value?.length ? 'focussed' : ``} ${
                        readOnly && !errorMessage ? 'disabled' : ''
                    }`}>
                        <div 
                            className="inputContainer"
                            onFocus={() => setIsCalendarOpen(true)}
                        >
                            <input 
                                className={`inputbox`} 
                                value={isDateRange ? value?.from : value}
                                onChange={() => {}}
                                placeholder={dateFormat}
                                name={`${key}_start`}
                                id={`${key}_start`}
                                disabled={readOnly}
                            />
                            {isDateRange ? (
                                <Fragment>
                                    <i className={`dateSplitIcon ${calendarDateRangeIcon}`}/>
                                    <input 
                                        className={`inputbox`} 
                                        value={isDateRange ? value?.to : value}
                                        onChange={() => {}}
                                        placeholder={dateFormat}
                                        name={`${key}_end`}
                                        id={`${key}_end`}
                                        disabled={readOnly}
                                    />
                            </Fragment>
                            ) : null}
                        </div>
                        <i className={`calendarIcon ${
                        readOnly && !errorMessage ? 'disabled' : ''
                    } ${calendarIcon}`}/>
                        {isCalendarOpen ? (
                        <div className="calendarPopOver">
                            {dateOnly ? renderCalendar() : null}
                            {timeOnly && !dateOnly ? renderTime(showDropdown, setShowDropdown, selectedHour, selectedMinute, ampmSelected, setSelectedHour, setSelectedMinute, setAmpmSelected) : null}
                        </div>
                        ) : null}
                    </div>
        </div>
    )

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