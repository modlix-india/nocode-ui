import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	isNullValue,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import axios from 'axios';
import {
	LOCAL_STORE_PREFIX,
	NAMESPACE_UI_ENGINE,
	SCHEMA_DATA_LOCATION,
	STORE_PREFIX,
} from '../constants';
import { getData } from '../context/StoreContext';
import { ComponentProperty } from '../types/common';
import { pathFromParams, queryParamsSerializer } from './utils';
import { shortUUID } from '../util/shortUUID';

const SIGNATURE = new FunctionSignature('DeleteData')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('url', Schema.ofString('url')),
			Parameter.ofEntry('queryParams', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UrlParameters`)),
			Parameter.ofEntry('pathParams', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UrlParameters`)),
			Parameter.ofEntry(
				'headers',
				Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UrlParameters`).setDefaultValue({
					Authorization: {
						location: {
							expression: `${LOCAL_STORE_PREFIX}.AuthToken`,
							type: 'EXPRESSION',
						},
					},
					clientCode: {
						location: {
							expression: `${STORE_PREFIX}.auth.loggedInClientCode`,
							type: 'EXPRESSION',
						},
					},
				}),
			),
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
	)
	.setDescription('Sends an HTTP DELETE request to remove data at the specified URL')
	.setDocumentation('# UIEngine.DeleteData\n\nMakes an HTTP DELETE request to the specified URL with configurable query parameters, path parameters, and headers. Used to delete resources on the server. Automatically resolves parameter and header values from store expressions.\n\n## Parameters\n\n- **url** (String, required): The endpoint URL to send the DELETE request to\n- **queryParams** (UrlParameters, optional): Key-value pairs appended as query string parameters to the URL\n- **pathParams** (UrlParameters, optional): Key-value pairs substituted into path placeholders in the URL\n- **headers** (UrlParameters, optional): HTTP request headers\n  - Default includes `Authorization` (from `LocalStore.AuthToken`) and `clientCode` (from `Store.auth.loggedInClientCode`)\n\n## Events\n\n- **output**: Triggered on successful response\n  - `data` (Any): The response body from the server\n- **error**: Triggered on request failure\n  - `data` (Any): Error response body\n  - `headers` (Any): Error response headers\n  - `status` (Number): HTTP status code\n\n## Use Cases\n\n- **Record Deletion**: Remove individual records from the database\n- **Bulk Cleanup**: Delete resources matching specific criteria\n- **Cache Invalidation**: Clear server-side caches\n- **Session Termination**: End active sessions or revoke tokens');

export class DeleteData extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const url: string = context.getArguments()?.get('url');
		let headers = context.getArguments()?.get('headers');
		let pathParams = context.getArguments()?.get('pathParams');
		let queryParams = context.getArguments()?.get('queryParams');
		const evmap = [...context.getValuesMap().values()];

		pathParams = Object.entries(pathParams)
			.map(([k, v]) => [k, getData(v as ComponentProperty<any>, [], ...evmap)])
			.reduce((a: { [key: string]: any }, [k, v]) => {
				if (!isNullValue(v)) a[k] = v;
				return a;
			}, {});
		queryParams = Object.entries(queryParams)
			.map(([k, v]) => [k, getData(v as ComponentProperty<any>, [], ...evmap)])
			.reduce((a: { [key: string]: any }, [k, v]) => {
				if (!isNullValue(v)) a[k] = v;
				return a;
			}, {});

		headers = Object.entries(headers)
			.map(([k, v]) => [k, getData(v as ComponentProperty<any>, [], ...evmap)])
			.reduce((a: { [key: string]: any }, [k, v]) => {
				if (!isNullValue(v)) a[k] = v;
				return a;
			}, {});

		if (globalThis.isDebugMode) headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') +shortUUID();
		try {
			const response = await axios({
				url: pathFromParams(url, pathParams),
				method: 'DELETE',
				params: queryParams,
				paramsSerializer: params => queryParamsSerializer(params)?.[1] ?? '',
				headers,
			});

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
				EventResult.outputOf(new Map([['data', null]])),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
