/**
 * The Dashboard over report groups (CONTRACT 9) in jsdom against the sample data transport:
 * group tabs, the group manager (New group, Rename, Delete with confirm) and Copy / Move to
 * group from the widget menu. The store is the real one (the shared list is checked).
 */
import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

jest.mock('../ui/ReportChart', () => ({
	__esModule: true,
	default: React.forwardRef(() => <div className="fakeChart" />),
}));

jest.mock('../../../functions/navigateTo', () => ({ navigateTo: jest.fn() }));

import { getDataFromPath } from '../../../context/StoreContext';
import { navigateTo } from '../../../functions/navigateTo';
import { resetStore } from '../dashboardStore';
import { fixtureTransport } from '../fixtures/reportFixtures';
import { resetGroupsStore } from '../groupsStore';
import { clearCatalogCache } from '../reportApi';
import { GroupedDashboardView, groupPageHref } from '../ui/GroupedDashboardView';

let root: Root;
let host: HTMLDivElement;
beforeEach(async () => {
	jest.useFakeTimers();
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	resetStore();
	resetGroupsStore();
	clearCatalogCache();
	await fixtureTransport.saveDoc('reports_groups', { groups: [] });
});
afterEach(() => {
	act(() => root.unmount());
	host.remove();
	jest.useRealTimers();
});

async function settle(ms = 400) {
	for (let i = 0; i < 8; i++)
		await act(async () => {
			jest.advanceTimersByTime(ms);
			await Promise.resolve();
		});
}

const buttons = () => [...document.body.querySelectorAll('button')] as HTMLButtonElement[];
const button = (text: string) => {
	const b = buttons().find(e => e.textContent?.trim() === text);
	if (!b) throw new Error(`no button "${text}"`);
	return b;
};
const tabs = () =>
	[...document.body.querySelectorAll('[role="tab"]')].map(t => [
		t.textContent,
		t.getAttribute('aria-selected'),
	]);

function typeInto(input: HTMLInputElement, value: string) {
	const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')!.set!;
	act(() => {
		set.call(input, value);
		input.dispatchEvent(new Event('input', { bubbles: true }));
	});
}

const view = (extra: Record<string, any> = {}) => (
	<GroupedDashboardView
		transport={fixtureTransport}
		catalogFunction="CxZump.reportCatalog"
		runFunction="CxZump.reportRun"
		appNamespace="CxZump"
		group="dashboard"
		groups="all"
		showGroupManager
		editable
		{...extra}
	/>
);

test('tabs, New group (rules, switch to it), Rename, Delete with confirm; the store follows', async () => {
	act(() => root.render(view()));
	await settle();
	expect(tabs()).toEqual([['Dashboard', 'true']]);
	expect(document.body.textContent).toContain('Total bookings');
	// App groups cannot be renamed or deleted.
	expect(buttons().some(b => b.textContent?.trim() === 'Rename')).toBe(false);

	act(() => button('New group').click());
	const input = () => document.body.querySelector('._rpModal input') as HTMLInputElement;
	typeInto(input(), 'dashboard');
	await act(async () => button('Create').click());
	expect(document.body.textContent).toContain('used by a group of the app');
	typeInto(input(), 'zz test');
	await act(async () => button('Create').click());
	await settle();
	expect(tabs()).toEqual([
		['Dashboard', 'false'],
		['zz test', 'true'],
	]);
	// A user group starts empty.
	expect(document.body.textContent).toContain('Nothing on this dashboard yet.');
	const stored = getDataFromPath('Store.reports.CxZump.groups', []);
	expect(stored.map((g: any) => [g.label, g.kind])).toEqual([
		['Dashboard', 'app'],
		['zz test', 'user'],
	]);
	expect(stored[1].id).toMatch(/^u_/);

	act(() => button('Rename').click());
	typeInto(input(), 'zz renamed');
	// The dialog's own Rename (the last one).
	await act(async () =>
		buttons()
			.filter(b => b.textContent?.trim() === 'Rename')
			.pop()!
			.click(),
	);
	await settle();
	expect(tabs()[1]).toEqual(['zz renamed', 'true']);
	expect(getDataFromPath('Store.reports.CxZump.groups', [])[1].label).toBe('zz renamed');

	act(() => button('Delete').click());
	expect(document.body.textContent).toContain('Delete the group zz renamed');
	await act(async () =>
		buttons()
			.filter(b => b.textContent?.trim() === 'Delete')
			.pop()!
			.click(),
	);
	await settle();
	expect(tabs()).toEqual([['Dashboard', 'true']]);
	expect(getDataFromPath('Store.reports.CxZump.groups', []).length).toBe(1);
});

test('Copy to group from the widget menu; the copy shows in the other group', async () => {
	await fixtureTransport.saveDoc('reports_groups', {
		groups: [{ id: 'u_view1', label: 'Personal', order: 1 }],
	});
	await fixtureTransport.saveDoc('reports_u_view1', {
		widgets: {},
		layout: [],
		seenDefaults: [],
	});
	act(() => root.render(view()));
	await settle();
	expect(tabs().map(t => t[0])).toEqual(['Dashboard', 'Personal']);
	const more = [
		...document.body.querySelectorAll('button[aria-label="More"]'),
	][0] as HTMLButtonElement;
	act(() => more.click());
	act(() => button('Copy to group').click());
	const radio = [
		...document.body.querySelectorAll('input[name="rpTransferTarget"]'),
	][0] as HTMLInputElement;
	act(() => radio.click());
	await act(async () => button('Copy').click());
	await settle();
	expect(document.body.textContent).toMatch(/Copied ".+" to Personal\./);
	const tab = [...document.body.querySelectorAll('[role="tab"]')][1] as HTMLButtonElement;
	act(() => tab.click());
	await settle();
	expect(document.body.querySelectorAll('._rpTile').length).toBe(1);
	await settle(2500);
	const saved = await fixtureTransport.loadDoc('reports_u_view1');
	expect(Object.keys(saved.widgets).length).toBe(1);
});

