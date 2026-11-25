import React, { useCallback, useEffect, useRef, useState } from 'react';
import { loadGoogleMaps } from '../../../util/googleMapsLoader';

interface LocationMapProps {
	location: {
		api_key?: string | null;
		query?: string | null;
		product_location?: string | null;
		location?: string | null;
		product_name?: string | null;
		coordinates?: { lat: number; lng: number } | null;
		location_found?: boolean;
		map_id?: string | null;
	};
	onConfirm: (coords: { lat: number; lng: number } | null, address?: string) => void;
	confirmed?: boolean;
	confirmedMeta?: { address?: string; lat?: number; lng?: number };
	disabled?: boolean;
}

// ADZ-2251: the map never carries its own style list. With a map id (GOOGLE_MAP_ID, the same one the
// MapPicker maps use) the map id's Google Cloud style draws it; without one it is plain Google styling.
// Either way place, area and road names show when zoomed in.
export function staticMapUrl(lat: number, lng: number, apiKey: string, mapId?: string | null): string {
	const params = [
		`center=${lat},${lng}`,
		'zoom=15',
		'size=480x260',
		'scale=2',
		'maptype=roadmap',
		`markers=size:small|color:0x1a1a1a|${lat},${lng}`,
		`key=${apiKey}`,
	];
	if (mapId) params.push(`map_id=${encodeURIComponent(mapId)}`);
	return `https://maps.googleapis.com/maps/api/staticmap?${params.join('&')}`;
}

