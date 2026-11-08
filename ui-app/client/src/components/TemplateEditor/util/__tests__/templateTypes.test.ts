import { inferTemplateType, previewDataOf, resolveTemplateType } from '../templateTypes';
import { collectVariables } from '../variableUtils';

const PDF_BODY =
	'<html><head><style>@page{size:A4;margin:20mm}</style></head><body>${case.caseNumber}</body></html>';

describe('resolveTemplateType', () => {
	it('takes the locked type over the type saved on the template', () => {
		// An older copy of a PDF template saved as 'email' still opens as a PDF where the page locks it.
		expect(resolveTemplateType({ templateType: 'email' }, 'pdf')).toBe('pdf');
	});

	it("takes the template's own type when nothing is locked", () => {
		expect(resolveTemplateType({ templateType: 'sms' }, undefined)).toBe('sms');
		expect(resolveTemplateType({ templateType: 'sms' }, '')).toBe('sms');
		expect(resolveTemplateType({ templateType: 'sms' }, null as any)).toBe('sms');
	});

	it('opens an untyped template with an @page rule as a PDF', () => {
		const t = { templateParts: { en: { body: PDF_BODY } } };
		expect(inferTemplateType(t)).toBe('pdf');
		expect(resolveTemplateType(t)).toBe('pdf');
	});

	it('keeps email for an untyped template without @page, and ignores unknown types', () => {
		expect(resolveTemplateType({ templateParts: { en: { body: '<p>Hi</p>' } } })).toBe('email');
		expect(resolveTemplateType({ templateType: 'MAIL' }, 'nope')).toBe('email');
		expect(resolveTemplateType(undefined)).toBe('email');
	});
});

describe('previewDataOf', () => {
	it("uses the template's sample data when it has some", () => {
		expect(previewDataOf({ sampleData: { a: 'x' }, variableSchema: {} })).toEqual({ a: 'x' });
	});

	it('makes sample data from the Variables when the template has none', () => {
		const t = {
			variableSchema: {
				type: 'OBJECT',
				properties: {
					case: { type: 'OBJECT', properties: { caseNumber: { type: 'STRING' } } },
					amount: { type: 'NUMBER' },
					rows: {
						type: 'ARRAY',
						items: { type: 'OBJECT', properties: { label: { type: 'STRING' } } },
					},
				},
			},
		};
		const d = previewDataOf(t);
		expect(d.case.caseNumber).toBeTruthy();
		expect(d.amount).toBe(1);
		expect(d.rows).toHaveLength(1);
		expect(d.rows[0].label).toBeTruthy();
	});

	it('returns nothing when there is neither', () => {
		expect(previewDataOf({})).toBeUndefined();
	});
});

describe('collectVariables labels and groups', () => {
	const schema = {
		type: 'OBJECT',
		properties: {
			generatedAt: {
				type: 'STRING',
				title: 'Date made',
				description: 'When the document is made.',
			},
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
			schedule: {
				type: 'ARRAY',
				title: 'Payment schedule',
				items: {
					type: 'OBJECT',
					properties: { label: { type: 'STRING', title: 'Instalment' } },
				},
			},
		},
	};

	it('carries the title and description of each field and the group it sits in', () => {
		const v = collectVariables(schema);
		const byPath = Object.fromEntries(v.map(e => [e.path, e]));
		expect(byPath.generatedAt).toMatchObject({
			label: 'Date made',
			description: 'When the document is made.',
			group: '',
			container: false,
		});
		expect(byPath.payment).toMatchObject({ label: 'This payment', container: true });
		expect(byPath['payment.amount']).toMatchObject({
			token: '${payment.amount}',
			label: 'Amount paid',
			group: 'payment',
		});
		expect(byPath['schedule[0].label']).toMatchObject({
			label: 'Instalment',
			group: 'schedule',
		});
	});
});
