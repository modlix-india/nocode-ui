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
import { LOCAL_STORE_PREFIX, NAMESPACE_UI_ENGINE, STORE_PREFIX } from '../constants';
import { getData } from '../context/StoreContext';
import { ComponentProperty } from '../types/common';
import { pathFromParams, queryParamsSerializer } from './utils';
import { shortUUID } from '../util/shortUUID';

const SIGNATURE = new FunctionSignature('FetchData')
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
			// `headers` and `status` are on the success event as well as the error
			// one. Without them a page can read a response body and nothing else, so
			// an ETag, a Content-Disposition, a pagination header or the
			// X-Draft-Version the draft read hands back are all unreachable. Axios
			// lowercases header names, and a bare hyphen parses as subtraction in an
			// expression, so read them as headers['x-draft-version'].
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([
					['data', Schema.ofAny('data')],
					['headers', Schema.ofAny('headers')],
					['status', Schema.ofNumber('status')],
				]),
			),
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
	.setDescription('Fetches data from the specified URL with given parameters and headers')
	.setDocumentation('# UIEngine.FetchData\n\nMakes an HTTP GET request to the specified URL with configurable query parameters, path parameters, and headers. Automatically resolves parameter and header values from store expressions.\n\n## Parameters\n\n- **url** (String, required): The endpoint URL to fetch data from\n- **queryParams** (UrlParameters, optional): Key-value pairs appended as query string parameters to the URL\n- **pathParams** (UrlParameters, optional): Key-value pairs substituted into path placeholders in the URL\n- **headers** (UrlParameters, optional): HTTP request headers\n  - Default includes `Authorization` (from `LocalStore.AuthToken`) and `clientCode` (from `Store.auth.loggedInClientCode`)\n\n## Events\n\n- **output**: Triggered on successful response, and also on failure with a null `data`\n  - `data` (Any): The response body from the server, null when the request failed\n  - `headers` (Any): Response headers, lower-cased. Read them as `headers[\'x-my-header\']` - a bare hyphen parses as subtraction\n  - `status` (Number): HTTP status code\n- **error**: Triggered on request failure\n  - `data` (Any): Error response body\n  - `headers` (Any): Error response headers\n  - `status` (Number): HTTP status code\n\n## Use Cases\n\n- **Loading Page Data**: Fetch data to populate UI components on page load\n- **Search and Filter**: Retrieve filtered results based on user input\n- **API Integration**: Connect to REST APIs with automatic authentication\n- **Data Refresh**: Re-fetch data to keep the UI up to date')
	;

export class FetchData extends AbstractFunction {
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
				method: 'get',
				params: queryParams,
				paramsSerializer: params => queryParamsSerializer(params)?.[1] ?? '',
				headers,
			});

			return new FunctionOutput([
				EventResult.outputOf(
					new Map<string, any>([
						['data', response.data],
						['headers', response.headers],
						['status', response.status],
					]),
				),
			]);
		} catch (err: any) {
			// A request that never got a response at all - network down, CORS, an
			// abort - has no `err.response`, so reading through it threw inside the
			// catch and the caller got a TypeError instead of the error event.
			const res = err?.response;
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map<string, any>([
						['data', res?.data],
						['headers', res?.headers],
						['status', res?.status],
					]),
				),
				// `output` fires on failure too, with a null `data`, which is why every
				// success chain has to guard on the data rather than on the event.
				// Carrying the status here lets that guard tell a 412 from a 403
				// without reaching into the error branch.
				EventResult.outputOf(
					new Map<string, any>([
						['data', null],
						['headers', res?.headers],
						['status', res?.status],
					]),
				),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
