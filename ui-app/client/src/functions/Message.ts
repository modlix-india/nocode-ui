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
import { addMessage, MESSAGE_TYPE } from '../App/Messages/Messages';
import { NAMESPACE_UI_ENGINE, GLOBAL_CONTEXT_NAME } from '../constants';

const SIGNATURE = new FunctionSignature('Message')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('msg', Schema.ofAny('msg')),
			Parameter.ofEntry(
				'isGlobalScope',
				Schema.ofBoolean('isGlobalScope').setDefaultValue(true),
			),
			Parameter.ofEntry(
				'pageName',
				Schema.ofString('pageName').setDefaultValue(GLOBAL_CONTEXT_NAME),
			),
			Parameter.ofEntry(
				'type',
				Schema.ofString('type')
					.setEnums(['ERROR', 'WARNING', 'INFO', 'SUCCESS'])
					.setDefaultValue('ERROR'),
			),
		]),
	)
	.setEvents(new Map([Event.eventMapEntry(Event.OUTPUT, new Map())]));

export class Message extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const error: any = context.getArguments()?.get('msg');
		const isGlobalScope: boolean = context.getArguments()?.get('isGlobalScope');
		const pageName: string = context.getArguments()?.get('pageName');
		const type: MESSAGE_TYPE = context.getArguments()?.get('type') as MESSAGE_TYPE;

		addMessage(type, error, isGlobalScope, pageName);

		return new FunctionOutput([EventResult.outputOf(new Map())]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
