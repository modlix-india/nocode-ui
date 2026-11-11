/**
 * Collapse Work (CXZ-1781): a reply shows one folded line ("Thinking..." while
 * the agent works, "Worked for 12s · 4 steps" after) and under it only the
 * answer: the text written after the last tool. The line opens to the working.
 * A failed reply shows a friendly line; the raw error sits in the working.
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import {
	DEFAULT_ERROR_TEXT,
	answerStartAfter,
	formatDuration,
	splitWork,
	workLabel,
} from '../collapseWork';
import { WorkSummary } from '../components/WorkSummary';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

/** Feed text chunks the way LazyPrompt does; `null` stands for a tool running. */
function stream(events: Array<string | null>) {
	let content = '';
	let answerFrom: number | undefined;
	let toolRan = false;
	for (const ev of events) {
		if (ev === null) {
			toolRan = true;
			continue;
		}
		const afterTool = toolRan;
		toolRan = false;
		const gap = afterTool && content && !/\s$/.test(content) && !/^\s/.test(ev) ? '\n\n' : '';
		const from = answerStartAfter(content + gap, ev, afterTool);
		if (afterTool && from === undefined) toolRan = true;
		if (from !== undefined) answerFrom = from;
		content = content + gap + ev;
	}
	return { content, answerFrom };
}

describe('splitWork', () => {
	it('shows the whole reply as the answer when no tool ran', () => {
		const msg = stream(['You have ', '3 products.']);
		expect(splitWork(msg, false, DEFAULT_ERROR_TEXT)).toEqual({
			work: '',
			answer: 'You have 3 products.',
		});
	});

	it('folds the text written before the last tool into the working', () => {
		const msg = stream([
			'Let me look that up.',
			null,
			'Checking the cases too.',
			null,
			'You have **3 products**: ',
			'2 active, 1 draft.',
		]);
		const { work, answer } = splitWork(msg, false, DEFAULT_ERROR_TEXT);
		expect(answer).toBe('You have **3 products**: 2 active, 1 draft.');
		expect(work).toContain('Let me look that up.');
		expect(work).toContain('Checking the cases too.');
		expect(work).not.toContain('3 products');
	});

	it('keeps the last answer when a tool runs after it with nothing written', () => {
		const msg = stream(['Let me check.', null, 'Here is the table.', null]);
		expect(splitWork(msg, false, DEFAULT_ERROR_TEXT).answer).toBe('Here is the table.');
	});

	it('does not let blank text after a tool start the answer', () => {
		expect(splitWork(stream(['Looking.', null, '\n', 'The answer.']), false, '').answer).toBe(
			'The answer.',
		);
		expect(splitWork(stream(['The answer.', null, '  ']), false, '').answer).toBe(
			'The answer.',
		);
	});

	it('keeps everything in the working while the reply is still running', () => {
		const msg = stream(['Let me check.', null, 'Partial answ']);
		expect(splitWork(msg, true, DEFAULT_ERROR_TEXT)).toEqual({
			work: msg.content,
			answer: '',
		});
	});

	it('answers a failed reply with the friendly error and folds its text away', () => {
		const msg = { content: 'Let me look.', failed: true };
		expect(splitWork(msg, false, 'Something went wrong.')).toEqual({
			work: 'Let me look.',
			answer: 'Something went wrong.',
		});
		expect(splitWork(msg, false, '').answer).toBe(DEFAULT_ERROR_TEXT);
	});

	it('shows a history reply (no answer start) whole', () => {
		expect(splitWork({ content: ' Done. ' }, false, '').answer).toBe('Done.');
	});
});

describe('workLabel', () => {
	it('says how long and how many steps, in plain words', () => {
		expect(workLabel(12_300, 4)).toBe('Worked for 12s · 4 steps');
		expect(workLabel(125_000, 1)).toBe('Worked for 2m 5s · 1 step');
		expect(workLabel(3_000, 0)).toBe('Worked for 3s');
		expect(workLabel(undefined, 3)).toBe('Worked through 3 steps');
		expect(workLabel(undefined, 0)).toBe('Details');
		expect(formatDuration(120_000)).toBe('2m');
	});
});

describe('WorkSummary', () => {
	let container: HTMLDivElement;
	let root: Root;

	const render = (props: Partial<React.ComponentProps<typeof WorkSummary>>) =>
		act(() =>
			root.render(
				<WorkSummary
					live={false}
					thinkingText="Thinking..."
					steps={2}
					hasDetails
					{...props}
				>
					<div className="_steps">Tool(List Products)</div>
				</WorkSummary>,
			),
		);
	const header = () => container.querySelector('button') as HTMLButtonElement;
	const click = () =>
		act(() => header().dispatchEvent(new MouseEvent('click', { bubbles: true })));

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
		root = createRoot(container);
	});

	afterEach(() => {
		act(() => root.unmount());
		container.remove();
	});

	it('shows "Thinking..." folded while live, and opens to the steps', () => {
		render({ live: true });
		expect(header().textContent).toBe('Thinking...');
		expect(container.querySelector('._steps')).toBeNull();
		click();
		expect(container.querySelector('._steps')?.textContent).toBe('Tool(List Products)');
	});

	it('folds again when the turn ends, with a summary that names no tools', () => {
		render({ live: true });
		click();
		render({ live: false });
		expect(container.querySelector('._steps')).toBeNull();
		expect(header().textContent).toMatch(/^Worked for \d+s · 2 steps$/);
		expect(header().textContent).not.toContain('List Products');
	});

	it('takes the duration from history, folded by default', () => {
		render({ durationMs: 12_000, steps: 4 });
		expect(header().textContent).toBe('Worked for 12s · 4 steps');
		expect(header().getAttribute('aria-expanded')).toBe('false');
		expect(container.querySelector('._steps')).toBeNull();
	});

	it('draws nothing for a finished reply with nothing to open', () => {
		render({ hasDetails: false, steps: 0 });
		expect(container.innerHTML).toBe('');
	});

	it('shows a plain "Thinking..." line with nothing to open before the reply starts', () => {
		render({ live: true, hasDetails: false, steps: 0 });
		expect(header().textContent).toBe('Thinking...');
		expect(container.querySelector('._thinkingChevron')).toBeNull();
		click();
		expect(container.querySelector('._steps')).toBeNull();
	});
});
