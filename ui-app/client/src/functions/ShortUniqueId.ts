import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { shortUUID } from '../util/shortUUID';

const SIGNATURE = new FunctionSignature('ShortUniqueId')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(
		new Map([Event.eventMapEntry(Event.OUTPUT, new Map([['id', Schema.ofString('id')]]))]),
	)
	.setDescription('Generates a short unique identifier string')
	.setDocumentation('# UIEngine.ShortUniqueId\n\nGenerates and returns a short unique identifier string. Useful for creating unique keys, reference IDs, or temporary identifiers without server-side generation.\n\n## Parameters\n\nNone\n\n## Events\n\n- **output**: Triggered with the generated ID\n  - `id` (String): A short unique identifier string\n\n## Use Cases\n\n- **Unique Keys**: Generate keys for dynamic list items or components\n- **Temporary IDs**: Create client-side IDs before server persistence\n- **Correlation IDs**: Generate IDs to track related operations\n- **Cache Busting**: Create unique suffixes for resource URLs');

export class ShortUniqueId extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		return new FunctionOutput([EventResult.outputOf(new Map([['id', shortUUID()]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
