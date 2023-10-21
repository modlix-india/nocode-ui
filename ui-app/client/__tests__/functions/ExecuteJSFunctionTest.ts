import {
	FunctionExecutionParameters,
	KIRunFunctionRepository,
	KIRunSchemaRepository,
} from '@fincity/kirun-js';
import { ExecuteJSFunction } from '../../src/functions/ExecuteJSFunction';

describe('ExecuteJSFunction test', () => {
	test('Javascript Math Function', async () => {
		const ejsf = new ExecuteJSFunction();
		let result = await ejsf.execute(
			new FunctionExecutionParameters(
				new KIRunFunctionRepository(),
				new KIRunSchemaRepository(),
			).setArguments(
				new Map<string, any>([
					['name', 'Math.pow'],
					['params', [10, 2]],
				]),
			),
		);
		expect(result.allResults()[0].getResult().get('result')).toBe(100);
	});

	test('Javascript Random Function', async () => {
		const ejsf = new ExecuteJSFunction();
		let result = await ejsf.execute(
			new FunctionExecutionParameters(
				new KIRunFunctionRepository(),
				new KIRunSchemaRepository(),
			).setArguments(new Map<string, any>([['name', 'Math.random']])),
		);
		expect(result.allResults()[0].getResult().get('result')).toBeLessThan(1);
	});

	test('Javascript No Function', async () => {
		const ejsf = new ExecuteJSFunction();
		let result = await ejsf.execute(
			new FunctionExecutionParameters(
				new KIRunFunctionRepository(),
				new KIRunSchemaRepository(),
			).setArguments(new Map<string, any>([['name', '']])),
		);
		expect(result.allResults()[0].getResult().get('data')).toBeInstanceOf(Error);
	});

	test('Javascript Unknown Function', async () => {
		const ejsf = new ExecuteJSFunction();
		let result = await ejsf.execute(
			new FunctionExecutionParameters(
				new KIRunFunctionRepository(),
				new KIRunSchemaRepository(),
			).setArguments(new Map<string, any>([['name', 'UnknownFunction']])),
		);
		expect(result.allResults()[0].getResult().get('data')).toBeInstanceOf(Error);
	});
});
