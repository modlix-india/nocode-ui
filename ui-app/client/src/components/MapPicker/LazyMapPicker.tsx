import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
	UrlDetailsExtractor,
} from '../../context/StoreContext';
import { ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { loadGoogleMaps } from '../../util/googleMapsLoader';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './mapPickerProperties';

type Point = { lat: number; lng: number };

const PIN_ZOOM = 13;

function asPoint(v: any): Point | undefined {
	const lat = Number(v?.lat);
	const lng = Number(v?.lng);
	if (v?.lat === undefined || v?.lat === null || v?.lat === '' || Number.isNaN(lat))
		return undefined;
	if (v?.lng === undefined || v?.lng === null || v?.lng === '' || Number.isNaN(lng))
		return undefined;
	if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return undefined;
	return { lat, lng };
}

const round6 = (n: number) => Math.round(n * 1e6) / 1e6;

type Place = {
	name?: string;
	lat?: number;
	lng?: number;
	radiusKm?: number;
	radius?: number;
	distanceUnit?: string;
	excluded?: boolean;
	/** ADZ-1217: drawn in the suggested colour (a place offered, not chosen). */
	suggested?: boolean;
	/** ADZ-1217: a Google place id; with a map id its real outline is drawn, with no lookup. */
	placeId?: string;
};
type Spot = {
	center: Point;
	bounds?: { south: number; west: number; north: number; east: number };
};

// one lookup per place name for the whole session (the Geocoding API is billed per call)
const spots = new Map<string, Promise<Spot | undefined>>();

function findPlace(google: any, name: string): Promise<Spot | undefined> {
	const key = name.trim().toLowerCase();
	const cached = spots.get(key);
	if (cached) return cached;
	const p = new Promise<Spot | undefined>(resolve => {
		try {
			new google.maps.Geocoder().geocode({ address: name }, (res: any, status: string) => {
				const g = status === 'OK' ? res?.[0]?.geometry : undefined;
				if (!g?.location) return resolve(undefined);
				const box = (g.bounds ?? g.viewport)?.toJSON?.() ?? g.bounds ?? g.viewport;
				resolve({ center: { lat: g.location.lat(), lng: g.location.lng() }, bounds: box });
			});
		} catch {
			resolve(undefined);
		}
	});
	spots.set(key, p);
	void p.then(s => !s && spots.delete(key));
	return p;
}

function placeList(v: any, excluded = false, suggested = false): Place[] {
	if (!Array.isArray(v)) return [];
	return v
		.filter(p => p && typeof p === 'object')
		.map(p =>
			excluded ? { ...p, excluded: true } : suggested ? { ...p, suggested: true } : p,
		);
}

// ADZ-1217: the Google boundary layers a place id can be outlined in (a map id with them switched on)
const BOUNDARY_LAYERS = [
	'LOCALITY',
	'POSTAL_CODE',
	'ADMINISTRATIVE_AREA_LEVEL_2',
	'ADMINISTRATIVE_AREA_LEVEL_1',
	'COUNTRY',
];

/** The boundary layers this map can style: none without a map id or when the map style has none switched on. */
export function boundaryLayers(google: any, map: any): any[] {
	if (!map?.getFeatureLayer) return [];
	const types = google?.maps?.FeatureType ?? {};
	const out: any[] = [];
	for (const t of BOUNDARY_LAYERS) {
		try {
			const layer = map.getFeatureLayer(types[t] ?? t);
			if (layer?.isAvailable) out.push(layer);
		} catch {
			/* a layer this map does not have */
		}
	}
	return out;
}

/** Outline and fill of a place: excluded, suggested (lighter) or chosen; an outlined area is filled a little more. */
export function placeLook(
	pl: Place,
	colors: { place?: string; excluded?: string; suggested?: string },
	outline = false,
) {
	const color = pl.excluded
		? (colors.excluded ?? '#c0362c')
		: pl.suggested
			? (colors.suggested ?? '#6b7280')
			: (colors.place ?? '#1a1a1a');
	const fill = pl.excluded ? 0.18 : pl.suggested ? 0.04 : outline ? 0.18 : 0.08;
	return {
		strokeColor: color,
		strokeOpacity: pl.suggested ? 0.6 : 0.9,
		strokeWeight: pl.excluded ? 2 : pl.suggested ? 1 : 1.5,
		fillColor: color,
		fillOpacity: fill,
	};
}

/** radiusKm, else radius in its distanceUnit (MILE / mile: miles, anything else: km). */
function placeKm(p: Place): number {
	if (Number(p.radiusKm) > 0) return Number(p.radiusKm);
	const r = Number(p.radius);
	if (!(r > 0)) return 0;
	return /^mile/i.test(String(p.distanceUnit ?? '')) ? r * 1.609344 : r;
}

/**
 * Pick one point on a Google map: a click or a marker drag writes {lat, lng} to the binding path
 * (other keys of the bound object are kept) and runs On Change. The bound point, when set, shows
 * as the marker; Radius (km) draws a circle around it. Without an API key it renders the "no map"
 * text only, so a page can place it next to typed latitude / longitude fields.
 */
function MapPicker(props: Readonly<ComponentProps>) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const urlExtractor = UrlDetailsExtractor.getForContext(props.context.pageName);
	const { definition, locationHistory, context, pageDefinition } = props;
	const { bindingPath, bindingPath2, key } = definition;
	const {
		properties: {
			apiKey,
			centerLat,
			centerLng,
			zoom,
			radiusKm,
			places,
			excludedPlaces,
			suggestedPlaces,
			placeColor,
			excludedColor,
			suggestedColor,
			mapId,
			noMapText,
			readOnly,
			onChange,
			onPlaceClick,
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
	const resolvedStyles = processComponentStylePseudoClasses(
		pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);
	const path = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;
	// ADZ-1217: where a click on a drawn place is written (the place as given), for On Place Click
	const clickedPath = bindingPath2
		? getPathFromLocation(bindingPath2, locationHistory, pageExtractor)
		: undefined;

	const [bound, setBound] = useState<any>(undefined);
	const [failed, setFailed] = useState(false);
	const [ready, setReady] = useState(false);
	const holder = useRef<HTMLDivElement>(null);
	const live = useRef<{
		google?: any;
		map?: any;
		marker?: any;
		circle?: any;
		shapes?: any[];
		layers?: any[];
		layerListeners?: any[];
		fit?: any;
		idled?: boolean;
	}>({});
	const latest = useRef<{
		bound?: any;
		readOnly?: boolean;
		onChange?: string;
		onPlaceClick?: string;
		clickedPath?: string;
	}>({});
	latest.current = { bound, readOnly, onChange, onPlaceClick, clickedPath };

	useEffect(() => {
		if (!path) return;
		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setBound(v),
			path,
		);
	}, [path]);

	const point = asPoint(bound);

	useEffect(() => {
		if (!apiKey || !holder.current) return;
		let cancelled = false;
		loadGoogleMaps(apiKey)
			.then(google => {
				if (cancelled || !holder.current) return;
				const start = asPoint(latest.current.bound);
				const map = new google.maps.Map(holder.current, {
					center: start ?? {
						lat: Number(centerLat ?? 20.5937),
						lng: Number(centerLng ?? 78.9629),
					},
					zoom: start ? PIN_ZOOM : Number(zoom ?? 5),
					disableDefaultUI: true,
					zoomControl: true,
					gestureHandling: 'cooperative',
					clickableIcons: false,
					// ADZ-1217: a map id whose style has the boundary layers on draws places' real outlines
					...(mapId ? { mapId } : {}),
				});
				live.current = { google, map };
				// a fit asked for before the map first settles is lost, so it is held until then
				map.addListener('idle', () => {
					live.current.idled = true;
					if (live.current.fit) fitWhenShown(live.current.fit);
				});
				setReady(true);
				map.addListener('click', (e: any) => {
					if (latest.current.readOnly || !e?.latLng) return;
					pick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
				});
				drawPoint(asPoint(latest.current.bound));
			})
			.catch(() => !cancelled && setFailed(true));
		return () => {
			cancelled = true;
			live.current = {};
			setReady(false);
		};
	}, [apiKey, mapId]);

	function pick(p: Point) {
		if (!path) return;
		const base =
			latest.current.bound && typeof latest.current.bound === 'object'
				? latest.current.bound
				: {};
		setData(path, { ...base, lat: round6(p.lat), lng: round6(p.lng) }, context.pageName);
		const ev = latest.current.onChange;
		if (ev && pageDefinition.eventFunctions?.[ev])
			(async () =>
				await runEvent(
					pageDefinition.eventFunctions[ev],
					key,
					context.pageName,
					locationHistory,
					pageDefinition,
				))();
	}

	function drawPoint(p?: Point) {
		const { google, map } = live.current;
		if (!google || !map) return;
		if (!p) {
			live.current.marker?.setMap(null);
			live.current.circle?.setMap(null);
			live.current.marker = undefined;
			live.current.circle = undefined;
			return;
		}
		if (!live.current.marker) {
			const marker = new google.maps.Marker({
				position: p,
				map,
				draggable: !latest.current.readOnly,
			});
			marker.addListener('dragend', () => {
				const pos = marker.getPosition();
				if (pos) pick({ lat: pos.lat(), lng: pos.lng() });
			});
			live.current.marker = marker;
			map.setCenter(p);
			if (map.getZoom() < PIN_ZOOM - 4) map.setZoom(PIN_ZOOM - 2);
		} else live.current.marker.setPosition(p);
		const km = Number(radiusKm);
		if (km > 0) {
			if (!live.current.circle)
				live.current.circle = new google.maps.Circle({
					map,
					center: p,
					radius: km * 1000,
					strokeWeight: 1,
					fillOpacity: 0.08,
					clickable: false,
				});
			else {
				live.current.circle.setCenter(p);
				live.current.circle.setRadius(km * 1000);
			}
		} else {
			live.current.circle?.setMap(null);
			live.current.circle = undefined;
		}
	}

	useEffect(() => drawPoint(point), [point?.lat, point?.lng, radiusKm]);

	// A map inside a hidden step has no size; fitting it then does nothing, so the fit waits until it is shown.
	function fitWhenShown(bounds: any) {
		const { map } = live.current;
		if (!map) return;
		const el = holder.current;
		if (live.current.idled && el && el.offsetWidth > 0 && el.offsetHeight > 0) {
			live.current.fit = undefined;
			map.fitBounds(bounds, 24);
		} else live.current.fit = bounds;
	}

	useEffect(() => {
		const el = holder.current;
		if (!ready || !el || typeof ResizeObserver === 'undefined') return;
		const ro = new ResizeObserver(() => {
			if (live.current.fit && el.offsetWidth > 0 && el.offsetHeight > 0)
				fitWhenShown(live.current.fit);
		});
		ro.observe(el);
		return () => ro.disconnect();
	}, [ready]);

	// ADZ-1217: a click on a drawn place writes it to the second binding and runs On Place Click
	function clickPlace(pl: Place) {
		const { clickedPath: cp, onPlaceClick: ev } = latest.current;
		if (cp) setData(cp, pl, context.pageName);
		if (ev && pageDefinition.eventFunctions?.[ev])
			(async () =>
				await runEvent(
					pageDefinition.eventFunctions[ev],
					key,
					context.pageName,
					locationHistory,
					pageDefinition,
				))();
	}

	function clearPlaces() {
		(live.current.shapes ?? []).forEach(s => s.setMap(null));
		live.current.shapes = [];
		(live.current.layerListeners ?? []).forEach(l => l?.remove?.());
		live.current.layerListeners = [];
		(live.current.layers ?? []).forEach(l => {
			try {
				l.style = null;
			} catch {
				/* a layer that takes no style */
			}
		});
		live.current.layers = [];
	}

	// ADZ-1171: the places a page targets (or excludes), drawn read-only under the picked point.
	// ADZ-1217: plus the suggested ones in their own colour; a place with a Google place id (and no radius) is
	// outlined with its real boundary when the map id has boundary layers, else drawn as before.
	const allPlaces = [
		...placeList(places),
		...placeList(suggestedPlaces, false, true),
		...placeList(excludedPlaces, true),
	];
	const placesKey = JSON.stringify(allPlaces);
	const clickable = !!(onPlaceClick || clickedPath);
	useEffect(() => {
		const { google, map } = live.current;
		if (!ready || !google || !map) return;
		let stale = false;
		clearPlaces();
		const list: Place[] = JSON.parse(placesKey);
		if (!list.length) return;
		const colors = { place: placeColor, excluded: excludedColor, suggested: suggestedColor };
		const layers = mapId ? boundaryLayers(google, map) : [];
		const outlined = new Map<string, Place>();
		list.forEach(pl => {
			if (layers.length && pl.placeId && !(placeKm(pl) > 0)) outlined.set(pl.placeId, pl);
		});
		if (outlined.size) {
			live.current.layers = layers;
			layers.forEach(layer => {
				layer.style = (opts: any) => {
					const pl = outlined.get(opts?.feature?.placeId);
					return pl ? placeLook(pl, colors, true) : null;
				};
				if (clickable)
					live.current.layerListeners!.push(
						layer.addListener('click', (e: any) => {
							const pl = outlined.get(e?.features?.[0]?.placeId);
							if (pl) clickPlace(pl);
						}),
					);
			});
		}
		Promise.all(
			list.map(pl => {
				const at = asPoint(pl);
				if (at) return Promise.resolve<Spot | undefined>({ center: at });
				if (pl.placeId && outlined.has(pl.placeId)) return Promise.resolve(undefined);
				return pl.name ? findPlace(google, String(pl.name)) : Promise.resolve(undefined);
			}),
		).then(found => {
			if (stale || live.current.map !== map) return;
			const all = new google.maps.LatLngBounds();
			let any = false;
			found.forEach((spot, i) => {
				if (!spot) return;
				const pl = list[i];
				const look = { map, clickable, ...placeLook(pl, colors) };
				const km = placeKm(pl);
				let shape: any;
				if (pl.placeId && outlined.has(pl.placeId)) {
					// the outline is the layer's; a small dot marks it and takes the click
					shape = new google.maps.Circle({
						...look,
						fillOpacity: 0.6,
						center: spot.center,
						radius: 120,
					});
				} else if (km > 0 || !spot.bounds) {
					shape = new google.maps.Circle({
						...look,
						center: spot.center,
						radius: (km > 0 ? km : 1) * 1000,
					});
				} else {
					shape = new google.maps.Rectangle({ ...look, bounds: spot.bounds });
				}
				if (clickable) shape.addListener?.('click', () => clickPlace(pl));
				live.current.shapes!.push(shape);
				const b = pl.placeId && outlined.has(pl.placeId) ? undefined : shape.getBounds?.();
				if (b) {
					all.union(b);
					any = true;
				} else {
					all.extend(spot.center);
					any = true;
				}
			});
			if (!any) return;
			// the picked point stays in view too
			const at = asPoint(latest.current.bound);
			if (at) all.extend(at);
			fitWhenShown(all);
		});
		return () => {
			stale = true;
		};
	}, [ready, placesKey, placeColor, excludedColor, suggestedColor, mapId, clickable]);

	return (
		<div className="comp compMapPicker" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
			{apiKey && !failed ? (
				<div className="_map" ref={holder} />
			) : (
				<div className="_noMap">{noMapText ?? 'The map is not available.'}</div>
			)}
		</div>
	);
}

export default MapPicker;
