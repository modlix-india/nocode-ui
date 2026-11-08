import { aiFields, aiToBlocks } from '../aiBlocks';
import { compileBlock } from '../docModel';
import { collectVariables } from '../../util/variableUtils';

const schema = {
	type: 'OBJECT',
	properties: {
		case: {
			type: 'OBJECT',
			title: 'The case',
			properties: { customerName: { type: 'STRING', title: 'Customer name' } },
		},
		al: {
			type: 'OBJECT',
			properties: {
				parking: {
					type: 'OBJECT',
					properties: {
						rows: {
							type: 'ARRAY',
							items: {
								type: 'OBJECT',
								properties: { name: { type: 'STRING' }, slots: { type: 'STRING' } },
							},
						},
					},
				},
			},
		},
		bf: {
			type: 'OBJECT',
			properties: {
				others: {
					type: 'ARRAY',
					items: {
						type: 'OBJECT',
						properties: {
							title: { type: 'STRING' },
							personal: { type: 'ARRAY', items: { type: 'OBJECT', properties: { k: { type: 'STRING' } } } },
						},
					},
				},
			},
		},
	},
};

const fields = aiFields(collectVariables(schema));

it('gives the AI the fields with lists written LIST[] and their items LIST[].field', () => {
	const paths = fields.map(f => f.path);
	expect(paths).toContain('al.parking.rows[]');
	expect(paths).toContain('al.parking.rows[].slots');
	expect(paths).toContain('bf.others[].personal[]');
	expect(fields.find(f => f.path === 'case.customerName')!.label).toBe('Customer name');
});

it('turns the answer into blocks, keeping only fields the template has', () => {
	const blocks = aiToBlocks(
		[
			{ type: 'heading', text: 'Parking' },
			{
				type: 'table',
				list: 'al.parking.rows',
				columns: [
					{ label: 'Type', field: 'name' },
					{ label: 'Slots', field: 'slots' },
					{ label: 'Tower', field: 'tower' },
				],
				showIf: { field: 'al.parking.rows', op: 'filled' },
			},
			{ type: 'text', text: 'For {{case.customerName}}, passport {{case.passport}}' },
			{ type: 'applicants', list: 'bf.others', titleField: 'title', rowsField: 'personal' },
			{ type: 'table', list: 'made.up', columns: [{ label: 'x', field: 'y' }] },
		],
		fields,
	);
	expect(blocks.map(b => b.type)).toEqual(['heading', 'table', 'text', 'applicants']);
	const table = compileBlock(blocks[1], 'pdf');
	expect(table).toContain('<#if (al.parking.rows)?has_content>');
	expect(table).toContain("<#list al.parking.rows as row><tr><td>${row.name!'-'}</td><td>${row.slots!'-'}</td></tr></#list>");
	expect(table).not.toContain('tower');
	expect(blocks[2].props.html).toBe("<p>For ${case.customerName!'-'}, passport </p>");
	expect(compileBlock(blocks[3], 'pdf')).toContain('<#list bf.others as a><div class="col ap"><h4>${a.title}</h4>');
});
