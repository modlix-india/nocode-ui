import type { MentionItem, MentionProvider } from './blockEditor/features/mention-types';

export interface MentionPerson {
	id: string;
	label: string;
}

const MAX_SUGGESTIONS = 8;

/** The `mentionPeople` property as people the picker can offer: each entry needs an id and a
 *  name (`name`, `label`, or `firstName` and `lastName`). Anything else is skipped. */
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
		out.push({ id: `${id}`, label });
	}
	return out;
}

/** Names that start with the filter come first, then names with a word that does. */
export function matchPeople(people: MentionPerson[], filter: string): MentionPerson[] {
	const f = filter.trim().toLowerCase();
	if (!f) return people.slice(0, MAX_SUGGESTIONS);
	const starts: MentionPerson[] = [];
	const words: MentionPerson[] = [];
	for (const p of people) {
		const l = p.label.toLowerCase();
		if (l.startsWith(f)) starts.push(p);
		else if (l.split(/\s+/).some(w => w.startsWith(f))) words.push(p);
	}
	return [...starts, ...words].slice(0, MAX_SUGGESTIONS);
}

/** A `user` mention provider over a fixed list. A mention is stored as
 *  `[@Name](mde://user/<id>)`. */
export function peopleMentionProvider(people: MentionPerson[]): MentionProvider {
	return {
		kind: 'user',
		label: 'People',
		search: async (filter: string): Promise<MentionItem[]> =>
			matchPeople(people, filter).map(p => ({ kind: 'user', id: p.id, label: p.label })),
	};
}
