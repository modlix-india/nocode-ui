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
import { LOCAL_STORE_PREFIX, NAMESPACE_UI_ENGINE, SCHEMA_REF_DATA_LOCATION } from '../constants';
import { getData } from '../context/StoreContext';
import { ComponentProperty } from '../types/common';
import { pathFromParams, queryParamsSerializer } from './utils';

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
						location: [`${LOCAL_STORE_PREFIX}.AuthToken`],
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
				new Map([['error', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.FetchError`)]]),
			),
		]),
	);

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
				if (v) a[k] = v;
				return a;
			}, {});
		queryParams = Object.entries(queryParams)
			.map(([k, v]) => [k, getData(v as ComponentProperty<any>, [], ...evmap)])
			.reduce((a: { [key: string]: any }, [k, v]) => {
				if (v) a[k] = v;
				return a;
			}, {});

		headers = Object.entries(headers)
			.map(([k, v]) => [k, getData(v as ComponentProperty<any>, [], ...evmap)])
			.reduce((a: { [key: string]: any }, [k, v]) => {
				if (v) a[k] = v;
				return a;
			}, {});
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
