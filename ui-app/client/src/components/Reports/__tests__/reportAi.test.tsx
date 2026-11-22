/**
 * The AI report builder client (CONTRACT 11) against SSE fixtures in the event format of
 * section 11: the stream parser, the Ask AI box in the editor (status, question buttons, the
 * spec loaded into the shelves with its summary, follow-ups carrying the current spec), and
 * `?spec=` links.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef(() => <div className="fakeChart" />),
}));

import { FIXTURE_CATALOG, fixtureTransport } from '../fixtures/reportFixtures';
import {
	AiEvent,
	aiUrl,
	specFromQuery,
	specToQuery,
	streamReportBuild,
	toAiEvent,
} from '../reportAi';
import { clearCatalogCache } from '../reportApi';
import { ReportSpec } from '../reportTypes';
import type { AiGroup } from '../reportAi';
import { ReportEditorView } from '../ui/ReportEditorView';

const LINE_SPEC: ReportSpec = {
	v: 1,
	source: 'cases',
	segment: 'bookings',
	measures: [{ fn: 'COUNT', as: 'bookings' }],
	groupBy: [{ field: 'assignedUserId', as: 'rm' }],
	view: { type: 'BAR', x: 'rm', y: ['bookings'], title: 'Bookings by RM' },
};

/** A fetch answering SSE text in the given chunks, recording each request body. */
function sseFetch(answers: string[][], bodies: any[] = []) {
	let i = 0;
	const enc = new TextEncoder();
	return jest.fn(async (_url: any, init: any) => {
		bodies.push(JSON.parse(init.body));
		const chunks = answers[Math.min(i++, answers.length - 1)];
		let k = 0;
		return {
			ok: true,
			status: 200,
			body: {
				getReader: () => ({
					read: async () =>
						k < chunks.length
							? { done: false, value: enc.encode(chunks[k++]) }
							: { done: true, value: undefined },
				}),
			},
		} as any;
	});
}

const ev = (type: string, data: any) => `event: ${type}\ndata: ${JSON.stringify(data)}\n\n`;

