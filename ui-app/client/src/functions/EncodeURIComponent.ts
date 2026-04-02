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

const SIGNATURE = new FunctionSignature('EncodeURIComponent')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(new Map([Parameter.ofEntry('uriComponent', Schema.ofString('uriComponent'))]))
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([['encodedValue', Schema.ofString('encodedValue')]]),
			),
		]),
	)
	.setDescription('Encodes a string as a URI component for safe use in URLs')
	.setDocumentation('# UIEngine.EncodeURIComponent\n\nEncodes a URI component string using JavaScript\'s native `encodeURIComponent()` function. Escapes special characters so the string can be safely used as a URL parameter value.\n\n## Parameters\n\n- **uriComponent** (String, required): The string to encode\n\n## Events\n\n- **output**: Triggered with the encoded result\n  - `encodedValue` (String): The URL-encoded string\n\n## Use Cases\n\n- **URL Building**: Safely encode parameter values for URL construction\n- **Query Strings**: Encode user input before adding to query parameters\n- **API Calls**: Encode values for REST API URL segments\n- **Deep Linking**: Encode complex values for shareable URLs');

export class EncodeURIComponent extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const uriComponent: string = context.getArguments()?.get('uriComponent');
		return new FunctionOutput([
			EventResult.outputOf(new Map([['encodedValue', encodeURIComponent(uriComponent)]])),
		]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
