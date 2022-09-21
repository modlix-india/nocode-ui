import {
	AbstractFunction,
	Event,
	EventResult,
	ExpressionEvaluator,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE, STORE_PREFIX } from '../constants';
import { getData, setData } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('ConstructURLPrefix')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry(
				'clientDetails',
				Schema.ofObject('clientDetails').setProperties(
					new Map<string, Schema>([
						['appname', Schema.ofString('appname')],
						['clientcode', Schema.ofString('clientcode')],
						['pagename', Schema.ofString('pagename')],
						[
							'pathParams',
							Schema.ofArray(
								'pathParams',
								Schema.ofString('pathParams'),
							),
						],
					]),
				),
			),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([['prefix', Schema.ofString('prefix')]]),
			),
		]),
	);

export class ConstructURLPrefix extends AbstractFunction {
	protected async internalExecute(
		context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		const clientDetails = context.getArguments()?.get('clientDetails');
		const defaultPage: string = context.getArguments()?.get('defaultPage');
		const { appname, clientcode, pagename, pathParams } = clientDetails;
		const prefix = `${appname ? `/${appname}` : ''}${
			clientcode ? `/${clientcode}` : ''
		}`;
		setData(`${STORE_PREFIX}.prefix`, prefix);
		return new FunctionOutput([
			EventResult.outputOf(new Map([['prefix', prefix]])),
		]);
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
