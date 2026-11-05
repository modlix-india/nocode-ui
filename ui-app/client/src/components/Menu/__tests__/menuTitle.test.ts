import { menuTitle } from '../menuTitle';

describe('menuTitle', () => {
	it('adds nothing by default (no tooltip, label shown)', () => {
		expect(menuTitle('Dashboard', false, undefined)).toEqual({});
	});

	it('names an icon-only item with its label for screen readers', () => {
		expect(menuTitle('Dashboard', true, undefined)).toEqual({ ariaLabel: 'Dashboard' });
	});

	it('shows the tooltip as the title when one is set', () => {
		expect(menuTitle('Dashboard', true, 'Dashboard')).toEqual({
			title: 'Dashboard',
			ariaLabel: 'Dashboard',
		});
		expect(menuTitle('Dashboard', false, 'Open the dashboard')).toEqual({
			title: 'Open the dashboard',
		});
	});

	it('ignores an empty tooltip and an empty label', () => {
		expect(menuTitle('', true, '')).toEqual({});
	});
});
