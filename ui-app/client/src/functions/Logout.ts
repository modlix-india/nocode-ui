import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	Schema,
} from '@fincity/kirun-js';
import axios from 'axios';
import { LOCAL_STORE_PREFIX, NAMESPACE_UI_ENGINE } from '../constants';
import { getDataFromPath, setData } from '../context/StoreContext';

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
		try {
			const token = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);

			const response = await axios({
				url: 'api/security/revoke',
				method: 'GET',
				headers: { AUTHORIZATION: token },
			});

			setData('Store.auth', undefined, undefined, true);
			setData(`${LOCAL_STORE_PREFIX}.AuthToken`, undefined, undefined, true);
			setData('Store.pageDefinition', {});
			setData('Store.messages', []);
			setData('Store.validations', {});
			setData('Store.pageData', {});
			setData('Store.application', undefined);
			setData('Store.functionExecutions', {});

			return new FunctionOutput([EventResult.outputOf(new Map([['data', new Map()]]))]);
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
				EventResult.outputOf(new Map([['data', null]])),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
