import axios from 'axios';
import { FunctionExecutionParameters } from '@fincity/kirun-js';
import { SsoSeed } from '../SsoSeed';
import { getDataFromPath } from '../../context/StoreContext';
import { isSsoEnabled, ssoSeedBeacon } from '../../sso/ssoModule';
import { replaceLocation } from '../../util/replaceLocation';

jest.mock('axios');
jest.mock('../../context/StoreContext', () => ({ getDataFromPath: jest.fn() }));
jest.mock('../../sso/ssoModule', () => ({
	isSsoEnabled: jest.fn(),
	ssoSeedBeacon: jest.fn(),
}));
jest.mock('../../util/absoluteDestination', () => ({
	absoluteDestination: (u: string) => `https://sitezump.test${u}`,
}));
jest.mock('../../util/replaceLocation', () => ({ replaceLocation: jest.fn() }));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedGet = getDataFromPath as jest.Mock;
const mockedSsoOn = isSsoEnabled as jest.Mock;
const mockedSeed = ssoSeedBeacon as jest.Mock;

// jsdom refuses to let window.location be redefined OR spied, so the fallback navigation is
// observed through the `replaceLocation` seam.
const replace = replaceLocation as jest.Mock;

/** `getDataFromPath` is called for the application first, then the token. */
function store({ application, token }: { application?: any; token?: any }) {
	mockedGet.mockImplementation((path: string) =>
		path === 'Store.application' ? application : token,
	);
}

// internalExecute rather than execute: the latter validates arguments against a schema
// repository that only a running engine supplies, and the logic under test is all in here.
function run(redirectUrl = '/accountHome') {
	const args = new Map<string, any>([['redirectUrl', redirectUrl]]);
	const context = { getArguments: () => args } as FunctionExecutionParameters;
	return (new SsoSeed() as any).internalExecute(context);
}

function outputData(result: any) {
	return result.allResults()[0].getResult().get('data');
}

beforeEach(() => {
	jest.restoreAllMocks();
	jest.clearAllMocks();
	mockedSsoOn.mockReturnValue(true);
	store({ application: { properties: { sso3: true } }, token: 'bearer-abc' });
	mockedAxios.post = jest.fn().mockResolvedValue({ data: { token: 'ott-1' } });
});

describe('UIEngine.SsoSeed', () => {
	// The bug this exists for: registration establishes a session without going through
	// UIEngine.Login, so nothing ever told the beacon and the new account was anonymous on
	// every other app until it signed in a second time.
	it('mints against authzump and seeds the beacon, landing on redirectUrl', async () => {
		const result = await run();

		expect(mockedAxios.post).toHaveBeenCalledWith(
			'api/security/makeOneTimeToken',
			{ targetAppCode: 'authzump', targetClientCode: 'SYSTEM' },
			expect.objectContaining({
				withCredentials: true,
				headers: expect.objectContaining({ Authorization: 'bearer-abc' }),
			}),
		);
		expect(mockedSeed).toHaveBeenCalledWith('ott-1', 'https://sitezump.test/accountHome');
		expect(outputData(result)).toBe(true);
	});

	it('still lands the user on redirectUrl when the mint is refused', async () => {
		mockedAxios.post = jest.fn().mockRejectedValue(new Error('403'));
		jest.spyOn(console, 'error').mockImplementation(() => {});

		expect(outputData(await run())).toBe(false);
		expect(mockedSeed).not.toHaveBeenCalled();
		expect(replace).toHaveBeenCalledWith('https://sitezump.test/accountHome');
	});

	it('is just a navigation on an app that is not enrolled in SSO', async () => {
		mockedSsoOn.mockReturnValue(false);

		expect(outputData(await run())).toBe(false);
		expect(mockedAxios.post).not.toHaveBeenCalled();
		expect(replace).toHaveBeenCalledWith('https://sitezump.test/accountHome');
	});

	it('does not mint when this origin holds no session to share', async () => {
		store({ application: { properties: { sso3: true } }, token: undefined });
		jest.spyOn(console, 'error').mockImplementation(() => {});

		expect(outputData(await run())).toBe(false);
		expect(mockedAxios.post).not.toHaveBeenCalled();
	});

	// Seeding leaves the page, so a caller that named no destination must not be sent
	// anywhere by the failure path either.
	it('navigates nowhere when no redirectUrl was given and seeding fails', async () => {
		mockedAxios.post = jest.fn().mockResolvedValue({ data: {} });
		jest.spyOn(console, 'error').mockImplementation(() => {});

		expect(outputData(await run(''))).toBe(false);
		expect(replace).not.toHaveBeenCalled();
	});
});
