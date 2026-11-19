/**
 * Step card (ADZ-2065): one card per turn, drawn like the agent card, with plain
 * words from the server; a failed step is red with one sentence and one action;
 * rememberThinking makes every thinking block open and close together.
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
	GENERIC_FAILED_TEXT,
	StepToolCall,
	buildStepRows,
	cardSeconds,
	mergeStepInfo,
	parseStepInfo,
	stepProgress,
	stepTitle,
} from '../stepCard';
import { StepCard } from '../components/StepCard';
import { ThinkingBlock } from '../components/ThinkingBlock';
import { AgentGroup } from '../components/AgentGroup';
import { WorkSummary } from '../components/WorkSummary';
import { ThinkingScope, ThinkingShared } from '../thinkingShared';
import { workLabel } from '../collapseWork';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const tool = (over: Partial<StepToolCall> & { id: string }): StepToolCall => ({
	toolName: 'products_list',
	displayName: 'List products',
	isRunning: false,
	success: true,
	...over,
});

describe('parseStepInfo and mergeStepInfo', () => {
	it('keeps only words and a complete action', () => {
		expect(parseStepInfo(undefined)).toBeUndefined();
		expect(parseStepInfo({})).toBeUndefined();
		expect(parseStepInfo({ name: ' Reading the product ', live: 3 })).toEqual({
			name: 'Reading the product',
			live: undefined,
			done: undefined,
			failed: undefined,
			action: undefined,
			hidden: undefined,
		});
		expect(parseStepInfo({ failed: 'x', action: { label: 'Retry' } })?.action).toBeUndefined();
		expect(
			parseStepInfo({ failed: 'x', action: { label: 'Retry', message: 'again' } })?.action,
		).toEqual({ label: 'Retry', message: 'again' });
	});

	it('lets the result fold over the start without erasing it', () => {
		const start = parseStepInfo({ name: 'Reading the product', live: 'Opening the site' });
		const end = parseStepInfo({ failed: 'The site did not open.' });
		expect(mergeStepInfo(start, end)).toMatchObject({
			name: 'Reading the product',
			live: 'Opening the site',
			failed: 'The site did not open.',
		});
	});
});

describe('buildStepRows', () => {
	it('uses the server words, never the tool name or its result', () => {
		const { rows } = buildStepRows(
			[
				tool({
					id: 'a',
					step: { name: 'Looking at your products', done: '3 products found' },
				}),
				tool({
					id: 'b',
					isRunning: true,
					step: { name: 'Reading the product', live: 'Opening the site' },
				}),
			],
			[],
		);
		expect(rows.map(r => r.name)).toEqual(['Looking at your products', 'Reading the product']);
		expect(rows[0].line).toBe('3 products found');
		expect(rows[1].line).toBe('Opening the site');
		expect(JSON.stringify(rows)).not.toContain('products_list');
	});

	it('shows the newest live update over the starting line while running', () => {
		const { rows } = buildStepRows(
			[
				tool({
					id: 'a',
					isRunning: true,
					updates: ['one', 'two'],
					step: { name: 'N', live: 'start' },
				}),
			],
			[],
		);
		expect(rows[0].line).toBe('two');
	});

	it('says one plain sentence for a failure, whatever the tool returned', () => {
		const { rows } = buildStepRows([tool({ id: 'a', success: false })], []);
		expect(rows[0].status).toBe('error');
		expect(rows[0].failed).toBe(GENERIC_FAILED_TEXT);
	});

	it("leaves out hidden steps and a helper's own tools; nests helpers under the step that started them", () => {
		const { rows, looseSpans } = buildStepRows(
			[
				tool({ id: 'q', step: { name: 'Quick replies', hidden: true } }),
				tool({ id: 'study', step: { name: 'Reading the product' } }),
				tool({ id: 'inner' }),
			],
			[
				{
					key: 's1',
					label: 'Profile Writer',
					parentToolUseId: 'study',
					status: 'success',
					startedAt: 0,
					durationMs: 3000,
					summary: 'Wrote the profile',
					toolCalls: [{ id: 'inner' }],
				},
				{
					key: 's2',
					label: 'Stray helper',
					status: 'running',
					startedAt: 0,
					toolCalls: [],
				},
			],
		);
		expect(rows.map(r => r.id)).toEqual(['study']);
		expect(rows[0].helpers).toHaveLength(1);
		expect(rows[0].helpers[0]).toMatchObject({
			name: 'Profile Writer',
			line: 'Wrote the profile',
		});
		expect(looseSpans).toEqual(['s2']);
	});

	it('titles and times the card', () => {
		const running = buildStepRows(
			[
				tool({ id: 'a', startedAt: 1000, endedAt: 2000 }),
				tool({ id: 'b', isRunning: true, startedAt: 2000 }),
			],
			[],
		).rows;
		expect(stepTitle(stepProgress(running))).toBe('Working, 1 of 2 done');
		expect(cardSeconds(running, 6000)).toBe(5);

		const failed = buildStepRows(
			[tool({ id: 'a' }), tool({ id: 'b', success: false })],
			[],
		).rows;
		expect(stepTitle(stepProgress(failed))).toBe('Stopped, 1 of 2 done');

		const saved = buildStepRows(
			[tool({ id: 'a', durationMs: 2000 }), tool({ id: 'b', durationMs: 41000 })],
			[],
		).rows;
		expect(stepTitle(stepProgress(saved))).toBe('Finished, 2 steps');
		expect(cardSeconds(saved, Date.now())).toBe(43);
		expect(workLabel(43_000, 4, ', ')).toBe('Worked for 43s, 4 steps');
	});
});

describe('StepCard', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});
	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	const rowsOf = (calls: StepToolCall[]) => buildStepRows(calls, []).rows;
	const q = (sel: string) => container.querySelector(sel) as HTMLElement | null;
	const click = (el: Element | null) =>
		act(() => {
			el!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		});

	it('draws the header, a progress bar and the rows, also for one step', () => {
		act(() =>
			root.render(
				<StepCard
					rows={rowsOf([
						tool({
							id: 'a',
							isRunning: true,
							startedAt: Date.now(),
							step: { name: 'Reading the product', live: 'Opening the site' },
						}),
					])}
				/>,
			),
		);
		expect(q('._agentCardTitle')?.textContent).toBe('Working, 0 of 1 done');
		expect(q('._agentCardProgress')).not.toBeNull();
		expect(q('._agentItemName')?.textContent).toBe('Reading the product');
		expect(q('._agentDoing')?.textContent).toBe('Opening the site');
		expect(q('._agentCardTime')?.textContent).toMatch(/^\d+s$/);
	});

	it('shows a failed step in red words with one action that sends its message', () => {
		const sent: string[] = [];
		act(() =>
			root.render(
				<StepCard
					onAction={m => sent.push(m)}
					rows={rowsOf([
						tool({
							id: 'a',
							success: false,
							step: {
								name: 'Checking your ad accounts',
								failed: 'Your ad account did not answer.',
								action: {
									label: 'Try again',
									message: 'Check my ad accounts again',
								},
							},
						}),
					])}
				/>,
			),
		);
		expect(q('._agentCardProgress')).toBeNull(); // not left in the working state
		expect(q('._agentCard')?.className).toContain('_done');
		expect(q('._stepFailed')?.textContent).toBe('Your ad account did not answer.');
		const btn = q('._stepAction') as HTMLButtonElement;
		expect(btn.textContent).toBe('Try again');
		click(btn);
		expect(sent).toEqual(['Check my ad accounts again']);
	});

	it('offers no button when the server names no action, or the reply is still running', () => {
		act(() =>
			root.render(
				<StepCard
					onAction={() => undefined}
					rows={rowsOf([
						tool({ id: 'a', success: false, step: { name: 'N', failed: 'F' } }),
					])}
				/>,
			),
		);
		expect(q('._stepAction')).toBeNull();
		act(() =>
			root.render(
				<StepCard
					onAction={() => undefined}
					actionsDisabled
					rows={rowsOf([
						tool({
							id: 'a',
							success: false,
							step: {
								name: 'N',
								failed: 'F',
								action: { label: 'Again', message: 'm' },
							},
						}),
					])}
				/>,
			),
		);
		expect((q('._stepAction') as HTMLButtonElement).disabled).toBe(true);
	});

	it('draws a helper as its own indented row with its own time', () => {
		const { rows } = buildStepRows(
			[tool({ id: 'study', step: { name: 'Reading the product' } })],
			[
				{
					key: 's1',
					label: 'Profile Writer',
					parentToolUseId: 'study',
					status: 'success',
					startedAt: 0,
					durationMs: 3000,
					toolCalls: [],
				},
			],
		);
		act(() => root.render(<StepCard rows={rows} />));
		const helper = q('._agentItem._helper')!;
		expect(helper.querySelector('._agentItemName')?.textContent).toBe('Profile Writer');
		expect(helper.querySelector('._agentItemDur')?.textContent).toBe('3s');
	});

	it('opens and closes on a click of its header', () => {
		act(() =>
			root.render(<StepCard rows={rowsOf([tool({ id: 'a', step: { name: 'Looking' } })])} />),
		);
		expect(q('._agentCardBody')).not.toBeNull();
		click(q('._agentCardHead'));
		expect(q('._agentCardBody')).toBeNull();
		click(q('._agentCardHead'));
		expect(q('._agentCardBody')).not.toBeNull();
	});
});

describe('rememberThinking: one state for every thinking block', () => {
	let container: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});
	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	const click = (el: Element | null) =>
		act(() => {
			el!.dispatchEvent(new MouseEvent('click', { bubbles: true }));
		});

	function Page({ shared }: { shared: ThinkingShared | undefined }) {
		const rows = buildStepRows(
			[tool({ id: 'a', step: { name: 'Looking at your products', done: 'Found 3' } })],
			[],
		).rows;
		return (
			<ThinkingScope shared={shared}>
				<ThinkingBlock isActive={false} toolCalls={[]} reasoningContent="some reasoning" />
				<StepCard rows={rows} />
				<AgentGroup
					spans={[
						{
							key: 'k',
							agentId: 'x',
							label: 'Helper',
							parentId: 'root',
							status: 'success',
							startedAt: 0,
							endedAt: 1000,
							toolCalls: [],
						},
					]}
				/>
				<WorkSummary live={false} thinkingText="T" steps={1} hasDetails>
					<div className="_ws">worked</div>
				</WorkSummary>
			</ThinkingScope>
		);
	}

	const opens = () => ({
		thinking: !!container.querySelector('._thinkingReasoning'),
		steps: !!container.querySelector('._stepCard ._agentCardBody'),
		agent: !!container.querySelector('._agentCard:not(._stepCard) ._agentCardBody'),
		work: !!container.querySelector('._ws'),
	});

	it('does nothing different without the prop: each block keeps its own state', () => {
		act(() => root.render(<Page shared={undefined} />));
		const before = opens();
		click(container.querySelector('._thinkingHeader._doneHeader'));
		const after = opens();
		expect(after.thinking).not.toBe(before.thinking);
		expect(after.steps).toBe(before.steps);
		expect(after.agent).toBe(before.agent);
	});

	it('clicking one block opens or closes all of them, and says so to be remembered', () => {
		const calls: boolean[] = [];
		let state: boolean | undefined;
		const shared = (): ThinkingShared => ({
			open: state,
			set: o => {
				calls.push(o);
				state = o;
				act(() => root.render(<Page shared={shared()} />));
			},
		});
		act(() => root.render(<Page shared={shared()} />));

		// A person who has not chosen yet: each block's own default (the step card open, the others folded).
		expect(opens()).toEqual({ thinking: false, steps: true, agent: true, work: false });

		click(container.querySelector('._thinkingHeader._doneHeader')); // any one block
		expect(calls).toEqual([true]);
		expect(opens()).toEqual({ thinking: true, steps: true, agent: true, work: true });

		click(container.querySelector('._stepCard ._agentCardHead')); // another one: closes all
		expect(calls).toEqual([true, false]);
		expect(opens()).toEqual({ thinking: false, steps: false, agent: false, work: false });

		click(container.querySelector('._workSummary ._thinkingHeader')); // opens all again
		expect(calls).toEqual([true, false, true]);
		expect(opens()).toEqual({ thinking: true, steps: true, agent: true, work: true });
	});

	it('restores a remembered choice on load', () => {
		act(() => root.render(<Page shared={{ open: false, set: () => undefined }} />));
		expect(opens()).toEqual({ thinking: false, steps: false, agent: false, work: false });
		act(() => root.render(<Page shared={{ open: true, set: () => undefined }} />));
		expect(opens()).toEqual({ thinking: true, steps: true, agent: true, work: true });
	});
});
