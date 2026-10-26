import {
	liveAgentEndpoint,
	runsHere,
	toRunIn,
	builderOrigins,
	draftEnvOf,
	envOfHost,
	hostForEnv,
	hostOfPattern,
	isAllowedParent,
	sessionFitsAgent,
	toDraftAgent,
	tokenAppCode,
	toMode,
	wantsDraftAppToken,
} from '../draftAgentEnv';
import { refreshActionFor } from '../draftAgentRefresh';
import { parseSSE, tailOf } from '../draftAgentStream';

const HEX = 'ff28c51bbe58a3af38b56d69259ed7ca';

describe('draftEnvOf', () => {
	it('reads the environment off a draft host', () => {
		expect(draftEnvOf(`d${HEX}.local.modlix.com`)).toBe('local');
		expect(draftEnvOf(`d${HEX}.dev.modlix.com`)).toBe('dev');
		expect(draftEnvOf(`d${HEX}.stage.modlix.com`)).toBe('stage');
		expect(draftEnvOf(`d${HEX}.modlix.com`)).toBe('');
	});
	it('is not fooled by look-alikes', () => {
		expect(draftEnvOf(`t-${HEX}.local.modlix.com`)).toBeUndefined();
		expect(draftEnvOf('appbuilder.local.modlix.com')).toBeUndefined();
		expect(draftEnvOf(`d${HEX}.modlix.com.evil.com`)).toBeUndefined();
		expect(draftEnvOf(`d${HEX}.qa.modlix.com`)).toBeUndefined();
		expect(draftEnvOf(`d${HEX.slice(1)}.modlix.com`)).toBeUndefined();
	});
});

describe('envOfHost and hostForEnv', () => {
	it('finds the env label before the registrable domain', () => {
		expect(envOfHost('appbuilder.local.modlix.com')).toBe('local');
		expect(envOfHost('local.leadzump.ai')).toBe('local');
		expect(envOfHost('stage.sitezump.ai')).toBe('stage');
		expect(envOfHost('appbuilder.modlix.com')).toBe('');
		expect(envOfHost('leadzump.ai')).toBe('');
		expect(envOfHost('localhost')).toBeUndefined();
	});
	it('puts the env into a production host', () => {
		expect(hostForEnv('appbuilder.modlix.com', 'dev')).toBe('appbuilder.dev.modlix.com');
		expect(hostForEnv('leadzump.ai', 'local')).toBe('local.leadzump.ai');
		expect(hostForEnv('https://sitezump.ai/', 'stage')).toBe('stage.sitezump.ai');
		expect(hostForEnv('leadzump.ai', '')).toBe('leadzump.ai');
		expect(hostForEnv('dev.leadzump.ai', 'dev')).toBe('dev.leadzump.ai');
	});

	it('fills an <env.> template exactly where it is written', () => {
		expect(hostForEnv('<env.>leadzump.ai', 'dev')).toBe('dev.leadzump.ai');
		expect(hostForEnv('<env.>leadzump.ai', 'stage')).toBe('stage.leadzump.ai');
		expect(hostForEnv('<env.>leadzump.ai', 'local')).toBe('local.leadzump.ai');
		expect(hostForEnv('<env.>leadzump.ai', '')).toBe('leadzump.ai');
		expect(hostForEnv('leadzump.<env.>modlix.com', 'dev')).toBe('leadzump.dev.modlix.com');
		expect(hostForEnv('leadzump.<env.>modlix.com', '')).toBe('leadzump.modlix.com');
		expect(hostForEnv('https://<ENV.>leadzump.ai/', 'stage')).toBe('stage.leadzump.ai');
		expect(builderOrigins('dev', 'leadzump', '<env.>leadzump.ai')).toEqual([
			{ origin: 'https://dev.leadzump.ai', label: 'dev.leadzump.ai' },
		]);
	});
});

