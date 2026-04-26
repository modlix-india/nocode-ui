import {
	AbstractFunction,
	Event,
	EventResult,
	FunctionExecutionParameters,
	FunctionOutput,
	FunctionSignature,
	isNullValue,
	LinkedList,
	Parameter,
	Schema,
} from '@fincity/kirun-js';
import axios, { AxiosRequestConfig } from 'axios';
import { LOCAL_STORE_PREFIX, NAMESPACE_UI_ENGINE, STORE_PREFIX } from '../constants';
import { getData } from '../context/StoreContext';
import { ComponentProperty } from '../types/common';
import { pathFromParams, queryParamsSerializer } from './utils';
import { shortUUID } from '../util/shortUUID';

const SIGNATURE = new FunctionSignature('SendData')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('url', Schema.ofString('url')),
			Parameter.ofEntry('method', Schema.ofString('method')),
			Parameter.ofEntry('queryParams', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UrlParameters`)),
			Parameter.ofEntry('pathParams', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UrlParameters`)),
			Parameter.ofEntry('payload', Schema.ofAny('payload')),
			Parameter.ofEntry(
				'downloadAsAFile',
				Schema.ofBoolean('downloadAsAFile').setDefaultValue(false),
			),
			Parameter.ofEntry(
				'downloadFileName',
				Schema.ofString('downloadFileName').setDefaultValue(''),
			),
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
	.setDescription('Sends data to the server using a specified HTTP method with support for file uploads and downloads')
	.setDocumentation('# UIEngine.SendData\n\nMakes an HTTP request with a specified method (POST, PUT, PATCH, etc.) and payload. Automatically detects File objects in the payload and converts to FormData for file uploads. Supports downloading the response as a file.\n\n## Parameters\n\n- **url** (String, required): The endpoint URL to send data to\n- **method** (String, required): HTTP method to use (e.g., POST, PUT, PATCH)\n- **queryParams** (UrlParameters, optional): Key-value pairs appended as query string parameters\n- **pathParams** (UrlParameters, optional): Key-value pairs substituted into path placeholders in the URL\n- **payload** (Any, required): The request body data. If it contains File objects, automatically converts to FormData\n- **downloadAsAFile** (Boolean, optional, default: false): If true, downloads the response as a file in the browser\n- **downloadFileName** (String, optional, default: \'\'): Custom filename for the downloaded file. Falls back to Content-Disposition header\n- **headers** (UrlParameters, optional): HTTP request headers\n  - Default includes `Authorization` (from `LocalStore.AuthToken`) and `clientCode` (from `Store.auth.loggedInClientCode`)\n\n## Events\n\n- **output**: Triggered on successful response\n  - `data` (Any): The response body from the server\n- **error**: Triggered on request failure\n  - `data` (Any): Error response body\n  - `headers` (Any): Error response headers\n  - `status` (Number): HTTP status code\n\n## Use Cases\n\n- **Form Submission**: Submit form data to create or update records\n- **File Upload**: Upload images, documents, or other files\n- **File Download**: Generate and download reports, exports, or documents\n- **API Integration**: Send data to external APIs with various HTTP methods\n- **Bulk Operations**: Send batch update or create requests');

const FILE_NAME = 'filename=';

export class SendData extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const evmap = Array.from(context.getValuesMap().values());
		const url: string = context.getArguments()?.get('url');
		const method: string = context.getArguments()?.get('method');
		let headers = context.getArguments()?.get('headers');
		let pathParams = context.getArguments()?.get('pathParams');
		let queryParams = context.getArguments()?.get('queryParams');
		let payload = context.getArguments()?.get('payload');

		let downloadAsAFile = context.getArguments()?.get('downloadAsAFile');
		let downloadFileName = context.getArguments()?.get('downloadFileName');

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

		let isFormData = headers['content-type'] == 'multipart/form-data';
		if (!isFormData && typeof payload === 'object' && !Array.isArray(payload)) {
			const ll = new LinkedList<any>();
			ll.add(payload);
			while (ll.size() > 0) {
				const current = ll.pop();

				if (Array.isArray(current)) {
					ll.addAll([...current]);
				} else if (typeof current === 'object' && current !== null) {
					if (current.constructor?.name === 'File') {
						isFormData = true;
						break;
					} else {
						ll.addAll(Array.from(Object.values(current)));
					}
				}
			}
		}

		if (isFormData) {
			const fd = Object.entries(payload).reduce((a, c) => {
				if (Array.isArray(c[1])) c[1].forEach(e => a.append(c[0], getAsBlob(e)));
				else a.append(c[0], getAsBlob(c[1]));
				return a;
			}, new FormData());

			payload = fd;

			headers['content-type'] = 'multipart/form-data';
		}

		if (globalThis.isDebugMode) headers['x-debug'] = (globalThis.isFullDebugMode ? 'full-' : '') +shortUUID();

		try {
			const options: AxiosRequestConfig<any> = {
				url: pathFromParams(url, pathParams),
				method,
				params: queryParams,
				paramsSerializer: params => queryParamsSerializer(params)?.[1] ?? '',

				headers,
				data: payload,
			};
			if (downloadAsAFile) options.responseType = 'arraybuffer';

			const response = await axios(options);

			if (downloadAsAFile) {
				let name = downloadFileName;
				if (!name) {
					const key = Object.keys(response.headers).find(
						key => key.toLowerCase() === 'content-disposition',
					);
					if (key) name = response.headers[key];
				}

				let index = name.indexOf(FILE_NAME);
				if (index !== -1) {
					name = name.substring(index + FILE_NAME.length);
					name = name.replace(/"/g, '');
				}

				const url = window.URL.createObjectURL(
					new Blob([response.data], { type: 'application/octet-stream' }),
				);

				const aTag = document.createElement('a');
				aTag.setAttribute('href', url);
				aTag.setAttribute('target', '_blank');
				aTag.setAttribute('download', name === '' ? 'file' : name);
				document.body.appendChild(aTag);
				aTag.click();
				document.body.removeChild(aTag);
			}

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

function getAsBlob(data: any) {
	if (data.constructor?.name === 'File') return data;
	const jsonData = JSON.stringify(data);
	return new Blob([jsonData], { type: 'application/json' });
}
