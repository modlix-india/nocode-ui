import {
	FunctionSignature,
	AbstractFunction,
	FunctionExecutionParameters,
	FunctionOutput,
	EventResult,
	Event,
} from '@fincity/kirun-js';

import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('NavigateForward')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Navigates to the next page in browser history')
	.setDocumentation('# UIEngine.NavigateForward\n\nNavigates to the next page in the browser history by calling `window.history.forward()`. Equivalent to the user clicking the browser forward button. Only works if the user has previously navigated back.\n\n## Parameters\n\nNone\n\n## Events\n\n- **output**: Triggered after navigation is initiated\n\n## Use Cases\n\n- **Forward Navigation**: Provide in-app forward button functionality\n- **Redo Navigation**: Return to a page after going back\n- **Navigation Controls**: Build custom browser-like navigation controls');

export class NavigateForward extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		window.history.forward();
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
