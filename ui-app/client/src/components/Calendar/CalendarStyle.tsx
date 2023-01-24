import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './calendarStyleProperties';

const PREFIX = '.comp.compCalendar';
export default function CalendarStyle({ theme } : {theme: Map<string, Map<string, string>>}) {
    const css = `
    ${PREFIX} .calendarDiv .inputContainer {
        position: relative;
    }
    
    ${PREFIX} .calendarDiv .inputContainer .inputbox {
        border: none;
        width: 100%;
        height: 100%;
        border-radius: 4px;
        outline: none;
    }

    ${PREFIX} .calendarDiv {
        display: grid;
        grid-template-columns: auto 30px;
    }

    ${PREFIX} .calendarDiv .calendarIcon {
        cursor: pointer;
    }

    ${PREFIX} .calendarDiv .calendarPopOver {
        position: absolute;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard {
        width: 100%;
        height: fit-content;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarMainData {
        width: 100%;
        height: 100%;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv {
        display: grid;
        grid-template-rows: auto auto auto;
        width: 100%;
        height: 100%;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarRow, 
    .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .iconLeft, 
    .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .iconRight {
        text-align:center;
        border-radius: 24px;
        cursor: pointer;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
    }
    
    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

    return <style id='CalendarCss'>{css}</style>
}