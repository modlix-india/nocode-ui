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

const SIGNATURE = new FunctionSignature('DecodeURIComponent')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(new Map([Parameter.ofEntry('uriComponent', Schema.ofString('uriComponent'))]))
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([['decodedValue', Schema.ofString('decodedValue')]]),
			),
		]),
	)
	.setDescription('Decodes a URI-encoded string back to its original form')
	.setDocumentation('# UIEngine.DecodeURIComponent\n\nDecodes a URI component string using JavaScript\'s native `decodeURIComponent()` function. Converts percent-encoded characters back to their original form.\n\n## Parameters\n\n- **uriComponent** (String, required): The URI-encoded string to decode\n\n## Events\n\n- **output**: Triggered with the decoded result\n  - `decodedValue` (String): The decoded string\n\n## Use Cases\n\n- **URL Parsing**: Decode values extracted from URL parameters\n- **Display Values**: Convert encoded strings for user-friendly display\n- **Data Processing**: Decode incoming encoded data from external sources\n- **Deep Link Handling**: Decode parameters from shared URLs');

export class DecodeURIComponent extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const uriComponent: string = context.getArguments()?.get('uriComponent');
		return new FunctionOutput([
			EventResult.outputOf(new Map([['decodedValue', decodeURIComponent(uriComponent)]])),
		]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
