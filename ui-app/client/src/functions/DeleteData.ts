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
import { getData } from '../context/StoreContext';
import { pathFromParams, queryParamsSerializer } from './utils';

const SIGNATURE = new FunctionSignature('DeleteData')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry(
				'url',
				Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`),
			),
			Parameter.ofEntry(
				'queryParams',
				Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UrlParameters`),
			),
			Parameter.ofEntry(
				'pathParams',
				Schema.ofRef(`${NAMESPACE_UI_ENGINE}.UrlParameters`),
			),
			Parameter.ofEntry(
				'headers',
				Schema.ofRef(
					`${NAMESPACE_UI_ENGINE}.UrlParameters`,
				).setDefaultValue({
					Authorization: {
						location: ['LocalStore.AuthToken'],
					},
				}),
			),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(
				Event.OUTPUT,
				new Map([['data', Schema.ofAny('data')]]),
			),
			Event.eventMapEntry(
				Event.ERROR,
				new Map([
					[
						'error',
						Schema.ofRef(`${NAMESPACE_UI_ENGINE}.FetchError`),
					],
				]),
			),
		]),
	);

export class DeleteData extends AbstractFunction {
	protected async internalExecute(
		context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		const url: string = getData(context.getArguments()?.get('url'));
		const headers = getData(context.getArguments()?.get('headers'));
		const pathParams = getData(context.getArguments()?.get('pathParams'));
		const queryParams = getData(context.getArguments()?.get('queryParams'));

		try {
			const response = await axios({
				url: pathFromParams(url, pathParams),
				method: 'DELETE',
				params: queryParams,
				paramsSerializer: params =>
					queryParamsSerializer(params)?.[1] ?? '',
				headers,
			});

			return new FunctionOutput([
				EventResult.outputOf(new Map([['data', response.data]])),
			]);
		} catch (err) {
			const errOutput = {
				headers: err.response.headers,
				data: err.response.data,
				status: err.response.status,
			};
			return new FunctionOutput([
				EventResult.of(Event.ERROR, new Map([['error', errOutput]])),
			]);
		}
	}

	getSignature(): FunctionSignature {
		return SIGNATURE;
	}
}
