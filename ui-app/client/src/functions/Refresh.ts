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
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Reloads the current page in the browser')
	.setDocumentation('# UIEngine.Refresh\n\nReloads the current page by calling `window.location.reload()`. This performs a full page reload, re-fetching all resources and re-initializing the application.\n\n## Parameters\n\nNone\n\n## Events\n\n- **output**: Triggered before the page reload begins\n\n## Use Cases\n\n- **Force Refresh**: Reload the page after critical data changes\n- **Error Recovery**: Attempt to recover from unexpected application states\n- **Cache Clearing**: Force re-fetch of all resources after updates\n- **Post-Update Reload**: Refresh after applying configuration changes');

export class Refresh extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		window.location.reload();
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
