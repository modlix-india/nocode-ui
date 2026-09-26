import axios from 'axios';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { PageStoreExtractor, UrlDetailsExtractor } from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './analyticsHeatmapProperties';
import { PAGE_ROUTE_DESIGN_PARAM } from '../../util/pageRouting';

/** What the engine answers for a heatmap. Coordinates are in its units, not pixels. */
interface HeatmapResponse {
	heatmap?: {
		/** x in ten-thousandths of the viewport width, y in absolute document pixels. */
		cells?: Array<{ x: number; y: number; count: number }>;
		max?: number;
		clicks?: number;
		cellX?: number;
		cellY?: number;
		variants?: Array<string>;
		viewports?: Array<number>;
	};
}

/**
 * One entry the reader can pick. `page` is the application's own name for it and `path` the
 * address it lives at; they are not the same thing, and with page routing they are not even
 * one-to-one. `page` is empty on rows recorded before the platform reported it.
 */
interface PageRow {
	label: string;
	events: number;
	page?: string;
	path?: string;
}

interface PagesResponse {
	rows?: Array<PageRow>;
}

/**
 * What the engine answers for scroll depth on the same page.
 *
 * Drawn here rather than on a card of its own because the two answer one question together:
 * a heatmap says a call to action is never clicked, and the depth says whether anybody ever
 * got far enough down to see it. Splitting them across two cards with two page pickers makes
 * the reader hold the answer in their head while they go and re-select the page.
 */
/**
 * Places worth looking at, as hypotheses.
 *
 * Drawn as outlines over the heat rather than as more heat: heat means "clicked a lot", and a
 * dead spot can be cold. Overloading one visual channel with two meanings is how a reader ends
 * up believing something the data did not say.
 */
interface FrictionResponse {
	friction?: {
		rage?: Array<{ x: number; y: number; clicks: number; sessions: number }>;
		dead?: Array<{ x: number; y: number; clicks: number; sessions: number }>;
		clicks?: number;
		measured?: boolean;
		cellX?: number;
		cellY?: number;
	};
}

interface ScrollResponse {
	rows?: Array<{ label: string; events: number }>;
	scroll?: {
		views?: number;
		averagePct?: number;
		medianPct?: number;
		foldPct?: number;
	};
}

function authToken(): string | undefined {
	try {
		return window.localStorage.getItem('AuthToken') || undefined;
	} catch {
		return undefined;
	}
}

function range(days: number, from?: unknown, to?: unknown): { from: string; to: string } {
	const parse = (v: unknown): Date | undefined => {
		if (v === undefined || v === null || v === '') return undefined;
		const n = typeof v === 'number' ? v : Number(v);
		if (!Number.isNaN(n) && n > 0) return new Date(n < 1e11 ? n * 1000 : n);
		const d = new Date(String(v));
		return Number.isNaN(d.getTime()) ? undefined : d;
	};

	const start = parse(from);
	const end = parse(to);
	if (start && end && end.getTime() > start.getTime())
		return { from: start.toISOString(), to: end.toISOString() };

	const t = new Date();
	const f = new Date(t.getTime() - Math.max(1, days) * 24 * 60 * 60 * 1000);
	return { from: f.toISOString(), to: t.toISOString() };
}

