// Budget for the serialised contents of the open tab. Big enough for a page of
// table rows plus the filters that produced them, small enough that it cannot
// crowd out the conversation on a long thread.
const ACTIVE_DATA_MAX_CHARS = 6000;

// Values whose NAME says they are a credential. A page hands over whatever the
// open tab holds, and some of those rows carry things that are effectively
// bearer tokens (an invite code is enough to accept an invitation). None of it
// helps the agent reason, and all of it would leave the tenant on every turn.
// Anchored at the END of the key rather than matched anywhere in it: unanchored,
// `token` also swallows `tokenizer` and `tokenCount`, and blanking a column the
// agent needs is its own kind of wrong. `code` is deliberately absent — half the
// platform is clientCode / appCode — so `invitecode` is spelled out in full.
const SECRET_KEY_SUFFIX =
	/(token|secret|password|passwd|api[-_]?key|credential|invitecode|accesskey)$/i;
// Too short to match as a suffix without catching unrelated words (spin, login).
const SECRET_KEY_EXACT = /^(otp|pin)$/i;

const isSecretKey = (key: string) => SECRET_KEY_SUFFIX.test(key) || SECRET_KEY_EXACT.test(key);

export function redactSecrets(value: any): any {
	if (Array.isArray(value)) return value.map(redactSecrets);
	if (!value || typeof value !== 'object') return value;
	const out: Record<string, any> = {};
	for (const [k, v] of Object.entries(value)) {
		out[k] = isSecretKey(k) ? '[redacted]' : redactSecrets(v);
	}
	return out;
}

// The state a page keeps for a tab is mostly plumbing — popup flags, dropdown
// option lists, half-filled forms — around the handful of entries that say what
// is actually on screen. These are those entries, and they are protected from
// the pruning below. Dropping by size alone drops the rows first, because the
// rows are the biggest thing there, which is exactly backwards.
const ACTIVE_DATA_KEEP_FIRST = /^(f|filters|search|sort|data|rows|content|total|page)$/i;

const sizeOf = (v: any) => JSON.stringify(v ?? null).length;

/** Shorten the longest array inside `value`. Returns false when there is none left to trim. */
function trimLongestArray(value: any): boolean {
	let best: { arr: any[]; owner: any; key: string | number } | undefined;
	const visit = (node: any) => {
		if (!node || typeof node !== 'object') return;
		for (const [k, v] of Object.entries(node)) {
			if (Array.isArray(v) && v.length > 1 && (!best || v.length > best.arr.length))
				best = { arr: v, owner: node, key: k };
			visit(v);
		}
	};
	visit(value);
	if (!best) return false;
	// Halve rather than shave: a 200-row table should not take 200 passes.
	const keep = Math.max(1, Math.floor(best.arr.length / 2));
	best.owner[best.key] = best.arr.slice(0, keep);
	return true;
}

/**
 * Serialise the open tab's contents for the agent, within a fixed budget.
 *
 * Pages should not have to hand-curate a payload per screen, so this takes the
 * whole of whatever the tab keeps and makes it fit: what is on screen is kept,
 * the plumbing around it is dropped smallest-value-first, and rows are thinned
 * only once nothing else can go. Whatever gets left out is named, so the agent
 * knows to reach for a tool rather than assume it saw everything.
 */
export function serialiseActiveData(raw: any): string | undefined {
	if (raw === undefined || raw === null || raw === '') return undefined;
	if (typeof raw !== 'object') return String(raw).slice(0, ACTIVE_DATA_MAX_CHARS);

	const safe = redactSecrets(raw);
	if (sizeOf(safe) <= ACTIVE_DATA_MAX_CHARS) return JSON.stringify(safe);

	if (Array.isArray(safe)) {
		const trimmed = [...safe];
		while (trimmed.length > 1 && sizeOf(trimmed) > ACTIVE_DATA_MAX_CHARS) trimmed.length >>= 1;
		return JSON.stringify(trimmed);
	}

	const keys = Object.keys(safe);
	const kept: Record<string, any> = {};
	for (const k of keys) if (ACTIVE_DATA_KEEP_FIRST.test(k)) kept[k] = safe[k];

	// Fill the leftover budget with the rest, cheapest first, so a screen with
	// room to spare still sends its incidentals.
	const omitted: string[] = [];
	const rest = keys.filter(k => !ACTIVE_DATA_KEEP_FIRST.test(k));
	rest.sort((a, b) => sizeOf(safe[a]) - sizeOf(safe[b]));
	for (const k of rest) {
		if (sizeOf({ ...kept, [k]: safe[k] }) <= ACTIVE_DATA_MAX_CHARS) kept[k] = safe[k];
		else omitted.push(k);
	}

	// Only now, with the plumbing gone, start thinning the rows themselves.
	let thinned = false;
	while (sizeOf(kept) > ACTIVE_DATA_MAX_CHARS && trimLongestArray(kept)) thinned = true;

	if (omitted.length) kept._omitted = `not sent, too large: ${omitted.join(', ')}`;
	if (thinned) kept._truncated = 'some lists were shortened to fit; ask for more if you need it';

	const text = JSON.stringify(kept);
	// Still over with everything trimmed: hard cut rather than overrun the budget.
	return text.length > ACTIVE_DATA_MAX_CHARS
		? text.slice(0, ACTIVE_DATA_MAX_CHARS) + '...(truncated)'
		: text;
}
