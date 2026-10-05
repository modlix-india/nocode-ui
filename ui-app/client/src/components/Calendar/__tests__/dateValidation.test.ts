import { validateWithProps } from '../utils/dateValidation';
import { CalendarValidationProps } from '../components/calendarTypes';

const props = { disableTemporalRanges: ['disablePast'] } as unknown as CalendarValidationProps;

describe('validateWithProps disablePast', () => {
	beforeAll(() => {
		jest.useFakeTimers();
		jest.setSystemTime(new Date(2026, 9, 5, 14, 30, 20));
	});
	afterAll(() => jest.useRealTimers());

	test('day precision keeps today and refuses yesterday', () => {
		expect(validateWithProps(new Date(2026, 9, 5, 0, 0, 0), props)).toBeDefined();
		expect(validateWithProps(new Date(2026, 9, 4, 23, 0, 0), props)).toBeUndefined();
	});

	test('hour precision refuses an hour that has gone, keeps the current one', () => {
		expect(validateWithProps(new Date(2026, 9, 5, 13, 0, 0), props, 'hour')).toBeUndefined();
		expect(validateWithProps(new Date(2026, 9, 5, 14, 0, 0), props, 'hour')).toBeDefined();
	});

	test('minute precision refuses a minute that has gone, keeps the current one', () => {
		expect(validateWithProps(new Date(2026, 9, 5, 14, 29, 0), props, 'minute')).toBeUndefined();
		expect(validateWithProps(new Date(2026, 9, 5, 14, 30, 0), props, 'minute')).toBeDefined();
	});

	test('second precision refuses a second that has gone', () => {
		expect(
			validateWithProps(new Date(2026, 9, 5, 14, 30, 19), props, 'second'),
		).toBeUndefined();
		expect(validateWithProps(new Date(2026, 9, 5, 14, 30, 20), props, 'second')).toBeDefined();
	});

	test('any time on a later day is allowed', () => {
		expect(validateWithProps(new Date(2026, 9, 6, 1, 0, 0), props, 'minute')).toBeDefined();
	});

	test('without disablePast a past time is allowed', () => {
		const none = {} as CalendarValidationProps;
		expect(validateWithProps(new Date(2026, 9, 5, 9, 0, 0), none, 'minute')).toBeDefined();
	});
});
