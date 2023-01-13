import { getHref } from '../../../src/components/util/getHref';

describe('getHref utility tests', () => {
	test('full url test', () => {
		const location = {
			pathname: '/',
			search: '',
			hash: '',
			state: null,
			key: 'm3osed5l',
		};
		expect(getHref('http://www.xyz.com/home', location)).toBe('http://www.xyz.com/home');
		expect(getHref('https://www.xyz.com/home', location)).toBe('https://www.xyz.com/home');
		expect(getHref('//www.xyz.com/home', location)).toBe('//www.xyz.com/home');
	});

	test('without page in pathname', () => {
		let location = {
			pathname: '/',
			search: '',
			hash: '',
			state: null,
			key: 'm3osed5l',
		};
		expect(getHref('dashboard', location)).toBe('dashboard');
		expect(getHref('/dashboard', location)).toBe('/dashboard');
		expect(getHref('/api/users', location)).toBe('/api/users');
		expect(getHref('api/users', location)).toBe('api/users');

		location = {
			pathname: '/abcd',
			search: '',
			hash: '',
			state: null,
			key: 'm3osed5l',
		};
		expect(getHref('dashboard', location)).toBe('dashboard');
		expect(getHref('/dashboard', location)).toBe('/dashboard');
		expect(getHref('/api/users', location)).toBe('/api/users');
		expect(getHref('api/users', location)).toBe('api/users');
	});

	test("/page in url - linkpath doesn't start with / - has codes  ", () => {
		const location = {
			pathname: '/appcode/clientcode/page/dashboard',
			search: '',
			hash: '',
			state: null,
			key: 'default',
		};
		expect(getHref('campaigns', location)).toBe('/appcode/clientcode/page/dashboard/campaigns');
		expect(getHref('/campaigns', location)).toBe('/appcode/clientcode/page/campaigns');
		expect(getHref('/api/xyz', location)).toBe('/appcode/clientcode/api/xyz');
		expect(getHref('api/xyz', location)).toBe('/appcode/clientcode/dashboard/api/xyz');
	});

	test("/page in url - linkpath doesn't start with  ", () => {
		const location = {
			pathname: '/page/dashboard',
			search: '',
			hash: '',
			state: null,
			key: 'default',
		};
		expect(getHref('campaigns', location)).toBe('/page/dashboard/campaigns');
		expect(getHref('/campaigns', location)).toBe('/page/campaigns');
		expect(getHref('/api/xyz', location)).toBe('/api/xyz');
		expect(getHref('api/xyz', location)).toBe('/dashboard/api/xyz');
	});
});
