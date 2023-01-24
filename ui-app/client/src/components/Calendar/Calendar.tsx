import React, { useEffect, useRef, useState } from "react";
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

function Calendar(props: ComponentProps) {
    const [focus, setFocus] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const calendarBody = useRef(null);
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysOfWeek = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

    // Get the current date
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();

    // Get the first and last day of the month
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);

    const handlePrevClick = () => {
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = prevMonth === 11 ? currentYear - 1 : currentYear;
        setCurrentDate(new Date(prevYear, prevMonth, -1));
    }

    const handleNextClick = () => {
        const nextMonth = currentMonth === 11 ? 0 : currentMonth;
        const nextYear = nextMonth === 0 ? currentYear + 1 : currentYear;
        setCurrentDate(new Date(nextYear, nextMonth, 1));
    }

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
            placeholderType,
            dateOnly
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
		{ focus, readOnly },
		stylePropertiesWithPseudoStates,
	);

    const [value, setvalue] = useState(defaultValue ?? '');
    if (!bindingPath) throw new Error('Definition requires bindingpath');
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
    useEffect(() => {
		const initValue = getDataFromLocation(bindingPath, locationHistory, pageExtractor);
		if (!isNullValue(defaultValue) && isNullValue(initValue)) {
			setData(bindingPathPath, defaultValue, context.pageName);
		}
		setvalue(initValue ?? defaultValue ?? '');
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

    const handleChange = () => {};

    const handleBlur = () => {
        setFocus(true);
    };

    const handleFocus = () => {
        setFocus(true);
    }

    const getWeek = (startDate: number, date: Date, lastDate: number) => {
        let currentDate = startDate;
        const cells= [];
        for(let i=0; i < 7; i++) {
            const day = new Date(date.getFullYear(), date.getMonth(), currentDate).getDay();
            if(day !== i  || currentDate > lastDate) {
                cells.push(<div className="emptyCell"></div>)
            }else {
                cells.push(<div className="cell">{currentDate}</div>)
            }
            currentDate++;
        }
        return cells;
    }

    const getCalendarPopover = (date: Date) => {
        const currentMonth = date.getMonth();
        const currentYear = date.getFullYear();
        let startDate = 1;
        const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();
        let calendar: any = [];
        while(startDate <= lastDate) {
            for(let i=0; i < 5; i++) {
                calendar.push(<div className="row">{getWeek(startDate, date, lastDate)}</div>)
                startDate = 7 - new Date(date.getFullYear(), date.getMonth(), startDate).getDay() + startDate;
            }
            if(startDate < lastDate)
            startDate =lastDate
        }
        return calendar;
    }

    let date = new Date(),
        currYear = date.getFullYear(),
        currMonth = date.getMonth();
        // storing full name of all months in array

    const renderCalendar = () => {

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

    const options : any = {
        weekday: 'short',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      };

    return (
        <div className="calendarPopupDiv">
            <div className="calendarSelectedDate">{value.toLocaleDateString('default',options)}</div>
            <div className="calendarMainCard">
                <div className="calendarHeader">
                    <span onClick={handlePrevClick} className="fa fa-angle-left iconLeft"></span>
                    <span>{currentDate.toLocaleString('default', { month: 'long' })} {currentYear}</span>
                    <span onClick={handleNextClick} className="fa fa-angle-right iconRight"></span>
                </div>
                <table className="calendarMainData">
                        <tr className="calendarCol">
                            {daysOfWeek.map((day, index) => (
                                <th className="calendarRow" key={index}>{day}</th>
                            ))}
                        </tr>
                        {calendarRows.map((week, index) => (
                            <tr key={index} className="calendarCol">
                                {week.map((day, dayIndex) => (
                                    <td className={`calendarRow ${value?.valueOf() == day?.valueOf() ? `selectedDay` : ``}`} key={dayIndex} onClick={() => setvalue(day)}>{day?.getDate()}</td>
                                ))}
                            </tr>
                        ))}
                </table>
            </div>
        </div>
        );
    }

    return(
        <div className="comp compCalendar">
            <HelperComponent definition={definition}/>
            <div className={`calendarDiv ${errorMessage ? 'error' : ''} ${focus && !value?.length ? 'focussed' : ``} ${value?.length && !readOnly ? 'hasText' : ''} ${
					readOnly && !errorMessage ? 'disabled' : ''
				}`}>
                    <div className="inputContainer">
                        <input 
                            className={`inputbox`} 
                            value={value?.toLocaleDateString('en-US')}
                            onChange={handleChange}
                            placeholder={placeholderType}
                            onFocus={handleFocus}
                            onBlur={handleBlur}
                            name={key}
                            id={key}
                            disabled={readOnly}
                        />
                    </div>
                    <i className="calendarIcon fa fa-calendar-day fa-fw"/>
                    {focus ? (
                    <div className="calendarPopOver">
                        {renderCalendar()}
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