describe('builderOrigins', () => {
	it('tries AppBuilder then SiteZump for the AppBuilder agent', () => {
		expect(builderOrigins('local').map(b => b.origin)).toEqual([
			'https://appbuilder.local.modlix.com',
			'https://local.sitezump.ai',
		]);
		expect(builderOrigins('').map(b => b.origin)).toEqual([
			'https://appbuilder.modlix.com',
			'https://sitezump.ai',
		]);
	});
	it('signs the LeadZump agent in on leadzump.ai', () => {
		expect(builderOrigins('dev', 'leadzump').map(b => b.origin)).toEqual([
			'https://dev.leadzump.ai',
		]);
		expect(builderOrigins('', 'leadzump').map(b => b.origin)).toEqual(['https://leadzump.ai']);
	});
	it('signs the CXZump agent in on cxzump.ai, and on cxlanding locally', () => {
		expect(builderOrigins('dev', 'cxzump').map(b => b.origin)).toEqual([
			'https://dev.cxzump.ai',
		]);
		expect(builderOrigins('stage', 'cxzump').map(b => b.origin)).toEqual([
			'https://stage.cxzump.ai',
		]);
		expect(builderOrigins('', 'cxzump').map(b => b.origin)).toEqual(['https://cxzump.ai']);
		// The local stack resolves no local.cxzump.ai.
		expect(builderOrigins('local', 'cxzump').map(b => b.origin)).toEqual([
			'https://cxlanding.local.modlix.com',
		]);
		expect(
			builderOrigins('local', 'cxzump', 'cx.<env.>example.com').map(b => b.origin),
		).toEqual(['https://cx.local.example.com']);
	});
	it('takes an explicit host over both', () => {
		expect(builderOrigins('stage', 'leadzump', 'crm.example.com').map(b => b.origin)).toEqual([
			'https://crm.stage.example.com',
		]);
	});
});

describe('isAllowedParent', () => {
	it('answers a draft host of the same environment', () => {
		expect(
			isAllowedParent(`https://d${HEX}.local.modlix.com`, 'appbuilder.local.modlix.com'),
		).toBe(true);
		expect(isAllowedParent(`https://d${HEX}.dev.modlix.com`, 'dev.leadzump.ai')).toBe(true);
		expect(isAllowedParent(`https://d${HEX}.modlix.com`, 'sitezump.ai')).toBe(true);
	});
	it('refuses another environment, plain http, a port, or a non-draft origin', () => {
		expect(
			isAllowedParent(`https://d${HEX}.dev.modlix.com`, 'appbuilder.local.modlix.com'),
		).toBe(false);
		expect(isAllowedParent(`https://d${HEX}.modlix.com`, 'appbuilder.dev.modlix.com')).toBe(
			false,
		);
		expect(
			isAllowedParent(`http://d${HEX}.local.modlix.com`, 'appbuilder.local.modlix.com'),
		).toBe(false);
		expect(
			isAllowedParent(`https://d${HEX}.local.modlix.com:444`, 'appbuilder.local.modlix.com'),
		).toBe(false);
		expect(isAllowedParent('https://evil.com', 'appbuilder.local.modlix.com')).toBe(false);
		expect(
			isAllowedParent(`https://d${HEX}.local.modlix.com/x`, 'appbuilder.local.modlix.com'),
		).toBe(false);
		expect(isAllowedParent('', 'appbuilder.local.modlix.com')).toBe(false);
	});
});

describe('small readers', () => {
	it('reads a host out of a url pattern', () => {
		expect(hostOfPattern(`d${HEX}.local.modlix.com`)).toBe(`d${HEX}.local.modlix.com`);
		expect(hostOfPattern(`https://D${HEX}.local.modlix.com:443/`)).toBe(
			`d${HEX}.local.modlix.com`,
		);
		expect(hostOfPattern(undefined)).toBe('');
	});
	it('defaults the agent to appbuilder', () => {
		expect(toDraftAgent(undefined)).toBe('appbuilder');
		expect(toDraftAgent('LeadZump')).toBe('leadzump');
		expect(toDraftAgent('other')).toBe('appbuilder');
	});
	it('defaults an unknown mode', () => {
		expect(toMode('compact')).toBe('compact');
		expect(toMode('rail')).toBe('button');
		expect(toMode('nope')).toBe('button');
		expect(toMode(undefined, 'right')).toBe('right');
	});
});

describe('refreshActionFor', () => {
	const cached = { home: { id: 'p1' }, about: { id: 'p2' }, shell: { id: 'p3' } };
	it('refreshes a cached page by name or by id', () => {
		expect(
			refreshActionFor({ kind: 'page', name: 'home', app_code: 'a' }, 'a', cached),
		).toEqual({
			action: 'page',
			pages: ['home'],
		});
		expect(refreshActionFor({ kind: 'page', id: 'p2' }, 'a', cached)).toEqual({
			action: 'page',
			pages: ['about'],
		});
	});
	it('ignores another app and pages not on screen', () => {
		expect(
			refreshActionFor({ kind: 'page', name: 'home', app_code: 'b' }, 'a', cached).action,
		).toBe('none');
		expect(refreshActionFor({ kind: 'page', name: 'other' }, 'a', cached).action).toBe('none');
		expect(refreshActionFor({ kind: 'storage', name: 'x' }, 'a', cached).action).toBe('none');
	});
	it('reloads for what is read once at start-up', () => {
		expect(refreshActionFor({ kind: 'theme' }, 'a', cached).action).toBe('reload');
		expect(refreshActionFor({ kind: 'application' }, 'a', cached).action).toBe('reload');
		expect(refreshActionFor({ kind: 'page', id: 'p3' }, 'a', cached, 'shell').action).toBe(
			'reload',
		);
	});
});

