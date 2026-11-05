import {
	FunctionExecutionParameters,
	KIRunFunctionRepository,
	KIRunSchemaRepository,
} from '@fincity/kirun-js';
import { Navigate } from '../Navigate';

// getHref pulls the whole store and component tree in; the path is already absolute here.
jest.mock('../../components/util/getHref', () => ({ getHref: (p: string) => p }));
jest.mock('../../sso/ssoModule', () => ({ isLeavingForBeacon: () => false }));

/**
 * `addressOnly` changes the address bar only: the current history entry is replaced, nothing is
 * pushed, and no back / forward runs (that dance is what makes the app open the page again).
 */

const run = (args: Record<string, any>) =>
	new Navigate().execute(
		new FunctionExecutionParameters(
			new KIRunFunctionRepository(),
			new KIRunSchemaRepository(),
		).setArguments(new Map(Object.entries(args))),
	);

describe('Navigate addressOnly', () => {
	let push: jest.SpyInstance, back: jest.SpyInstance, replace: jest.SpyInstance;

	beforeEach(() => {
		window.history.replaceState({ key: 'k1' }, '', '/newCampaign');
		push = jest.spyOn(window.history, 'pushState');
		back = jest.spyOn(window.history, 'back').mockImplementation(() => {});
		replace = jest.spyOn(window.history, 'replaceState');
	});

	afterEach(() => jest.restoreAllMocks());

	it('replaces the address and keeps the history state, without opening the page again', async () => {
		await run({ linkPath: '/newCampaign/01ABC', addressOnly: true });
		expect(window.location.pathname).toBe('/newCampaign/01ABC');
		expect(replace).toHaveBeenCalledWith({ key: 'k1' }, '', '/newCampaign/01ABC');
		expect(push).not.toHaveBeenCalled();
		expect(back).not.toHaveBeenCalled();
	});

	it('does nothing when the address is already the same', async () => {
		await run({ linkPath: '/newCampaign', addressOnly: true });
		expect(replace).not.toHaveBeenCalled();
		expect(push).not.toHaveBeenCalled();
	});

	it('navigates as before without addressOnly', async () => {
		await run({ linkPath: '/newCampaign/01ABC' });
		expect(push).toHaveBeenCalledWith(undefined, '', '/newCampaign/01ABC');
		expect(back).toHaveBeenCalled();
	});
});
