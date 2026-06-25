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
	};
	onConfirm: (coords: { lat: number; lng: number } | null, address?: string) => void;
	confirmed?: boolean;
	confirmedMeta?: { address?: string; lat?: number; lng?: number };
	disabled?: boolean;
}

// Clean monochrome static-map styles (grayscale, no POIs).
const STATIC_STYLES = [
	'feature:poi|visibility:off',
	'feature:transit|visibility:off',
	'feature:administrative.land_parcel|visibility:off',
	'feature:administrative.neighborhood|visibility:off',
	'feature:road|element:labels.icon|visibility:off',
	'feature:road.local|element:labels|visibility:off',
	'element:labels.text.stroke|color:0xffffff',
	'element:labels.text.fill|color:0x757575',
	'feature:landscape|element:geometry|color:0xf5f5f5',
	'feature:road|element:geometry|color:0xffffff',
	'feature:road.arterial|element:geometry|color:0xe8e8e8',
	'feature:road.highway|element:geometry|color:0xdadada',
	'feature:water|element:geometry|color:0xeaeaea',
];

function staticMapUrl(lat: number, lng: number, apiKey: string): string {
	const params = [
		`center=${lat},${lng}`,
		'zoom=15',
		'size=480x260',
		'scale=2',
		'maptype=roadmap',
		`markers=size:small|color:0x1a1a1a|${lat},${lng}`,
		`key=${apiKey}`,
	];
	STATIC_STYLES.forEach(s => params.push(`style=${encodeURIComponent(s)}`));
	return `https://maps.googleapis.com/maps/api/staticmap?${params.join('&')}`;
}

const DEFAULT_CENTER = { lat: 20.5937, lng: 78.9629 }; // India
const DEFAULT_ZOOM = 5;
const PIN_ZOOM = 15;

// Clean light-theme map styles — hide POIs, transit, fine-grained admin labels,
// dim road/water colors. Matches the feel of the reference image but light.
const MAP_STYLES = [
	{ featureType: 'poi', stylers: [{ visibility: 'off' }] },
	{ featureType: 'transit', stylers: [{ visibility: 'off' }] },
	{ featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
	{ featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
	{ featureType: 'road', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
	{ featureType: 'road.local', elementType: 'labels', stylers: [{ visibility: 'off' }] },
	{ elementType: 'labels.text.stroke', stylers: [{ color: '#ffffff' }] },
	{ elementType: 'labels.text.fill', stylers: [{ color: '#616161' }] },
	{ featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#f5f5f5' }] },
	{ featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
	{ featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#e8e8e8' }] },
	{ featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#dadada' }] },
	{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#cfe2f3' }] },
];


async function geocodeQuery(google: any, query: string): Promise<{ lat: number; lng: number; address: string } | null> {
	if (!query) return null;
	const geocoder = new google.maps.Geocoder();
	const parts = query.split(',').map((s: string) => s.trim()).filter(Boolean);
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
	const query = location.query || location.product_location || location.location || '';
	const display =
		location.product_location ||
		location.location ||
		location.product_name ||
		'Detected location';

	const [container, setContainer] = useState<HTMLDivElement | null>(null);
	const [status, setStatus] = useState<'loading' | 'ready' | 'no-key' | 'error'>(apiKey ? 'loading' : 'no-key');
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
						styles: MAP_STYLES,
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
	}, [apiKey, container, confirmed, query]);

	if (confirmed) {
		const addr = confirmedMeta?.address || display;
		const lat = confirmedMeta?.lat;
		const lng = confirmedMeta?.lng;
		const snapshot = apiKey && lat != null && lng != null ? staticMapUrl(lat, lng, apiKey) : null;
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
						{status === 'error' && 'Couldn’t load map. You can still confirm the detected location.'}
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