describe('parseSSE', () => {
	it('splits events and keeps the unfinished tail', () => {
		const r = parseSSE(
			'event: text\ndata: {"text":"hi"}\n\nevent: done\ndata: {"session_id":"s',
		);
		expect(r.events).toEqual([{ type: 'text', data: { text: 'hi' } }]);
		expect(r.rest).toBe('data: {"session_id":"s');
		expect(r.type).toBe('done');
		const r2 = parseSSE(r.rest + '1"}\n\n', r.type);
		expect(r2.events).toEqual([{ type: 'done', data: { session_id: 's1' } }]);
	});
	it('shortens long replies to their tail', () => {
		expect(tailOf('**short**')).toBe('short');
		const long = 'word '.repeat(80);
		expect(tailOf(long, 40).length).toBeLessThanOrEqual(40);
	});
});

describe('run in draft or live', () => {
	it('defaults to a draft run', () => {
		expect(toRunIn(undefined)).toBe('draft');
		expect(toRunIn('_live')).toBe('live');
		expect(toRunIn('LIVE')).toBe('live');
		expect(toRunIn('nonsense')).toBe('draft');
	});
	it('shows a draft run only on a draft host and a live run only on the live app', () => {
		expect(runsHere('draft', true)).toBe(true);
		expect(runsHere('draft', false)).toBe(false);
		expect(runsHere('live', false)).toBe(true);
		expect(runsHere('live', true)).toBe(false);
	});
	it('builds a live run endpoint from a plain agent name only', () => {
		expect(liveAgentEndpoint('leadzump')).toBe('/api/ai/leadzump/chat?draftmode=false');
		expect(liveAgentEndpoint(' AdZump2 ')).toBe('/api/ai/adzump2/chat?draftmode=false');
		expect(liveAgentEndpoint('../security/x')).toBe('/api/ai/appbuilder/chat?draftmode=false');
		expect(liveAgentEndpoint('')).toBe('/api/ai/appbuilder/chat?draftmode=false');
	});
});

describe('which app the bridge mints for', () => {
	it('asks for the draft app only for the agents that admit their own app', () => {
		expect(wantsDraftAppToken('appbuilder')).toBe(false);
		expect(wantsDraftAppToken('leadzump')).toBe(true);
		expect(wantsDraftAppToken('cxzump')).toBe(true);
	});
	it('mints for the draft app when asked, else the session app', () => {
		// CXZump: a builder signed in on cxlanding gets a cxzump token.
		expect(tokenAppCode('cxlanding', 'cxzump', true)).toBe('cxzump');
		// AppBuilder: unchanged, the builder's own app.
		expect(tokenAppCode('appbuilder', 'crumbcob', false)).toBe('appbuilder');
		expect(tokenAppCode('sitezump', 'crumbcob', false)).toBe('sitezump');
		// LeadZump: the builder host is the app itself, so nothing changes.
		expect(tokenAppCode('leadzumptwo', 'leadzumptwo', true)).toBe('leadzumptwo');
		// Asked without a draft app: the session's app, never an empty target.
		expect(tokenAppCode('cxlanding', '', true)).toBe('cxlanding');
		expect(tokenAppCode('cxlanding', '  ', true)).toBe('cxlanding');
	});
	it('keeps a session only when it can serve the agent', () => {
		expect(sessionFitsAgent('cxlanding', 'cxzump', 'cxzump')).toBe(false);
		expect(sessionFitsAgent('cxzump', 'cxzump', 'cxzump')).toBe(true);
		expect(sessionFitsAgent('CXZUMP', 'cxzump', 'cxzump')).toBe(true);
		expect(sessionFitsAgent(undefined, 'cxzump', 'cxzump')).toBe(false);
		expect(sessionFitsAgent('leadzumptwo', 'leadzumptwo', 'leadzump')).toBe(true);
		// The AppBuilder agent runs on the builder's token, whatever the draft app.
		expect(sessionFitsAgent('appbuilder', 'crumbcob', 'appbuilder')).toBe(true);
		expect(sessionFitsAgent('sitezump', 'crumbcob', 'appbuilder')).toBe(true);
	});
});
