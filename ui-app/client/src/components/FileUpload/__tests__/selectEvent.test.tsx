/**
 * FileUpload select event (LZT-2418): the event runs after the chosen file is in the binding, so it reads the new
 * file; it runs for a dropped file too; and it does not run for a file refused as too big.
 * STUBBED: the store, styles, helper overlays, validation and messages.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const calls: string[] = [];
const store: Record<string, any> = {};
jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'p' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListenerAndCallImmediately: () => () => {},
	getPathFromLocation: (b: any) => b.value,
	setData: (path: string, v: any) => {
		if (path.startsWith('Store.validations')) return;
		store[path] = v;
		calls.push('set ' + path);
	},
}));
jest.mock('../../util/runEvent', () => ({
	runEvent: async () => {
		calls.push('event sees ' + (store['Page.file']?.name ?? 'nothing'));
	},
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({ SubHelperComponent: () => null }));
jest.mock('../../../util/validationProcessor', () => ({ validate: () => [] }));
const messages: string[] = [];
jest.mock('../../../App/Messages/Messages', () => ({
	MESSAGE_TYPE: { ERROR: 'ERROR' },
	addMessage: (_t: string, m: string) => messages.push(m),
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ properties, key: 'fu', stylePropertiesWithPseudoStates: {} }),
}));

import FileUpload from '../LazyFileUpload';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
	calls.length = 0;
	messages.length = 0;
	Object.keys(store).forEach(k => delete store[k]);
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	properties = {
		uploadViewType: '_droparea_design1',
		uploadType: 'FILE_OBJECT',
		isMultiple: false,
		maxFileSize: 1000,
		onSelectEvent: 'ev1',
		buttonText: 'Choose a file',
	};
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
});

const render = () =>
	act(() => {
		root.render(
			<FileUpload
				definition={{ key: 'fu', bindingPath: { value: 'Page.file' } } as any}
				context={{ pageName: 'p' } as any}
				locationHistory={[]}
				pageDefinition={{ eventFunctions: { ev1: { name: 'ev1', steps: {} } } } as any}
			/>,
		);
	});

const fileList = (f: File) => ({ 0: f, length: 1, item: () => f }) as unknown as FileList;
const flush = () => act(async () => await new Promise(r => setTimeout(r, 0)));

test('the select event runs after the chosen file is bound', async () => {
	render();
	const input = host.querySelector('input[type="file"]') as HTMLInputElement;
	Object.defineProperty(input, 'files', { value: fileList(new File(['abc'], 'a.jpg')) });
	await act(async () => {
		input.dispatchEvent(new Event('change', { bubbles: true }));
	});
	await flush();
	expect(calls).toEqual(['set Page.file', 'event sees a.jpg']);
});

test('a dropped file is bound and runs the select event', async () => {
	render();
	const area =
		host.querySelector('._dropArea, [class*="drop"], ._droparea_design1') ??
		host.firstElementChild!;
	const ev = new Event('drop', { bubbles: true, cancelable: true }) as any;
	ev.dataTransfer = { files: fileList(new File(['abc'], 'b.pdf')) };
	await act(async () => {
		area.dispatchEvent(ev);
	});
	await flush();
	expect(calls).toEqual(['set Page.file', 'event sees b.pdf']);
});

test('a file refused as too big does not run the select event', async () => {
	render();
	const input = host.querySelector('input[type="file"]') as HTMLInputElement;
	Object.defineProperty(input, 'files', {
		value: fileList(new File(['x'.repeat(2000)], 'big.mp4')),
	});
	await act(async () => {
		input.dispatchEvent(new Event('change', { bubbles: true }));
	});
	await flush();
	expect(calls).toEqual([]);
	expect(messages[0]).toContain('big.mp4');
});
