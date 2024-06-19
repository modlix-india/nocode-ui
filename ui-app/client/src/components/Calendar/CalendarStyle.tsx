import React from 'react';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleDefaults, styleProperties } from './calendarStyleProperties';

const PREFIX = '.comp.compCalendar';
export default function CalendarStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
        ${PREFIX} {
            display: flex;
            align-items: center;
        }

        ${PREFIX}.fullCalendar {
            display: flex;
            flex-direction: column;
            justify-content: center;
        }
    
        ${PREFIX} input {
            flex: 1;
            height: 100%;
            border: none;
            font: inherit;
            line-height: inherit;
            outline: none;
            padding: 0;
            background: transparent;
            color: inherit;
            min-width: 20px;
        }
    
        ${PREFIX}._isActive ._label,
        ${PREFIX} ._label._noFloat {
            transform: translateY(-50%);
		    bottom: 100%;
        }
    
        ${PREFIX}._hasLeftIcon ._label {
            padding-left: 24px;
        }
    
        ${PREFIX} ._label {
            position: absolute;
            user-select: none;
            pointer-events: none;
            bottom: 50%;
		    transform: translateY(50%);
            transition: transform 0.2s ease-in-out, left 0.2s ease-in-out, bottom 0.2s ease-in-out;
        }
    
        ${PREFIX} ._rightIcon,
        ${PREFIX} ._leftIcon {
            width: 24px;
        }
    
        ${PREFIX}._bigDesign1 ._leftIcon {
            margin-right: 10px;
            border-right: 1px solid;
        }
    
        ${PREFIX}._bigDesign1 ._label {
            margin-top: 0px;
        }
    
        ${PREFIX}._bigDesign1._hasLeftIcon ._label {
            padding-left: 36px;
        }
    
        ${PREFIX}._bigDesign1._hasValue ._label,
        ${PREFIX}._bigDesign1._isActive ._label,
        ${PREFIX}._bigDesign1 ._label._noFloat {
            margin-top: -30px;
            bottom: auto;
            transform: none;
        }
    
        ${PREFIX}._bigDesign1 ._inputBox {
            padding-top: 10px;
        }
    
        ${PREFIX} ._rightIcon {
            padding-right: 5px;
        }
    
        ${PREFIX} ._label._float {
            bottom: 0px;
        }
    
        ${PREFIX} ._clearText, ${PREFIX} ._passwordIcon {
            cursor: pointer;
        }
    
        ${PREFIX} ._supportText {
            position:absolute;
            z-index:1;
            left: 0;
            top: 100%;
            margin-top: 5px;
        }

        ${PREFIX} ._dropdownContainer{
            z-index: 5;
            left: 0;
            position: absolute;
            top: 100%;
            padding: 0 !important;
            box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.1);
            min-width: 100%;
        }

        ${PREFIX} ._leftArrow, 
        ${PREFIX} ._rightArrow,
        ${PREFIX} ._calendarHeader,
        ${PREFIX} ._calendarHeaderTitle,
        ${PREFIX} ._calendarBodyMonths,
        ${PREFIX} ._yearNumber,
        ${PREFIX} ._monthName,
        ${PREFIX} ._calendarHeaderMonthsContainer,
        ${PREFIX} ._calendarHeaderMonths
         {
            position: relative;
        }

        ${PREFIX} ._yearNumber,
        ${PREFIX} ._monthName {
            cursor: pointer;
            user-select: none;
        }

        ${PREFIX} ._calendarHeader {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 10px;
            width: 100%;
        }

        ${PREFIX} ._calendarHeader svg {
            width: 100% 
        }

        ${PREFIX} ._leftArrow, 
        ${PREFIX} ._rightArrow {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
        }

        ${PREFIX} ._calendarHeaderTitle {
            display: flex;
            gap: 5px;
            flex: 1;
            justify-content: center;
        }

        ${PREFIX} ._calendarHeaderMonthsContainer {
            display: flex;
            gap: 5px;
            width: 100%;
            align-items: center;
            justify-content: space-between;            
        }

        ${PREFIX} ._calendarHeaderMonths {
            cursor: pointer;
        }

        ${PREFIX} ._month {
            display: grid;
            justify-items: center;
            align-items: center;
            grid-template-rows: auto repeat(6, 1fr);
        }

        ${PREFIX} ._month._withMonthName {
            grid-template-rows: auto auto repeat(6, 1fr)
        }

        ${PREFIX} ._month._8cols {
            grid-template-columns: repeat(8, 1fr);
        }
        
        ${PREFIX} ._month._7cols {
            grid-template-columns: repeat(7, 1fr);
        }

        ${PREFIX} ._month._8cols ._monthName {
            grid-column: 1 / span 8;
        }
        
        ${PREFIX} ._month._7cols ._monthName {
            grid-column: 1 / span 7;
        }

        ${PREFIX} ._calendarBodyMonths._months {
            display: grid;
            gap: 10px;
            grid-template-columns: auto auto auto;
        }

        ${PREFIX} ._calendarBodyMonths._months._1cols {
            grid-template-columns: repeat(1, 1fr);
        }

        ${PREFIX} ._calendarBodyMonths._months._1cols > ._month {
            grid-template-rows: auto repeat(5, 1fr) auto;
        }

        ${PREFIX} ._calendarBodyMonths._months._2cols {
            grid-template-columns: repeat(2, 1fr);
        }
        ${PREFIX} ._calendarBodyMonths._months._3cols,
        ${PREFIX} ._calendarBodyMonths._months._6cols,
        ${PREFIX} ._calendarBodyMonths._months._12cols {
            grid-template-columns: repeat(3, 1fr);
        }
        ${PREFIX} ._calendarBodyMonths._months._4cols {
            grid-template-columns: repeat(4, 1fr);
        }

        ${PREFIX} ._month > div {
            padding: 3px;
        }

        ${PREFIX} ._date {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        ${PREFIX} ._date._dateSelectable {
            cursor: pointer;
        }

        ${PREFIX} ._calendarBodyBrowseYears,
        ${PREFIX} ._calendarBodyBrowseMonths  {
            position: absolute;
            gap: 10px;
            bottom: 0px;
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            flex-wrap: wrap;
            justify-content: flex-start;
            align-items: center;
            padding: 20px;
        }
       
 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CalendarCss">{css}</style>;
}
