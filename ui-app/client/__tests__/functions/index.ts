import { NAMESPACE_UI_ENGINE } from '../../src/constants';
import { UIFunctionRepository } from '../../src/functions';
import { FetchData } from '../../src/functions/FetchData';

describe('Fucntion Repository Data', () => {
	test('Getting function', async () => {
		expect(await UIFunctionRepository.find(NAMESPACE_UI_ENGINE, 'FetchData')).toBeInstanceOf(
			FetchData,
		);
	});

	test('Getting function with wrong namespace', async () => {
		expect(
			await UIFunctionRepository.find(NAMESPACE_UI_ENGINE + 'FAKE', 'FetchData'),
		).toBeUndefined();
	});
});
