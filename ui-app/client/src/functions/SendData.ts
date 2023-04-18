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
import axios from 'axios';
import { LOCAL_STORE_PREFIX, NAMESPACE_UI_ENGINE, STORE_PREFIX } from '../constants';
import { getData } from '../context/StoreContext';
import { ComponentProperty } from '../types/common';
import { pathFromParams, queryParamsSerializer } from './utils';

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
	);

export class SendData extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
		const evmap = [...context.getValuesMap().values()];
		const url: string = context.getArguments()?.get('url');
		const method: string = context.getArguments()?.get('method');
		let headers = context.getArguments()?.get('headers');
		let pathParams = context.getArguments()?.get('pathParams');
		let queryParams = context.getArguments()?.get('queryParams');
		let payload = context.getArguments()?.get('payload');

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

		let isFormData = false || headers['content-type'] == 'multipart/form-data';
		if (!isFormData && typeof payload === 'object' && !Array.isArray(payload)) {
			const ll = new LinkedList<any>();
			ll.add(payload);
			while (ll.size() > 0) {
				const current = ll.pop();
				if (Array.isArray(current)) {
					ll.addAll([...current]);
				} else if (typeof current === 'object') {
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
				if (Array.isArray(c[1])) c[1].forEach(e => a.append(c[0], e));
				else a.append(c[0], c[1] as any);
				return a;
			}, new FormData());

			payload = fd;

			headers['content-type'] = 'multipart/form-data';
		}

		try {
			const response = await axios({
				url: pathFromParams(url, pathParams),
				method,
				params: queryParams,
				paramsSerializer: params => queryParamsSerializer(params)?.[1] ?? '',
				headers,
				data: payload,
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
