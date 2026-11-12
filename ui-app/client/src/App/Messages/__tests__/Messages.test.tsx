/**
 * The toast: the message, the next step on a second line, and a "Copy error id" control when the
 * error has an id. Older bodies (Java's, without `action`) still show just their message.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

jest.mock('../../../sso/ssoModule', () => ({ takeSocialArrivalMessage: () => undefined }));
jest.mock('../../../components/util/runEvent', () => ({ runEvent: jest.fn() }));

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLDivElement;
let root: Root;
let mod: typeof import('../Messages');
let clearMessages: () => void;

beforeAll(() => {
	// Messages starts its expiry timer when it loads.
	jest.useFakeTimers();
	mod = require('../Messages');
	const { setData } = require('../../../context/StoreContext');
	const { STORE_PATH_MESSAGES } = require('../../../constants');
	clearMessages = () => setData(STORE_PATH_MESSAGES, []);
});

afterAll(() => {
	jest.useRealTimers();
});

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	root = createRoot(container);
	act(() => root.render(<mod.Messages />));
});

afterEach(() => {
	act(() => clearMessages());
	act(() => root.unmount());
	container.remove();
});

function add(msg: any, type = mod.MESSAGE_TYPE.ERROR) {
	act(() => mod.addMessage(type, msg, true, ''));
}

function lines() {
	return Array.from(container.querySelectorAll('._msgStringContainer > *')).map(e => [
		e.className,
		e.textContent,
	]);
}

describe('Messages', () => {
	it('shows the next step under the message and offers the error id', async () => {
		const writeText = jest.fn().mockResolvedValue(undefined);
		Object.defineProperty(globalThis.navigator, 'clipboard', {
			configurable: true,
			value: { writeText },
		});

		add({
			exceptionId: '2026-10-17-1f2e3d',
			code: 'MULTI.TRANSPORT_EXPORT_FORBIDDEN',
			message:
				"You can't export this app: your organisation does not have write access to it.",
			action: "Ask the app's owner to give your organisation write access to it.",
			stackTrace: '',
			debugMessage: '[forbidden_create] Cannot create transport for the selected client',
		});

		expect(lines()).toEqual([
			[
				'_msgString',
				"You can't export this app: your organisation does not have write access to it.",
			],
			[
				'_msgString _msgAction',
				"Ask the app's owner to give your organisation write access to it.",
			],
			['_msgString _msgCopyId', 'Copy error id'],
		]);

		const copy = container.querySelector('._msgCopyId') as HTMLButtonElement;
		expect(copy.title).toBe('2026-10-17-1f2e3d');
		await act(async () => copy.click());
		expect(writeText).toHaveBeenCalledWith('2026-10-17-1f2e3d');
		expect(copy.textContent).toBe('Copied');
		act(() => {
			jest.advanceTimersByTime(2000);
		});
		expect(copy.textContent).toBe('Copy error id');
	});

	it('shows a Java body as before, and the detail behind the caret', () => {
		add({ message: 'Cannot update this object', debugMessage: 'Cannot update this object' });
		expect(lines()).toEqual([['_msgString', 'Cannot update this object']]);

		act(() => (container.querySelector('.fa-angle-right') as HTMLElement).click());
		expect(container.querySelector('._msgDebug')?.textContent).toBe(
			'Cannot update this object',
		);
	});

	it('says something for an empty answer, by its status', () => {
		add({
			isAxiosError: true,
			message: 'Request failed with status code 503',
			response: { status: 503, data: '' },
		});
		expect(lines()).toEqual([
			['_msgString', 'The service is restarting. Try again in a few seconds.'],
		]);
	});

	it('leaves plain texts alone', () => {
		add('Saved', mod.MESSAGE_TYPE.SUCCESS);
		expect(lines()).toEqual([['_msgString', 'Saved']]);
		expect(container.querySelector('._message.SUCCESS')).not.toBeNull();
	});
});

describe('Messages lift (opt-in, per page)', () => {
	const box = () => container.querySelector('.compMessages') as HTMLElement;
	const set = (path: string, v: any) => {
		const { setData } = require('../../../context/StoreContext');
		act(() => setData(path, v));
	};

	afterEach(() => {
		set('Store.pageData.liftA.messagesLift', undefined);
		set('Store.pageData.liftB.messagesLift', undefined);
		set('Store.urlDetails', undefined);
	});

	it('stays where the theme puts it when no page asks', () => {
		set('Store.urlDetails', { pageName: 'liftA', pathParts: [], queryParameters: {} });
		expect(box().getAttribute('style')).toBeNull();
		expect(box().dataset.lift).toBeUndefined();
	});

	it('moves up by the current page`s messagesLift, and only on that page', () => {
		set('Store.urlDetails', { pageName: 'liftA', pathParts: [], queryParameters: {} });
		set('Store.pageData.liftA.messagesLift', 88);
		expect(box().dataset.lift).toBe('88px');
		expect(box().style.getPropertyValue('translate')).toBe('0px -88px');

		set('Store.pageData.liftA.messagesLift', '5rem');
		expect(box().dataset.lift).toBe('5rem');

		set('Store.urlDetails', { pageName: 'liftB', pathParts: [], queryParameters: {} });
		expect(box().dataset.lift).toBeUndefined();
		expect(box().style.getPropertyValue('translate')).toBe('');

		set('Store.urlDetails', { pageName: 'liftA', pathParts: [], queryParameters: {} });
		expect(box().dataset.lift).toBe('5rem');
	});

	it('ignores values that are not a plain positive length', () => {
		expect(mod.messagesLiftValue(undefined)).toBeUndefined();
		expect(mod.messagesLiftValue(0)).toBeUndefined();
		expect(mod.messagesLiftValue(-5)).toBeUndefined();
		expect(mod.messagesLiftValue('calc(10px)')).toBeUndefined();
		expect(mod.messagesLiftValue('10px; color: red')).toBeUndefined();
		expect(mod.messagesLiftValue(' 72px ')).toBe('72px');
		expect(mod.messagesLiftValue(72.5)).toBe('72.5px');
	});
});

describe('Toast actions, sticky and details (opt-in)', () => {
	const store = () => require('../../../context/StoreContext');
	const { runEvent } = require('../../../components/util/runEvent');
	const buttons = () =>
		Array.from(container.querySelectorAll('._msgActionBtn')).map(b => b.textContent);

	beforeEach(() => {
		(runEvent as jest.Mock).mockClear();
		act(() =>
			store().setData('Store.pageDefinition.toastPage', {
				name: 'toastPage',
				eventFunctions: {
					k1: { name: 'undoPause', steps: {} },
					k2: { name: 'other', steps: {} },
				},
			}),
		);
	});

	it('leaves a toast without the new options exactly as before', () => {
		add('Saved', mod.MESSAGE_TYPE.SUCCESS);
		expect(container.querySelector('._msgActions')).toBeNull();
		expect(container.querySelector('._msgDetails')).toBeNull();
		expect(container.querySelector('._message')?.className).toBe('_message SUCCESS');
		const stored = store().getDataFromPath('Store.messages', []);
		expect(Object.keys(stored[0]).sort()).toEqual([
			'id',
			'isGlobalScope',
			'msg',
			'type',
			'when',
		]);
	});

	it('shows an action, writes its value, runs the page event by name and closes', async () => {
		act(() =>
			mod.addMessage(mod.MESSAGE_TYPE.SUCCESS, '3 campaigns paused', true, '', {
				actions: mod.toastActions([
					{
						label: 'Undo',
						eventFunction: 'undoPause',
						path: 'Page.undo',
						value: ['a', 'b'],
					},
				]),
				page: 'toastPage',
			}),
		);
		expect(buttons()).toEqual(['Undo']);
		await act(async () => (container.querySelector('._msgActionBtn') as HTMLElement).click());
		expect(store().getDataFromPath('Store.pageData.toastPage.undo', [])).toEqual(['a', 'b']);
		expect(runEvent).toHaveBeenCalledTimes(1);
		const [def, , page, , pageDef] = (runEvent as jest.Mock).mock.calls[0];
		expect(def.name).toBe('undoPause');
		expect(page).toBe('toastPage');
		expect(pageDef.name).toBe('toastPage');
		expect(container.querySelector('._message')).toBeNull();
	});

	it('runs an event by its key, and a named function as a one step event', async () => {
		act(() =>
			mod.addMessage(mod.MESSAGE_TYPE.INFORMATION, 'x', true, '', {
				actions: mod.toastActions([
					{ label: 'Open', eventFunction: 'k2' },
					{ label: 'Run', function: 'AdZumpV2.cmpList' },
				]),
				page: 'toastPage',
			}),
		);
		await act(async () =>
			(container.querySelectorAll('._msgActionBtn')[0] as HTMLElement).click(),
		);
		expect((runEvent as jest.Mock).mock.calls[0][0].name).toBe('other');

		act(() =>
			mod.addMessage(mod.MESSAGE_TYPE.INFORMATION, 'y', true, '', {
				actions: mod.toastActions([{ label: 'Run', function: 'AdZumpV2.cmpList' }]),
				page: 'toastPage',
			}),
		);
		await act(async () => (container.querySelector('._msgActionBtn') as HTMLElement).click());
		const step = (runEvent as jest.Mock).mock.calls[1][0].steps.run;
		expect([step.namespace, step.name]).toEqual(['AdZumpV2', 'cmpList']);
	});

	it('keeps a sticky toast past the timeout and drops a plain one', () => {
		act(() =>
			mod.addMessage(mod.MESSAGE_TYPE.ERROR, '2 paused, 1 failed', true, '', {
				sticky: true,
			}),
		);
		add('Saved', mod.MESSAGE_TYPE.SUCCESS);
		expect(container.querySelectorAll('._message')).toHaveLength(2);
		expect(container.querySelector('._message._sticky')).not.toBeNull();
		act(() => {
			jest.advanceTimersByTime(12000);
		});
		const left = Array.from(container.querySelectorAll('._message ._msgString')).map(
			e => e.textContent,
		);
		expect(left).toEqual(['2 paused, 1 failed']);
		act(() => (container.querySelector('._msgCloseIcon') as HTMLElement).click());
		expect(container.querySelector('._message')).toBeNull();
	});

	it('opens the details lines behind a Details button', () => {
		act(() =>
			mod.addMessage(mod.MESSAGE_TYPE.ERROR, '2 paused, 1 failed', true, '', {
				sticky: true,
				details: mod.toastDetails('Broad: Meta refused the change\nCityville: no access'),
			}),
		);
		expect(buttons()).toEqual(['Details']);
		expect(container.querySelector('._msgDetails')).toBeNull();
		act(() => (container.querySelector('._msgDetailsBtn') as HTMLElement).click());
		expect(
			Array.from(container.querySelectorAll('._msgDetails li')).map(l => l.textContent),
		).toEqual(['Broad: Meta refused the change', 'Cityville: no access']);
		expect(buttons()).toEqual(['Hide details']);
	});

	it('keeps only usable actions and printable details', () => {
		expect(
			mod.toastActions([
				{ label: '', eventFunction: 'x' },
				{ label: 'No target' },
				null,
				'Undo',
				new Map<string, any>([
					['label', 'Undo'],
					['eventFunction', 'undoPause'],
				]),
			]),
		).toEqual([{ label: 'Undo', eventFunction: 'undoPause' }]);
		expect(mod.toastActions(undefined)).toEqual([]);
		expect(mod.toastDetails(['a', 2, { x: 1 }, ' '])).toEqual(['a', '2']);
		expect(mod.toastDetails(undefined)).toEqual([]);
	});
});
