import {
	AbstractFunction,
	duplicate,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	isNullValue,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import { GLOBAL_CONTEXT_NAME, NAMESPACE_UI_ENGINE } from '../constants';
import { ParentExtractorForRunEvent } from '../context/ParentExtractor';
import { PageStoreExtractor, setData } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('SetStore')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('path', Schema.ofString('path')),
			Parameter.ofEntry('value', Schema.ofAny('value')),
			Parameter.ofEntry('deleteKey', Schema.ofBoolean('deleteKey').setDefaultValue(false)),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

export class SetStore extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		let path: string = context.getArguments()?.get('path');
		const value = context.getArguments()?.get('value');
		const deleteKey: boolean = context.getArguments()?.get('deleteKey');

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
				deleteKey,
			);
		}
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
