import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './calendarStyleProperties';

const PREFIX = '.comp.compCalendar';
export default function CalendarStyle({ theme } : {theme: Map<string, Map<string, string>>}) {
    const css = `
    ${PREFIX} .calendarDiv .inputContainer {
        position: relative;
        display: flex;
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
        position: relative;
    }

    ${PREFIX} .calendarDiv .calendarPopOver {
        position: absolute;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard {
        width: 100%;
        height: fit-content;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv {
        display: grid;
        grid-template-rows: auto auto;
        align-items: baseline;  
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader {
        position: relative;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .iconLeft {
        position: absolute;
        left: 0;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .iconRight {
        position: absolute;
        right: 0;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .currentDate,
    .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarHeader .currentEndDate {
        display: flex;
        justify-content: center;
        gap: 4px;
        flex-wrap: wrap;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.yearDropDown, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol.monthDropDown {
        display: grid;
        justify-items: center;
        align-items: center;
        text-align: center;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .yearSubDiv, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .monthSubDiv {
        overflow-y: scroll;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol .calendarRow.notVisible, .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .calendarCol .calendarRow.notAllowed {
        display: block;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .buttonAndTimePicker, .calendarDiv .calendarPopOver .calendarPopupDiv .buttonAndTimePicker .timePicker, .calendarDiv .calendarPopOver .calendarPopupDiv .buttonAndTimePickerRange, .timePicker {
        display: flex;
    }


    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .calendarMainCard .caldendarMainCardWrapper {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        justify-content: center;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .buttonAndTimePicker .timePicker .container, .timePicker .container {
        position: relative;
    }

    ${PREFIX} .calendarDiv .calendarPopOver .calendarPopupDiv .buttonAndTimePicker .timePicker .container .labelcontainer, .timePicker .container .labelcontainer {
        width: 100%;
        height: 100%;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    ${PREFIX} .container .dropdowncontainer {
        position: absolute;
        left:0;
        overflow-y: scroll;
    }

    ${PREFIX} .container .dropdowncontainer::-webkit-scrollbar {
        display: none;
    },

    ${PREFIX} .container .dropdowncontainer .dropdownItem {
        -ms-overflow-style: none;
        scrollbar-width: none;
    }

    ` + processStyleDefinition(PREFIX, styleProperties, styleDefaults, theme);

    return <style id='CalendarCss'>{css}</style>
}