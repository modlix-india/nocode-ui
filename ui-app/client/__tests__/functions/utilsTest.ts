import { queryParamsSerializer, pathFromParams } from '../../src/functions/utils';

describe('Handiling array values accroding to the HTTP Get RFC', () => {
	test('Array Value at level 1', () => {
		expect(queryParamsSerializer({ fileType: ['images', 'videos'] })?.[1]).toBe(
			'fileType=images&fileType=videos',
		);
		expect(queryParamsSerializer({ fileType: ['images'] })?.[1]).toBe('fileType=images');

		expect(queryParamsSerializer({ fileType: 'images' })?.[1]).toBe('fileType=images');

		expect(queryParamsSerializer({ fileType: 'images,videos' })?.[1]).toBe(
			'fileType=images%2Cvideos',
		);
	});

	test('Array Value at level 2', () => {
		expect(
			queryParamsSerializer({ fileType: [{ type: 'images' }, { type: 'videos' }] })?.[1],
		).toBe('fileType[0].type=images&fileType[1].type=videos');
		expect(queryParamsSerializer({ fileType: [{ type: 'images' }] })?.[1]).toBe(
			'fileType[0].type=images',
		);
		expect(queryParamsSerializer({ fileType: { type: 'images' } })?.[1]).toBe(
			'fileType.type=images',
		);
	});
});

describe('Function Util test', () => {
	test('Query Path Serializer', () => {
		expect(queryParamsSerializer({ a: 3 })?.[1]).toBe('a=3');

		expect(queryParamsSerializer({ a: { b: 4 } })?.[1]).toBe('a.b=4');

		expect(queryParamsSerializer({ a: { b: [4, 5] } })?.[1]).toBe('a.b[0]=4&a.b[1]=5');

		expect(
			queryParamsSerializer({
				a: { b: [{ c: 'kiran' }, { c: 'kumar' }] },
			})?.[1],
		).toBe('a.b[0].c=kiran&a.b[1].c=kumar');
	});
	test('Path params url replaces by value', () => {
		const url = '/api/user/{userId}';
		const pathObject = { userId: 14567 };
		expect(pathFromParams(url, pathObject)).toBe('/api/user/14567');
	});

	test('Path params url replaces by value', () => {
		const url = '/api/user/{userId}/{anotherId}/finally/{anObj}';
		const pathObject = {
			userId: 14567,
			anotherId: 'Eureka',
			anObj: { hello: 'world' },
		};
		expect(pathFromParams(url, pathObject)).toBe(
			'/api/user/14567/Eureka/finally/[object Object]',
		);
	});

	test('Path params url replaces by value', () => {
		const url = '/api/user/{userId}/{anotherId}/finally/{anObj}';
		const pathObject = {
			userId: 14567,
			anotherId: 'Eureka',
			anObj: ['hello', 'World'],
		};
		expect(pathFromParams(url, pathObject)).toBe('/api/user/14567/Eureka/finally/hello,World');
	});
});
