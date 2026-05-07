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
import { getDataFromPath } from '../context/StoreContext';

const SIGNATURE = new FunctionSignature('QueryAnalytics')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setParameters(
		new Map([
			Parameter.ofEntry('appCode', Schema.ofString('appCode')),
			Parameter.ofEntry('clientCode', Schema.ofString('clientCode')),
			Parameter.ofEntry('query', Schema.ofAny('query')),
		]),
	)
	.setEvents(
		new Map([
			Event.eventMapEntry(Event.OUTPUT, new Map([['data', Schema.ofAny('data')]])),
			Event.eventMapEntry(
				Event.ERROR,
				new Map([
					['data', Schema.ofAny('data')],
					['status', Schema.ofNumber('status')],
				]),
			),
		]),
	)
	.setDescription('Runs an analytics query against PostHog through the tenant-scoped backend proxy.')
	.setDocumentation(
		'# UIEngine.QueryAnalytics\n\nForwards a HogQL (or other PostHog query envelope) to `/api/ui/analytics/query`. The backend enforces tenant scoping — every query is filtered by `app_code` and `url_client_code` server-side, regardless of what the body contains.\n\nCaller must supply `appCode` and `clientCode`. The authenticated user must have write access to the application and their own client must own or manage the requested `clientCode` (same rules as deleting an app).\n\n## Parameters\n\n- **appCode** (String, required): Application to scope the query to.\n- **clientCode** (String, required): URL client code (tenant) to scope the query to.\n- **query** (Any, required): PostHog query envelope. Example: `{ kind: "HogQLQuery", query: "SELECT count() FROM events WHERE event = \'$pageview\'" }`. Supports `HogQLQuery`, `TrendsQuery`, `FunnelsQuery`, `RetentionQuery`, `PathsQuery`, `LifecycleQuery`, `StickinessQuery`.\n\n## Events\n\n- **output**: Triggered on success.\n  - `data` (Any): The PostHog response body.\n- **error**: Triggered on failure.\n  - `data` (Any): Error response body.\n  - `status` (Number): HTTP status code.\n\n## Use Cases\n\n- **Drive AnalyticsQuery widget**: Bind the function to a widget that renders the result.\n- **Custom KPI panels**: Read a specific number into a counter or KPI tile.\n- **Background metric refresh**: Run on a timer to keep dashboards live.',
	);

export class QueryAnalytics extends AbstractFunction {
	protected async internalExecute(
		context: FunctionExecutionParameters,
	): Promise<FunctionOutput> {
		const appCode: string = context.getArguments()?.get('appCode');
		const clientCode: string = context.getArguments()?.get('clientCode');
		const query = context.getArguments()?.get('query');

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			appCode,
			clientCode,
		};
		const token = getDataFromPath('LocalStore.AuthToken', []);
		if (token) headers['Authorization'] = token;

		try {
			const response = await axios.post('/api/ui/analytics/query', query, { headers });
			return new FunctionOutput([EventResult.outputOf(new Map([['data', response.data]]))]);
		} catch (err: any) {
			return new FunctionOutput([
				EventResult.of(
					Event.ERROR,
					new Map<string, any>([
						['data', err?.response?.data ?? null],
						['status', err?.response?.status ?? 0],
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
