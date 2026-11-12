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
import { addMessage, MESSAGE_TYPE, toastActions, toastDetails } from '../App/Messages/Messages';
import { PageStoreExtractor } from '../context/StoreContext';
import { NAMESPACE_UI_ENGINE, GLOBAL_CONTEXT_NAME } from '../constants';

const SIGNATURE = new FunctionSignature('Message')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('msg', Schema.ofAny('msg')),
			Parameter.ofEntry(
				'isGlobalScope',
				Schema.ofBoolean('isGlobalScope').setDefaultValue(true),
			),
			Parameter.ofEntry(
				'pageName',
				Schema.ofString('pageName').setDefaultValue(GLOBAL_CONTEXT_NAME),
			),
			Parameter.ofEntry(
				'type',
				Schema.ofString('type')
					.setEnums(['ERROR', 'WARNING', 'INFO', 'SUCCESS'])
					.setDefaultValue('ERROR'),
			),
			Parameter.ofEntry(
				'actions',
				Schema.ofArray('actions', Schema.ofAny('action')).setDefaultValue([]),
			),
			Parameter.ofEntry('sticky', Schema.ofBoolean('sticky').setDefaultValue(false)),
			Parameter.ofEntry('details', Schema.ofAny('details')),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Displays a notification message to the user with configurable type and scope')
	.setDocumentation(
		"# UIEngine.Message\n\nAdds a notification message to the application's message queue. Messages can be displayed globally or scoped to a specific page. Supports different message types for various severity levels.\n\n## Parameters\n\n- **msg** (Any, required): The message content to display\n- **isGlobalScope** (Boolean, optional, default: true): If true, the message is shown globally; if false, scoped to a specific page\n- **pageName** (String, optional, default: '__GLOBAL__'): The page name for page-scoped messages\n- **type** (String, optional, default: 'ERROR'): Message severity type\n  - `ERROR`: Error notification (red)\n  - `WARNING`: Warning notification (yellow/orange)\n  - `INFO`: Informational notification (blue)\n  - `SUCCESS`: Success notification (green)\n- **actions** (Array, optional, default: []): Buttons on the toast, each `{ label, eventFunction?, function?, path?, value? }`. A click writes `value` to `path` (when given), runs the page event named by `eventFunction` (its key or its name) on the page that raised the toast, or the function `function` (`Namespace.Name`), then closes the toast.\n- **sticky** (Boolean, optional, default: false): Keeps the toast until its close icon or one of its actions is clicked, instead of removing it after the app's message timeout.\n- **details** (String or Array of Strings, optional): Extra lines behind a Details button; the toast grows to show them when it is clicked.\n\nWithout `actions`, `sticky` and `details` a toast looks and behaves as it always did.\n\n## Events\n\n- **output**: Triggered after the message is added to the queue\n\n## Use Cases\n\n- **Form Validation Feedback**: Show errors when form validation fails\n- **Operation Confirmation**: Confirm successful save, delete, or update operations\n- **API Error Display**: Show user-friendly error messages from API failures\n- **Warnings**: Alert users about potential issues or required actions",
	);

export class Message extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const error: any = context.getArguments()?.get('msg');
		const isGlobalScope: boolean = context.getArguments()?.get('isGlobalScope');
		const pageName: string = context.getArguments()?.get('pageName');
		const type: MESSAGE_TYPE = context.getArguments()?.get('type') as MESSAGE_TYPE;
		const actions: any[] = context.getArguments()?.get('actions') ?? [];
		const sticky: boolean = context.getArguments()?.get('sticky') ?? false;
		const details: any = context.getArguments()?.get('details');
		// The page whose event raised the toast: an action runs that page's event, and writes
		// its `Page.` paths, even when the user has moved on to another page since.
		const page = (
			context.getValuesMap().get('Page.') as PageStoreExtractor | undefined
		)?.getPageName?.();

		addMessage(type, error, isGlobalScope, pageName, {
			actions: toastActions(actions),
			sticky,
			details: toastDetails(details),
			page,
		});

		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
