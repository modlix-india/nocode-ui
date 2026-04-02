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
	)
	.setDescription('Copies the specified text to the system clipboard')
	.setDocumentation('# UIEngine.CopyTextToClipboard\n\nCopies the specified text to the system clipboard using the Clipboard API (`navigator.clipboard.writeText`). Requires a secure context (HTTPS) in most browsers.\n\n## Parameters\n\n- **text** (String, required): The text content to copy to the clipboard\n\n## Events\n\n- **output**: Triggered on successful copy\n- **error**: Triggered if the clipboard operation fails\n  - `data` (Any): Error details\n\n## Use Cases\n\n- **Share Links**: Copy shareable URLs to clipboard\n- **Copy Codes**: Copy referral codes, verification codes, or API keys\n- **Export Data**: Quick copy of formatted text or data\n- **Developer Tools**: Copy generated snippets or configuration');

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
