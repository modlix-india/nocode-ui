import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Parameter,
	Schema,
	TokenValueExtractor,
} from '@fincity/kirun-js';
import { GLOBAL_CONTEXT_NAME, NAMESPACE_UI_ENGINE } from '../constants';
import { getData, PageStoreExtractor, setData } from '../context/StoreContext';

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
		console.log('context', context);
		const path: string = context.getArguments()?.get('path');
		const value = context.getArguments()?.get('value');

		const tve = context.getValuesMap().get('Page.') as PageStoreExtractor;

		if (path.length) setData(path, value, tve?.getPageName() ?? GLOBAL_CONTEXT_NAME);
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
