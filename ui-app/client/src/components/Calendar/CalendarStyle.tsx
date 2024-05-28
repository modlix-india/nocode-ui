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
        }

        ${PREFIX} ._calenderHeader{
            background-color: #f5f5f5;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px 20px;
            color: #333333;
            border-top-left-radius: 2px;
            border-top-right-radius: 2px;
            width: 100%;
        }

        ${PREFIX} ._calenderBody{
            background-color: #ffffff;
            border-bottom-left-radius: 2px;
            border-bottom-right-radius: 2px;
        }

        ${PREFIX} ._calendarBodyContainer {
            width: 300px;
            height: 300px;
            display: grid;
            grid-template-columns: repeat(7, 1fr);
            grid-template-rows: repeat(7, 1fr);
            justify-items: center;
            align-items: center;
        }

        ${PREFIX} ._date {
            width: 30px;
            height: 30px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            border-radius: 50%;
            color: #333333;
        }

        ${PREFIX} ._date:hover {
            background-color: #219C90;
            color: #ffffff;
        }

        ${PREFIX} ._date._selected {
            background-color: #219C90;
            color: #ffffff;
        }
 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CalendarCss">{css}</style>;
}
