/**
 * The flow view rendered in jsdom with the sample automation (deal created ->
 * WhatsApp -> wait until read, at most 2 days -> IF read: task / otherwise:
 * reminder -> END) and a sample run; plus the page component's store wiring.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

const mockSetData = jest.fn();
const mockStore: Record<string, any> = {};
let mockProps: any = {};

jest.mock('../../../context/StoreContext', () => ({
	__esModule: true,
	getPathFromLocation: (p: any) => (typeof p === 'string' ? p : p?.value),
	getDataFromPath: () => undefined,
	setData: (...args: any[]) => mockSetData(...args),
	addListenerAndCallImmediatelyWithChildrenActivity: (_page: string, cb: any, path: string) => {
		cb(path, mockStore[path]);
		return () => undefined;
	},
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'p' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
}));
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ properties: mockProps, stylePropertiesWithPseudoStates: {} }),
}));
jest.mock('../../../util/styleProcessor', () => ({
	__esModule: true,
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({
	__esModule: true,
	HelperComponent: () => null,
}));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	__esModule: true,
	SubHelperComponent: () => null,
}));
const mockRunEvent = jest.fn();
jest.mock('../../util/runEvent', () => ({
	__esModule: true,
	runEvent: (...a: any[]) => mockRunEvent(...a),
}));
jest.mock('../../util/getTranslations', () => ({
	__esModule: true,
	getTranslations: (s: string) => s,
}));
const mockPost = jest.fn();
jest.mock('axios', () => ({
	__esModule: true,
	default: { post: (...a: any[]) => mockPost(...a), get: jest.fn() },
}));

import { FlowView } from '../FlowView';
import LazyAutomationFlow from '../LazyAutomationFlow';
import { sampleCatalog, sampleDoc, sampleRun } from '../sampleAutomation';
import { AutomationDoc } from '../automationTypes';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLElement;
let root: Root | undefined;

function mount(el: React.ReactElement) {
	root = createRoot(container);
	act(() => root!.render(el));
}

function click(el: Element | null | undefined) {
	if (!el) throw new Error('nothing to click');
	act(() => {
		(el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
	});
}

const card = (key: string) => container.querySelector(`[data-node="${key}"]`) as HTMLElement;

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	mockSetData.mockReset();
	mockRunEvent.mockReset();
	mockPost.mockReset();
});

afterEach(() => {
	if (root) act(() => root!.unmount());
	root = undefined;
	container.remove();
});

describe('FlowView', () => {
	it('reads the automation as sentence cards with Yes and Otherwise lanes', () => {
		mount(<FlowView doc={sampleDoc()} catalog={sampleCatalog()} />);
		expect(card('__trigger').textContent).toContain('WHEN');
		expect(card('__trigger').textContent).toContain('a deal is created');
		expect(card('__trigger').textContent).toContain('where Stage is Won');
		expect(card('step1').textContent).toBe('DOsend the WhatsApp template welcome to Phone');
		expect(card('step2').textContent).toBe(
			'WAITuntil the WhatsApp message is read, at most 2 days',
		);
		expect(card('step3').textContent).toContain('IF');
		const lanes = Array.from(container.querySelectorAll('._afLane')).map(l =>
			l.getAttribute('aria-label'),
		);
		expect(lanes).toEqual(['Yes path', 'Otherwise path']);
		expect(container.querySelector('._afBranch._merged')).not.toBeNull();
		// a path is drawn by its label as a chip
		expect(
			Array.from(card('step1').querySelectorAll('._afChip')).map(c => c.textContent),
		).toEqual(['welcome', 'Phone']);
		// view mode has no editing affordances and the cards are not buttons
		expect(container.querySelector('._afAdd')).toBeNull();
		expect(container.querySelector('button._afCardMain')).toBeNull();
	});

	it('shows a run: states per card and the lane taken', () => {
		mount(
			<FlowView doc={sampleDoc()} catalog={sampleCatalog()} run={sampleRun()} mode="run" />,
		);
		expect(card('step1').textContent).toMatch(/Done \d+ Nov/);
		expect(card('step2').textContent).toMatch(/Happened/);
		expect(card('step5').textContent).toContain('Skipped');
		const [yes, otherwise] = Array.from(container.querySelectorAll('._afLane'));
		expect(yes.className).toContain('_taken');
		expect(yes.getAttribute('aria-label')).toBe('Yes path, taken');
		expect(otherwise.className).toContain('_notTaken');
	});

	it('badges cards the check report names and cards marked changed', () => {
		mount(
			<FlowView
				doc={sampleDoc()}
				catalog={sampleCatalog()}
				check={{ ok: false, errors: [{ node: 'step4', message: 'Choose a title' }] }}
				changed={['step2']}
			/>,
		);
		expect(card('step4').className).toContain('_hasError');
		expect(card('step4').textContent).toContain('Choose a title');
		expect(card('step2').querySelector('._afChangedBadge')?.textContent).toBe('changed');
	});

	it('edits: "+" inserts a step, cards select, remove reconnects', () => {
		let latest: AutomationDoc | undefined;
		let selectedNew: string | undefined;
		const clicked: string[] = [];
		mount(
			<FlowView
				doc={sampleDoc()}
				catalog={sampleCatalog()}
				mode="edit"
				onDocChange={(d, k) => {
					latest = d;
					selectedNew = k;
				}}
				onCardClick={k => clicked.push(k)}
			/>,
		);
		const adds = container.querySelectorAll('._afAdd');
		expect(adds.length).toBeGreaterThan(5);
		click(adds[0]);
		const menu = container.querySelector('[role="menu"]')!;
		const labels = Array.from(menu.querySelectorAll('[role="menuitem"]')).map(
			b => b.textContent,
		);
		// End is not offered between WHEN and the first step: it would cut the flow
		expect(labels).toEqual(['Do something', 'Wait', 'Check', 'Do at the same time']);
		click(Array.from(menu.querySelectorAll('button')).find(b => b.textContent === 'Wait'));
		expect(selectedNew).toBe('step7');
		expect(latest?.start).toBe('step7');
		expect(latest?.nodes?.step7?.type).toBe('WAIT');

		click(card('step2').querySelector('button._afCardMain'));
		expect(clicked).toEqual(['step2']);

		click(card('step2').querySelector('button[aria-label^="Remove"]'));
		expect(latest?.nodes?.step2).toBeUndefined();
		expect(latest?.transitions).toContainEqual({ from: 'step1', to: 'step3' });
	});
});

describe('AutomationFlow page component', () => {
	const base: any = {
		definition: {
			key: 'af',
			name: 'af',
			type: 'AutomationFlow',
			bindingPath: 'Page.automation',
			bindingPath2: 'Page.catalog',
			bindingPath5: 'Page.selected',
		},
		context: { pageName: 'p' },
		pageDefinition: {
			componentDefinition: {},
			translations: {},
			eventFunctions: { save: { name: 'save' }, picked: { name: 'picked' } },
		},
		locationHistory: [],
	};

	beforeEach(() => {
		mockStore['Page.automation'] = sampleDoc();
		mockStore['Page.catalog'] = sampleCatalog();
		mockStore['Page.selected'] = undefined;
	});

	it('writes the edited document back, then runs On Change', async () => {
		mockProps = { mode: 'edit', onChange: 'save', onCardClick: 'picked' };
		mount(<LazyAutomationFlow {...base} />);
		click(card('step1').querySelector('button[aria-label^="Remove"]'));
		const [path, value] = mockSetData.mock.calls[0];
		expect(path).toBe('Page.automation');
		expect(value.start).toBe('step2');
		expect(mockRunEvent).toHaveBeenCalledWith(
			{ name: 'save' },
			'save',
			'p',
			[],
			base.pageDefinition,
		);
	});

	it('writes the clicked card to the selection binding, then runs On Card Click', () => {
		mockProps = { mode: 'view', onCardClick: 'picked' };
		mount(<LazyAutomationFlow {...base} />);
		click(card('step3').querySelector('button._afCardMain'));
		expect(mockSetData).toHaveBeenCalledWith('Page.selected', 'step3', 'p');
		expect(mockRunEvent.mock.calls[0][1]).toBe('picked');
	});

	it('opens the side panel for the selected card in edit mode', () => {
		mockStore['Page.selected'] = 'step2';
		mockProps = { mode: 'edit' };
		mount(<LazyAutomationFlow {...base} />);
		const panel = container.querySelector('._afPanel')!;
		expect(panel).not.toBeNull();
		expect(panel.textContent).toContain('Until something happens');
		const radios = Array.from(
			panel.querySelectorAll('input[type="radio"]'),
		) as HTMLInputElement[];
		expect(radios.map(r => r.checked)).toEqual([false, false, true]);
	});
	it('panel edits write the document at once and run On Change after a pause', () => {
		jest.useFakeTimers();
		try {
			mockStore['Page.selected'] = 'step4';
			mockProps = { mode: 'edit', onChange: 'save' };
			mount(<LazyAutomationFlow {...base} />);
			const input = container.querySelector(
				'._afPanel ._afVarInput input',
			) as HTMLInputElement;
			expect(input.value).toBe('Call {{trigger.leadName}}');
			const setter = Object.getOwnPropertyDescriptor(
				HTMLInputElement.prototype,
				'value',
			)!.set!;
			act(() => {
				setter.call(input, 'Call back');
				input.dispatchEvent(new Event('input', { bubbles: true }));
			});
			const [path, value] = mockSetData.mock.calls[0];
			expect(path).toBe('Page.automation');
			expect(value.nodes.step4.params.title).toBe('Call back');
			expect(mockRunEvent).not.toHaveBeenCalled();
			act(() => {
				jest.advanceTimersByTime(1000);
			});
			expect(mockRunEvent.mock.calls[0][1]).toBe('save');
		} finally {
			jest.useRealTimers();
		}
	});

	it('loads picker options once through the function execute route', async () => {
		const catalog = sampleCatalog();
		catalog.actions![0].params![0].options = { namespace: 'LZ', name: 'Templates' };
		mockStore['Page.catalog'] = catalog;
		mockPost.mockResolvedValue({
			data: [
				{
					name: 'output',
					result: { options: [{ label: 'Welcome to Skyline', value: 'welcome' }] },
				},
			],
		});
		mockProps = { mode: 'view' };
		mount(<LazyAutomationFlow {...base} />);
		await act(async () => {
			await Promise.resolve();
			await Promise.resolve();
		});
		expect(mockPost).toHaveBeenCalledTimes(1);
		expect(mockPost.mock.calls[0][0]).toBe('api/core/function/execute/LZ/Templates');
		expect(card('step1').textContent).toContain('Welcome to Skyline');
	});
});
