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
	)
	.setDescription('Dynamically executes a named JavaScript function with provided parameters')
	.setDocumentation('# UIEngine.ExecuteJSFunction\n\nDynamically executes a JavaScript function by name with provided parameters. Uses the Function constructor to invoke the named function, allowing integration with global JavaScript functions or third-party libraries.\n\n## Parameters\n\n- **name** (String, required): The fully qualified JavaScript function name to execute (e.g., `console.log`, `Math.round`)\n- **params** (Any[], required): Array of parameters to pass to the function\n\n## Events\n\n- **output**: Triggered on successful execution\n  - `result` (Any): The return value from the executed function\n- **error**: Triggered if the function execution fails\n  - `data` (Any): Error details\n\n## Use Cases\n\n- **Third-Party Integration**: Call functions from external JavaScript libraries\n- **Custom Logic**: Execute custom JavaScript functions defined in the global scope\n- **Dynamic Computation**: Perform calculations using built-in JavaScript functions\n- **Legacy Integration**: Interface with existing JavaScript codebases');

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
