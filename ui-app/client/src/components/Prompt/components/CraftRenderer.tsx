import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';
import { loadGoogleMaps } from '../../../util/googleMapsLoader';

interface CraftContextValue {
	sessionId: string | null;
	agentEndpoint: string;
	onSend: (text: string, attachments?: any[], displayText?: string) => Promise<void>;
	getAuthHeaders: () => Record<string, string>;
}

const CraftContext = createContext<CraftContextValue | null>(null);

interface Block {
	type: string;
	[key: string]: any;
}



function HeadingBlock({ text, level = 1 }: { text: string; level?: number }) {
	const Tag = `h${Math.min(level, 3)}` as keyof JSX.IntrinsicElements;
	return <Tag className="_craftHeading">{text}</Tag>;
}

function TextBlock({ content }: { content: string }) {
	if (!content) return null;
	return <p className="_craftText">{content}</p>;
}

function BadgeBlock({
	label,
	styleProperties,
}: {
	label: string;
	variant?: string;
	styleProperties?: any;
}) {
	return (
		<span className="_craftBadge" style={styleProperties?.craftBadge ?? {}}>
			{label}
		</span>
	);
}

function KeyValueBlock({ items }: { items: Array<{ key: string; value: string }> }) {
	const isUrl = (val: string) => val.startsWith('http://') || val.startsWith('https://');

	return (
		<div className="_craftKeyValue">
			{items.map((item, i) => (
				<div key={i} className="_craftKvRow">
					<span className="_craftKvKey">{item.key}</span>
					<span className="_craftKvValue">
						{isUrl(item.value) ? (
							<a href={item.value} target="_blank" rel="noopener noreferrer">
								{item.value}
							</a>
						) : (
							item.value
						)}
					</span>
				</div>
			))}
		</div>
	);
}

function ImageBlock({
	url,
	thumb_url,
	caption,
	size,
	background,
	fit,
}: {
	url: string;
	thumb_url?: string;
	caption?: string;
	size?: 'thumbnail';
	background?: 'dark' | 'light';
	fit?: 'cover' | 'contain';
}) {
	if (!url && !thumb_url) return null;
	const classes = ['_craftImage'];
	if (size === 'thumbnail') classes.push('_thumbnail');
	if (background === 'dark') classes.push('_dark');
	if (fit === 'cover') classes.push('_cover');
	const inlineSrc = thumb_url || url;
	const img = <img src={inlineSrc} alt={caption ?? ''} loading="lazy" />;
	return (
		<div className={classes.join(' ')}>
			{url ? (
				<a
					href={url}
					target="_blank"
					rel="noopener noreferrer"
					title="Click to view full size"
				>
					{img}
				</a>
			) : (
				img
			)}
			{caption && <span className="_craftImageCaption">{caption}</span>}
		</div>
	);
}

function TableBlock({ headers, rows }: { headers: string[]; rows: string[][] }) {
	return (
		<table className="_craftTable">
			<thead>
				<tr>
					{headers.map((h, i) => (
						<th key={i}>{h}</th>
					))}
				</tr>
			</thead>
			<tbody>
				{rows.map((row, ri) => (
					<tr key={ri}>
						{row.map((cell, ci) => (
							<td key={ci}>{cell}</td>
						))}
					</tr>
				))}
			</tbody>
		</table>
	);
}

function DividerBlock() {
	return <hr className="_craftDivider" />;
}

function MetricBlock({
	label,
	value,
	detail,
	trend,
}: {
	label: string;
	value: string;
	detail?: string;
	trend?: 'up' | 'down';
}) {
	return (
		<div className="_craftMetric">
			<span className="_craftMetricLabel">{label}</span>
			<span className="_craftMetricValue">
				{value}
				{trend && (
					<span className={`_craftMetricTrend _${trend}`}>
						{trend === 'up' ? '↑' : '↓'}
					</span>
				)}
			</span>
			{detail && <span className="_craftMetricDetail">{detail}</span>}
		</div>
	);
}

