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
import { getData, getDataFromLocation, getDataFromPath } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('Login')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map()),
			Event.eventMapEntry(
				Event.ERROR,
				new Map([['error', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.FetchError`)]]),
			),
		]),
	);

export class Logout extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const userName: string = context.getArguments()?.get('userName');
		const password: string = context.getArguments()?.get('password');
		const rememberMe: string = context.getArguments()?.get('rememberMe');

		try {
			const token = getDataFromPath('LocalStore.AuthToken', []);

			const response = await axios({
				url: 'api/security/revoke',
				method: 'GET',
				headers: { AUTHORIZATION: token },
			});

			return new FunctionOutput([EventResult.outputOf(new Map([['data', new Map()]]))]);
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
