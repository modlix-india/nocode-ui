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
	duplicate,
	isNullValue,
} from '@fincity/kirun-js';
import { GLOBAL_CONTEXT_NAME, NAMESPACE_UI_ENGINE } from '../constants';
import { getData, PageStoreExtractor, setData } from '../context/StoreContext';
import { ParentExtractorForRunEvent } from '../context/ParentExtractor';

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
		let path: string = context.getArguments()?.get('path');
		const value = context.getArguments()?.get('value');

		const tve = context.getValuesMap().get('Page.') as PageStoreExtractor;

		if (path.length) {
			if (path.startsWith('Parent.')) {
				const pve = context.getValuesMap().get('Parent.');
				if (pve instanceof ParentExtractorForRunEvent) {
					path = pve.computeParentPath(path);
				}
			}
			setData(
				path,
				isNullValue(value) ? value : duplicate(value),
				tve?.getPageName() ?? GLOBAL_CONTEXT_NAME,
			);
		}
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
