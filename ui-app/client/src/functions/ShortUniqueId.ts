import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { shortUUID } from '../util/shortUUID';

const SIGNATURE = new FunctionSignature('ShortUniqueId')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(
		new Map([Event.eventMapEntry(Event.OUTPUT, new Map([['id', Schema.ofString('id')]]))]),
	);

export class ShortUniqueId extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		return new FunctionOutput([EventResult.outputOf(new Map([['id', shortUUID()]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
