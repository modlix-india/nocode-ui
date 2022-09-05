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
import { getData } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('GetStoreData')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry(
				'path',
				Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`),
			),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([['data', Schema.ofAny('data')]]),
			),
		]),
	);

export class SetStore extends AbstractFunction {
	protected async internalExecute(
		context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		const path: string = getData(context.getArguments()?.get('path'));
		const data = getData(path);
		return new FunctionOutput([
			EventResult.outputOf(new Map([['data', data]])),
		]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
