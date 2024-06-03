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
import { shortUUID } from '../util/shortUUID';
import pageHistory from '../components/Page/pageHistory';

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
			Parameter.ofEntry('userId', Schema.ofAny('userId').setDefaultValue(null)),
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
		const userId: any = context.getArguments()?.get('userId');

		const data: any = { userName, password, rememberMe, cookie };
		if (identifierType) data.indentifierType = identifierType;

		if (userId) data.userId = userId;

		const headers: any = {};
		if (globalThis.isDebugMode) headers['x-debug'] = shortUUID();

		try {
			const response = await axios({
				url: 'api/security/authenticate',
				method: 'POST',
				data,
				headers,
			});
			for (let key of Object.keys(pageHistory)) delete pageHistory[key];

			setData('Store.auth', response.data);
			setData('LocalStore.AuthToken', response.data?.accessToken, undefined, true);
			setData(
				'LocalStore.AuthTokenExpiry',
				response.data?.accessTokenExpiryAt,
				undefined,
				true,
			);

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
