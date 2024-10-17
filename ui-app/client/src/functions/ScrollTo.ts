import {
	FunctionSignature,
	AbstractFunction,
	FunctionExecutionParameters,
	FunctionOutput,
	EventResult,
	Event,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('ScrollTo')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('vertical', Schema.ofString('vertical')),
			Parameter.ofEntry('horizontal', Schema.ofString('horizontal')),
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
			behavior: behaviour == 'Instant' ? 'instant' : 'smooth',
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
	return parsedValue;
}

function caluclateLeft(horizontal: string): number {
	if (horizontal == 'left') return 0;
	if (horizontal == 'right') return document.body.scrollWidth;
	const parsedValue = parseInt(horizontal);
	return parsedValue;
}
