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
import { NAMESPACE_UI_ENGINE, SCHEMA_DATA_LOCATION } from '../constants';
import { getData, getDataFromPath } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('GetStoreData')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(new Map([Parameter.ofEntry('path', Schema.ofString('path'))]))
	.setEvents(
		new Map([Event.eventMapEntry(Event.OUTPUT, new Map([['data', Schema.ofAny('data')]]))]),
	)
	.setDescription('Retrieves data from the application store at a specified path')
	.setDocumentation('# UIEngine.GetStoreData\n\nRetrieves data from the application store at a specified path. Evaluates the path using the expression context to resolve any dynamic references.\n\n## Parameters\n\n- **path** (String, required): The store path to retrieve data from\n  - Examples: `Store.user.name`, `Page.formData`, `LocalStore.AuthToken`\n\n## Events\n\n- **output**: Triggered with the retrieved data\n  - `data` (Any): The value found at the specified store path\n\n## Use Cases\n\n- **Data Access**: Read values from the store for conditional logic\n- **Dynamic Expressions**: Retrieve data using dynamically constructed paths\n- **Cross-Component Data**: Access data set by other components\n- **Store Inspection**: Check current store values during workflow execution');

export class GetStoreData extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const evmap = [...Array.from(context.getValuesMap().values())];
		const data = getData(context.getArguments()?.get('path'), [], ...evmap);
		return new FunctionOutput([EventResult.outputOf(new Map([['data', data]]))]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
