import {
	FunctionSignature,
	AbstractFunction,
	FunctionExecutionParameters,
	FunctionOutput,
	EventResult,
	Event,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('Refresh')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

export class Refresh extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		window.location.reload();
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