/**
 * A page in a frame with its clicks drawn on top.
 *
 * Three things about this are decisions rather than details.
 *
 * **The frame is made as tall as the page instead of scrolled.** A cross-origin frame will not
 * say where it has been scrolled to, and an overlay that cannot follow the scroll draws every
 * click in the wrong place — convincingly, which is worse than not drawing it. So the frame is
 * given a height, the whole thing scrolls together, and the height is a property because only
 * a person looking at it knows when the bottom is cut off.
 *
 * **It is then scaled down to whatever room it has.** The frame has to be rendered at the
 * layout width being measured — a desktop page rendered at 500px is a phone page, and the
 * clicks would sit over the wrong things. But a 1440px box inside a dashboard card does not
 * shrink: a flex item's `min-width` is `auto`, so the card grows to fit it and takes the page
 * apart. So the frame keeps its real size and CSS `zoom` shrinks it to fit, which leaves the
 * geometry exact and the arithmetic in one place.
 *
 * **The width is a band, not a slider.** Clicks are recorded as a proportion of the window
 * width, and comparing them only means something within one layout. Drawing a phone's clicks
 * over a desktop rendering produces a picture of neither.
 *
 * **The overlay can be switched off.** The frame is live: an authenticated page needs somebody
 * to sign in, and a menu has to be opened before the clicks on it make sense. The canvas never
 * takes pointer events, so the page underneath stays usable either way; the switch is about
 * being able to SEE it.
 */
