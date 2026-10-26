const setData = jest.fn();
jest.mock('../../../context/StoreContext', () => ({ setData: (...a: any[]) => setData(...a) }));
const runEvent = jest.fn();
jest.mock('../../util/runEvent', () => ({ runEvent: (...a: any[]) => runEvent(...a) }));

import { savePersonalizationCurry, withDefaultPreferences } from '../utils';

describe('KIRun Editor view toggles', () => {
	beforeEach(() => {
		setData.mockClear();
		runEvent.mockClear();
	});

	it('starts from the Show Expressions and Show Stores properties', () => {
		expect(withDefaultPreferences({}, { showExpressions: true, showStores: false })).toEqual({
			showParamValues: true,
			// kirun-ui reads showStores true as "stores hidden"
			showStores: true,
		});
		expect(withDefaultPreferences(undefined, { showExpressions: false, showStores: true })).toEqual({
			showParamValues: false,
			showStores: false,
		});
	});

	it("keeps the user's own choice over the properties", () => {
		expect(
			withDefaultPreferences(
				{ showParamValues: false, showStores: false, editorMode: 'text' },
				{ showExpressions: true, showStores: false },
			),
		).toEqual({ showParamValues: false, showStores: false, editorMode: 'text' });
	});

	it('leaves the preference alone when no property is set', () => {
		expect(withDefaultPreferences({ editorMode: 'visual' }, {})).toEqual({ editorMode: 'visual' });
	});

	it('writes a toggle to the store even when the page has no personalization event', () => {
		const save = savePersonalizationCurry('Page.pref', 'playground', undefined, [], {} as any);
		save('showStores', false);
		expect(setData).toHaveBeenCalledWith('Page.pref.showStores', false, 'playground');
	});

	it('still calls the personalization event, debounced', () => {
		jest.useFakeTimers();
		const onChange = jest.fn();
		const save = savePersonalizationCurry('Page.pref', 'page', onChange, [], {} as any);
		save('a', 1);
		save('b', 2);
		expect(setData).toHaveBeenCalledTimes(2);
		expect(onChange).not.toHaveBeenCalled();
		jest.advanceTimersByTime(2000);
		expect(onChange).toHaveBeenCalledTimes(1);
		jest.useRealTimers();
	});
});
