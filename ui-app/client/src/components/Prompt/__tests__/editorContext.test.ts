import { redactSecrets, serialiseActiveData } from '../editorContext';

const MAX = 6000;

// Roughly the shape an org pane keeps: a little state that says what is on
// screen, and a lot of plumbing around it.
function pane({ rows = 10, optionCount = 120 } = {}) {
	return {
		f: { clientId: 0, appId: 0 },
		search: 'shiva',
		data: {
			totalElements: 259,
			number: 0,
			content: Array.from({ length: rows }, (_, i) => ({
				id: i,
				emailId: `person${i}@example.com`,
				firstName: `First${i}`,
				inviteCode: `c0a922fb6d9b4a54b206a508cfe520${i}`,
			})),
		},
		clientOpts: Array.from({ length: optionCount }, (_, i) => ({
			id: i,
			name: `A fairly long client display name number ${i}`,
		})),
		appOpts: Array.from({ length: optionCount }, (_, i) => ({
			id: i,
			name: `Another long application display name ${i}`,
		})),
		showForm: false,
		formError: '',
		detOpen: false,
	};
}

const parse = (s: string | undefined) => JSON.parse(s as string);

describe('redactSecrets', () => {
	it('replaces credential-shaped keys at any depth', () => {
		const out = redactSecrets({
			emailId: 'a@b.com',
			inviteCode: 'abc123',
			nested: [{ accessToken: 't', apiKey: 'k', name: 'keep' }],
		});
		expect(out.emailId).toBe('a@b.com');
		expect(out.inviteCode).toBe('[redacted]');
		expect(out.nested[0].accessToken).toBe('[redacted]');
		expect(out.nested[0].apiKey).toBe('[redacted]');
		expect(out.nested[0].name).toBe('keep');
	});

	it('leaves innocuous lookalikes alone', () => {
		const out = redactSecrets({ description: 'x', pinned: true, tokenizer: 'y' });
		expect(out).toEqual({ description: 'x', pinned: true, tokenizer: 'y' });
	});
});

describe('serialiseActiveData', () => {
	it('returns nothing for an empty value', () => {
		expect(serialiseActiveData(undefined)).toBeUndefined();
		expect(serialiseActiveData(null)).toBeUndefined();
		expect(serialiseActiveData('')).toBeUndefined();
	});

	it('passes a small payload through untouched', () => {
		const small = { f: { clientId: 3 }, data: { content: [{ id: 1 }] } };
		expect(parse(serialiseActiveData(small))).toEqual(small);
	});

	it('redacts before sending', () => {
		const out = parse(serialiseActiveData({ rows: [{ inviteCode: 'secret' }] }));
		expect(out.rows[0].inviteCode).toBe('[redacted]');
	});

	// The regression that motivated the priority list: dropping purely by size
	// threw away `data` (the rows) and kept the popup flags.
	it('keeps what is on screen and drops the plumbing', () => {
		const out = parse(serialiseActiveData(pane()));

		expect(out.data.content.length).toBe(10);
		expect(out.f).toEqual({ clientId: 0, appId: 0 });
		expect(out.search).toBe('shiva');
		expect(out.clientOpts).toBeUndefined();
		expect(out.appOpts).toBeUndefined();
		expect(out._omitted).toMatch(/clientOpts/);
		expect(out._omitted).toMatch(/appOpts/);
	});

	it('stays inside the budget', () => {
		expect(serialiseActiveData(pane())!.length).toBeLessThanOrEqual(MAX);
		expect(serialiseActiveData(pane({ rows: 500 }))!.length).toBeLessThanOrEqual(MAX);
	});

	it('spends leftover budget on the cheap extras', () => {
		const out = parse(serialiseActiveData(pane({ optionCount: 400 })));
		// The tiny flags cost almost nothing, so they ride along even though the
		// big option lists could not.
		expect(out.showForm).toBe(false);
		expect(out.detOpen).toBe(false);
		expect(out.clientOpts).toBeUndefined();
	});

	it('thins rows only when nothing else can go, and says so', () => {
		const out = parse(serialiseActiveData(pane({ rows: 500, optionCount: 0 })));
		expect(out.data.content.length).toBeGreaterThan(0);
		expect(out.data.content.length).toBeLessThan(500);
		expect(out._truncated).toMatch(/shortened/);
		// Paging metadata survives, so the agent knows how much it did not see.
		expect(out.data.totalElements).toBe(259);
	});

	it('truncates a bare oversized array', () => {
		const big = Array.from({ length: 2000 }, (_, i) => ({ id: i, name: `row ${i}` }));
		const out = serialiseActiveData(big)!;
		expect(out.length).toBeLessThanOrEqual(MAX);
		expect(JSON.parse(out).length).toBeLessThan(2000);
	});

	it('stringifies a non-object', () => {
		expect(serialiseActiveData(42)).toBe('42');
	});
});
