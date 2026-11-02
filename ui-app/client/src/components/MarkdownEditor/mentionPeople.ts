import type { MentionItem, MentionProvider } from './blockEditor/features/mention-types';

export interface MentionPerson {
	id: string;
	label: string;
	/** Shown under the name and searched, when the host passes one. */
	email?: string;
}

/** The `mentionPeople` property as people the picker can offer: each entry needs an id and a
 *  name (`name`, `label`, or `firstName` and `lastName`). Anything else is skipped. An
 *  `email` (or `emailId`) is kept for searching when present. */
export function peopleForMentions(value: unknown): MentionPerson[] {
	if (!Array.isArray(value)) return [];
	const out: MentionPerson[] = [];
	const seen = new Set<string>();
	for (const p of value) {
		if (!p || typeof p !== 'object') continue;
		const id = p.id ?? p.userId;
		if (id === undefined || id === null || `${id}` === '') continue;
		const full = [p.firstName, p.lastName].filter(Boolean).join(' ');
		const label = `${p.name || p.label || full || p.userName || ''}`.trim();
		if (!label || seen.has(`${id}`)) continue;
		seen.add(`${id}`);
		const email = `${p.email || p.emailId || ''}`.trim();
		out.push(email ? { id: `${id}`, label, email } : { id: `${id}`, label });
	}
	return out;
}

/**
 * Everyone whose name or email matches what was typed after "@", case-insensitive, best
 * matches first: the name starts with the text, then every typed word starts a word of the
 * name ("wahab sh" finds "Abdul Wahab Shaik"), then the name contains it, then the email
 * does. With nothing typed it is the whole list: the picker scrolls, so nobody is left out.
 */
export function matchPeople(people: MentionPerson[], filter: string): MentionPerson[] {
	const f = filter.trim().toLowerCase().replace(/\s+/g, ' ');
	if (!f) return people.slice();
	const tokens = f.split(' ');
	const ranked: MentionPerson[][] = [[], [], [], []];
	for (const p of people) {
		const name = p.label.toLowerCase();
		const words = name.split(/\s+/);
		if (name.startsWith(f)) ranked[0]!.push(p);
		else if (tokens.every(t => words.some(w => w.startsWith(t)))) ranked[1]!.push(p);
		else if (name.includes(f)) ranked[2]!.push(p);
		else if (p.email?.toLowerCase().includes(f)) ranked[3]!.push(p);
	}
	return ranked.flat();
}

/** A `user` mention provider over a fixed list. A mention is stored as
 *  `[@Name](mde://user/<id>)`. */
export function peopleMentionProvider(people: MentionPerson[]): MentionProvider {
	return {
		kind: 'user',
		label: 'People',
		search: async (filter: string): Promise<MentionItem[]> =>
			matchPeople(people, filter).map(p =>
				p.email
					? { kind: 'user', id: p.id, label: p.label, description: p.email }
					: { kind: 'user', id: p.id, label: p.label },
			),
	};
}
