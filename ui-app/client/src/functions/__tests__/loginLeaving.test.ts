import axios from 'axios';
import { FunctionExecutionParameters } from '@fincity/kirun-js';
import { Login } from '../Login';
import { reloadsTheDocument } from '../../util/reloadsTheDocument';
import { getDataFromPath, setData } from '../../context/StoreContext';
import { beginSsoSeed, isSsoEnabled } from '../../sso/ssoModule';

jest.mock('axios');
jest.mock('../../context/StoreContext', () => ({ getDataFromPath: jest.fn(), setData: jest.fn() }));
jest.mock('../../sso/ssoModule', () => ({ isSsoEnabled: jest.fn(), beginSsoSeed: jest.fn() }));
jest.mock('../../util/absoluteDestination', () => ({
	absoluteDestination: (u: string) => `https://leadzump.test${u}`,
}));
jest.mock('../../components/Page/pageHistory', () => ({}));

const mockedAxios = axios as jest.Mocked<typeof axios>;

function run(args: Record<string, any>) {
	const map = new Map<string, any>(Object.entries({ userName: 'u', password: 'p', ...args }));
	const context = { getArguments: () => map } as FunctionExecutionParameters;
	return (new Login() as any).internalExecute(context);
}

const resetPaths = () =>
	(setData as jest.Mock).mock.calls.map(c => c[0]).filter(p => p.startsWith('Store.') && p !== 'Store.auth');

beforeEach(() => {
	jest.clearAllMocks();
	jest.spyOn(console, 'error').mockImplementation(() => {});
	(getDataFromPath as jest.Mock).mockReturnValue({ properties: {} });
	(isSsoEnabled as jest.Mock).mockReturnValue(false);
	(mockedAxios as unknown as jest.Mock).mockResolvedValue({ data: { accessToken: 'tok', accessTokenExpiryAt: 1 } });
});

describe('UIEngine.Login store reset (QA-0507)', () => {
	// The page being left must not re-fetch and re-run its onLoad signed in: an accepted invite
	// page showed "Invitation Revoked" until the next document arrived.
	it('keeps the page as it is when it leaves for redirectUrl', async () => {
		await run({ redirectUrl: '/deals', forceRedirect: true });
		expect(setData).toHaveBeenCalledWith('LocalStore.AuthToken', 'tok', undefined, true);
		expect(resetPaths()).toEqual([]);
	});

	it('keeps the page as it is when it leaves through the SSO beacon', async () => {
		(isSsoEnabled as jest.Mock).mockReturnValue(true);
		mockedAxios.post = jest.fn().mockResolvedValue({ data: { token: 'ott' } });
		(beginSsoSeed as jest.Mock).mockReturnValue('https://authzump.test/seed');
		await run({});
		expect(resetPaths()).toEqual([]);
	});

	it('resets the store when it stays on the page, so the page renders signed in', async () => {
		await run({});
		expect(resetPaths()).toEqual(
			expect.arrayContaining(['Store.pageDefinition', 'Store.pageData', 'Store.application']),
		);
	});
});

describe('reloadsTheDocument', () => {
	const here = 'https://leadzump.test/inviteUser/abc';
	it('is true for another page and for the same URL without a fragment', () => {
		expect(reloadsTheDocument('https://leadzump.test/deals', here)).toBe(true);
		expect(reloadsTheDocument(here, here)).toBe(true);
	});
	it('is false for a fragment-only change', () => {
		expect(reloadsTheDocument(`${here}#x`, here)).toBe(false);
	});
});
