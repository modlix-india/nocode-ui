import { crumbTargetPath } from '../LazyFileBrowser';

describe('FileBrowser breadcrumb target', () => {
	test('unrestricted crumbs are the path itself', () => {
		expect(crumbTargetPath('', '/a', false)).toBe('/');
		expect(crumbTargetPath('/a/b', '/a', false)).toBe('/a/b');
		expect(crumbTargetPath('/a', undefined, true)).toBe('/a');
	});
	test('restricted crumbs map back under the start folder', () => {
		const start = '/_withInSubClient/products/420';
		expect(crumbTargetPath('420', start, true)).toBe('/_withInSubClient/products/420');
		expect(crumbTargetPath('420/Channel Partner', start, true)).toBe(
			'/_withInSubClient/products/420/Channel Partner',
		);
		expect(crumbTargetPath('420', start + '/', true)).toBe('/_withInSubClient/products/420');
	});
	test('a one level start folder keeps its leading slash', () => {
		expect(crumbTargetPath('420', '/420', true)).toBe('/420');
	});
});