export default function LazyAnalyticsHeatmap(props: Readonly<ComponentProps>) {
	const {
		definition,
		pageDefinition,
		locationHistory,
		context,
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(context.pageName);

	const {
		properties: {
			appCode,
			clientCode,
			siteUrl,
			path: pathProp,
			page: pageProp,
			variant: variantProp,
			dateRangeDays,
			dateFrom,
			dateTo,
			viewport: viewportProp,
			frameHeight,
			showOverlay: showOverlayProp,
			refreshIntervalSeconds,
			visibility,
			analyticsLabel,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
		urlExtractor,
	);

	const [data, setData] = useState<HeatmapResponse['heatmap']>();
	const [scroll, setScroll] = useState<ScrollResponse | undefined>();
	const [friction, setFriction] = useState<FrictionResponse['friction']>();
	const [pages, setPages] = useState<Array<PageRow>>([]);
	const [path, setPath] = useState<string>('');
	// The application's name for what is being looked at. Empty means "whatever is at this
	// address", which is all an older row can say.
	const [page, setPage] = useState<string>('');
	const [variant, setVariant] = useState<string>('');
	const [width, setWidth] = useState<number>(Number(viewportProp) || 1440);
	const [overlay, setOverlay] = useState<boolean>(showOverlayProp !== false);
	const [error, setError] = useState<string | undefined>();
	const [loading, setLoading] = useState(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const stageRef = useRef<HTMLDivElement | null>(null);
	const [room, setRoom] = useState(0);
	// How tall the framed page says it is. Nothing else can know: it is another origin.
	const [reported, setReported] = useState(0);

	useEffect(() => setPath(pathProp ?? ''), [pathProp]);
	useEffect(() => setPage(pageProp ?? ''), [pageProp]);
	useEffect(() => setVariant(variantProp ?? ''), [variantProp]);
	useEffect(() => setWidth(Number(viewportProp) || 1440), [viewportProp]);
	useEffect(() => setOverlay(showOverlayProp !== false), [showOverlayProp]);

	const window_ = useMemo(
		() => range(Number(dateRangeDays) || 30, dateFrom, dateTo),
		[dateRangeDays, dateFrom, dateTo],
	);

	const ask = useCallback(
		async (body: Record<string, unknown>) => {
			const headers: Record<string, string> = {
				'Content-Type': 'application/json',
				appCode,
				clientCode,
			};
			const tok = authToken();
			if (tok) headers.Authorization = tok;
			return axios.post('/api/ui/analytics/query', body, { headers });
		},
		[appCode, clientCode],
	);

	/**
	 * The page list, so somebody can pick a page without knowing one by heart.
	 *
	 * Both measurements, merged. Clicks are recorded only when a site switches heatmaps on and
	 * depth is recorded unless it switches scroll off, so on most sites the two lists are
	 * different and one of them is empty. Offering only the pages with CLICKS left this whole
	 * card saying "no page has clicks yet" on a site that had depth for every page it served,
	 * which is the common case rather than an edge one.
	 */
	useEffect(() => {
		if (!appCode || !clientCode) return;
		let cancelled = false;

		Promise.all([
			ask({ widget: 'heatmapPages', ...window_, limit: 50 }).catch(() => undefined),
			ask({ widget: 'scrollPages', ...window_, limit: 50 }).catch(() => undefined),
		])
			.then(([clicks, scrolls]) => {
				if (cancelled) return;

				// Keyed on the pair, because a page and an address are not interchangeable:
				// two arms of one A/B test share an address, and one page can be served at
				// several. The engine hands back both for exactly that reason.
				const byKey = new Map<string, PageRow>();
				for (const r of [
					...((clicks?.data as PagesResponse)?.rows ?? []),
					...((scrolls?.data as PagesResponse)?.rows ?? []),
				]) {
					const key = `${r.page ?? ''}\n${r.path ?? ''}`;
					const seen = byKey.get(key);
					// Summed only to rank the list. The number is not shown as a total of
					// anything — a click and a scroll report are not the same unit — it just
					// puts the pages somebody is most likely to want at the top.
					if (seen) seen.events += r.events;
					else byKey.set(key, { ...r });
				}

				const rows = [...byKey.values()].sort((a, b) => b.events - a.events);
				setPages(rows);

				// The busiest page is the useful default: an empty frame teaches nobody
				// anything, and the alternative is asking the reader to guess a path.
				const first = rows[0];
				if (first) {
					setPath(p => p || first.path || first.label || '');
					setPage(g => g || first.page || '');
				}
			})
			.catch(() => {
				/* The heatmap's own error is the one worth showing. */
			});

		return () => {
			cancelled = true;
		};
	}, [ask, window_, appCode, clientCode]);

	const load = useCallback(async () => {
		if (!appCode || !clientCode || (!path && !page)) return;
		setLoading(true);
		setError(undefined);
		try {
			const r = await ask({
				widget: 'heatmap',
				// The engine prefers the page and falls back to the address, which is the
				// only thing a click recorded before the platform reported its page name
				// can be found by.
				path,
				page: page || undefined,
				variant: variant || undefined,
				viewport: width,
				...window_,
			});
			setData((r.data as HeatmapResponse)?.heatmap);

			// Asked for separately and failing separately: a site with clicks but no scroll
			// reports — one measuring before the beacon could report depth, or with
			// `captureScroll` off — must still draw its heatmap rather than showing an error
			// about a measurement it never asked for.
			ask({
				widget: 'clickFriction',
				path,
				page: page || undefined,
				variant: variant || undefined,
				viewport: width,
				...window_,
			})
				.then(fr => setFriction((fr.data as FrictionResponse)?.friction))
				.catch(() => setFriction(undefined));

			ask({
				widget: 'scrollDepth',
				path,
				page: page || undefined,
				variant: variant || undefined,
				viewport: width,
				...window_,
			})
				.then(sr => setScroll(sr.data as ScrollResponse))
				.catch(() => setScroll(undefined));
		} catch (err: any) {
			const status = err?.response?.status;
			const detail = err?.response?.data?.message ?? err?.message ?? 'Query failed';
			setError(`${status ? status + ': ' : ''}${detail}`);
		} finally {
			setLoading(false);
		}
	}, [ask, path, page, variant, width, window_, appCode, clientCode]);

	useEffect(() => {
		load();
	}, [load]);

	useEffect(() => {
		const interval = Number(refreshIntervalSeconds);
		if (!interval || interval <= 0) return;
		const handle = window.setInterval(load, interval * 1000);
		return () => window.clearInterval(handle);
	}, [load, refreshIntervalSeconds]);

	/**
	 * How tall to make the frame.
	 *
	 * `frameHeight` is a floor, not the answer. It used to be the answer, and it was a guess:
	 * a page taller than it got a frame that scrolled INSIDE its own overlay — a fourth
	 * scrollbar, and the one that actually lies, because the canvas stays put while the page
	 * under it moves. Clicks below the guess were drawn off the end of the canvas and were
	 * simply not in the picture, with nothing saying so.
	 *
	 * The data already knows: the lowest recorded click is how far down the page anyone has
	 * been. A cell's y is its top edge, so a cell height and a little air get added to it.
	 */
	const lowestClick = (data?.cells ?? []).reduce((m, c) => Math.max(m, c.y), 0);
	const height = Math.min(
		// A canvas taller than the browser allows is not a short canvas, it is a BLANK one —
		// the context silently refuses the whole surface and every blob disappears. Chrome
		// stops at 65535 per side and sooner on total area; this is well inside both and
		// still twenty screens of page.
		32000,
		Math.max(Number(frameHeight) || 2400, lowestClick + (data?.cellY ?? 20) + 200, reported),
	);
	/**
	 * What to frame.
	 *
	 * **The page by NAME when there is one, not the address it was served at.** Loading the
	 * address runs the application's page routing again and routing draws its own arm, so the
	 * frame could show `home` with `homeTwo`'s clicks painted over it — a picture that looks
	 * right and is not.
	 *
	 * **The name alone is not enough**, because routing rules are keyed by the page REQUESTED
	 * and for a split that key is normally the control arm's own name — so asking for `home`
	 * is exactly the request the rule fires on. Measured: `/crumbco/FIN/page/home` rendered
	 * `homeTwo`. `modlixDesign` is the answer: the resolver runs no rule for it, and the
	 * beacon counts nothing, so looking at a page does not add to the numbers being looked at.
	 *
	 * The address is the fallback, and the only thing a click recorded before the platform
	 * reported its page name can be opened by.
	 */
	const base = (siteUrl ?? '').replace(/\/$/, '');
	let src = '';
	if (page && appCode && clientCode)
		src = `${base}/${appCode}/${clientCode}/page/${page}?${PAGE_ROUTE_DESIGN_PARAM}=1`;
	else if (path)
		src = `${base}${path}${path.includes('?') ? '&' : '?'}${PAGE_ROUTE_DESIGN_PARAM}=1`;

	// How much room the card actually gives us. Measured rather than assumed: this pane sits in
	// a resizable workspace next to an explorer that opens and closes.
	useEffect(() => {
		const el = stageRef.current;
		if (!el) return;
		const measure = () => setRoom(el.clientWidth);
		measure();
		if (typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, [src]);

	/**
	 * The framed page reporting its own height.
	 *
	 * The beacon posts it, because the beacon is the one script already on both sides of the
	 * origin boundary. Without it the frame is a guess — 2400px by default — and a taller page
	 * is simply cut off part way down a heading, which is what it did.
	 *
	 * Only messages from the framed origin are believed, and only the one shape. A window
	 * receives messages from anything that has a handle on it.
	 */
	useEffect(() => {
		if (!src) return;
		let origin = '';
		try {
			origin = new URL(src, window.location.href).origin;
		} catch {
			return;
		}

		const onMessage = (ev: MessageEvent) => {
			if (ev.origin !== origin) return;
			const d = ev.data;
			if (!d || d.mlx !== 'height') return;
			const h = Number(d.height);
			if (!Number.isFinite(h) || h <= 0) return;
			// A page only ever grows while it settles — fonts, images, a consent bar being
			// answered. Taking the largest avoids the frame flapping shorter and back.
			setReported(prev => (h > prev ? h : prev));
		};

		window.addEventListener('message', onMessage);
		return () => window.removeEventListener('message', onMessage);
	}, [src]);

	// A different page is a different height, and keeping the last one would leave a tall
	// band of nothing under a short page.
	useEffect(() => setReported(0), [src]);

	// Never scaled up: a 1440 layout blown up to 1800 is a blurry lie about the rendering.
	const scale = room > 0 ? Math.min(1, room / width) : 1;

	/**
	 * How far down the page people got, said in words.
	 *
	 * The median, not the average, and the fold beside it — because "half the people got 40%
	 * down" is only actionable once you know that a screenful is 25% of the page. The two
	 * together are what turn a number into "the button is two screens below where people
	 * stop".
	 *
	 * The sample rides along rather than gating the picture. A map drawn from 23 clicks is
	 * worth looking at as long as it says it is 23; what must not happen is an automated
	 * conclusion drawn from them, and there is none here.
	 */
	const scrollSummary = useMemo(() => {
		const sc = scroll?.scroll;
		if (!sc?.views) return '';

		// "half of 1 view" is not a sentence. One report is an anecdote and is worth saying
		// so, rather than dressing a single observation up as a distribution.
		const parts = [
			sc.views === 1
				? `1 view, and it got ${sc.medianPct ?? 0}% down`
				: `half of ${sc.views} views got ${sc.medianPct ?? 0}% down`,
		];
		if (sc.foldPct) parts.push(`a screenful is ${sc.foldPct}% of the page`);
		return parts.join(' · ');
	}, [scroll]);

	/**
	 * Friction, in words, and never as a finding.
	 *
	 * "Possible", always: a run of clicks in one spot is as consistent with somebody enjoying
	 * a slider as with somebody jabbing at a dead button, and a click on something inert is as
	 * consistent with selecting text. The brief's own framing rule, and the reason the count of
	 * VISITS is what leads — one visit clicking twenty times is a person having a bad minute,
	 * and twenty visits clicking once each is a design problem.
	 */
	const frictionSummary = useMemo(() => {
		const parts: Array<string> = [];
		const dead = friction?.dead ?? [];
		const rage = friction?.rage ?? [];

		if (dead.length) {
			const visits = dead.reduce((n, s) => n + s.sessions, 0);
			parts.push(
				`${dead.length} possible dead spot${dead.length === 1 ? '' : 's'} (${visits} visits)`,
			);
		}
		if (rage.length) {
			const visits = rage.reduce((n, s) => n + s.sessions, 0);
			parts.push(
				`${rage.length} place${rage.length === 1 ? '' : 's'} clicked repeatedly (${visits} visits)`,
			);
		}
		// Said out loud when the measurement is simply absent, because an empty list and an
		// unmeasured page look identical and one of them is a clean bill of health.
		if (!parts.length && friction && friction.clicks && !friction.measured) {
			return 'dead clicks were not recorded for these clicks';
		}
		return parts.join(' · ');
	}, [friction]);

	/**
	 * The depth bands drawn down the edge of the frame.
	 *
	 * One band per gap between thresholds, shaded by the share of views that reached it, so
	 * the strip reads as a column of colour draining away down the page. It lines up with the
	 * frame because both are measured in the same thing: a percentage of the document's
	 * height, which is exactly what the frame's height represents.
	 */
	const scrollBands = useMemo(() => {
		const rows = scroll?.rows ?? [];
		const views = scroll?.scroll?.views ?? 0;
		if (!rows.length || !views) return [];

		let top = 0;
		return rows.map(r => {
			const pct = Number.parseInt(r.label, 10) || 0;
			const band = { top, bottom: pct, share: r.events / views, label: r.label };
			top = pct;
			return band;
		});
	}, [scroll]);

	// Draw. A blob per cell, radius and alpha from the count, additively composited so that
	// overlapping cells build into a hot region rather than each drawing over the last.
	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = width;
		canvas.height = height;
		ctx.clearRect(0, 0, width, height);

		const cells = data?.cells ?? [];
		const max = data?.max || 1;
		if (!cells.length) return;

		const cellW = ((data?.cellX ?? 100) / 10000) * width;
		const radius = Math.max(18, cellW * 2.5);

		for (const c of cells) {
			// x is a proportion of the width it was recorded at, so it maps onto whatever
			// width we are drawing at. That is the whole reason it is stored that way.
			const cx = (c.x / 10000) * width + cellW / 2;
			const cy = c.y + (data?.cellY ?? 20) / 2;
			const weight = Math.min(1, c.count / max);

			const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
			g.addColorStop(0, `rgba(255, 64, 0, ${0.15 + weight * 0.55})`);
			g.addColorStop(0.5, `rgba(255, 170, 0, ${0.1 + weight * 0.3})`);
			g.addColorStop(1, 'rgba(255, 220, 0, 0)');

			ctx.fillStyle = g;
			ctx.beginPath();
			ctx.arc(cx, cy, radius, 0, Math.PI * 2);
			ctx.fill();
		}

		/*
		 * Friction on top, as outlines rather than as more heat.
		 *
		 * Heat already means "clicked a lot", and a dead spot can be cold — the whole point of
		 * it is that people press something that does nothing, which may be rare. Drawing it
		 * in the same channel would say something the data did not, so it gets a shape of its
		 * own: a ring, which sits over hot and cold alike.
		 */
		const ring = (
			spots: Array<{ x: number; y: number }>,
			colour: string,
			dash: Array<number>,
		) => {
			ctx.save();
			ctx.strokeStyle = colour;
			ctx.lineWidth = 2;
			ctx.setLineDash(dash);
			for (const sp of spots) {
				const cx = (sp.x / 10000) * width + cellW / 2;
				const cy = sp.y + (friction?.cellY ?? 20) / 2;
				ctx.beginPath();
				ctx.arc(cx, cy, Math.max(14, cellW * 1.2), 0, Math.PI * 2);
				ctx.stroke();
			}
			ctx.restore();
		};

		// Solid for a dead click, dashed for a run of them: two hypotheses, two marks, and
		// neither of them heat.
		ring(friction?.dead ?? [], 'rgba(30, 30, 30, 0.75)', []);
		ring(friction?.rage ?? [], 'rgba(160, 20, 200, 0.8)', [4, 3]);
	}, [data, friction, width, height, overlay]);

	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	if (visibility === false) return null;

	const variants = data?.variants ?? [];
	// A native select needs a value it can match; the row index is the only thing that is
	// unique when a page and an address are both part of the identity.
	const selected = String(
		Math.max(
			0,
			pages.findIndex(p => (p.page ?? '') === page && (p.path ?? p.label) === path),
		),
	);

	return (
		<div
			className="comp compAnalyticsHeatmap"
			style={resolvedStyles.comp ?? {}}
			data-analytics-label={analyticsLabel || undefined}
		>
			<HelperComponent context={props.context} definition={definition} />

			<div className="_toolbar" style={resolvedStyles.toolbar ?? {}}>
				{/* One entry per PAGE, not per address. Two arms of a split share an address,
				    so a list keyed on the address cannot offer them separately — it names one
				    entry and draws both arms over whichever layout it happens to frame. The
				    label is the page's own name where the platform reported one, and the
				    address otherwise, which is what an older row can say. */}
				<select
					className="_pick"
					value={selected}
					onChange={e => {
						const row = pages[Number(e.target.value)];
						if (!row) return;
						setPage(row.page ?? '');
						setPath(row.path ?? row.label ?? '');
						// An arm belongs to one page now, so a variant chosen for the last
						// page means nothing here.
						setVariant('');
					}}
					title="Page"
				>
					{pages.length === 0 ? <option value="">Nothing measured yet</option> : null}
					{pages.map((p, i) => (
						<option key={`${p.page ?? ''}|${p.path ?? p.label}`} value={String(i)}>
							{p.label} ({p.events})
						</option>
					))}
				</select>

				{/* Only offered when an experiment is actually running on this page. A picker
				    with one entry is a question nobody asked. */}
				{variants.length > 0 ? (
					<select
						className="_pick"
						value={variant}
						onChange={e => setVariant(e.target.value)}
						title="Experiment variant"
					>
						<option value="">All variants</option>
						{variants.map(v => (
							<option key={v} value={v}>
								Variant {v}
							</option>
						))}
					</select>
				) : null}

				<select
					className="_pick"
					value={String(width)}
					onChange={e => setWidth(Number(e.target.value))}
					title="Layout width"
				>
					<option value="390">Phone 390</option>
					<option value="820">Tablet 820</option>
					<option value="1440">Desktop 1440</option>
				</select>

				<label className="_toggle">
					<input
						type="checkbox"
						checked={overlay}
						onChange={e => setOverlay(e.target.checked)}
					/>
					Overlay
				</label>

				<span className="_count">
					{loading
						? 'Loading…'
						: `${data?.clicks ?? 0} clicks${
								data?.max ? `, busiest spot ${data.max}` : ''
							}`}
					{/* Said out loud, because the page in the frame is not life size and
					    somebody will otherwise measure something against it. */}
					{scale < 1 ? ` · shown at ${Math.round(scale * 100)}%` : ''}
				</span>

				{/* The median rather than the average, and in a sentence rather than as a
				    percentage on its own. A long page where most people read the first screen
				    and a few read all of it has a respectable average describing nobody. */}
				{scrollSummary ? <span className="_depth">{scrollSummary}</span> : null}
				{frictionSummary ? <span className="_depth">{frictionSummary}</span> : null}
			</div>

			{error ? <div className="_error">{error}</div> : null}

			{!src ? (
				<div className="_empty">
					No page has been clicked or scrolled yet, so there is nothing to draw on.
				</div>
			) : (
				<div className="_stage" ref={stageRef} style={resolvedStyles.stage ?? {}}>
					{/* Down the left edge of the page it describes, at the same height, so a
					    band and the content it covers are read together without anybody
					    having to map one percentage onto another. */}
					{scrollBands.length ? (
						<div className="_scrollStrip" style={{ height: height * scale }}>
							{scrollBands.map(b => (
								<div
									key={b.label}
									className="_scrollBand"
									title={`${Math.round(b.share * 100)}% of views reached ${b.label}`}
									style={{
										height: `${b.bottom - b.top}%`,
										// Green where most people reach, red where few do.
										// Hue alone carries it, so the strip stays legible
										// against both a light and a dark page behind it.
										background: `hsl(${Math.round(b.share * 120)} 70% 45%)`,
									}}
								/>
							))}
						</div>
					) : null}
					{/* Holds the space the scaled frame occupies. A transform does not change
					    layout, so without this the card would still be sized for 1440×2400. */}
					<div
						className="_scaler"
						style={{ width: width * scale, height: height * scale }}
					>
						{/* `zoom`, not `transform: scale`. A cross-origin frame is composited
						    out of process, and a transformed one is sampled wrongly at the
						    edges — the page comes back with a mirrored copy of itself beside
						    it. `zoom` scales during layout instead, so the frame is simply
						    laid out smaller and the subframe paints normally. The inner
						    document still measures itself at the full width, which is the
						    whole point: it has to lay out as the width being measured. */}
						<div className="_frameWrap" style={{ width, height, zoom: scale }}>
							{/* The live page. Interactive on purpose: an authenticated page has
							    to be signed into before the clicks on it mean anything. */}
							<iframe
								className="_frame"
								title="Page"
								src={src}
								width={width}
								height={height}
								// A frame that scrolls on its own slides the page out from
								// under a canvas that cannot follow it, and every blob then
								// sits on the wrong thing — convincingly. The frame is made
								// tall enough for every click instead.
								scrolling="no"
								style={{ width, height, border: 0 }}
							/>
							<canvas
								ref={canvasRef}
								className="_overlay"
								style={{
									width,
									height,
									display: overlay ? 'block' : 'none',
								}}
							/>
						</div>
					</div>
				</div>
			)}

			{/* A blocked frame renders as nothing at all, with only a console message — so the
			    one thing that makes it fixable is saying which setting to change. */}
			<div className="_hint">
				A blank frame means the site refused to be embedded. Add this page's origin to{' '}
				<code>csp.frameAncestors</code> on the application being measured.
			</div>
		</div>
	);
}
