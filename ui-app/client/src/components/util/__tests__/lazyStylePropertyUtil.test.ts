import axios from 'axios';
import { fetchStyleProperties, lazyStylePropertyLoadFunction } from '../lazyStylePropertyUtil';

jest.mock('axios');
const mockedGet = axios.get as jest.Mock;

describe('fetchStyleProperties', () => {
	beforeEach(() => {
		mockedGet.mockReset();
		globalThis.styleProperties = {};
		globalThis.cdnPrefix = 'cdn.example.com';
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		(console.error as jest.Mock).mockRestore();
	});

	it('returns the list on the first answer', async () => {
		mockedGet.mockResolvedValueOnce({ data: [{ n: 'a', dv: '1' }] });
		await expect(fetchStyleProperties('Button', [0])).resolves.toEqual([{ n: 'a', dv: '1' }]);
		expect(mockedGet).toHaveBeenCalledTimes(1);
	});

	it('retries a failed request with a fresh url', async () => {
		mockedGet
			.mockRejectedValueOnce(new Error('Network Error'))
			.mockResolvedValueOnce({ data: [{ n: 'a' }] });
		await expect(fetchStyleProperties('Button', [0, 0])).resolves.toEqual([{ n: 'a' }]);
		expect(mockedGet).toHaveBeenCalledTimes(2);
		expect(mockedGet.mock.calls[0][0]).toBe(
			'https://cdn.example.com/js/dist/styleProperties/Button.json',
		);
		expect(mockedGet.mock.calls[1][0]).toBe(
			'https://cdn.example.com/js/dist/styleProperties/Button.json?r=1',
		);
	});

	it('retries an answer that is not a list', async () => {
		mockedGet
			.mockResolvedValueOnce({ data: '<html>' })
			.mockResolvedValueOnce({ data: [{ n: 'b' }] });
		await expect(fetchStyleProperties('TextBox', [0])).resolves.toEqual([{ n: 'b' }]);
	});

	it('gives up after the last retry without throwing', async () => {
		mockedGet.mockRejectedValue(new Error('404'));
		await expect(fetchStyleProperties('Button', [0, 0])).resolves.toBeUndefined();
		expect(mockedGet).toHaveBeenCalledTimes(3);
	});

	it('the load function sets the style properties after a failed first request', async () => {
		mockedGet
			.mockRejectedValueOnce(new Error('Network Error'))
			.mockResolvedValueOnce({ data: [{ n: 'x', dv: 'red' }] });
		const set = jest.fn();
		const defaults = new Map<string, string>();
		jest.useFakeTimers();
		lazyStylePropertyLoadFunction('Button', set, defaults)();
		await jest.runAllTimersAsync();
		jest.useRealTimers();
		expect(set).toHaveBeenCalledWith([{ n: 'x', dv: 'red' }], undefined);
		expect(defaults.get('x')).toBe('red');
	});
});