test('a group page on a user group that does not exist: a message, no document made', async () => {
	const save = jest.spyOn(fixtureTransport, 'saveDoc');
	act(() => root.render(view({ group: 'u_missing', groups: 'none' })));
	await settle(2500);
	expect(document.body.textContent).toContain('This group no longer exists.');
	expect(save.mock.calls.some(c => c[0] === 'reports_u_missing')).toBe(false);
	save.mockRestore();
});

test('title: the group label on a group page (manager or tabs); a plain group shows none', async () => {
	await fixtureTransport.saveDoc('reports_groups', {
		groups: [{ id: 'u_view2', label: 'Personal', order: 1 }],
	});
	const barTitle = () => document.body.querySelector('._rpBar ._rpTitle')?.textContent;
	act(() => root.render(view({ group: 'u_view2', groups: 'none' })));
	await settle();
	expect(barTitle()).toBe('Personal');
	act(() => root.render(view({ group: 'dashboard', groups: 'none', showGroupManager: false })));
	await settle();
	expect(barTitle()).toBeUndefined();
	act(() =>
		root.render(
			view({ group: 'dashboard', groups: 'none', showGroupManager: false, title: 'Mine' }),
		),
	);
	await settle();
	expect(barTitle()).toBe('Mine');
	act(() => root.render(view({ group: 'dashboard', groups: 'all', showGroupManager: false })));
	await settle();
	expect(barTitle()).toBe('Dashboard');
});

test('groupPageHref: {id} replaced (encoded), else appended', () => {
	expect(groupPageHref('/reportGroup/{id}', 'u_ab')).toBe('/reportGroup/u_ab');
	expect(groupPageHref('/reportGroup/', 'u_a b')).toBe('/reportGroup/u_a%20b');
	expect(groupPageHref('/g/{id}?x={id}', 'dashboard')).toBe('/g/dashboard?x=dashboard');
});

test('with groupPagePath: New group navigates to its page; deleting goes to the next group, else dashboard', async () => {
	const nav = navigateTo as jest.Mock;
	nav.mockClear();
	await fixtureTransport.saveDoc('reports_groups', {
		groups: [
			{ id: 'u_nav1', label: 'First', order: 1 },
			{ id: 'u_nav2', label: 'Second', order: 2 },
		],
	});
	act(() =>
		root.render(view({ group: 'u_nav2', groups: 'none', groupPagePath: '/reportGroup/{id}' })),
	);
	await settle();
	act(() => button('New group').click());
	const input = () => document.body.querySelector('._rpModal input') as HTMLInputElement;
	typeInto(input(), 'Third');
	await act(async () => button('Create').click());
	await settle();
	expect(nav).toHaveBeenCalledTimes(1);
	const newId = (await fixtureTransport.loadDoc('reports_groups')).groups.find(
		(g: any) => g.label === 'Third',
	).id;
	expect(nav).toHaveBeenLastCalledWith(`/reportGroup/${newId}`);

	// The page follows the URL: render the group page on u_nav2 again and delete it.
	act(() =>
		root.render(view({ group: 'u_nav1', groups: 'none', groupPagePath: '/reportGroup/{id}' })),
	);
	await settle();
	act(() => button('Delete').click());
	await act(async () =>
		buttons()
			.filter(b => b.textContent?.trim() === 'Delete')
			.pop()!
			.click(),
	);
	await settle();
	expect(nav).toHaveBeenLastCalledWith('/reportGroup/u_nav2');

	// Only one group left: deleting it goes to the dashboard group.
	await fixtureTransport.saveDoc('reports_groups', {
		groups: [{ id: 'u_nav9', label: 'Last', order: 1 }],
	});
	resetGroupsStore();
	act(() => root.unmount());
	root = createRoot(host);
	act(() =>
		root.render(view({ group: 'u_nav9', groups: 'none', groupPagePath: '/reportGroup/{id}' })),
	);
	await settle();
	act(() => button('Delete').click());
	await act(async () =>
		buttons()
			.filter(b => b.textContent?.trim() === 'Delete')
			.pop()!
			.click(),
	);
	await settle();
	expect(nav).toHaveBeenLastCalledWith('/reportGroup/dashboard');
});

test('without groupPagePath nothing navigates (switches in place)', async () => {
	const nav = navigateTo as jest.Mock;
	nav.mockClear();
	act(() => root.render(view()));
	await settle();
	act(() => button('New group').click());
	const input = document.body.querySelector('._rpModal input') as HTMLInputElement;
	typeInto(input, 'In place');
	await act(async () => button('Create').click());
	await settle();
	expect(tabs().map(t => t[0])).toContain('In place');
	expect(nav).not.toHaveBeenCalled();
});
