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
	it('asks one request per component when the load function runs twice at once', async () => {
		mockedGet.mockResolvedValue({ data: [{ n: 'y', dv: 'blue' }] });
		const set = jest.fn();
		const defaults = new Map<string, string>();
		const load = lazyStylePropertyLoadFunction('Dropdown', set, defaults);
		load();
		load();
		await Promise.resolve();
		await new Promise(r => setTimeout(r, 0));
		expect(mockedGet).toHaveBeenCalledTimes(1);
		expect(set).toHaveBeenCalledTimes(1);
	});

	it('asks again when the network comes back after every retry failed', async () => {
		jest.useFakeTimers();
		mockedGet.mockRejectedValue(new Error('Network Error'));
		const set = jest.fn();
		const defaults = new Map<string, string>();
		lazyStylePropertyLoadFunction('TextBox', set, defaults)();
		// The quick retries (400 + 1500 + 4000 ms) all fail.
		await jest.advanceTimersByTimeAsync(6000);
		expect(mockedGet).toHaveBeenCalledTimes(4);
		expect(set).not.toHaveBeenCalled();

		mockedGet.mockReset();
		mockedGet.mockResolvedValue({ data: [{ n: 'z', dv: 'green' }] });
		window.dispatchEvent(new Event('online'));
		await jest.advanceTimersByTimeAsync(0);
		jest.useRealTimers();
		expect(mockedGet).toHaveBeenCalledTimes(1);
		expect(set).toHaveBeenCalledWith([{ n: 'z', dv: 'green' }], undefined);
		expect(defaults.get('z')).toBe('green');
	});

	it('asks again on a timer when nothing else wakes it', async () => {
		jest.useFakeTimers();
		mockedGet.mockRejectedValue(new Error('Network Error'));
		const set = jest.fn();
		const defaults = new Map<string, string>();
		lazyStylePropertyLoadFunction('Calendar', set, defaults)();
		await jest.advanceTimersByTimeAsync(6000);
		expect(set).not.toHaveBeenCalled();

		mockedGet.mockResolvedValue({ data: [{ n: 'c', dv: '1px' }] });
		await jest.advanceTimersByTimeAsync(15000);
		jest.useRealTimers();
		expect(set).toHaveBeenCalledWith([{ n: 'c', dv: '1px' }], undefined);
	});
});
