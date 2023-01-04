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
import { NAMESPACE_UI_ENGINE, SCHEMA_REF_DATA_LOCATION } from '../constants';
import { getData, getDataFromPath } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('GetStoreData')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(new Map([Parameter.ofEntry('path', Schema.ofString('path'))]))
	.setEvents(
		new Map([Event.eventMapEntry(Event.OUTPUT, new Map([['data', Schema.ofAny('data')]]))]),
	);

export class GetStoreData extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const evmap = [...context.getValuesMap().values()];
		const data = getData(context.getArguments()?.get('path'), [], ...evmap);
		return new FunctionOutput([EventResult.outputOf(new Map([['data', data]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
