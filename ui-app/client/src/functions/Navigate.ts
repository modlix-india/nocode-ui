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
import { getHref } from '../components/util/getHref';
import { NAMESPACE_UI_ENGINE } from '../constants';

const SIGNATURE = new FunctionSignature('Navigate')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('linkPath', Schema.ofString('linkPath')),
			Parameter.ofEntry('target', Schema.ofString('target').setDefaultValue('_self')),
			Parameter.ofEntry('force', Schema.ofBoolean('force').setDefaultValue(false)),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

export class Navigate extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const linkPath: string = context.getArguments()?.get('linkPath');
		const target = context.getArguments()?.get('target');
		const force = context.getArguments()?.get('force');

		const url = getHref(linkPath, window.location);

		if (target === '_self' && !force && !url?.startsWith("http")) {			
			window.history.pushState(undefined, '', url);
			window.history.back();
			setTimeout(() => window.history.forward(), 100);
		} else window.open(url, target);

		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
