import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('ExecuteJSFunction')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('name', Schema.ofString('name')),
			Parameter.ofEntry('params', Schema.ofRef('System.any'), true),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['result', Schema.ofAny('result')]])),
			Event.eventMapEntry(Event.ERROR, new Map([['data', Schema.ofAny('data')]])),
		]),
	);

export class ExecuteJSFunction extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const name: string = context.getArguments()?.get('name');
		const params: any[] = context.getArguments()?.get('params');
		let result: any = undefined;
		try {
			const args = params.map((_, i) => `arg${i}`);
			const func: Function = new Function(...args, `return ${name}(${args.join(',')})`);
			result = func(...params);
		} catch (error) {
			return new FunctionOutput([
				EventResult.of(Event.ERROR, new Map([['data', error]])),
				EventResult.outputOf(new Map([['data', null]])),
			]);
		}
		return new FunctionOutput([EventResult.outputOf(new Map([['result', result]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
