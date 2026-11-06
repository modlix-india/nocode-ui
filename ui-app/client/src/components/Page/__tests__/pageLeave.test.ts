jest.mock('../../util/runEvent', () => ({ runEvent: jest.fn(() => Promise.resolve()) }));
jest.mock('../../../context/StoreContext', () => ({
	getDataFromPath: jest.fn(),
	PageStoreExtractor: { getForContext: jest.fn(() => ({})) },
}));

import { getDataFromPath } from '../../../context/StoreContext';
import { runEvent } from '../../util/runEvent';
import { pageLeaveWarning, runPageLeaveEvent } from '../pageLeave';

const def = (properties: any, eventFunctions: any = { save: { name: 'save' } }) =>
	({ name: 'p1', properties, eventFunctions }) as any;

describe('runPageLeaveEvent', () => {
	beforeEach(() => {
		(runEvent as jest.Mock).mockClear();
		globalThis.isDesignMode = false;
	});

	test('does nothing without onLeaveEvent (old behaviour)', async () => {
		await runPageLeaveEvent('p1', def({}), []);
		await runPageLeaveEvent('p1', undefined, []);
		expect(runEvent).not.toHaveBeenCalled();
	});

	test('does nothing when the named event is missing', async () => {
		await runPageLeaveEvent('p1', def({ onLeaveEvent: 'nope' }), []);
		expect(runEvent).not.toHaveBeenCalled();
	});

	test('runs the named event for the page and waits for it', async () => {
		const d = def({ onLeaveEvent: 'save' });
		await runPageLeaveEvent('p1', d, []);
		expect(runEvent).toHaveBeenCalledWith({ name: 'save' }, 'pageOnLeave', 'p1', [], d);
	});

	test('a failing event does not throw', async () => {
		(runEvent as jest.Mock).mockImplementationOnce(() => Promise.reject(new Error('x')));
		await expect(
			runPageLeaveEvent('p1', def({ onLeaveEvent: 'save' }), []),
		).resolves.toBeUndefined();
	});

	test('never runs in design mode', async () => {
		globalThis.isDesignMode = true;
		await runPageLeaveEvent('p1', def({ onLeaveEvent: 'save' }), []);
		expect(runEvent).not.toHaveBeenCalled();
		globalThis.isDesignMode = false;
	});
});

describe('pageLeaveWarning', () => {
	const ev = () => ({ preventDefault: jest.fn(), returnValue: undefined as any }) as any;

	test('asks only while the value is truthy', () => {
		const h = pageLeaveWarning('p1', 'Page.unsaved');
		(getDataFromPath as jest.Mock).mockReturnValueOnce(false);
		const e1 = ev();
		h(e1);
		expect(e1.preventDefault).not.toHaveBeenCalled();
		(getDataFromPath as jest.Mock).mockReturnValueOnce(true);
		const e2 = ev();
		h(e2);
		expect(e2.preventDefault).toHaveBeenCalled();
		expect(e2.returnValue).toBe('');
		expect(getDataFromPath).toHaveBeenLastCalledWith('Page.unsaved', [], {});
	});
});
