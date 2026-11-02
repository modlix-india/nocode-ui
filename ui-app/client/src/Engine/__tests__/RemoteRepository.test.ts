import axios from 'axios';
import { REPO_SERVER, REPO_TYPE, RemoteRepository } from '../RemoteRepository';
import { getDataFromPath } from '../../context/StoreContext';

jest.mock('axios', () => ({ get: jest.fn(), post: jest.fn() }));
jest.mock('../../context/StoreContext', () => ({ getDataFromPath: jest.fn() }));

const mockedGet = axios.get as jest.Mock;
const mockedStore = getDataFromPath as jest.Mock;

const conversion = (json: any) => json?.definition ?? undefined;

function repo(server = REPO_SERVER.CORE) {
	return new RemoteRepository<any>(
		undefined,
		undefined,
		conversion,
		false,
		REPO_TYPE.FUNCTION,
		server,
	);
}

function answer(definition: any) {
	return Promise.resolve({ data: { definition } });
}

beforeEach(() => {
	window.localStorage.clear();
	mockedGet.mockReset();
	mockedStore.mockImplementation((path: string) =>
		path.endsWith('.url') ? { appCode: 'loopzump', clientCode: 'SYSTEM' } : undefined,
	);
	globalThis.isDesignMode = false;
});

test('a new page load answers from the stored signature without waiting', async () => {
	mockedGet.mockReturnValueOnce(answer({ name: 'listProjects', v: 1 }));
	expect(await repo().find('loopzump', 'listProjects')).toEqual({ name: 'listProjects', v: 1 });

	// The next load's fetch never answers, yet find returns at once.
	mockedGet.mockReturnValueOnce(new Promise(() => {}));
	expect(await repo().find('loopzump', 'listProjects')).toEqual({ name: 'listProjects', v: 1 });
	expect(mockedGet).toHaveBeenCalledTimes(2);
});

test('the background refresh replaces the stored copy', async () => {
	mockedGet.mockReturnValueOnce(answer({ v: 1 }));
	await repo().find('loopzump', 'f');

	mockedGet.mockReturnValueOnce(answer({ v: 2 }));
	expect(await repo().find('loopzump', 'f')).toEqual({ v: 1 });
	await Promise.resolve();
	await Promise.resolve();

	mockedGet.mockReturnValueOnce(new Promise(() => {}));
	expect(await repo().find('loopzump', 'f')).toEqual({ v: 2 });
});

test('a function that is gone is forgotten', async () => {
	mockedGet.mockReturnValueOnce(answer({ v: 1 }));
	await repo().find('loopzump', 'f');

	mockedGet.mockReturnValueOnce(answer(null));
	await repo().find('loopzump', 'f');
	await Promise.resolve();
	await Promise.resolve();

	mockedGet.mockReturnValueOnce(answer({ v: 3 }));
	expect(await repo().find('loopzump', 'f')).toEqual({ v: 3 });
});

test('copies are kept per app', async () => {
	mockedGet.mockReturnValueOnce(answer({ app: 'loopzump' }));
	await repo().find('loopzump', 'f');

	mockedStore.mockImplementation((path: string) =>
		path.endsWith('.url') ? { appCode: 'leadzump', clientCode: 'SYSTEM' } : undefined,
	);
	mockedGet.mockReturnValueOnce(answer({ app: 'leadzump' }));
	expect(await repo().find('loopzump', 'f')).toEqual({ app: 'leadzump' });
});

test('ui functions and design mode always fetch', async () => {
	mockedGet.mockReturnValue(answer({ v: 1 }));
	await repo(REPO_SERVER.UI).find('loopzump', 'f');
	expect(window.localStorage.length).toBe(0);

	globalThis.isDesignMode = true;
	await repo().find('loopzump', 'f');
	expect(window.localStorage.length).toBe(0);
});
