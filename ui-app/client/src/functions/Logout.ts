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
import { LOCAL_STORE_PREFIX, NAMESPACE_UI_ENGINE } from '../constants';
import { getDataFromPath, setData } from '../context/StoreContext';
import { shortUUID } from '../util/shortUUID';

const SIGNATURE = new FunctionSignature('Logout')
	.setParameters(new Map([
		Parameter.ofEntry('ssoLogout', Schema.ofBoolean('ssoLogout').setDefaultValue(false)),
		Parameter.ofEntry('redirectUrl', Schema.ofString('redirectUrl').setDefaultValue('')),
	]))
	.setNamespace(NAMESPACE_UI_ENGINE).setEvents(
	new Map([
		Event.eventMapEntry(Event.OUTPUT, new Map()),
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

export class Logout extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		try {
			const token = getDataFromPath(`${LOCAL_STORE_PREFIX}.AuthToken`, []);

			setData('Store.auth', undefined, undefined, true);
			setData(`${LOCAL_STORE_PREFIX}.AuthToken`, undefined, undefined, true);
			setData('Store.pageDefinition', {});
			setData('Store.messages', []);
			setData('Store.validations', {});
			setData('Store.validationTriggers', {});
			setData('Store.pageData', {});
			setData('Store.application', undefined, undefined, true);
			setData('Store.functionExecutions', {});

			const headers: any = { AUTHORIZATION: token };
			if (globalThis.isDebugMode) headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') +shortUUID();

			const ssoLogout: boolean = context.getArguments()?.get('ssoLogout');
			const redirectUrl: string = context.getArguments()?.get('redirectUrl');

			const response = await axios({
				url: `api/security/revoke?ssoLogout=${ssoLogout ? 'true' : 'false'}`,
				method: 'GET',
				headers,
			});

			if (redirectUrl && redirectUrl !== '') {
				setTimeout(() => {
					globalThis.location.href = redirectUrl;
				}, 100);
			}

			return new FunctionOutput([EventResult.outputOf(new Map([['data', {}]]))]);
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
