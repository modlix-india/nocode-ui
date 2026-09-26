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
		"# UIEngine.QueryAnalytics\n\nRuns one of the analytics engine's fixed widgets through `/api/ui/analytics/query`. There is no query language: the widget name is the query, which is also the read security model — with no caller-supplied expression there is nothing to sanitise and no request can widen its own scope.\n\nThe site is resolved by the server from `appCode` and `clientCode`, and any `site` in the body is overwritten. The timezone likewise: unset, it comes from the client's own configured zone, so two people in two countries reading the same dashboard see the same day boundaries.\n\nCaller must supply `appCode` and `clientCode`. The authenticated user must have write access to the application and their own client must own or manage the requested `clientCode` (same rules as deleting an app).\n\n## Parameters\n\n- **appCode** (String, required): Application to scope the query to.\n- **clientCode** (String, required): URL client code (tenant) to scope the query to.\n- **query** (Any, required): The widget request. Example: `{ widget: \"topPages\", from: \"2026-09-01T00:00:00Z\", to: \"2026-09-30T00:00:00Z\", limit: 10 }`.\n\nAdd `compare: \"previous\"` to get the preceding period back as `previous`, aligned row for row with `rows`, plus `previousTotal` to compare against `total`. The preceding period is the same number of calendar days ending where this one begins, so a week containing a clock change is still seven days. Rollup-backed widgets only: asking on a funnel, a heatmap or a visit widget is an error rather than a silent omission, and so is any value other than `previous`.\n\n`total` is returned whether or not a comparison was asked for, and counts every key including the ones the limit cut off — adding up the listed rows to make a headline is wrong on exactly the sites with a long tail.\n\n`topEvents` and `eventTimeline` also return `audience` \u2014 the site's page views, visitors and visits over the same range \u2014 so a conversion rate is computed against a denominator that came from the same query as its numerator. A form submitted anywhere on the site is recorded as `form_submit` with the form's own label, which is what makes an enquiry countable without anybody wiring an event by hand.\n\n`clickFriction` answers where ONE page may be frustrating: spots clicked repeatedly in quick succession, and spots where clicks landed on something that does nothing. Both are possibilities rather than findings \u2014 a run of clicks is as consistent with somebody enjoying a slider as with somebody jabbing at a dead button \u2014 and `measured: false` means the page's clicks predate the column rather than that nothing was dead.\n\n`scrollDepth` answers how far down ONE page people got, taking a `path` or a `page` and optionally a `variant` and a `viewport`. Its rows are the 25/50/75/90/100 thresholds and how many views reached each; `scroll` carries the average, the median and `foldPct` \u2014 how much of the page a screenful is, which is what turns a depth into a decision about where a button sits. The thresholds are bucketed at read time from the raw maximum each view reached, so changing the list changes what yesterday's data says.\n\nWidgets: `pageviewsOverTime`, `eventTimeline`, `topPages`, `topReferrers`, `channelBreakdown`, `deviceBreakdown`, `browserBreakdown`, `osBreakdown`, `geoBreakdown`, `platformBreakdown`, `appVersionBreakdown`, `topEvents`, `breakdownByProperty`, `funnel`, `retention`, `stickiness`, `lifecycle`, `entryPages`, `exitPages`, `pagesPerVisit`, `visitLength`, `scrollDepth`, `scrollPages`, `heatmapPages`, `heatmap`.\n\nThe four visit widgets \u2014 `entryPages`, `exitPages`, `pagesPerVisit`, `visitLength` \u2014 answer from sessions rather than from visitors, which is why they work where the cohort ones do not: a visit is minutes long and cannot straddle the identity rotation. `exitPages` and the two distributions count only visits that both began and ended inside the range, and they carry `denominator` \u2014 the number of visits counted \u2014 so a share is computed against the same total every tile uses rather than against a second query's.\n\n## Events\n\n- **output**: Triggered on success.\n  - `data` (Any): `{ rows: [{ label, events, visitors }], visitorsApproximate, visitorsDaily, rawHoursScanned }`, plus `funnel`, `retention`, `stickiness` or `lifecycle` for those widgets.\n- **error**: Triggered on failure.\n  - `data` (Any): Error response body.\n  - `status` (Number): HTTP status code.\n\n## Notes\n\nEvent counts are exact. Visitor counts come from sketches wherever `visitorsApproximate` is true — about 0.8% error on a headline number and 2.3% per key. Funnel, retention, stickiness and lifecycle read raw events instead, and their counts are exact.\n\n**A visitor is a visitor-day.** Identity is derived from a salt that rotates at UTC midnight, so somebody who visits on two days is two visitors. Any answer whose range crosses a midnight carries `visitorsDaily: true`, and the count is then the sum of each day's uniques rather than a number of people. Label it accordingly; it cannot be corrected after the fact, because what would link the two is discarded at ingest on purpose.\n\nFor the same reason a funnel's `windowHours` is capped at 24 and a longer one is refused: across a rotation a slow conversion is not found late, it is reported as a drop-off. And `retention`, `stickiness` and `lifecycle` are cross-period, so they cannot be answered at all today — every visitor is new every day. They are not on any dashboard.\n\n## Use Cases\n\n- **Drive a chart**: Bind the result to a Chart component rather than the built-in bars.\n- **Custom KPI panels**: Read one number into a counter or KPI tile.\n- **Background metric refresh**: Run on a timer to keep a dashboard live.",
	);

export class QueryAnalytics extends AbstractFunction {
	protected async internalExecute(context: FunctionExecutionParameters): Promise<FunctionOutput> {
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
