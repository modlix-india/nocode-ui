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
	.setDescription('Runs an analytics engine widget through the tenant-scoped backend proxy.')
	.setDocumentation(
		'# UIEngine.QueryAnalytics\n\nRuns one of the analytics engine\'s fixed widgets through `/api/ui/analytics/query`. There is no query language: the widget name is the query, which is also the read security model — with no caller-supplied expression there is nothing to sanitise and no request can widen its own scope.\n\nThe site is resolved by the server from `appCode` and `clientCode`, and any `site` in the body is overwritten. The timezone likewise: unset, it comes from the client\'s own configured zone, so two people in two countries reading the same dashboard see the same day boundaries.\n\nCaller must supply `appCode` and `clientCode`. The authenticated user must have write access to the application and their own client must own or manage the requested `clientCode` (same rules as deleting an app).\n\n## Parameters\n\n- **appCode** (String, required): Application to scope the query to.\n- **clientCode** (String, required): URL client code (tenant) to scope the query to.\n- **query** (Any, required): The widget request. Example: `{ widget: "topPages", from: "2026-09-01T00:00:00Z", to: "2026-09-30T00:00:00Z", limit: 10 }`.\n\nWidgets: `pageviewsOverTime`, `eventTimeline`, `topPages`, `topReferrers`, `channelBreakdown`, `deviceBreakdown`, `browserBreakdown`, `osBreakdown`, `geoBreakdown`, `platformBreakdown`, `appVersionBreakdown`, `topEvents`, `breakdownByProperty`, `funnel`, `retention`, `stickiness`, `lifecycle`.\n\n## Events\n\n- **output**: Triggered on success.\n  - `data` (Any): `{ rows: [{ label, events, visitors }], visitorsApproximate, rawHoursScanned }`, plus `funnel`, `retention`, `stickiness` or `lifecycle` for those widgets.\n- **error**: Triggered on failure.\n  - `data` (Any): Error response body.\n  - `status` (Number): HTTP status code.\n\n## Notes\n\nEvent counts are exact. Visitor counts come from sketches wherever `visitorsApproximate` is true — about 0.8% error on a headline number and 2.3% per key. Funnel, retention, stickiness and lifecycle read raw events instead, and their counts are exact.\n\n## Use Cases\n\n- **Drive a chart**: Bind the result to a Chart component rather than the built-in bars.\n- **Custom KPI panels**: Read one number into a counter or KPI tile.\n- **Background metric refresh**: Run on a timer to keep a dashboard live.',
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
