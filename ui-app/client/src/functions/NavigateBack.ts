import {
	FunctionSignature,
	AbstractFunction,
	FunctionExecutionParameters,
	FunctionOutput,
	EventResult,
	Event,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('NavigateBack')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Navigates to the previous page in browser history')
	.setDocumentation('# UIEngine.NavigateBack\n\nNavigates to the previous page in the browser history by calling `window.history.back()`. Equivalent to the user clicking the browser back button.\n\n## Parameters\n\nNone\n\n## Events\n\n- **output**: Triggered after navigation is initiated\n\n## Use Cases\n\n- **Cancel Actions**: Return to the previous page when the user cancels an operation\n- **Back Navigation**: Provide in-app back button functionality\n- **Form Cancellation**: Navigate away from a form without saving');

export class NavigateBack extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		window.history.back();
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