describe('events', () => {
	it('named events, and unnamed ones with a type', () => {
		expect(toAiEvent('status', '{"message":"Reading your data"}')).toEqual({
			type: 'status',
			message: 'Reading your data',
		});
		expect(
			toAiEvent(
				'message',
				'{"type":"question","question":"Count or value?","options":["Count","Value"]}',
			),
		).toEqual({
			type: 'question',
			question: 'Count or value?',
			options: ['Count', 'Value'],
		});
		expect(
			toAiEvent(
				'spec',
				JSON.stringify({
					spec: LINE_SPEC,
					summary: 'S',
					group: { id: 'dashboard', label: 'Dashboard', kind: 'app', new: false },
					period: { from: '2026-10-01', to: '2026-12-31', label: 'This quarter' },
				}),
			),
		).toEqual({
			type: 'spec',
			spec: LINE_SPEC,
			summary: 'S',
			group: { id: 'dashboard', label: 'Dashboard', kind: 'app' },
			period: { from: '2026-10-01', to: '2026-12-31', label: 'This quarter' },
		});
		// A NEW group is only a label; the page makes it after the user confirms.
		expect(
			toAiEvent(
				'spec',
				JSON.stringify({
					spec: LINE_SPEC,
					summary: 'S',
					group: { label: 'Sales', new: true },
				}),
			),
		).toMatchObject({ group: { label: 'Sales', new: true } });
		expect(toAiEvent('error', '{"message":"No credits","code":"BILLING"}')).toEqual({
			type: 'error',
			message: 'No credits',
			code: 'BILLING',
		});
		expect(toAiEvent('done', '{"ok":true,"ms":900,"attempts":1}')).toMatchObject({
			type: 'done',
			info: { ok: true, ms: 900 },
		});
		expect(toAiEvent('spec', '{"spec":{}}')).toMatchObject({ type: 'error' });
		expect(toAiEvent('ping', '')).toBeUndefined();
		expect(toAiEvent('done', '')).toEqual({ type: 'done' });
		expect(toAiEvent('done', '{}')).toEqual({ type: 'done' });
	});

	it('streams chunks split anywhere, ends with one done; a failing status is an error', async () => {
		const text =
			ev('status', { message: 'Thinking' }) +
			ev('spec', { spec: LINE_SPEC, summary: 'S' }) +
			ev('done', {});
		const got: AiEvent[] = [];
		await streamReportBuild('/x', { prompt: 'p' }, e => got.push(e), {
			fetchImpl: sseFetch([[text.slice(0, 7), text.slice(7, 60), text.slice(60)]]),
		});
		expect(got.map(e => e.type)).toEqual(['status', 'spec', 'done']);

		const bad: AiEvent[] = [];
		await streamReportBuild('/x', { prompt: 'p' }, e => bad.push(e), {
			fetchImpl: jest.fn(async () => ({
				ok: false,
				status: 503,
				json: async () => ({ detail: 'Busy' }),
			})) as any,
		});
		expect(bad).toEqual([{ type: 'error', message: 'Busy' }, { type: 'done' }]);

		const missing: AiEvent[] = [];
		await streamReportBuild('/x', { prompt: 'p' }, e => missing.push(e), {
			fetchImpl: jest.fn(async () => ({
				ok: false,
				status: 404,
				json: async () => ({ detail: 'Not Found' }),
			})) as any,
		});
		expect(missing[0]).toEqual({
			type: 'error',
			message: 'The AI report builder is not available here yet.',
		});
	});

	it('urls and ?spec= links', () => {
		expect(aiUrl(undefined, 'cxzump')).toBe('/api/ai/reports/cxzump/build');
		expect(aiUrl('/x/{app}/y', 'a b')).toBe('/x/a%20b/y');
		const q = specToQuery({
			...LINE_SPEC,
			view: { ...LINE_SPEC.view, title: 'Bookings, ₹ by RM' },
		});
		expect(q).not.toMatch(/[+/=]/);
		expect(specFromQuery(`?a=1&spec=${q}`)?.view.title).toBe('Bookings, ₹ by RM');
		expect(specFromQuery('?spec=bm90IGpzb24')).toBeUndefined();
		// The assistant's links: compact JSON, base64url, no padding.
		const raw = Buffer.from(JSON.stringify({ v: 1, source: 'cases', view: { type: 'KPI' } }))
			.toString('base64')
			.replace(/\+/g, '-')
			.replace(/\//g, '_')
			.replace(/=+$/, '');
		expect(specFromQuery(`?spec=${raw}`)?.source).toBe('cases');
		expect(specFromQuery('')).toBeUndefined();
	});
});

describe('Ask AI box in the editor', () => {
	let root: Root;
	let host: HTMLDivElement;
	beforeEach(() => {
		jest.useFakeTimers();
		host = document.createElement('div');
		document.body.appendChild(host);
		root = createRoot(host);
		clearCatalogCache();
	});
	afterEach(() => {
		act(() => root.unmount());
		host.remove();
		jest.useRealTimers();
	});
	async function settle(ms = 300, n = 8) {
		for (let i = 0; i < n; i++)
			await act(async () => {
				jest.advanceTimersByTime(ms);
				await Promise.resolve();
			});
	}
	const button = (text: string) =>
		[...document.body.querySelectorAll('button')].find(b => b.textContent?.trim() === text) as
			HTMLButtonElement | undefined;
	/** The name the editor would save with: the save dialog's prefilled name (then closed). */
	async function savedName() {
		await settle(300, 4);
		await act(async () =>
			(
				[...document.body.querySelectorAll('._rpBuilderFoot button')].find(
					b => b.textContent === 'Save',
				) as HTMLButtonElement
			).click(),
		);
		const v = (document.body.querySelector('._rpModal input') as HTMLInputElement)?.value;
		act(() =>
			(
				[...document.body.querySelectorAll('._rpModal button')].find(
					b => b.textContent === 'Cancel',
				) as HTMLButtonElement
			).click(),
		);
		return v;
	}
	function type(text: string) {
		const ta = document.body.querySelector(
			'textarea[aria-label="Ask AI for a report"]',
		) as HTMLTextAreaElement;
		act(() => {
			Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value')!.set!.call(
				ta,
				text,
			);
			ta.dispatchEvent(new Event('input', { bubbles: true }));
		});
	}

	const render = (catalog: any, fetchImpl: any, onGroup?: (g: AiGroup) => void) =>
		act(() =>
			root.render(
				<ReportEditorView
					transport={fixtureTransport}
					catalog={catalog}
					runFunction="CxZump.reportRun"
					onSave={() => {}}
					ai={{
						endpoint: '/api/ai/reports/cxzump/build',
						group: 'dashboard',
						fetchImpl,
						onGroup,
					}}
				/>,
			),
		);

	it('hidden unless the catalog says ai: true', async () => {
		render(FIXTURE_CATALOG, sseFetch([[]]));
		await settle();
		expect(document.body.querySelector('._rpAsk')).toBeNull();
	});

	it('status, a question as buttons, the spec in the shelves with its summary; a follow-up sends the spec', async () => {
		const bodies: any[] = [];
		const onGroup = jest.fn();
		const fetchImpl = sseFetch(
			[
				[
					ev('status', { message: 'Reading the catalog' }),
					ev('question', { question: 'Count or value?', options: ['Count', 'Value'] }),
					ev('done', {}),
				],
				[
					ev('status', { message: 'Checking the report' }),
					ev('spec', {
						spec: LINE_SPEC,
						summary: 'Bookings, counted by RM, all time, projects you can see',
						group: { label: 'Personal', new: true },
					}),
					ev('done', {}),
				],
				[
					ev('spec', {
						spec: {
							...LINE_SPEC,
							view: { ...LINE_SPEC.view, type: 'LINE', title: 'Bookings by month' },
						},
						summary: 'As a line',
					}),
					ev('done', {}),
				],
			],
			bodies,
		);
		render({ ...FIXTURE_CATALOG, ai: true }, fetchImpl, onGroup);
		await settle();
		expect(document.body.querySelector('._rpAsk')).not.toBeNull();
		type('bookings by RM');
		await act(async () => button('Ask AI')!.click());
		await settle();
		expect(bodies[0]).toMatchObject({ prompt: 'bookings by RM', group: 'dashboard' });
		expect(bodies[0].spec).toBeUndefined();
		expect(document.body.textContent).toContain('Count or value?');

		await act(async () => button('Count')!.click());
		await settle(300, 12);
		expect(bodies[1].prompt).toBe('Count');
		expect(bodies[1].history.map((h: any) => h.role)).toEqual(['user', 'assistant']);
		expect(document.body.querySelector('._rpSummary')?.textContent).toBe(
			'Bookings, counted by RM, all time, projects you can see',
		);
		// Loaded into the shelves and the name.
		expect(document.body.querySelector('[data-shelf="columns"]')?.textContent).toContain('RM');
		expect(await savedName()).toBe('Bookings by RM');
		expect(onGroup).toHaveBeenCalledWith({ label: 'Personal', new: true });

		type('make it a line');
		await act(async () => button('Ask AI')!.click());
		await settle(300, 12);
		expect(bodies[2].spec).toMatchObject({
			source: 'cases',
			groupBy: [{ field: 'assignedUserId' }],
		});
		expect(document.body.querySelector('._rpSummary')?.textContent).toBe('As a line');
		// The name the AI filled in follows the new answer (a typed name would stay).
		expect(await savedName()).toBe('Bookings by month');
	});

	it('an error shows; nothing is loaded', async () => {
		render(
			{ ...FIXTURE_CATALOG, ai: true },
			sseFetch([[ev('error', { message: 'No field like that' }), ev('done', {})]]),
		);
		await settle();
		type('weather by city');
		await act(async () => button('Ask AI')!.click());
		await settle();
		expect(document.body.querySelector('[role="alert"]')?.textContent).toContain(
			'No field like that',
		);
		expect(document.body.querySelector('._rpSummary')).toBeNull();
	});
});
