import { getValidDate, toFormat } from '../utils/dateFormatting';
import { validateRangesAndSetData } from '../utils/dateValidation';

jest.mock('../../../context/StoreContext', () => ({ setData: jest.fn() }));
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { setData } = require('../../../context/StoreContext');

describe('year-first storage format (YYYY-MM-DD)', () => {
	test('a day picked in DD/MM/YYYY is stored as YYYY-MM-DD', () => {
		expect(toFormat('28/10/2026', 'DD/MM/YYYY', 'YYYY-MM-DD')).toBe('2026-10-28');
	});

	test('a stored YYYY-MM-DD value reads back for display', () => {
		const d = getValidDate('2026-10-28', 'YYYY-MM-DD');
		expect(d?.getFullYear()).toBe(2026);
		expect(d?.getMonth()).toBe(9);
		expect(d?.getDate()).toBe(28);
		expect(toFormat('2026-10-28', 'YYYY-MM-DD', 'DD/MM/YYYY')).toBe('28/10/2026');
	});

	test('the picked date is written to the store', () => {
		const ok = validateRangesAndSetData('Page.tsk.dueAt', '2026-10-28', 'caseView', {
			storageFormat: 'YYYY-MM-DD',
			displayDateFormat: 'DD/MM/YYYY',
		} as any);
		expect(ok).toBe(true);
		expect(setData).toHaveBeenCalledWith('Page.tsk.dueAt', '2026-10-28', 'caseView');
	});

	test('slash formats are unchanged', () => {
		expect(toFormat('10/28/2026', 'MM/DD/YYYY', 'DD/MM/YYYY')).toBe('28/10/2026');
		expect(getValidDate('2026-10-28', 'DD/MM/YYYY')).toBeUndefined();
	});
});
