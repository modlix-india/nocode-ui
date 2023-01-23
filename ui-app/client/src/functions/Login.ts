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

const SIGNATURE = new FunctionSignature('Login')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('userName', Schema.ofString('userName')),
			Parameter.ofEntry('password', Schema.ofString('password')),
			Parameter.ofEntry('rememberMe', Schema.ofBoolean('rememberMe').setDefaultValue(false)),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['data', Schema.ofAny('data')]])),
			Event.eventMapEntry(
				Event.ERROR,
				new Map([['error', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.FetchError`)]]),
			),
		]),
	);

export class Login extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const userName: string = context.getArguments()?.get('userName');
		const password: string = context.getArguments()?.get('password');
		const rememberMe: string = context.getArguments()?.get('rememberMe');

		try {
			const response = await axios({
				url: 'api/security/authenticate',
				method: 'POST',
				data: { userName, password, rememberMe },
			});

			console.log('Login Response: ', response);

			return new FunctionOutput([EventResult.outputOf(new Map([['data', response.data]]))]);
		} catch (err: any) {
			const errOutput = {
				headers: err.response.headers,
				data: err.response.data,
				status: err.response.status,
			};
			return new FunctionOutput([
				EventResult.of(Event.ERROR, new Map([['error', errOutput]])),
				EventResult.outputOf(new Map([['data', null]])),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
