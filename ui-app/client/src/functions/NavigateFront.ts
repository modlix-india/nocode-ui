import {
	FunctionSignature,
	AbstractFunction,
	FunctionExecutionParameters,
	FunctionOutput,
	EventResult,
	Event,
} from '@fincity/kirun-js';

import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('NavigateFront')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

export class NavigateFront extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		window.history.go();
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
