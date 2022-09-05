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
			Parameter.ofEntry(
				'path',
				Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`),
			),
			Parameter.ofEntry(
				'value',
				Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UrlParameters`),
			),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

export class SetStore extends AbstractFunction {
	protected async internalExecute(
		context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		const path: string = getData(context.getArguments()?.get('path'));
		const value = getData(context.getArguments()?.get('value'));
		setData(path, value);
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