function CalloutBlock({
	text,
	variant = 'info',
}: {
	text: string;
	icon?: string;
	variant?: string;
}) {
	return <div className={`_craftCallout _${variant}`}>{text}</div>;
}

function ListBlock({ items, ordered }: { items: string[]; ordered?: boolean }) {
	const Tag = ordered ? 'ol' : 'ul';
	return (
		<Tag className="_craftList">
			{items.map((item, i) => (
				<li key={i}>{item}</li>
			))}
		</Tag>
	);
}

function RowBlock({
	children = [],
	styleProperties,
}: {
	children?: Block[];
	styleProperties?: any;
}) {
	if (!children.length) return null;
	return (
		<div className="_craftRow">
			{children.map((block, i) => (
				<CraftBlockRenderer
					key={(block as any).id ?? i}
					block={block}
					styleProperties={styleProperties}
				/>
			))}
		</div>
	);
}

function CollapsibleBlock({
	summary,
	glyph,
	children = [],
	default_expanded,
	styleProperties,
}: {
	summary: string;
	glyph?: string;
	children?: Block[];
	default_expanded?: boolean;
	styleProperties?: any;
}) {
	const [expanded, setExpanded] = useState(Boolean(default_expanded));
	if (!summary && (!children || children.length === 0)) return null;

	return (
		<div className="_craftCollapsible">
			<button
				type="button"
				className="_craftCollapsibleHeader"
				onClick={() => setExpanded(prev => !prev)}
				aria-expanded={expanded}
			>
				{glyph && <span className="_craftCollapsibleGlyph">{glyph}</span>}
				<span className="_craftCollapsibleSummary">{summary}</span>
				<span
					className={`_craftCollapsibleChevron ${expanded ? '_open' : ''}`}
					aria-hidden="true"
				>
					›
				</span>
			</button>
			{expanded && (
				<div className="_craftCollapsibleBody">
					{children.map((block, i) => (
						<CraftBlockRenderer
							key={(block as any).id ?? i}
							block={block}
							styleProperties={styleProperties}
						/>
					))}
				</div>
			)}
		</div>
	);
}


// Suggestion type → TargetArea.scale. Broad scales keep their locality-level
// map polygon (the backend skips pincode-stamping them); unlisted types
// (neighbourhoods, postal codes) stay unscaled and get a pincode backfilled.
const SUGGESTION_SCALES: Record<string, string> = {
	city: 'city',
	municipality: 'city',
	region: 'state',
	province: 'state',
	state: 'state',
	country: 'country',
};

