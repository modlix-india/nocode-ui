/**
 * Step card (ADZ-2065): a reload rebuilds the card's rows from the saved turn.
 * LazyPrompt is big, so this only checks the history mapping it exports.
 */

import { mapHistoryToMessages } from '../LazyPrompt';
import { buildStepRows } from '../stepCard';

function turn(calls: any[], extra: any[] = []) {
	return [
		{
			turn_number: 1,
			user_instruction: 'read the product again',
			assistant_summary: 'Done.',
			tool_calls_json: JSON.stringify([...calls, ...extra]),
		},
	];
}

describe('mapHistoryToMessages with steps', () => {
	it("keeps a tool entry's step words and its time", () => {
		const msgs = mapHistoryToMessages(
			turn(
				[
					{
						tool: 'products_list',
						display_name: 'List products',
						summary: '{"rows": []}',
						success: true,
						ms: 2400,
						tool_use_id: 't1',
						step: { name: 'Looking at your products', done: '3 products found' },
					},
					{
						tool: 'accounts_list',
						display_name: 'List ad accounts',
						summary: 'x',
						success: false,
						ms: 400,
						tool_use_id: 't2',
						step: {
							name: 'Checking your ad accounts',
							failed: 'Your ad account did not answer.',
							action: { label: 'Try again', message: 'Check my ad accounts again' },
						},
					},
				],
				[{ kind: 'timing', tool: '_turn', ms: 5000 }],
			),
		);
		const asst = msgs.find(m => m.role === 'assistant')!;
		expect(asst.durationMs).toBe(5000);
		expect(asst.toolCalls).toHaveLength(2);
		expect(asst.toolCalls![0].durationMs).toBe(2400);

		const { rows } = buildStepRows(asst.toolCalls!, []);
		expect(rows.map(r => r.name)).toEqual([
			'Looking at your products',
			'Checking your ad accounts',
		]);
		expect(rows[0].line).toBe('3 products found');
		expect(rows[1].status).toBe('error');
		expect(rows[1].failed).toBe('Your ad account did not answer.');
		expect(rows[1].action).toEqual({
			label: 'Try again',
			message: 'Check my ad accounts again',
		});
	});

	it('folds a separate kind "step" record into the tool it names', () => {
		const msgs = mapHistoryToMessages(
			turn(
				[
					{
						tool: 'products_list',
						display_name: 'List products',
						summary: 's',
						success: true,
						tool_use_id: 't1',
					},
				],
				[{ kind: 'step', tool_use_id: 't1', step: { name: 'Looking at your products' } }],
			),
		);
		const asst = msgs.find(m => m.role === 'assistant')!;
		expect(asst.toolCalls).toHaveLength(1);
		expect(asst.toolCalls![0].step?.name).toBe('Looking at your products');
	});

	it('leaves a turn saved before steps existing as plain tool calls', () => {
		const msgs = mapHistoryToMessages(
			turn([
				{
					tool: 'products_list',
					display_name: 'List products',
					summary: 's',
					success: true,
				},
			]),
		);
		const asst = msgs.find(m => m.role === 'assistant')!;
		expect(asst.toolCalls![0].step).toBeUndefined();
		expect(buildStepRows(asst.toolCalls!, []).rows[0].name).toBe('List products');
	});
});
