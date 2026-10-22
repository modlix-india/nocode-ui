import { loadScript } from '../loadScript';

function lastScript(): HTMLScriptElement {
	const all = document.head.querySelectorAll('script');
	return all[all.length - 1] as HTMLScriptElement;
}

afterEach(() => {
	document.head.innerHTML = '';
	delete (globalThis as any).FakeSdk;
});

describe('loadScript', () => {
	test('one script tag per URL, resolving the global it defines', async () => {
		const a = loadScript('https://cdn.example/sdk-1.js', 'FakeSdk');
		const b = loadScript('https://cdn.example/sdk-1.js', 'FakeSdk');
		expect(document.head.querySelectorAll('script')).toHaveLength(1);
		expect(lastScript().src).toBe('https://cdn.example/sdk-1.js');

		(globalThis as any).FakeSdk = { ok: true };
		lastScript().onload!(new Event('load'));
		await expect(a).resolves.toEqual({ ok: true });
		await expect(b).resolves.toEqual({ ok: true });

		// Already defined: no new tag.
		await expect(loadScript('https://cdn.example/sdk-1.js', 'FakeSdk')).resolves.toEqual({
			ok: true,
		});
		expect(document.head.querySelectorAll('script')).toHaveLength(1);
	});

	test('a failed load rejects and is tried again next time', async () => {
		const a = loadScript('https://cdn.example/sdk-2.js', 'FakeSdk');
		lastScript().onerror!(new Event('error'));
		await expect(a).rejects.toThrow('Could not load https://cdn.example/sdk-2.js');

		const b = loadScript('https://cdn.example/sdk-2.js', 'FakeSdk');
		expect(document.head.querySelectorAll('script')).toHaveLength(2);
		lastScript().onload!(new Event('load'));
		await expect(b).rejects.toThrow('did not define FakeSdk');
	});
});