function MapBlock({
	api_key,
	map_id,
	center,
	target_areas = [],
	platform = 'Google Ads',
	product_location,
}: {
	api_key?: string;
	map_id?: string;
	center?: { lat: number; lng: number };
	target_areas?: Array<{
		name: string;
		type?: string;
		lat?: number;
		lng?: number;
		place_id?: string;
		pincode?: string;
		city?: string;
		state?: string;
		scale?: string;
		meta?: { type?: string; key?: string; name?: string };
		google?: { resourceName?: string; name?: string };
	}>;
	platform?: string;
	product_location?: string;
}) {
	const context = useContext(CraftContext);
	if (!context) {
		throw new Error('MapBlock must be used within a CraftRenderer');
	}
	const { sessionId, agentEndpoint, onSend, getAuthHeaders } = context;
	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const [status, setStatus] = useState<'loading' | 'ready' | 'no-key' | 'error'>(api_key ? 'loading' : 'no-key');
	const [searchQuery, setSearchQuery] = useState('');
	const [suggestions, setSuggestions] = useState<any[]>([]);
	const [searching, setSearching] = useState(false);
	const [selectedLocation, setSelectedLocation] = useState<any | null>(null);
	const [tooltipLines, setTooltipLines] = useState<string[]>([]);
	const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
	const [mapReady, setMapReady] = useState(false);
	const mapRef = useRef<any>(null);
	const googleRef = useRef<any>(null);
	const markersRef = useRef<any[]>([]);
	const featureListenersRef = useRef<any[]>([]);
	const tooltipRef = useRef<HTMLDivElement>(null);
	const searchBoxRef = useRef<HTMLDivElement>(null);

	const containerRef = useCallback((node: HTMLDivElement | null) => setContainer(node), []);

	// Close suggestions when clicking outside the search box.
	useEffect(() => {
		const handleOutsideClick = (e: MouseEvent) => {
			if (searchBoxRef.current && !searchBoxRef.current.contains(e.target as Node)) {
				setSuggestions([]);
			}
		};
		document.addEventListener('mousedown', handleOutsideClick);
		return () => document.removeEventListener('mousedown', handleOutsideClick);
	}, []);

	// Each craft re-emit hands us fresh `center`/`target_areas` references with
	// identical contents. Depend on these stable values — not the object/array
	// identities — so the map is built once and the geocode/feature-style pass
	// re-runs only when the targeting set actually changes (not on every emit).
	const centerLat = center?.lat;
	const centerLng = center?.lng;
	const areasKey = React.useMemo(
		() => JSON.stringify((target_areas || []).map(a => [a.name, a.pincode, a.lat, a.lng])),
		[target_areas],
	);

	// Search Autocomplete lookup API call
	useEffect(() => {
		if (searchQuery.trim().length < 2 || !sessionId) {
			setSuggestions([]);
			return;
		}
		const delayDebounce = setTimeout(async () => {
			setSearching(true);
			try {
				const baseUrl = agentEndpoint.replace(/\/chat$/, '');
				const queryPlatform = platform.toLowerCase().includes('meta') ? 'meta' : 'google';
				const url = `${baseUrl}/sessions/${sessionId}/target-locations/search?q=${encodeURIComponent(searchQuery)}&platform=${queryPlatform}`;
				const res = await fetch(url, {
					headers: getAuthHeaders(),
				});
				if (res.ok) {
					const data = await res.json();
					setSuggestions(data || []);
				}
			} catch (err) {
				console.error('Search autocomplete failed:', err);
			} finally {
				setSearching(false);
			}
		}, 300);
		return () => clearTimeout(delayDebounce);
	}, [searchQuery, sessionId, agentEndpoint, getAuthHeaders, platform]);

	// Update selectedLocation when target_areas change
	useEffect(() => {
		if (selectedLocation) {
			const stillExists = target_areas.some(
				loc => loc.lat === selectedLocation.lat && loc.lng === selectedLocation.lng
			);
			if (!stillExists) setSelectedLocation(null);
		}
	}, [target_areas, selectedLocation]);

	// Create the map and center marker once — re-runs only when api_key/container/center changes.
	useEffect(() => {
		if (!api_key || !container) return;
		let cancelled = false;

		loadGoogleMaps(api_key)
			.then(async google => {
				if (cancelled || !container.isConnected) return;
				await new Promise(requestAnimationFrame);
				if (cancelled || !container.isConnected) return;

				try {
					const mapCenter = center || { lat: 20.5937, lng: 78.9629 };
					const map = new google.maps.Map(container, {
						center: mapCenter,
						zoom: center ? 11 : 5,
						mapId: map_id,
						disableDefaultUI: true,
						zoomControl: true,
						renderingType: 'VECTOR',
					});
					mapRef.current = map;
					googleRef.current = google;

					markersRef.current.forEach(m => m.setMap(null));
					markersRef.current = [];

					if (center) {
						const bizMarker = new google.maps.Marker({
							position: center,
							map,
							title: product_location || 'Business Location',
							icon: { url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png' },
						});
						markersRef.current.push(bizMarker);
					}

					if (!cancelled) setMapReady(true);
				} catch (e) {
					console.error(e);
					if (!cancelled) setStatus('error');
				}
			})
			.catch(() => {
				if (!cancelled) setStatus('error');
			});

		return () => {
			cancelled = true;
			markersRef.current.forEach(m => m.setMap(null));
			mapRef.current = null;
			googleRef.current = null;
			setMapReady(false);
		};
		// Rebuild only when the map identity or business location actually changes —
		// `center`/`product_location` are read from the live closure on each run.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [api_key, container, map_id, centerLat, centerLng]);

	// Geocode target areas and apply feature-layer styling whenever areas change.
	// Depends on mapReady so it re-runs once the map from the effect above is ready.
	// Feature Layer polygon coverage is reliable for postal codes but incomplete for
	// neighbourhoods, so the backend stamps a pincode on every target area (search
	// adds included) and the pincode-first geocode below lands on a POSTAL_CODE
	// feature that always carries a polygon.
	useEffect(() => {
		const map = mapRef.current;
		const google = googleRef.current;
		if (!map || !google || !map_id) {
			if (mapReady) setStatus('ready');
			return;
		}

		let cancelled = false;
		const geocoder = new google.maps.Geocoder();

		const FT = google.maps.FeatureType || {};
		const hasFeatureLayers = typeof map.getFeatureLayer === 'function';
		const layerTypes = [
			FT.LOCALITY || 'LOCALITY',
			FT.POSTAL_CODE || 'POSTAL_CODE',
			FT.NEIGHBORHOOD || 'NEIGHBORHOOD',
			FT.SUBLOCALITY_LEVEL_1 || 'SUBLOCALITY_LEVEL_1',
		];

		// Listeners and styles attach to map-cached layer objects that outlive this
		// effect, so both must be cleared on re-run/unmount — otherwise listeners
		// stack up and a stale style closure keeps highlighting the previous set.
		const clearFeatureLayers = () => {
			featureListenersRef.current.forEach(l => {
				try { l.remove(); } catch { /* layer already gone */ }
			});
			featureListenersRef.current = [];
			if (hasFeatureLayers) {
				layerTypes.forEach(t => {
					try { map.getFeatureLayer(t).style = null; } catch { /* unsupported layer */ }
				});
			}
		};

		const run = async () => {
			const placeIdsToStyle = new Set<string>();
			const placeIdToLocMap = new Map<string, any>();

			// Guard every iteration with `cancelled` so cleanup of a previous run
			// stops the loop immediately — prevents overlapping geocode floods.
			for (const loc of target_areas) {
				if (cancelled) return;
				const query = loc.pincode ? `${loc.pincode}, India` : (loc.name || loc.city);
				if (!query) continue;
				await new Promise<void>(resolve => {
					geocoder.geocode({ address: query }, (results: any, gStatus: any) => {
						if (!cancelled && gStatus === 'OK' && results?.[0]?.place_id) {
							const pId = results[0].place_id;
							placeIdsToStyle.add(pId);
							placeIdToLocMap.set(pId, loc);
						}
						resolve();
					});
				});
			}

			if (cancelled) return;

			// Drop prior listeners + styles before re-binding against the current
			// area set (the layer objects persist across runs now).
			clearFeatureLayers();

			if (hasFeatureLayers && placeIdsToStyle.size > 0) {
				layerTypes.forEach(layerType => {
					try {
						const layer = map.getFeatureLayer(layerType);
						featureListenersRef.current.push(
							layer.addListener('click', (e: any) => {
								const matchedLoc = e.features?.length > 0
									? placeIdToLocMap.get(e.features[0].placeId)
									: null;
								if (matchedLoc) setSelectedLocation(matchedLoc);
							}),
							layer.addListener('pointermove', (e: any) => {
								const matchedLoc = e.features?.length > 0
									? placeIdToLocMap.get(e.features[0].placeId)
									: null;
								if (matchedLoc) {
									setTooltipLines([
										matchedLoc.pincode && `Pincode: ${matchedLoc.pincode}`,
										matchedLoc.city && `City: ${matchedLoc.city}`,
										matchedLoc.state && `State: ${matchedLoc.state}`,
										matchedLoc.lat && matchedLoc.lng && `Coordinates: ${Number(matchedLoc.lat).toFixed(4)}, ${Number(matchedLoc.lng).toFixed(4)}`,
										matchedLoc.google?.resourceName && `Google: ${matchedLoc.google.resourceName}`,
										matchedLoc.meta?.key && `Meta Key: ${matchedLoc.meta.key}`,
									].filter(Boolean) as string[]);
									setTooltipPos({ x: e.domEvent.offsetX + 12, y: e.domEvent.offsetY + 12 });
								} else {
									setTooltipLines([]);
									setTooltipPos(null);
								}
							}),
							layer.addListener('pointerout', () => {
								setTooltipLines([]);
								setTooltipPos(null);
							}),
						);
						layer.style = (options: any) =>
							placeIdsToStyle.has(options.feature.placeId)
								? { strokeColor: '#1E88E5', strokeOpacity: 0.8, strokeWeight: 2, fillColor: '#1E88E5', fillOpacity: 0.25 }
								: null;
					} catch (err) {
						console.warn('Feature layer', layerType, 'error:', err);
					}
				});
			}

			const bounds = new google.maps.LatLngBounds();
			let hasCoords = false;
			if (center) { bounds.extend(center); hasCoords = true; }
			target_areas.forEach(area => {
				if (area.lat && area.lng) { bounds.extend({ lat: area.lat, lng: area.lng }); hasCoords = true; }
			});
			if (hasCoords && target_areas.length > 0) {
				map.fitBounds(bounds);
				google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
					if (map.getZoom() > 14) map.setZoom(14);
				});
			}

			if (!cancelled) setStatus('ready');
		};

		run().catch(() => { if (!cancelled) setStatus('error'); });
		return () => { cancelled = true; clearFeatureLayers(); };
		// `target_areas` is read live; `areasKey` is its stable-content proxy.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [mapReady, areasKey, map_id, centerLat, centerLng]);

	const handleAddLocation = (place: any) => {
		setSearchQuery('');
		setSuggestions([]);
		const isMeta = platform.toLowerCase().includes('meta');
		const payload = {
			name: place.canonical_name || place.name,
			lat: place.lat,
			lng: place.lng,
			place_id: place.place_id,
			pincode: place.pincode,
			scale: SUGGESTION_SCALES[(place.type || '').toLowerCase()],
			// Platform-native handle names — match Meta/Google's own API vocab.
			// `key` is Meta's `geo_locations[].key`; `resourceName` is Google's
			// `geoTargetConstants.resourceName`. Backend (nocode-ai) reads
			// these names; the legacy `meta_key` / `google_id` aliases are gone.
			resourceName: isMeta ? undefined : place.id,
			key: isMeta ? place.id : undefined,
		};
		onSend(`add targeting location ${JSON.stringify(payload)}`, undefined, `Adding location ${payload.name}...`);
	};

	const handleDelete = (index?: number, name?: string) => {
		if (index === undefined) return;
		const label = name ? `"${name}"` : `index ${index + 1}`;
		onSend(
			`delete targeting location ${label} (index ${index + 1})`,
			undefined,
			`Removing ${name || `location ${index + 1}`}...`,
		);
		setSelectedLocation(null);
	};

	return (
		<div className="_craftMapBlock">
			<div className="_mapSearchBox" ref={searchBoxRef}>
				<input
					type="text"
					placeholder="Search locations to target..."
					value={searchQuery}
					onChange={e => setSearchQuery(e.target.value)}
					className="_mapSearchInput"
				/>
				{searching && <span className="_mapSearchSpinner">Searching...</span>}
				{suggestions.length > 0 && (
					<div className="_mapSuggestionsList">
						{suggestions.map((sug, i) => (
							<button
								key={i}
								type="button"
								onClick={() => handleAddLocation(sug)}
								className="_mapSuggestionItem"
							>
								<span className="_mapSugName">{sug.canonical_name || sug.name}</span>
								<span className="_mapSugType">{sug.type || 'Region'}</span>
							</button>
						))}
					</div>
				)}
			</div>

			<div className="_mapCanvasWrap">
				<div ref={containerRef} className="_mapCanvasDiv" />
				<div
					ref={tooltipRef}
					className="_mapTooltip"
					style={{
						display: tooltipPos ? 'block' : 'none',
						left: tooltipPos?.x ?? 0,
						top: tooltipPos?.y ?? 0,
					}}
				>
					{tooltipLines.map((line, i) => <div key={i}>{line}</div>)}
				</div>
				{status !== 'ready' && (
					<div className="_mapCanvasOverlay">
						{status === 'loading' && 'Loading interactive map...'}
						{status === 'no-key' && 'Map unavailable (Google Maps API key not configured)'}
						{status === 'error' && 'Failed to load interactive Google Map.'}
					</div>
				)}
			</div>

			<div className="_mapFooter">
				{selectedLocation ? (
					<div className="_mapFooterDetail">
						<div>
							<div className="_mapFooterName">{selectedLocation.name}</div>
							<div className="_mapFooterMeta">
								{[
									selectedLocation.pincode && `Pincode: ${selectedLocation.pincode}`,
									selectedLocation.city && `City: ${selectedLocation.city}`,
									selectedLocation.state && `State: ${selectedLocation.state}`,
									selectedLocation.lat && selectedLocation.lng && `${Number(selectedLocation.lat).toFixed(4)}, ${Number(selectedLocation.lng).toFixed(4)}`,
									selectedLocation.google?.resourceName && `Google: ${selectedLocation.google.resourceName}`,
									selectedLocation.meta?.key && `Meta Key: ${selectedLocation.meta.key}`,
								].filter(Boolean).join(' | ')}
							</div>
						</div>
						<button
							type="button"
							className="_mapFooterDelete"
							onClick={() => {
								// Match by name first (stable), then fall back to coordinate proximity.
								let idx = target_areas.findIndex(loc => loc.name === selectedLocation.name);
								if (idx < 0) {
									idx = target_areas.findIndex(
										loc =>
											Math.abs((loc.lat ?? 0) - (selectedLocation.lat ?? 0)) < 0.0001 &&
											Math.abs((loc.lng ?? 0) - (selectedLocation.lng ?? 0)) < 0.0001,
									);
								}
								handleDelete(idx >= 0 ? idx : undefined, selectedLocation.name);
							}}
						>
							Delete
						</button>
					</div>
				) : target_areas.length > 0 ? (
					<div className="_mapFooterHint">Click a highlighted boundary to view details and delete.</div>
				) : null}
			</div>

		</div>
	);
}

const BLOCK_RENDERERS: Record<string, React.FC<any>> = {
	heading: HeadingBlock,
	text: TextBlock,
	badge: BadgeBlock,
	key_value: KeyValueBlock,
	image: ImageBlock,
	table: TableBlock,
	divider: DividerBlock,
	metric: MetricBlock,
	callout: CalloutBlock,
	list: ListBlock,
	row: RowBlock,
	collapsible: CollapsibleBlock,
	map: MapBlock,
};

function CraftBlockRenderer({
	block,
	styleProperties,
}: {
	block: Block;
	styleProperties?: any;
}) {
	const Component = BLOCK_RENDERERS[block.type];
	if (!Component) return null;
	return (
		<Component
			{...block}
			styleProperties={styleProperties}
		/>
	);
}

export function CraftRenderer({
	blocks,
	definition,
	styleProperties,
	sessionId,
	agentEndpoint,
	onSend,
	getAuthHeaders,
}: Readonly<{
	blocks: Block[];
	definition: ComponentDefinition;
	styleProperties?: any;
	sessionId: string | null;
	agentEndpoint: string;
	onSend: (text: string, attachments?: any[], displayText?: string) => Promise<void>;
	getAuthHeaders: () => Record<string, string>;
}>) {
	return (
		<CraftContext.Provider value={{ sessionId, agentEndpoint, onSend, getAuthHeaders }}>
			<div className="_craftContent" style={styleProperties?.craftContent ?? {}}>
				<SubHelperComponent definition={definition} subComponentName="craftContent" />
				{blocks.map((block, i) => (
					<CraftBlockRenderer
						key={(block as any).id ?? i}
						block={block}
						styleProperties={styleProperties}
					/>
				))}
			</div>
		</CraftContext.Provider>
	);
}
