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

const SIGNATURE = new FunctionSignature('ScrollToGrid')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('gridkey', Schema.ofString('gridkey')),
			Parameter.ofEntry(
				'behaviour',
				Schema.ofString('behaviour')
					.setEnums(['Instant', 'Smooth'])
					.setDefaultValue('Instant'),
			),
			Parameter.ofEntry('index', Schema.ofInteger('index').setDefaultValue(0)),
			Parameter.ofEntry(
				'block',
				Schema.ofString('block')
					.setEnums(['Start', 'Center', 'End', 'Nearest'])
					.setDefaultValue('Start'),
			),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Scrolls a specific grid component into view by its element ID')
	.setDocumentation(
		"# UIEngine.ScrollToGrid\n\nScrolls a specific grid component into view using its element ID and the `scrollIntoView` API. Useful for programmatically focusing on a data grid or any element by its ID.\n\n## Parameters\n\n- **gridkey** (String, required): The DOM element ID of the grid to scroll to\n- **behaviour** (String, optional, default: 'Instant'): Scroll animation behavior\n  - `Instant`: Jump immediately to the element\n  - `Smooth`: Animate smoothly to the element\n- **index** (Integer, optional, default: 0): Which element with that ID, counted from 0. A component inside an ArrayRepeater renders one element per row, all with the same ID, so the row's index picks the row\n- **block** (String, optional, default: 'Start'): Where the element lands: `Start`, `Center`, `End` or `Nearest`\n\n## Events\n\n- **output**: Triggered after the scroll operation\n\n## Use Cases\n\n- **Data Grid Focus**: Scroll to a specific data grid after filtering or searching\n- **Element Navigation**: Jump to any element by its ID\n- **Form Sections**: Scroll to a specific section of a form\n- **Error Highlighting**: Scroll to a component that has validation errors",
	);

export class ScrollToGrid extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const gridkey: string = context.getArguments()?.get('gridkey');
		const behaviour: string = context.getArguments()?.get('behaviour');
		const index: number = context.getArguments()?.get('index') ?? 0;
		const block: string = context.getArguments()?.get('block') ?? 'Start';
		const gridElement =
			index > 0
				? document.querySelectorAll(`[id="${gridkey.replace(/["\\]/g, '\\$&')}"]`)[index]
				: document.getElementById(gridkey);

		gridElement?.scrollIntoView({
			behavior: behaviour.toLowerCase() == 'instant' ? 'instant' : 'smooth',
			block: block.toLowerCase() as ScrollLogicalPosition,
		});

		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
