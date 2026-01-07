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
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

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
