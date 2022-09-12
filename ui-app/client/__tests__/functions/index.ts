import { NAMESPACE_UI_ENGINE } from '../../src/constants';
import { UIFunctionRepository } from '../../src/functions';
import { FetchData } from '../../src/functions/FetchData';

describe('Fucntion Repository Data', () => {
	test('Getting function', () => {
		expect(
			UIFunctionRepository.find(NAMESPACE_UI_ENGINE, 'FetchData'),
		).toBeInstanceOf(FetchData);
	});

	test('Getting function with wrong namespace', () => {
		expect(
			UIFunctionRepository.find(
				NAMESPACE_UI_ENGINE + 'FAKE',
				'FetchData',
			),
		).toBe(undefined);
	});
});
