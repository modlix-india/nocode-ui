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
import { getData, setData } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('SetStore')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('path', Schema.ofString('path')),
			Parameter.ofEntry('value', Schema.ofAny('value')),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

export class SetStore extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const path: string = context.getArguments()?.get('path');
		const value = context.getArguments()?.get('value');
		console.log(`${path} -->`, value);
		if (path.length) setData(path, value);
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
