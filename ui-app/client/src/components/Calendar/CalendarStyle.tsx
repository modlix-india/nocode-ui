import React from "react";
import { processStyleDefinition } from "../../util/styleProcessor";
import { styleDefaults, styleProperties } from "./calendarStyleProperties";

const PREFIX = ".comp.compCalendar";
export default function CalendarStyle({
  theme,
}: {
  theme: Map<string, Map<string, string>>;
}) {
  const css =
    `
        ${PREFIX} {
            display: flex;
            align-items: center;
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

        ${PREFIX} ._label {
            position: absolute;
            user-select: none;
            pointer-events: none;
            bottom: 50%;
		    transform: translateY(50%);
            transition: transform 0.2s ease-in-out, left 0.2s ease-in-out, bottom 0.2s ease-in-out;
        }
        
        ${PREFIX} ._rightIcon {
            width: 24px;
        }

        ${PREFIX} ._rightIcon {
            padding-right: 5px;
        }
    
        ${PREFIX} ._label._float {
            bottom: 0px;
        }

        .calendarPopOver {
            z-index: 5;
            left: 0;
            position: absolute;
            top: 100%;
        }

       .calendarPopOver._simpleCalendar {
            position: absolute;
        }

        .date.disabled {
            background-color: #f7f7f7;
        }

        .dateContainer {
            display: flex;
            justify-content: space-between;
        }

        .dateContainer span {
            z-index: 2;
        }

        .dateContainer._center, .dateContainer._left, .dateContainer._right {
            position: relative;
            justify-content: center;
            align-items: center;
        }

        .arrowButton._center {
            display: flex;
            justify-content: space-between;
            position: absolute;
            width: 100%;
        }

        .arrowButton._left {
            display: flex;
            align-items: center;
            position: absolute;
            left: 0;
        }

        .arrowButton._right {
            display: flex;
            align-items: center;
            position: absolute;
            right: 0;
        }

        .dateText {
            display: flex;
            align-items: center;
        }

        .calendar .date {
            text-align: center;
        }

        .svgIcon_180 {
            position: relative;
            top: -2px;
        }

 	` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

  return <style id="CalendarCss">{css}</style>;
}
