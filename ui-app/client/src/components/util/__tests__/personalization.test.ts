import axios from 'axios';
import { personalizationEvent } from '../personalization';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData as setStoreData,
} from '../../../context/StoreContext';

jest.mock('axios');
jest.mock('../../../context/StoreContext', () => ({
	addListenerAndCallImmediatelyWithChildrenActivity: jest.fn(() => jest.fn()),
	getDataFromPath: jest.fn(),
	setData: jest.fn(),
}));

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedListener = addListenerAndCallImmediatelyWithChildrenActivity as jest.Mock;
const mockedGet = getDataFromPath as jest.Mock;
const mockedSet = setStoreData as jest.Mock;

const pageExtractor = { getPageName: () => 'org' } as any;

// Let the in-flight GET settle. Timers are faked, so this has to be a real
// microtask drain rather than a timeout.
const flush = async () => {
	for (let i = 0; i < 5; i++) await Promise.resolve();
};

function subscribe(overrides: Partial<Parameters<typeof personalizationEvent>[0]> = {}) {
	return personalizationEvent({
		prefix: 'grid',
		personalizationBindingPath: 'Store.personalization.org.someKey',
		key: 'someKey',
		locationHistory: [],
		pageExtractor,
		...overrides,
	});
}

beforeEach(() => {
	jest.clearAllMocks();
	jest.useFakeTimers();
	mockedGet.mockReturnValue('appbuilder');
	mockedAxios.get.mockResolvedValue({ data: {} } as any);
	mockedAxios.post.mockResolvedValue({} as any);
});

afterEach(() => {
	jest.useRealTimers();
});

describe('personalizationEvent', () => {
	it('does nothing without a binding path', () => {
		expect(subscribe({ personalizationBindingPath: undefined })).toBeUndefined();
		expect(mockedAxios.get).not.toHaveBeenCalled();
		expect(mockedListener).not.toHaveBeenCalled();
	});

	it('builds the document url from the prefix, page and component key', () => {
		subscribe({ prefix: 'table' });
		expect(mockedAxios.get).toHaveBeenCalledWith(
			'api/ui/personalization/appbuilder/table_org_someKey',
			expect.anything(),
		);
	});

	it('seeds the store and calls onLoad with the saved document', async () => {
		const saved = { resizeSize: 460 };
		mockedAxios.get.mockResolvedValue({ data: saved } as any);
		const onLoad = jest.fn();

		subscribe({ onLoad });
		await flush();

		expect(mockedSet).toHaveBeenCalledWith('Store.personalization.org.someKey', saved, 'org');
		expect(onLoad).toHaveBeenCalledWith(saved);
	});

	// Regression: the GET used to run unwrapped, so the first-ever load — where no
	// document exists yet — raised an unhandled rejection.
	it('survives a failing fetch instead of rejecting', async () => {
		mockedAxios.get.mockRejectedValue(new Error('404'));
		const onLoad = jest.fn();

		expect(() => subscribe({ onLoad })).not.toThrow();
		await flush();

		expect(onLoad).not.toHaveBeenCalled();
		expect(mockedSet).not.toHaveBeenCalled();
	});

	it('posts a changed value once the debounce elapses', async () => {
		subscribe();
		await flush();

		const notify = mockedListener.mock.calls[0][1];
		notify('Store.personalization.org.someKey', { resizeSize: 520 });

		expect(mockedAxios.post).not.toHaveBeenCalled();
		jest.advanceTimersByTime(2000);

		expect(mockedAxios.post).toHaveBeenCalledWith(
			'api/ui/personalization/appbuilder/grid_org_someKey',
			{ resizeSize: 520 },
			expect.anything(),
		);
	});

	it('does not post a value equal to what was loaded', async () => {
		mockedAxios.get.mockResolvedValue({ data: { resizeSize: 300 } } as any);
		subscribe();
		await flush();

		mockedListener.mock.calls[0][1]('Store.personalization.org.someKey', { resizeSize: 300 });
		jest.advanceTimersByTime(2000);

		expect(mockedAxios.post).not.toHaveBeenCalled();
	});

	// Regression: the cancel used to read `if (!timeoutHandle) clearTimeout(...)`, so
	// a pending write was never cancelled and every intermediate value was POSTed.
	it('coalesces a burst of changes into one post of the last value', async () => {
		subscribe();
		await flush();

		const notify = mockedListener.mock.calls[0][1];
		notify('Store.personalization.org.someKey', { resizeSize: 400 });
		jest.advanceTimersByTime(1000);
		notify('Store.personalization.org.someKey', { resizeSize: 500 });
		jest.advanceTimersByTime(1000);
		notify('Store.personalization.org.someKey', { resizeSize: 600 });
		jest.advanceTimersByTime(2000);

		expect(mockedAxios.post).toHaveBeenCalledTimes(1);
		expect(mockedAxios.post).toHaveBeenCalledWith(
			expect.any(String),
			{ resizeSize: 600 },
			expect.anything(),
		);
	});

	it('returns the listener unsubscribe so callers can hand it to useEffect', async () => {
		const unsub = jest.fn();
		mockedListener.mockReturnValue(unsub);

		expect(subscribe()).toBe(unsub);
	});
});
