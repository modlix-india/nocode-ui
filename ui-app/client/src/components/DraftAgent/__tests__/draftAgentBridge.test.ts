/**
 * @jest-environment jsdom
 * @jest-environment-options {"url": "https://cxlanding.local.modlix.com/__mlx-agent-bridge"}
 */
import { runDraftAgentBridge } from '../draftAgentBridge';
import { bridgeUrl, dropUnfitSession, getAgentSession, setAgentSession } from '../draftAgentAuth';

const HEX = 'ff28c51bbe58a3af38b56d69259ed7ca';
const DRAFT = `https://d${HEX}.local.modlix.com`;

interface Answers {
	sessionApp: string;
	mintStatus?: number;
}

function mockFetch({ sessionApp, mintStatus = 200 }: Answers) {
	const minted: any[] = [];
	(global as any).fetch = jest.fn(async (url: string, init: any) => {
		const ok = (status: number, body: any) => ({ status, json: async () => body });
		if (url.startsWith('/api/security/verifyToken'))
			return ok(200, {
				user: { firstName: 'Zz', lastName: 'Builder' },
				verifiedAppCode: sessionApp,
				loggedInClientCode: 'ZZHOM',
			});
		if (url.startsWith('/api/security/clienturls/draft'))
			return ok(200, { urlPattern: `d${HEX}.local.modlix.com` });
		if (url.startsWith('/api/security/makeOneTimeToken')) {
			minted.push(JSON.parse(init.body));
			return mintStatus === 200 ? ok(200, { token: 'ott-1' }) : ok(mintStatus, {});
		}
		return ok(404, {});
	});
	return minted;
}

async function runBridge(hash: Record<string, string>) {
	const posted: any[] = [];
	(window as any).opener = {
		postMessage: (m: any, origin: string) => posted.push({ m, origin }),
	};
	window.location.hash = new URLSearchParams({
		parent: DRAFT,
		nonce: 'n1',
		mode: 'popup',
		...hash,
	}).toString();
	jest.useFakeTimers();
	await runDraftAgentBridge();
	jest.useRealTimers();
	return posted;
}

beforeEach(() => {
	window.localStorage.setItem('AuthToken', JSON.stringify('builder-token'));
	window.localStorage.setItem('AuthTokenExpiry', String(Math.floor(Date.now() / 1000) + 3600));
});

describe('draft bridge: which app the one-time token is for', () => {
	it('mints for the draft app when asked and the session is another app (cxlanding -> cxzump)', async () => {
		const minted = mockFetch({ sessionApp: 'cxlanding' });
		const posted = await runBridge({ app: 'cxzump', token: 'app' });
		expect(minted).toEqual([{ targetAppCode: 'cxzump', authMode: 'BEARER' }]);
		expect(posted).toHaveLength(1);
		expect(posted[0].origin).toBe(DRAFT);
		expect(posted[0].m).toMatchObject({
			status: 'ok',
			ott: 'ott-1',
			appCode: 'cxzump',
			clientCode: 'ZZHOM',
		});
	});

	it('keeps the session app for the AppBuilder agent (no token param)', async () => {
		const minted = mockFetch({ sessionApp: 'appbuilder' });
		const posted = await runBridge({ app: 'crumbcob' });
		expect(minted).toEqual([{ targetAppCode: 'appbuilder', authMode: 'BEARER' }]);
		expect(posted[0].m).toMatchObject({ status: 'ok', appCode: 'appbuilder' });
	});

	it('changes nothing for LeadZump, whose sign-in host is the app itself', async () => {
		const minted = mockFetch({ sessionApp: 'leadzumptwo' });
		const posted = await runBridge({ app: 'leadzumptwo', token: 'app' });
		expect(minted).toEqual([{ targetAppCode: 'leadzumptwo', authMode: 'BEARER' }]);
		expect(posted[0].m).toMatchObject({ status: 'ok', appCode: 'leadzumptwo' });
	});

	it('answers no-access, with no token, when security refuses the other app', async () => {
		const minted = mockFetch({ sessionApp: 'cxlanding', mintStatus: 403 });
		const posted = await runBridge({ app: 'someapp', token: 'app' });
		expect(minted).toEqual([{ targetAppCode: 'someapp', authMode: 'BEARER' }]);
		expect(posted[0].m.status).toBe('no-access');
		expect(posted[0].m.ott).toBeUndefined();
	});
});

describe('draft side', () => {
	it('asks for the draft app token only when told to', () => {
		expect(
			bridgeUrl('https://cxlanding.local.modlix.com', 'cxzump', 'n', 'frame', true),
		).toContain('token=app');
		expect(
			bridgeUrl('https://appbuilder.local.modlix.com', 'crumbcob', 'n', 'frame'),
		).not.toContain('token=');
	});

	it('drops a cached session of another app for an app agent, and keeps it for AppBuilder', () => {
		const s = {
			accessToken: 't',
			expiresAt: Date.now() + 3_600_000,
			appCode: 'cxlanding',
			clientCode: 'ZZHOM',
			userName: '',
			origin: 'https://cxlanding.local.modlix.com',
			label: 'CXZump',
		};
		setAgentSession(s);
		dropUnfitSession('cxzump', 'appbuilder');
		expect(getAgentSession()?.appCode).toBe('cxlanding');
		dropUnfitSession('cxzump', 'cxzump');
		expect(getAgentSession()).toBeUndefined();
		setAgentSession({ ...s, appCode: 'cxzump' });
		dropUnfitSession('cxzump', 'cxzump');
		expect(getAgentSession()?.appCode).toBe('cxzump');
		setAgentSession(undefined);
	});
});
