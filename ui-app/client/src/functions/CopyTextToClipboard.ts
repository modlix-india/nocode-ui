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

const SIGNATURE = new FunctionSignature('CopyTextToClipboard')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(new Map([Parameter.ofEntry('text', Schema.ofString('text'))]))
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map()),
			Event.eventMapEntry(Event.ERROR, new Map([['data', Schema.ofAny('data')]])),
		]),
	);

export class CopyTextToClipboard extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const text: string = context.getArguments()?.get('text');
		try {
			await navigator.clipboard.writeText(text);
		} catch (error) {
			return new FunctionOutput([
				EventResult.of(Event.ERROR, new Map([['data', error]])),
				EventResult.outputOf(new Map([['data', null]])),
			]);
		}
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
