import { parseRelativeDate } from '../../../../src/components/Calendar/components/calendarFunctions';

test('Testing parse relative time', () => {
	let newDate = parseRelativeDate('+1d');

	expect(newDate.getDate()).toBe(new Date().getDate() + 1);

	newDate = parseRelativeDate('+1year -1d');
	let resultDate = new Date();
	resultDate.setFullYear(resultDate.getFullYear() + 1);
	resultDate.setDate(resultDate.getDate() - 1);
	expect(newDate.getDate()).toBe(resultDate.getDate());

	newDate = parseRelativeDate('+1year -1d2m');
	resultDate = new Date();
	resultDate.setFullYear(resultDate.getFullYear() + 1);
	resultDate.setDate(resultDate.getDate() - 1);
	resultDate.setMonth(resultDate.getMonth() - 2);
	expect(newDate.getDate()).toBe(resultDate.getDate());
});
