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

        ${PREFIX} ._leftArrow, 
        ${PREFIX} ._rightArrow,
        ${PREFIX} ._calenderHeader {
            position: relative;
        }
       
 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

	return <style id="CalendarCss">{css}</style>;
}
