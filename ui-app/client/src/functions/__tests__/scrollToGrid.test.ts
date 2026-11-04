import { FunctionExecutionParameters, KIRunFunctionRepository, KIRunSchemaRepository } from '@fincity/kirun-js';
import { ScrollToGrid } from '../ScrollToGrid';

/**
 * A component inside an ArrayRepeater renders one element per row, and every one of them carries
 * the component key as its id. `index` picks the row; without it the first element is used, as before.
 */

const run = (args: Record<string, any>) =>
	new ScrollToGrid().execute(
		new FunctionExecutionParameters(
			new KIRunFunctionRepository(),
			new KIRunSchemaRepository(),
		).setArguments(new Map(Object.entries(args))),
	);

describe('ScrollToGrid', () => {
	let calls: Array<{ row: string; options: ScrollIntoViewOptions }>;

	beforeEach(() => {
		calls = [];
		document.body.innerHTML = ['a', 'b', 'c']
			.map(r => `<div id="nfRow" data-row="${r}"></div>`)
			.join('');
		document.querySelectorAll<HTMLElement>('#nfRow').forEach(el => {
			el.scrollIntoView = (options?: any) => calls.push({ row: el.dataset.row!, options });
		});
	});

	afterEach(() => {
		document.body.innerHTML = '';
	});

	it('scrolls the first element when no index is given', async () => {
		await run({ gridkey: 'nfRow', behaviour: 'Instant' });
		expect(calls).toEqual([{ row: 'a', options: { behavior: 'instant', block: 'start' } }]);
	});

	it('scrolls the row at the index, where the block says', async () => {
		await run({ gridkey: 'nfRow', behaviour: 'Smooth', index: 2, block: 'Center' });
		expect(calls).toEqual([{ row: 'c', options: { behavior: 'smooth', block: 'center' } }]);
	});

	it('does nothing when the index is past the last row', async () => {
		await run({ gridkey: 'nfRow', behaviour: 'Instant', index: 7 });
		expect(calls).toEqual([]);
	});
});
