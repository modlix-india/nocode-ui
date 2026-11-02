/**
 * The @ list in LoopZump comments showed only the first 8 people and gave no hint that
 * typing searches it. Everyone is listed now (the picker scrolls), typing after "@"
 * narrows by name or email, and the arrow keys plus Enter pick from the whole list.
 */

import React from 'react';
import { act } from 'react-dom/test-utils';
import { createRoot, Root } from 'react-dom/client';
import { MentionPicker } from '../blockEditor/features/mention-picker';
import type { MentionItem } from '../blockEditor/features/mention-types';
import { matchPeople, peopleForMentions, peopleMentionProvider } from '../mentionPeople';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

// 40 people, more than the old cap of 8.
const PEOPLE = peopleForMentions(
	Array.from({ length: 40 }, (_, i) => ({
		id: 1000 + i,
		name: `Person ${String(i).padStart(2, '0')}`,
		email: `person${i}@example.com`,
	})).concat([
		{ id: 1, name: 'Abdul Wahab Shaik', email: 'abdul.w@example.com' },
		{ id: 2, name: 'Zoe Adams', email: 'zadams@example.com' },
	]),
);

describe('matching people for @', () => {
	test('with nothing typed, everyone is offered', () => {
		expect(matchPeople(PEOPLE, '')).toHaveLength(42);
		expect(matchPeople(PEOPLE, '   ')).toHaveLength(42);
	});

	test('case-insensitive, any word of the name, several words', () => {
		expect(matchPeople(PEOPLE, 'WAHAB').map(p => p.id)).toEqual(['1']);
		expect(matchPeople(PEOPLE, 'wahab sh').map(p => p.id)).toEqual(['1']);
		expect(matchPeople(PEOPLE, 'abdul  wahab').map(p => p.id)).toEqual(['1']);
		expect(matchPeople(PEOPLE, 'adams').map(p => p.id)).toEqual(['2']);
	});

	test('names that start with the text first, then word starts, then inside the name, then email', () => {
		const people = peopleForMentions([
			{ id: 'e', name: 'Ravi K', email: 'zed.kumar@example.com' },
			{ id: 'c', name: 'Inzed Rao' },
			{ id: 'b', name: 'Amy Zed' },
			{ id: 'a', name: 'Zed Lee' },
		]);
		expect(matchPeople(people, 'zed').map(p => p.id)).toEqual(['a', 'b', 'c', 'e']);
	});

	test('email is searched and shown under the name when the host passes one', async () => {
		expect(matchPeople(PEOPLE, 'ZADAMS@').map(p => p.id)).toEqual(['2']);
		const provider = peopleMentionProvider(PEOPLE);
		expect(await provider.search('zadams', {})).toEqual([
			{ kind: 'user', id: '2', label: 'Zoe Adams', description: 'zadams@example.com' },
		]);
		expect(peopleForMentions([{ id: 5, name: 'A', emailId: 'a@x.io' }])).toEqual([
			{ id: '5', label: 'A', email: 'a@x.io' },
		]);
	});

	test('the whole list comes back from the provider, not the first 8', async () => {
		const provider = peopleMentionProvider(PEOPLE);
		expect(await provider.search('', {})).toHaveLength(42);
		expect(await provider.search('person', {})).toHaveLength(40);
	});
});

describe('the @ picker with a long list', () => {
	let host: HTMLDivElement;
	let root: Root;

	beforeEach(() => {
		host = document.createElement('div');
		document.body.appendChild(host);
		root = createRoot(host);
		Element.prototype.scrollIntoView = jest.fn();
	});

	afterEach(() => {
		act(() => root.unmount());
		host.remove();
	});

	async function render(filter: string, onSelect: (item: MentionItem) => void) {
		await act(async () => {
			root.render(
				<MentionPicker
					position={{ x: 10, y: 10 }}
					filter={filter}
					providers={[peopleMentionProvider(PEOPLE)]}
					onSelect={onSelect}
					onClose={() => {}}
				/>,
			);
		});
		// The provider search resolves on a microtask; let it land.
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
	}

	const rows = () => host.querySelectorAll('[data-mention-kind="user"]');
	const hint = () => host.querySelector('[data-testid="mention-picker-hint"]')?.textContent;

	test('lists everyone in a scrolling box and says typing searches', async () => {
		await render('', () => {});
		expect(rows()).toHaveLength(42);
		expect(hint()).toBe('Type a name to search');
		const box = host.querySelector('[data-testid="mention-picker"]') as HTMLElement;
		expect(box.style.overflowY).toBe('auto');
		expect(box.style.maxHeight).toBe('320px');
	});

	test('typing narrows the list', async () => {
		await render('wahab', () => {});
		expect(rows()).toHaveLength(1);
		expect(rows()[0]!.textContent).toContain('Abdul Wahab Shaik');
		expect(hint()).toBe('Matching "wahab"');
	});

	test('arrow keys move past the first 8 and Enter picks', async () => {
		const picked: MentionItem[] = [];
		await render('', item => picked.push(item));
		await act(async () => {
			for (let i = 0; i < 10; i++)
				document.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown' }));
		});
		await act(async () => {
			document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
		});
		expect(picked).toHaveLength(1);
		expect(picked[0]!.label).toBe('Person 10');
	});
});
