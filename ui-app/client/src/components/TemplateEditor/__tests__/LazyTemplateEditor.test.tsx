/**
 * Component wiring test for the Template Editor.
 *
 * Proves the fix end-to-end at the DOM level: a Template that arrives *after* mount (as it does from
 * the page store) must land in the Monaco code editor showing its custom HTML — not stuck on the
 * visual block canvas, which cannot represent an arbitrary `<!DOCTYPE html>...` document.
 *
 * Monaco, the preview API and the page-store context are mocked so the test exercises only this
 * component's own logic in jsdom.
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

// A tiny stand-in for the Monaco editor: a textarea that reflects `value` and reports edits.
// Inserts at the cursor are recorded in (globalThis).__monacoEdits.
jest.mock('@monaco-editor/react', () => {
	const R = require('react');
	return {
		__esModule: true,
		default: ({ value, onChange, onMount }: any) => {
			R.useEffect(() => {
				onMount?.({
					getAction: () => ({ run: () => undefined }),
					getSelection: () => ({}),
					executeEdits: (_: string, edits: any[]) => {
						((globalThis as any).__monacoEdits ??= []).push(...edits.map(e => e.text));
					},
					focus: () => undefined,
				});
			}, []);
			return R.createElement('textarea', {
				'data-testid': 'monaco',
				value: value ?? '',
				onChange: (e: any) => onChange?.(e.target.value),
			});
		},
	};
});

jest.mock('../util/previewApi', () => ({
	fetchHtmlPreview: jest.fn().mockResolvedValue({ body: '<h1>rendered</h1>', subject: 'Reset' }),
	fetchPdfPreview: jest.fn().mockResolvedValue('blob:pdf'),
}));

jest.mock('../util/eventsApi', () => ({
	fetchEventDefinitions: jest.fn().mockResolvedValue([]),
	fetchEventSchema: jest.fn(),
	PLATFORM_EVENT_CATALOG: [],
	platformEventSchema: () => undefined,
}));

jest.mock('../../../context/StoreContext', () => ({
	__esModule: true,
	getDataFromPath: () => undefined,
	addListenerAndCallImmediately: () => () => undefined,
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'p' }) },
}));

// eslint-disable-next-line import/first
import LazyTemplateEditor from '../LazyTemplateEditor';

const CUSTOM_HTML =
	'<!DOCTYPE html><html lang="en"><head><style>.table{width:50%}</style>' +
	'<link rel="stylesheet" href="https://fonts.googleapis.com/x" /></head>' +
	'<body>Hello ${fullName}, your email is ${email}</body></html>';

const emailTemplate = () => ({
	templateType: 'email',
	defaultLanguage: 'en',
	templateParts: { en: { subject: 'Reset your password', body: CUSTOM_HTML } },
});

const baseProps = {
	onChange: () => undefined,
	lockedType: 'email',
	context: { pageName: 'p' } as any,
	pageDefinition: {} as any,
	locationHistory: [] as any,
	pageExtractor: { getPageName: () => 'p' } as any,
};

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;
// jsdom has no object URLs; the PDF preview revokes the one it made.
(URL as any).revokeObjectURL ??= () => undefined;

function render(
	container: HTMLElement,
	template: any,
	onChange = baseProps.onChange,
	extra: any = {},
): Root {
	const root = createRoot(container);
	act(() => {
		root.render(
			<LazyTemplateEditor
				{...baseProps}
				{...extra}
				onChange={onChange}
				template={template}
			/>,
		);
	});
	return root;
}

async function settlePreview() {
	await flush();
	await act(async () => {
		jest.advanceTimersByTime(900);
	});
	await flush();
}

function click(el: Element | null) {
	expect(el).not.toBeNull();
	act(() => {
		(el as HTMLElement).dispatchEvent(new MouseEvent('click', { bubbles: true }));
	});
}

async function flush() {
	// Let the lazy Monaco import + effects settle.
	await act(async () => {
		await Promise.resolve();
		await Promise.resolve();
	});
}

describe('LazyTemplateEditor wiring', () => {
	let container: HTMLElement;
	let root: Root | undefined;

	beforeEach(() => {
		container = document.createElement('div');
		document.body.appendChild(container);
	});

	afterEach(() => {
		if (root) act(() => root!.unmount());
		root = undefined;
		container.remove();
		jest.clearAllTimers();
	});

	it('shows the custom HTML in the code editor once the template arrives after mount', async () => {
		// Mount before the template has loaded — this is the real lifecycle.
		root = render(container, undefined);
		await flush();

		// Template arrives from the store (re-render with the loaded object).
		await act(async () => {
			root!.render(<LazyTemplateEditor {...baseProps} template={emailTemplate()} />);
		});
		await flush();

		const monaco = container.querySelector(
			'[data-testid="monaco"]',
		) as HTMLTextAreaElement | null;
		expect(monaco).not.toBeNull();
		expect(monaco!.value).toContain('<!DOCTYPE html>');
		expect(monaco!.value).toContain('${fullName}');
		// The visual block canvas must NOT be what is shown for arbitrary HTML.
		expect(container.querySelector('._blockCanvas')).toBeNull();
	});

	it('opens directly in the code editor when the template is present at mount', async () => {
		root = render(container, emailTemplate());
		await flush();

		const monaco = container.querySelector(
			'[data-testid="monaco"]',
		) as HTMLTextAreaElement | null;
		expect(monaco).not.toBeNull();
		expect(monaco!.value).toContain('<body>Hello ${fullName}');
	});

	it('propagates edits in the code editor back through onChange', async () => {
		const onChange = jest.fn();
		root = render(container, emailTemplate(), onChange);
		await flush();

		const monaco = container.querySelector('[data-testid="monaco"]') as HTMLTextAreaElement;
		const setter = Object.getOwnPropertyDescriptor(
			window.HTMLTextAreaElement.prototype,
			'value',
		)!.set!;
		act(() => {
			setter.call(monaco, CUSTOM_HTML + '<p>edited</p>');
			monaco.dispatchEvent(new Event('input', { bubbles: true }));
		});

		expect(onChange).toHaveBeenCalled();
		const next = onChange.mock.calls.at(-1)![0];
		expect(next.templateParts.en.body).toContain('<p>edited</p>');
	});

	it('shows the filled subject in the preview and edits the raw one above the body', async () => {
		jest.useFakeTimers();
		try {
			const { fetchHtmlPreview } = require('../util/previewApi');
			fetchHtmlPreview.mockResolvedValueOnce({ body: '<p>x</p>', subject: 'Receipt R-0001' });
			const tpl = emailTemplate();
			tpl.templateParts.en.subject = "Receipt ${payment.receiptNumber!''}";
			const onChange = jest.fn();
			root = render(container, tpl, onChange);
			await settlePreview();

			const input = container.querySelector('._subjectField input') as HTMLInputElement;
			expect(input.value).toBe("Receipt ${payment.receiptNumber!''}");
			const shown = container.querySelector('._previewSubject');
			expect(shown!.textContent).toContain('Receipt R-0001');
			// The preview never shows the raw merge field.
			expect(shown!.textContent).not.toContain('${');
			// There is no editable subject inside the preview any more.
			expect(container.querySelector('._previewPane input')).toBeNull();

			const setter = Object.getOwnPropertyDescriptor(
				window.HTMLInputElement.prototype,
				'value',
			)!.set!;
			act(() => {
				setter.call(input, 'Thanks ${name}');
				input.dispatchEvent(new Event('input', { bubbles: true }));
			});
			expect(onChange.mock.calls.at(-1)![0].templateParts.en.subject).toBe('Thanks ${name}');
		} finally {
			jest.useRealTimers();
		}
	});

	it('shows a subject without fields as it is before the preview comes back', async () => {
		root = render(container, emailTemplate());
		await flush();
		expect(container.querySelector('._previewSubject')!.textContent).toContain(
			'Reset your password',
		);
	});

	it('opens a PDF as a PDF where the page locks the type, whatever the template says', async () => {
		jest.useFakeTimers();
		try {
			const { fetchPdfPreview, fetchHtmlPreview } = require('../util/previewApi');
			fetchPdfPreview.mockClear();
			fetchHtmlPreview.mockClear();
			const tpl = {
				templateType: 'email',
				defaultLanguage: 'en',
				templateParts: {
					en: { subject: 'x', body: '<html><body>${case.caseNumber}</body></html>' },
				},
				variableSchema: {
					type: 'OBJECT',
					properties: {
						case: { type: 'OBJECT', properties: { caseNumber: { type: 'STRING' } } },
					},
				},
			};
			root = render(container, tpl, undefined, { lockedType: 'pdf' });
			await settlePreview();

			expect(container.querySelector('._teTypeChip')!.textContent).toContain('PDF');
			expect(container.querySelector('._teTypeChip i')!.className).toContain('fa-file-pdf');
			// No email-only controls: device sizes or a subject.
			expect(container.querySelector('._deviceSizes')).toBeNull();
			expect(container.querySelector('._subjectField')).toBeNull();
			expect(container.querySelector('._previewSubject')).toBeNull();
			// The real PDF preview, with sample data made from the Variables (none was saved).
			expect(fetchHtmlPreview).not.toHaveBeenCalled();
			expect(fetchPdfPreview).toHaveBeenCalled();
			const data = fetchPdfPreview.mock.calls.at(-1)[1];
			expect(data.case.caseNumber).toBeTruthy();
			expect(container.querySelector('iframe._pdfPreview')!.getAttribute('src')).toBe(
				'blob:pdf',
			);
		} finally {
			jest.useRealTimers();
		}
	});

	it('lists the fields with their meanings and puts a picked one where the cursor is', async () => {
		(globalThis as any).__monacoEdits = [];
		const tpl: any = emailTemplate();
		tpl.variableSchema = {
			type: 'OBJECT',
			properties: {
				payment: {
					type: 'OBJECT',
					title: 'This payment',
					properties: {
						amount: {
							type: 'NUMBER',
							title: 'Amount paid',
							description: 'The amount received.',
						},
					},
				},
			},
		};
		root = render(container, tpl);
		await flush();

		const tab = Array.from(container.querySelectorAll('._teTab')).find(
			b => b.textContent === 'Variables',
		)!;
		click(tab);
		await flush();

		const list = container.querySelector('._fieldList');
		expect(list).not.toBeNull();
		expect(list!.textContent).toContain('This payment');
		expect(list!.textContent).toContain('Amount paid');
		expect(list!.textContent).toContain('The amount received.');

		click(container.querySelector('._fieldItem'));
		expect((globalThis as any).__monacoEdits).toEqual(['${payment.amount}']);
	});

	describe('Document look (editorLook DOCUMENT)', () => {
		const pdfTemplate = () => ({
			name: 'cxBookingForm',
			templateType: 'pdf',
			defaultLanguage: 'en',
			templateParts: {
				en: {
					body:
						'<html><head><style>@page{size:A4;margin:20mm}</style></head><body>' +
						'<div class="sec">Booking details</div>' +
						'<div class="two"><#list bf.details as r><div class="kv"><span class="k">${r.k}</span><span class="v">${r.v}</span></div></#list></div>' +
						"<p>For ${case.customerName!'-'}</p></body></html>",
				},
			},
			sampleData: {
				case: { customerName: 'Asha Rao' },
				bf: { details: [{ k: 'Unit no', v: '101' }] },
			},
			variableSchema: {
				type: 'OBJECT',
				properties: {
					case: {
						type: 'OBJECT',
						title: 'The case',
						properties: { customerName: { type: 'STRING', title: 'Customer name' } },
					},
				},
			},
		});

		it('is off by default: the classic editor opens', async () => {
			root = render(container, pdfTemplate(), undefined, { lockedType: 'pdf' });
			await flush();
			expect(container.querySelector('._docLook')).toBeNull();
			expect(container.querySelector('[data-testid="monaco"]')).not.toBeNull();
		});

		it('opens a PDF as its page: blocks, list rows filled from the data, fields as named chips', async () => {
			root = render(container, pdfTemplate(), undefined, {
				lockedType: 'pdf',
				editorLook: 'DOCUMENT',
			});
			await flush();
			expect(container.querySelector('._docLook')).not.toBeNull();
			const page = container.querySelector('._docPage')!;
			expect(page.querySelector('._t_heading')!.textContent).toContain('Booking details');
			expect(page.querySelector('._t_fields')!.textContent).toContain('Unit no');
			expect(page.querySelector('._t_fields')!.textContent).toContain('101');
			const chip = page.querySelector('._t_text span[data-token]')!;
			expect(chip.textContent).toBe('Asha Rao');
			expect(chip.getAttribute('title')).toContain('Customer name');
			// No code on screen unless Code is opened.
			expect(container.querySelector('[data-testid="monaco"]')).toBeNull();
		});

		it('saves a page edit as the HTML it compiles to, and keeps the page next to it', async () => {
			const onChange = jest.fn();
			root = render(container, pdfTemplate(), onChange, {
				lockedType: 'pdf',
				editorLook: 'DOCUMENT',
			});
			await flush();
			click(container.querySelector('._docRailTabs button'));
			const add = Array.from(container.querySelectorAll('._docAddItem')).find(b =>
				b.textContent?.startsWith('Page break'),
			)!;
			click(add);
			const next = onChange.mock.calls.at(-1)![0];
			expect(next.templateParts.en.body).toContain('page-break-after:always');
			expect(next.templateParts.en.body).toContain('<#list bf.details as r>');
			expect(next.design.document.en.blocks.map((b: any) => b.type)).toEqual([
				'heading',
				'fields',
				'text',
				'pageBreak',
			]);
		});

		it('previews with a picked record: the page asks for it and shows its data', async () => {
			const onPick = jest.fn();
			const onOpen = jest.fn();
			const records = { records: [{ id: 'c1', label: 'CX-1008, Ravi' }], onPick, onOpen };
			root = render(container, pdfTemplate(), undefined, {
				lockedType: 'pdf',
				editorLook: 'DOCUMENT',
				records,
			});
			await flush();
			click(container.querySelector('._docPickerBtn'));
			expect(onOpen).toHaveBeenCalled();
			click(container.querySelector('._docPickerList ._docPickerItem'));
			expect(onPick).toHaveBeenCalledWith('c1');

			await act(async () => {
				root!.render(
					<LazyTemplateEditor
						{...baseProps}
						lockedType="pdf"
						editorLook="DOCUMENT"
						template={pdfTemplate()}
						records={{
							...records,
							recordId: 'c1',
							recordData: {
								case: { customerName: 'Ravi Kumar' },
								bf: { details: [] },
							},
						}}
					/>,
				);
			});
			await flush();
			expect(container.querySelector('._docPickerBtn')!.textContent).toContain(
				'CX-1008, Ravi',
			);
			expect(container.querySelector('._t_text span[data-token]')!.textContent).toBe(
				'Ravi Kumar',
			);
		});
	});
});
