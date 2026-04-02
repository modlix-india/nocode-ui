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
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Sets or deletes a value at a specified path in the application store')
	.setDocumentation('# UIEngine.SetStore\n\nSets data at a specified path in the application store (Store, Page, or Parent scope). Creates a deep copy of the value before storing to prevent unintended reference mutations. Can also delete keys from the store.\n\n## Parameters\n\n- **path** (String, required): The store path to set the value at\n  - Examples: `Store.user.name`, `Page.formData.email`, `Parent.items`\n  - Supports `Parent.` prefix for updating parent component store in nested contexts\n- **value** (Any, optional): The value to set at the specified path\n- **deleteKey** (Boolean, optional, default: false): If true, deletes the key at the path instead of setting a value\n\n## Events\n\n- **output**: Triggered after the store is updated\n\n## Use Cases\n\n- **Form State Management**: Update form field values in the store\n- **User Session Data**: Store user preferences or session information\n- **Component Communication**: Share data between components via the store\n- **Reset State**: Clear or delete temporary data after processing\n- **Parent Updates**: Update parent component state from child components');

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
