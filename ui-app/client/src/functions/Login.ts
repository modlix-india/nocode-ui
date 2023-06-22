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
import axios from 'axios';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { setData } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('Login')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('userName', Schema.ofString('userName')),
			Parameter.ofEntry('password', Schema.ofString('password')),
			Parameter.ofEntry('rememberMe', Schema.ofBoolean('rememberMe').setDefaultValue(false)),
			Parameter.ofEntry(
				'identifierType',
				Schema.ofString('identifierType').setDefaultValue(''),
			),
			Parameter.ofEntry('cookie', Schema.ofBoolean('cookie').setDefaultValue(false)),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['data', Schema.ofAny('data')]])),
			Event.eventMapEntry(
				Event.ERROR,
				new Map([
					['data', Schema.ofAny('data')],
					['headers', Schema.ofAny('headers')],
					['status', Schema.ofNumber('status')],
				]),
			),
		]),
	);

export class Login extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const userName: string = context.getArguments()?.get('userName');
		const password: string = context.getArguments()?.get('password');
		const rememberMe: string = context.getArguments()?.get('rememberMe');
		const cookie: boolean = context.getArguments()?.get('cookie');
		const identifierType: string = context.getArguments()?.get('identifierType');

		const data: any = { userName, password, rememberMe, cookie };
		if (identifierType) data.indentifierType = identifierType;

		try {
			const response = await axios({
				url: 'api/security/authenticate',
				method: 'POST',
				data,
			});

			setData('Store.auth', response.data);
			setData('LocalStore.AuthToken', response.data?.accessToken, undefined, true);

			setData('Store.pageDefinition', {});
			setData('Store.messages', []);
			setData('Store.pageData', {});
			setData('Store.validations', {});
			setData('Store.validationTriggers', {});
			setData('Store.application', undefined, undefined, true);
			setData('Store.functionExecutions', {});

			return new FunctionOutput([EventResult.outputOf(new Map([['data', response.data]]))]);
		} catch (err: any) {
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map([
						['data', err.response.data],
						['headers', err.response.headers],
						['status', err.response.status],
					]),
				),
				EventResult.outputOf(new Map([])),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
