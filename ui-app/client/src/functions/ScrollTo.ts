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

const SIGNATURE = new FunctionSignature('ScrollTo')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('vertical', Schema.ofString('vertical').setDefaultValue('top')),
			Parameter.ofEntry('horizontal', Schema.ofString('horizontal').setDefaultValue('left')),
			Parameter.ofEntry(
				'behaviour',
				Schema.ofString('behaviour')
					.setEnums(['Instant', 'Smooth'])
					.setDefaultValue('Instant'),
			),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]))
	.setDescription('Scrolls the window to a specified vertical and horizontal position')
	.setDocumentation('# UIEngine.ScrollTo\n\nScrolls the browser window to a specified position. Supports named positions (top, bottom, left, right) or exact pixel values. The scroll behavior can be instant or smooth.\n\n## Parameters\n\n- **vertical** (String, optional, default: \'top\'): Vertical scroll position\n  - `top`: Scroll to the top of the page\n  - `bottom`: Scroll to the bottom of the page\n  - Any numeric string (e.g., `"200"`): Scroll to that pixel offset from the top\n- **horizontal** (String, optional, default: \'left\'): Horizontal scroll position\n  - `left`: Scroll to the left edge\n  - `right`: Scroll to the right edge\n  - Any numeric string (e.g., `"100"`): Scroll to that pixel offset from the left\n- **behaviour** (String, optional, default: \'Instant\'): Scroll animation behavior\n  - `Instant`: Jump immediately to the position\n  - `Smooth`: Animate smoothly to the position\n\n## Events\n\n- **output**: Triggered after the scroll operation\n\n## Use Cases\n\n- **Back to Top**: Scroll to the top of a long page\n- **Form Focus**: Scroll to a form section after validation errors\n- **Content Navigation**: Jump to specific sections on a page\n- **Infinite Scroll**: Scroll to load more content positions');

export class ScrollTo extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const vertical: string = context.getArguments()?.get('vertical');
		const horizontal: string = context.getArguments()?.get('horizontal');
		const behaviour: string = context.getArguments()?.get('behaviour');
		window.scrollTo({
			top: caluclateTop(vertical.toLowerCase()),
			left: caluclateLeft(horizontal.toLowerCase()),
			behavior: behaviour.toLowerCase() == 'instant' ? 'instant' : 'smooth',
		});
		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
function caluclateTop(vertical: string): number {
	if (vertical == 'top') return 0;
	if (vertical == 'bottom') return document.body.scrollHeight;

	const parsedValue = parseInt(vertical);
	if (isNaN(parsedValue)) return 0;
	return parsedValue;
}

function caluclateLeft(horizontal: string): number {
	if (horizontal == 'left') return 0;
	if (horizontal == 'right') return document.body.scrollWidth;
	const parsedValue = parseInt(horizontal);
	if (isNaN(parsedValue)) return 0;
	return parsedValue;
}
