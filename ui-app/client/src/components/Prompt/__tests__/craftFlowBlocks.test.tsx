/**
 * The `flow` and `kirun` craft blocks: the contract agreed with the agent side
 * (see FlowCraftBlock.tsx and KirunCraftBlock.tsx), drawn inline in a message
 * and in the craft side panel.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

jest.mock('../../../context/StoreContext', () => ({
	__esModule: true,
	getDataFromPath: () => 'token',
}));
const mockGet = jest.fn();
jest.mock('axios', () => ({
	__esModule: true,
	default: { post: jest.fn(), get: (...a: any[]) => mockGet(...a) },
}));
jest.mock('../../KIRunEditor/LazyKIRunEditor', () => ({
	__esModule: true,
	default: (p: any) => (
		<div data-testid="kirunEditor">
			{p.functionDefinition?.name}|{String(p.definition.properties.readOnly.value)}|
			{p.definition.properties.editorType.value}
		</div>
	),
}));
jest.mock('../../HelperComponents/SubHelperComponent', () => ({
	__esModule: true,
	SubHelperComponent: () => null,
}));
jest.mock('../../../util/googleMapsLoader', () => ({
	__esModule: true,
	loadGoogleMaps: jest.fn(),
}));
jest.mock('../../util/useSecureSrc', () => ({ __esModule: true, SecureImg: () => null }));

import { CraftContext, CraftContextValue } from '../components/craftContext';
import FlowCraftBlock, { aboutStep } from '../components/FlowCraftBlock';
import KirunCraftBlock from '../components/KirunCraftBlock';
import { CraftRenderer } from '../components/CraftRenderer';
import { sampleCatalog, sampleDoc, sampleRun } from '../../AutomationFlow/sampleAutomation';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let container: HTMLElement;
let root: Root | undefined;

function ctx(over: Partial<CraftContextValue> = {}): CraftContextValue {
	return {
		sessionId: 's1',
		agentEndpoint: '/api/ai/x',
		onSend: jest.fn(async () => undefined),
		getAuthHeaders: () => ({}),
		onSeedInput: jest.fn(),
		onOpenPanel: jest.fn(),
		host: { context: { pageName: 'p' }, pageDefinition: {} as any, locationHistory: [] },
		...over,
	};
}

function mount(el: React.ReactElement, value: CraftContextValue) {
	root = createRoot(container);
	act(() => root!.render(<CraftContext.Provider value={value}>{el}</CraftContext.Provider>));
}

function click(el: Element | null | undefined) {
	if (!el) throw new Error('nothing to click');
	act(() => {
		(el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
	});
}

const button = (label: string) =>
	Array.from(container.querySelectorAll('button')).find(b => b.textContent === label);

beforeEach(() => {
	container = document.createElement('div');
	document.body.appendChild(container);
	mockGet.mockReset();
});

afterEach(() => {
	if (root) act(() => root!.unmount());
	root = undefined;
	container.remove();
});

describe('flow block', () => {
	const block = {
		automation: sampleDoc(),
		catalog: sampleCatalog(),
		changed: ['step4'],
		actions: [
			{ label: 'Test', prompt: 'Run a test of this automation' },
			{ label: 'Publish', prompt: 'Publish this automation' },
		],
	};

	it('draws compact inline cards with the agent buttons and an Open', () => {
		const value = ctx({ inline: true });
		mount(<FlowCraftBlock {...block} />, value);
		expect(container.querySelector('.compAutomationFlow ._afRoot._compact')).not.toBeNull();
		expect(container.textContent).toContain('a deal is created');
		expect(container.querySelector('[data-node="step4"] ._afChangedBadge')?.textContent).toBe(
			'changed',
		);
		click(button('Publish'));
		expect(value.onSend).toHaveBeenCalledWith('Publish this automation', undefined, 'Publish');
		click(button('Open'));
		expect(value.onOpenPanel).toHaveBeenCalled();
	});

	it('puts a reference to the clicked step into the chat input', () => {
		const value = ctx();
		mount(<FlowCraftBlock {...block} />, value);
		click(container.querySelector('[data-node="step2"] button._afCardMain'));
		expect(value.onSeedInput).toHaveBeenCalledWith(
			'About the step "Wait until the WhatsApp message is read, at most 2 days": ',
		);
		// in the panel it is full size and has no Open
		expect(container.querySelector('._afRoot._compact')).toBeNull();
		expect(button('Open')).toBeUndefined();
	});

	it('uses a step title when it has one', () => {
		const doc = sampleDoc();
		doc.nodes!.step4.title = 'Call task';
		expect(aboutStep(doc, 'step4', 'Create a task')).toBe('About the step "Call task": ');
	});

	it('shows a run when given one', () => {
		mount(<FlowCraftBlock {...block} run={sampleRun()} mode="run" />, ctx());
		expect(container.querySelector('[data-node="step5"]')?.textContent).toContain('Skipped');
	});
});

describe('kirun block', () => {
	const block = {
		namespace: 'LeadZump',
		name: 'sendWhatsAppTemplate',
		isServer: true,
		appCode: 'leadzumptwo',
		summary: ['Find the deal.', 'Send the template to its phone.'],
	};

	it('is a one-line chip inline that opens the panel', () => {
		const value = ctx({ inline: true });
		mount(<KirunCraftBlock {...block} />, value);
		expect(container.textContent).toBe('Function: sendWhatsAppTemplate · View');
		click(button('View'));
		expect(value.onOpenPanel).toHaveBeenCalled();
	});

	it('shows the summary first and the read only editor on the technical tab', async () => {
		mockGet.mockResolvedValue({
			data: { definition: { name: 'sendWhatsAppTemplate', steps: {} } },
		});
		mount(<KirunCraftBlock {...block} />, ctx());
		const tabs = Array.from(container.querySelectorAll('[role="tab"]'));
		expect(tabs.map(t => t.getAttribute('aria-selected'))).toEqual(['true', 'false']);
		expect(Array.from(container.querySelectorAll('ol li')).map(l => l.textContent)).toEqual(
			block.summary,
		);
		click(button('Technical view'));
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(mockGet).toHaveBeenCalledWith('api/core/functions/repositoryFind', {
			params: {
				appCode: 'leadzumptwo',
				namespace: 'LeadZump',
				name: 'sendWhatsAppTemplate',
				includeKIRunRepos: true,
			},
			headers: { Authorization: 'token', appCode: 'leadzumptwo' },
		});
		expect(container.querySelector('[data-testid="kirunEditor"]')?.textContent).toBe(
			'sendWhatsAppTemplate|true|core',
		);
	});

	it('does not fetch when the block carries the definition', async () => {
		mount(
			<KirunCraftBlock {...block} isServer={false} definition={{ name: 'pageFn' }} />,
			ctx(),
		);
		click(button('Technical view'));
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(mockGet).not.toHaveBeenCalled();
		expect(container.querySelector('[data-testid="kirunEditor"]')?.textContent).toBe(
			'pageFn|true|ui',
		);
	});
});

describe('CraftRenderer', () => {
	it('dispatches the new block types', async () => {
		root = createRoot(container);
		await act(async () => {
			root!.render(
				<CraftRenderer
					blocks={[{ type: 'kirun', name: 'fnA', summary: ['One.'] }]}
					definition={{ key: 'k', name: 'n', type: 'Prompt' } as any}
					sessionId={null}
					agentEndpoint=""
					onSend={async () => undefined}
					getAuthHeaders={() => ({})}
					inline
					onOpenPanel={() => undefined}
				/>,
			);
		});
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(container.textContent).toContain('Function: fnA');
	});
});
