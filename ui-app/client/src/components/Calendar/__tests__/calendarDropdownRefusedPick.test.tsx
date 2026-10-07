/**
 * A dropdown Calendar with disablePast refused a past time silently but kept showing it:
 * picking AM on today's date in the evening showed "9 AM" while the bound value stayed at
 * 9:57 PM, and that old value was what got saved. The dropdowns must never show a time that
 * is not the bound one.
 *
 * REAL: CalendarDropdown, the option hooks, validateWithProps and the date formatting.
 * STUBBED: DateDropdowns and TimeDropdowns (they only render what they are given, so the test
 * reads their props: the selected values and the offered options) and the helper overlays.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let timeProps: any;

jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	SubHelperComponent: () => null,
}));
jest.mock('../components/DateDropdowns', () => ({ DateDropdowns: () => null }));
jest.mock('../components/TimeDropdowns', () => ({
	TimeDropdowns: (p: any) => {
		timeProps = p;
		return null;
	},
}));

import { CalendarDropdown } from '../components/CalendarDropdown';

// 2026-10-07 21:30:00 local, today in the evening.
const NOW = new Date(2026, 9, 7, 21, 30, 0);
const TODAY_2157 = new Date(2026, 9, 7, 21, 57, 53).getTime();

let container: HTMLDivElement;
let root: Root;
let onChange: jest.Mock;

function render(value: number | undefined) {
	onChange = jest.fn();
	const props: any = {
		thisDate: value,
		displayDateFormat: 'x',
		storageFormat: 'x',
		timeDesignType: 'comboBoxes12Hr',
		disableTemporalRanges: ['disablePast'],
		weekEndDays: [],
		isMultiSelect: false,
		multipleDateSeparator: ',',
		onChange,
		onBrowsingMonthYearChange: () => {},
		browsingMonthYear: '',
		styles: {},
		hoverStyles: {},
		disabledStyles: {},
		definition: {},
	};
	act(() => root.render(<CalendarDropdown {...props} />));
}

beforeAll(() => {
	jest.useFakeTimers();
	jest.setSystemTime(NOW);
});
afterAll(() => jest.useRealTimers());

beforeEach(() => {
	timeProps = undefined;
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
});

afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

test('AM is not offered on today once every AM hour has gone', () => {
	render(TODAY_2157);
	expect(timeProps.availableAmPm.map((e: any) => e.value)).toEqual(['PM']);
});

test('both halves are offered on a later day', () => {
	render(new Date(2026, 9, 8, 21, 57, 0).getTime());
	expect(timeProps.availableAmPm.map((e: any) => e.value)).toEqual(['AM', 'PM']);
});

test('a refused AM pick stores nothing and the dropdowns keep showing the bound time', () => {
	render(TODAY_2157);
	act(() => timeProps.onAmPmChange('AM'));
	expect(onChange).not.toHaveBeenCalled();
	expect(timeProps.selectedHour).toBe(21);
	expect(timeProps.selectedMinute).toBe(57);
});

test('an AM hour on a later day stays AM', () => {
	render(new Date(2026, 9, 8, 0, 57, 0).getTime());
	expect(timeProps.selectedHour).toBe(0);
	act(() => timeProps.onHourChange(10));
	expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 9, 8, 10, 57, 0).getTime(), false);
	expect(timeProps.selectedHour).toBe(10);
});

test('an hour picked with AM showing on today takes PM when only PM is allowed', () => {
	// Midnight today, what a date-only pick stores: the time shows as 12 AM.
	render(new Date(2026, 9, 7, 0, 0, 0).getTime());
	act(() => timeProps.onHourChange(10));
	expect(onChange).toHaveBeenLastCalledWith(new Date(2026, 9, 7, 22, 0, 0).getTime(), false);
	expect(timeProps.selectedHour).toBe(22);
});

test('a refused hour leaves the shown hour alone', () => {
	render(TODAY_2157);
	// 8 PM today has gone and 8 AM has too.
	act(() => timeProps.onHourChange(8));
	expect(onChange).not.toHaveBeenCalled();
	expect(timeProps.selectedHour).toBe(21);
});
