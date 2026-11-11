/**
 * KIRun editor Show Debug Runs (opt-in): lists the stored server runs of a core function by day,
 * and a picked run's log feeds the editor's trace view. Without the property nothing changes.
 *
 * REAL: LazyKIRunEditor, DebugRunsPanel, debugRunsApi. STUBBED: axios (the core API), the store,
 * kirun-ui's editor (records its props), repositories, helpers and style processing.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const axiosGet = jest.fn();
jest.mock('axios', () => ({ __esModule: true, default: { get: (...a: any[]) => axiosGet(...a) } }));

const editorProps: any[] = [];
jest.mock('@fincity/kirun-ui', () => ({
	KIRunEditor: (p: any) => {
		editorProps.push(p);
		return null;
	},
	correctStatementNames: (d: any) => d,
}));
jest.mock('../../../functions', () => ({
	registerUIEngineFunctionDocs: () => undefined,
	UIFunctionRepository: class {},
}));
jest.mock('../../../schemas/common', () => ({ UISchemaRepository: class {} }));
jest.mock('../../../App/usedComponents', () => ({ usedComponents: { using: () => () => {} } }));
jest.mock('../../../Engine/RemoteRepository', () => ({
	RemoteRepository: {
		getRemoteFunctionRepository: () => ({}),
		getRemoteSchemaRepository: () => ({}),
	},
	REPO_SERVER: { UI: 'UI', CORE: 'CORE' },
}));
const FN_DEF = { namespace: 'Orders', name: 'place', steps: {} };
jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'testpage' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListenerAndCallImmediatelyWithChildrenActivity: (_p: string, cb: any, path: string) => {
		if (path === 'Page.fn') cb(path, FN_DEF);
		return () => {};
	},
	getPathFromLocation: (bp: any) => bp?.value ?? bp,
	getDataFromPath: () => 'token-1',
	setData: () => undefined,
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));
jest.mock('../utils', () => ({
	normalizeParameterTypes: (d: any) => d,
	PAGE_STORES: [],
	savePersonalizationCurry: () => () => {},
	withDefaultPreferences: (p: any) => p,
}));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ properties, stylePropertiesWithPseudoStates: {} }),
}));

import LazyKIRunEditor from '../LazyKIRunEditor';

const DAYS = [
	{ day: '2026-11-11', runs: 2, errored: 1 },
	{ day: '2026-11-10', runs: 1, errored: 0 },
];
const RUNS = {
	content: [
		{
			id: 'r1',
			debugId: 'abc123',
			appCode: 'shop',
			clientCode: 'FIN',
			namespace: 'Orders',
			name: 'place',
			userId: 7,
			userName: 'Asha Rao',
			errored: true,
			durationMs: 42,
			startedAt: 1794391200,
		},
	],
	totalElements: 1,
	number: 0,
	size: 20,
};
const RUN = {
	...RUNS.content[0],
	log: {
		executionId: 'e1',
		startTime: 1,
		errored: true,
		truncated: true,
		definitions: {},
		logs: [
			{
				statementName: 'call',
				functionName: 'Http',
				arguments: { key: '****' },
				result: {},
				truncated: true,
				children: [],
			},
		],
	},
};

function route(url: string) {
	if (url.endsWith('/debugRuns/days')) return DAYS;
	if (url.endsWith('/debugRuns')) return RUNS;
	if (url.endsWith('/debugRuns/r1')) return RUN;
	throw new Error(url);
}

let container: HTMLDivElement;
let root: Root;

async function flush() {
	for (let i = 0; i < 5; i++) await act(async () => await Promise.resolve());
}

function render() {
	root = createRoot(container);
	act(() => {
		root.render(
			<LazyKIRunEditor
				definition={{
					key: 'ed',
					name: 'ed',
					type: 'KIRunEditor',
					bindingPath: { type: 'VALUE', value: 'Page.fn' },
				}}
				pageDefinition={{ eventFunctions: {}, translations: {} } as any}
				locationHistory={[]}
				context={{ pageName: 'testpage' } as any}
			/>,
		);
	});
}

function button(text: string) {
	return Array.from(container.querySelectorAll('button')).find(b => b.textContent === text)!;
}

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	editorProps.length = 0;
	axiosGet.mockReset();
	axiosGet.mockImplementation((url: string) => Promise.resolve({ data: route(url) }));
	properties = { editorType: 'core', appCode: 'shop', clientCode: 'FIN', showDebugRuns: true };
});
afterEach(() => {
	act(() => root.unmount());
	container.remove();
});

describe('KIRun editor debug runs', () => {
	it('lists days and that day runs from the API', async () => {
		render();
		act(() => button('Debug runs').click());
		await flush();
		const days = container.querySelectorAll('[data-testid="debugRunsDay"]');
		expect(days).toHaveLength(2);
		expect(days[0].textContent).toContain('2 runs');
		expect(days[0].textContent).toContain('1 failed');
		const runs = container.querySelectorAll('[data-testid="debugRunsRun"]');
		expect(runs).toHaveLength(1);
		expect(runs[0].textContent).toContain('Asha Rao');
		expect(runs[0].textContent).toContain('42 ms');
		expect(runs[0].textContent).toContain(new Date(1794391200 * 1000).toLocaleTimeString());
		expect(runs[0].textContent).toContain('Failed');
		expect(runs[0].textContent).toContain('abc123');
		expect(axiosGet.mock.calls[0][1].params).toEqual({
			appCode: 'shop',
			clientCode: 'FIN',
			namespace: 'Orders',
			name: 'place',
		});
		expect(axiosGet.mock.calls[0][1].headers.Authorization).toBe('token-1');
		expect(axiosGet.mock.calls[1][1].params).toMatchObject({
			day: '2026-11-11',
			page: 0,
			size: 20,
		});
	});

	it('feeds a picked run log to the trace view', async () => {
		render();
		act(() => button('Debug runs').click());
		await flush();
		act(() => (container.querySelector('[data-testid="debugRunsRun"]') as HTMLElement).click());
		await flush();
		const last = editorProps[editorProps.length - 1];
		expect(last.debugViewMode).toBe(true);
		expect(last.readOnly).toBe(true);
		expect(last.executionLog.executionId).toBe('e1');
		expect(last.executionLog.logs[0].arguments.key).toBe('****');
		expect(
			container.querySelector('[data-testid="debugRunsTruncated"]')!.textContent,
		).toContain('call');
		expect(container.textContent).toContain('hidden secrets');
		expect(container.textContent).toContain('too large to keep whole');
		act(() => button('Back to editing').click());
		expect(editorProps[editorProps.length - 1].debugViewMode).toBe(false);
	});

	it('shows a plain message on 403', async () => {
		axiosGet.mockImplementation(() => Promise.reject({ response: { status: 403 } }));
		render();
		act(() => button('Debug runs').click());
		await flush();
		expect(container.querySelector('[data-testid="debugRunsMessage"]')!.textContent).toBe(
			'You do not have access to the debug runs of this function.',
		);
	});

	it('says so when the server does not store runs yet (404)', async () => {
		axiosGet.mockImplementation(() => Promise.reject({ response: { status: 404 } }));
		render();
		act(() => button('Debug runs').click());
		await flush();
		expect(container.querySelector('[data-testid="debugRunsMessage"]')!.textContent).toBe(
			'This server does not store debug runs yet.',
		);
	});

	it('explains when there are no runs', async () => {
		axiosGet.mockImplementation(() => Promise.resolve({ data: [] }));
		render();
		act(() => button('Debug runs').click());
		await flush();
		expect(container.querySelector('[data-testid="debugRunsEmpty"]')!.textContent).toContain(
			'debug mode is on',
		);
	});

	it('is unchanged without the property', async () => {
		properties = { editorType: 'core', appCode: 'shop', clientCode: 'FIN' };
		render();
		await flush();
		expect(button('Debug runs')).toBeUndefined();
		expect(axiosGet).not.toHaveBeenCalled();
		const last = editorProps[editorProps.length - 1];
		expect(last.debugViewMode).toBe(false);
		expect(last.executionLog).toBeUndefined();
	});

	it('stays off for a UI editor even with the property', async () => {
		properties = { editorType: 'ui', showDebugRuns: true };
		render();
		await flush();
		expect(button('Debug runs')).toBeUndefined();
	});
});
