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
jest.mock('@monaco-editor/react', () => {
	const R = require('react');
	return {
		__esModule: true,
		default: ({ value, onChange, onMount }: any) => {
			R.useEffect(() => {
				onMount?.({
					getAction: () => ({ run: () => undefined }),
					getSelection: () => ({}),
					executeEdits: () => undefined,
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

jest.mock('../../../context/StoreContext', () => ({
	__esModule: true,
	getDataFromPath: () => undefined,
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

function render(container: HTMLElement, template: any, onChange = baseProps.onChange): Root {
	const root = createRoot(container);
	act(() => {
		root.render(<LazyTemplateEditor {...baseProps} onChange={onChange} template={template} />);
	});
	return root;
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

		const monaco = container.querySelector('[data-testid="monaco"]') as HTMLTextAreaElement | null;
		expect(monaco).not.toBeNull();
		expect(monaco!.value).toContain('<!DOCTYPE html>');
		expect(monaco!.value).toContain('${fullName}');
		// The visual block canvas must NOT be what is shown for arbitrary HTML.
		expect(container.querySelector('._blockCanvas')).toBeNull();
	});

	it('opens directly in the code editor when the template is present at mount', async () => {
		root = render(container, emailTemplate());
		await flush();

		const monaco = container.querySelector('[data-testid="monaco"]') as HTMLTextAreaElement | null;
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
});
