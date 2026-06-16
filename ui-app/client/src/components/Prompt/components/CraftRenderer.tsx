import React, { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import { ComponentDefinition } from '../../../types/common';
import { SubHelperComponent } from '../../HelperComponents/SubHelperComponent';

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

const loaders = new Map<string, Promise<any>>();

function loadMaps(apiKey: string): Promise<any> {
	if ((window as any).google?.maps) return Promise.resolve((window as any).google);
	const cached = loaders.get(apiKey);
	if (cached) return cached;
	const p = new Promise<any>((resolve, reject) => {
		const cbName = `__gmapsCb_${Math.random().toString(36).slice(2)}`;
		(window as any)[cbName] = () => {
			resolve((window as any).google);
			delete (window as any)[cbName];
		};
		const script = document.createElement('script');
		script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=${cbName}&loading=async`;
		script.async = true;
		script.defer = true;
		script.onerror = () => reject(new Error('Failed to load Google Maps'));
		document.head.appendChild(script);
	});
	loaders.set(apiKey, p);
	return p;
}

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
		type: string;
		lat?: number;
		lng?: number;
		place_id?: string;
		pincode?: string;
		google_id?: string;
		meta_key?: string;
		city?: string;
		state?: string;
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
	const [tooltipContent, setTooltipContent] = useState<string>('');
	const [tooltipPos, setTooltipPos] = useState<{ x: number; y: number } | null>(null);
	const mapRef = useRef<any>(null);
	const markersRef = useRef<any[]>([]);
	const tooltipRef = useRef<HTMLDivElement>(null);

	const containerRef = useCallback((node: HTMLDivElement | null) => setContainer(node), []);

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

	// Initialize Google Map, Markers & styling boundaries
	useEffect(() => {
		if (!api_key || !container) return;
		let cancelled = false;

		loadMaps(api_key)
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

					// Clear old markers
					markersRef.current.forEach(m => m.setMap(null));
					markersRef.current = [];

					const bounds = new google.maps.LatLngBounds();
					let hasCoords = false;

					// Base product center marker
					if (center) {
						const bizMarker = new google.maps.Marker({
							position: center,
							map,
							title: product_location || 'Business Location',
							icon: {
								url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
							},
						});
						markersRef.current.push(bizMarker);
						bounds.extend(center);
						hasCoords = true;
					}

					// Compute bounds for targeted areas
					target_areas.forEach((area) => {
						if (area.lat && area.lng) {
							bounds.extend({ lat: area.lat, lng: area.lng });
							hasCoords = true;
						}
					});

					// Client-side geocoding to resolve Place IDs for Feature Layer styling
					const geocoder = new google.maps.Geocoder();
					const resolveBoundariesAndStyle = async () => {
						const placeIdsToStyle = new Set<string>();
						const placeIdToLocMap = new Map<string, any>();

						for (const loc of target_areas) {
							const query = loc.pincode ? `${loc.pincode}, India` : (loc.name || loc.city);
							if (!query) continue;

							await new Promise<void>((resolve) => {
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

						// Style FeatureLayers using resolved Place IDs
						const FT = google.maps.FeatureType || {};
						if (typeof map.getFeatureLayer !== 'function') return;
						if (!map_id) return;

						const layersToStyle = [
							FT.LOCALITY || 'LOCALITY',
							FT.POSTAL_CODE || 'POSTAL_CODE',
							FT.NEIGHBORHOOD || 'NEIGHBORHOOD',
							FT.SUBLOCALITY_LEVEL_1 || 'SUBLOCALITY_LEVEL_1',
						];

						layersToStyle.forEach(layerType => {
							try {
								const layer = map.getFeatureLayer(layerType);
								if (placeIdsToStyle.size > 0) {
									layer.addListener('click', (e: any) => {
										if (e.features?.length > 0) {
											const clickedPlaceId = e.features[0].placeId;
											const matchedLoc = placeIdToLocMap.get(clickedPlaceId);
											if (matchedLoc) setSelectedLocation(matchedLoc);
										}
									});

									layer.addListener('pointermove', (e: any) => {
										if (e.features?.length > 0) {
											const pid = e.features[0].placeId;
											const matchedLoc = placeIdToLocMap.get(pid);
											if (matchedLoc && tooltipRef.current) {
												const rows: string[] = [];
												if (matchedLoc.pincode) rows.push(`Pincode: ${matchedLoc.pincode}`);
												if (matchedLoc.city) rows.push(`City: ${matchedLoc.city}`);
												if (matchedLoc.state) rows.push(`State: ${matchedLoc.state}`);
												if (matchedLoc.lat && matchedLoc.lng) rows.push(`Coordinates: ${Number(matchedLoc.lat).toFixed(4)}, ${Number(matchedLoc.lng).toFixed(4)}`);
												if (matchedLoc.google_id) rows.push(`Google ID: ${matchedLoc.google_id}`);
												if (matchedLoc.meta_key) rows.push(`Meta Key: ${matchedLoc.meta_key}`);
												setTooltipContent(rows.join('<br/>'));
												setTooltipPos({ x: e.domEvent.offsetX + 12, y: e.domEvent.offsetY + 12 });
											} else {
												setTooltipContent('');
												setTooltipPos(null);
											}
										} else {
											setTooltipContent('');
											setTooltipPos(null);
										}
									});

									layer.addListener('pointerout', () => {
										setTooltipContent('');
										setTooltipPos(null);
									});

									layer.style = (options: any) => {
										if (placeIdsToStyle.has(options.feature.placeId)) {
											return {
												strokeColor: '#1E88E5',
												strokeOpacity: 0.8,
												strokeWeight: 2,
												fillColor: '#1E88E5',
												fillOpacity: 0.25,
											};
										}
										return null;
									};
								} else {
									layer.style = null;
								}
							} catch (err) {
								console.warn('Feature layer', layerType, 'error:', err);
							}
						});
					};

					await resolveBoundariesAndStyle();

					if (hasCoords) {
						if (target_areas.length > 0) {
							map.fitBounds(bounds);
							google.maps.event.addListenerOnce(map, 'bounds_changed', () => {
								if (map.getZoom() > 14) map.setZoom(14);
							});
						} else {
							map.setCenter(mapCenter);
						}
					}

					if (!cancelled) setStatus('ready');
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
		};
	}, [api_key, container, center, target_areas, product_location]);

	const handleAddLocation = (place: any) => {
		setSearchQuery('');
		setSuggestions([]);
		
		const payload = {
			name: place.canonical_name || place.name,
			lat: place.lat,
			lng: place.lng,
			place_id: place.place_id,
			pincode: place.pincode,
			google_id: platform.toLowerCase().includes('meta') ? undefined : place.id,
			meta_key: platform.toLowerCase().includes('meta') ? place.id : undefined,
		};
		
		const args = Object.entries(payload)
			.filter(([_, v]) => v !== undefined && v !== '')
			.map(([k, v]) => `${k}=${typeof v === 'number' ? v : `"${v}"`}`)
			.join(' ');

		onSend(`add targeting location ${args}`, undefined, `Adding location ${payload.name}...`);
	};

	const handleDelete = (index?: number) => {
		if (index === undefined) return;
		onSend(`delete targeting location index ${index + 1}`, undefined, `Deleting location...`);
		setSelectedLocation(null);
	};

	return (
		<div className="_craftMapBlock">
			<div className="_mapSearchBox">
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
								style={{ color: '#1e293b', background: '#ffffff' }}
							>
								<span className="_mapSugName" style={{ color: '#1e293b' }}>{sug.canonical_name || sug.name}</span>
								<span className="_mapSugType" style={{ color: '#64748b', background: '#f1f5f9' }}>{sug.type || 'Region'}</span>
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
					dangerouslySetInnerHTML={{ __html: tooltipContent }}
				/>
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
								{selectedLocation.pincode ? `Pincode: ${selectedLocation.pincode}` : ''}
								{selectedLocation.city ? ` | City: ${selectedLocation.city}` : ''}
								{selectedLocation.state ? ` | State: ${selectedLocation.state}` : ''}
								{selectedLocation.lat && selectedLocation.lng ? ` | ${Number(selectedLocation.lat).toFixed(4)}, ${Number(selectedLocation.lng).toFixed(4)}` : ''}
								{selectedLocation.google_id ? ` | Google ID: ${selectedLocation.google_id}` : ''}
								{selectedLocation.meta_key ? ` | Meta Key: ${selectedLocation.meta_key}` : ''}
							</div>
						</div>
						<button
							type="button"
							className="_mapFooterDelete"
							onClick={() => {
								const idx = target_areas.findIndex(
									loc => loc.lat === selectedLocation.lat && loc.lng === selectedLocation.lng
								);
								handleDelete(idx >= 0 ? idx : undefined);
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
