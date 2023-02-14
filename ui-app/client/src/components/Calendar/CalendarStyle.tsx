import React from 'react';
import { StyleResolution } from '../../types/common';
import { processStyleDefinition } from '../../util/styleProcessor';
import { styleProperties, styleDefaults } from './calendarStyleProperties';

const PREFIX = '.comp.compCalendar';
export default function CalendarStyle({ theme }: { theme: Map<string, Map<string, string>> }) {
	const css =
		`
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

    ${PREFIX}.calendarPopOver {
        position: absolute;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv {
        width: 100%;
        height: 100%;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv  .calendarHeader, .timePicker .container {
        position: relative;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv  .calendarHeader .iconLeft {
        position: absolute;
        left: 0;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv  .calendarHeader .iconRight {
        position: absolute;
        right: 0;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv  .calendarHeader .currentDate,
    .calendarDiv .calendarPopOver .calendarPopupDiv  .calendarHeader .currentEndDate {
        display: flex;
        justify-content: center;
        gap: 4px;
        flex-wrap: wrap;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv  .calendarRow.yearDropDown,.calendarPopOver .calendarPopupDiv  .calendarRow.monthDropDown {
        display: grid;
        justify-items: center;
        align-items: center;
        text-align: center;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv  .yearSubDiv,.calendarPopOver .calendarPopupDiv  .monthSubDiv {
        overflow-y: scroll;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv  .calendarRow .calendarCol.notVisible,.calendarPopOver .calendarPopupDiv  .calendarRow .calendarCol.notAllowed {
        display: block;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv .buttonAndTimePicker,.calendarPopOver .calendarPopupDiv .buttonAndTimePicker .timePicker {
        display: flex;
    }


    ${PREFIX}.calendarPopOver .calendarPopupDiv  .caldendarMainCardWrapper {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        justify-content: center;
    }

    ${PREFIX}.calendarPopOver .calendarPopupDiv .buttonAndTimePicker .timePicker .container .labelContainer, .timePicker .container .labelContainer {
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

	return <style id="CalendarCss">{css}</style>;
}