export function mapLookOptions(mapId?: string | null): Record<string, any> {
	return mapId ? { mapId } : {};
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India
const DEFAULT_ZOOM = 5;
const PIN_ZOOM = 15;

async function geocodeQuery(
	google: any,
	query: string,
): Promise<{ lat: number; lng: number; address: string } | null> {
	if (!query) return null;
	const geocoder = new google.maps.Geocoder();
	const parts = query
		.split(',')
		.map((s: string) => s.trim())
		.filter(Boolean);
	for (let i = 0; i < parts.length; i++) {
		const candidate = parts.slice(i).join(', ');
		try {
			const result = await new Promise<any>((resolve, reject) => {
				geocoder.geocode({ address: candidate }, (results: any, status: string) => {
					if (status === 'OK' && results?.[0]) resolve(results[0]);
					else reject(new Error(status));
				});
			});
			const loc = result.geometry?.location;
			if (loc) {
				return {
					lat: loc.lat(),
					lng: loc.lng(),
					address: result.formatted_address || candidate,
				};
			}
		} catch {
			// try shorter query
		}
	}
	return null;
}

async function reverseGeocode(google: any, lat: number, lng: number): Promise<string | null> {
	try {
		const geocoder = new google.maps.Geocoder();
		const result = await new Promise<any>((resolve, reject) => {
			geocoder.geocode({ location: { lat, lng } }, (results: any, status: string) => {
				if (status === 'OK' && results?.[0]) resolve(results[0]);
				else reject(new Error(status));
			});
		});
		return result.formatted_address || null;
	} catch {
		return null;
	}
}

export function LocationMap({
	location,
	onConfirm,
	confirmed,
	confirmedMeta,
	disabled,
}: Readonly<LocationMapProps>) {
	const apiKey = location.api_key || '';
	const mapId = location.map_id || '';
	const query = location.query || location.product_location || location.location || '';
	const display =
		location.product_location ||
		location.location ||
		location.product_name ||
		'Detected location';

	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const [status, setStatus] = useState<'loading' | 'ready' | 'no-key' | 'error'>(
		apiKey ? 'loading' : 'no-key',
	);
	const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
		location.coordinates ?? null,
	);
	const addressRef = useRef<string>(display);

	const containerRef = useCallback((node: HTMLDivElement | null) => setContainer(node), []);

	useEffect(() => {
		if (!apiKey || !container || confirmed) return;
		let cancelled = false;
		let map: any = null;
		let marker: any = null;

		loadGoogleMaps(apiKey)
			.then(async google => {
				if (cancelled || !container.isConnected) return;

				// Make sure the container has layout before constructing the map —
				// Google internally sets up IntersectionObservers that require this.
				await new Promise(requestAnimationFrame);
				if (cancelled || !container.isConnected) return;

				try {
					map = new google.maps.Map(container, {
						center: coords ?? DEFAULT_CENTER,
						zoom: coords ? PIN_ZOOM : DEFAULT_ZOOM,
						disableDefaultUI: true,
						zoomControl: true,
						mapTypeControl: false,
						streetViewControl: false,
						fullscreenControl: false,
						gestureHandling: 'cooperative',
						clickableIcons: false,
						...mapLookOptions(mapId),
					});
				} catch (e) {
					if (!cancelled) setStatus('error');
					return;
				}

				const placeMarker = (lat: number, lng: number) => {
					if (!marker) {
						marker = new google.maps.Marker({
							position: { lat, lng },
							map,
							draggable: true,
						});
						marker.addListener('dragend', async () => {
							const pos = marker.getPosition();
							if (!pos) return;
							const lat2 = pos.lat();
							const lng2 = pos.lng();
							setCoords({ lat: lat2, lng: lng2 });
							const addr = await reverseGeocode(google, lat2, lng2);
							if (addr) addressRef.current = addr;
						});
					} else {
						marker.setPosition({ lat, lng });
					}
				};

				map.addListener('click', async (e: any) => {
					const lat = e.latLng.lat();
					const lng = e.latLng.lng();
					setCoords({ lat, lng });
					placeMarker(lat, lng);
					map.panTo({ lat, lng });
					if (map.getZoom() < PIN_ZOOM) map.setZoom(PIN_ZOOM);
					const addr = await reverseGeocode(google, lat, lng);
					if (addr) addressRef.current = addr;
				});

				if (!coords && query) {
					const resolved = await geocodeQuery(google, query);
					if (cancelled) return;
					if (resolved) {
						setCoords({ lat: resolved.lat, lng: resolved.lng });
						addressRef.current = resolved.address;
						map.setCenter({ lat: resolved.lat, lng: resolved.lng });
						map.setZoom(PIN_ZOOM);
						placeMarker(resolved.lat, resolved.lng);
					}
				} else if (coords) {
					placeMarker(coords.lat, coords.lng);
				}

				if (!cancelled) setStatus('ready');
			})
			.catch(() => {
				if (!cancelled) setStatus('error');
			});

		return () => {
			cancelled = true;
			if (marker) marker.setMap(null);
			map = null;
		};
		// We intentionally DO NOT depend on `coords` — the effect should run once
		// per (apiKey, container). Marker updates are driven imperatively.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [apiKey, mapId, container, confirmed, query]);

	if (confirmed) {
		const addr = confirmedMeta?.address || display;
		const lat = confirmedMeta?.lat;
		const lng = confirmedMeta?.lng;
		const snapshot =
			apiKey && lat != null && lng != null ? staticMapUrl(lat, lng, apiKey, mapId) : null;
		return (
			<div className="_pLocationConfirmedCard" role="status">
				{snapshot && (
					<div className="_pLocationConfirmedMap">
						<img src={snapshot} alt={`Map of ${addr}`} />
					</div>
				)}
				<div className="_pLocationConfirmedRow">
					<span className="_pLocationConfirmedCheck" aria-hidden="true">
						<svg viewBox="0 0 24 24" width="14" height="14">
							<path
								fill="none"
								stroke="currentColor"
								strokeWidth="3"
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M5 12l5 5L20 7"
							/>
						</svg>
					</span>
					<span className="_pLocationConfirmedAddr">{addr}</span>
				</div>
			</div>
		);
	}

	return (
		<div className="_pLocationContainer">
			<div className="_pLocationHeader">
				<span>{display}</span>
			</div>
			<div className="_pLocationMapWrap">
				<div ref={containerRef} className="_pLocationMapDiv" />
				{status !== 'ready' && (
					<div className="_pLocationMapOverlay">
						{status === 'loading' && 'Loading map…'}
						{status === 'no-key' && 'Map unavailable (API key not configured)'}
						{status === 'error' &&
							'Couldn’t load map. You can still confirm the detected location.'}
					</div>
				)}
			</div>
			<div className="_pLocationFooter">
				<span className="_pLocationHint">
					{coords ? 'Drag the pin or click the map to adjust' : 'Locating…'}
				</span>
				<div className="_pLocationActions">
					<button
						className="_pLocationConfirmBtn"
						onClick={() => onConfirm(coords, addressRef.current)}
						disabled={disabled || !coords}
						type="button"
					>
						Confirm
					</button>
				</div>
			</div>
		</div>
	);
}
