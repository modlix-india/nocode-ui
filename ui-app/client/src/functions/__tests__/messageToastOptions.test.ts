import {
	FunctionExecutionParameters,
	KIRunFunctionRepository,
	KIRunSchemaRepository,
} from '@fincity/kirun-js';

jest.mock('../../sso/ssoModule', () => ({ takeSocialArrivalMessage: () => undefined }));

/**
 * UIEngine.Message takes three opt-in parameters: `actions` (buttons such as Undo), `sticky`
 * (stays until dismissed) and `details` (lines behind a Details button). A step without them
 * stores the same toast it always did.
 */

beforeAll(() => jest.useFakeTimers());
afterAll(() => jest.useRealTimers());

// The store first, as the app loads it; Message after it (the two import each other).
const { PageStoreExtractor, getDataFromPath, setData } = require('../../context/StoreContext');
const { Message } = require('../Message');

const run = (args: Record<string, any>, page?: string) => {
	const fep = new FunctionExecutionParameters(
		new KIRunFunctionRepository(),
		new KIRunSchemaRepository(),
	).setArguments(new Map(Object.entries(args)));
	if (page) {
		const pe = PageStoreExtractor.getForContext(page);
		fep.setValuesMap(new Map([[pe.getPrefix(), pe]]));
	}
	return new Message().execute(fep);
};

const last = () => {
	const all = getDataFromPath('Store.messages', []) ?? [];
	return all[all.length - 1];
};

describe('UIEngine.Message toast options', () => {
	afterEach(() => setData('Store.messages', []));

	it('stores the old toast when no option is given', async () => {
		await run({ msg: 'Saved', type: 'SUCCESS' }, 'campaigns');
		expect(Object.keys(last()).sort()).toEqual(['id', 'isGlobalScope', 'msg', 'type', 'when']);
	});

	it('stores actions, sticky, details and the raising page', async () => {
		await run(
			{
				msg: '2 paused, 1 failed',
				type: 'ERROR',
				sticky: true,
				details: ['Broad: refused'],
				actions: [
					{
						label: 'Undo',
						eventFunction: 'z1713undo',
						path: 'Page.undoIds',
						value: ['c1'],
					},
				],
			},
			'campaigns',
		);
		const m = last();
		expect(m.sticky).toBe(true);
		expect(m.details).toEqual(['Broad: refused']);
		expect(m.page).toBe('campaigns');
		expect(m.actions).toEqual([
			{ label: 'Undo', eventFunction: 'z1713undo', path: 'Page.undoIds', value: ['c1'] },
		]);
	});
});
