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
	/** ADZ-1257: the kind of place (a Google Ads or Meta target type), checked when Match Place Type is on. */
	type?: string;
};
type Spot = {
	center: Point;
	bounds?: { south: number; west: number; north: number; east: number };
	/** ADZ-1257: what the lookup found: its types, its own bounds (not only a viewport), its place id */
	types?: string[];
	exact?: boolean;
	partial?: boolean;
	placeId?: string;
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
				const r = status === 'OK' ? res?.[0] : undefined;
				const g = r?.geometry;
				if (!g?.location) return resolve(undefined);
				const box = (g.bounds ?? g.viewport)?.toJSON?.() ?? g.bounds ?? g.viewport;
				resolve({
					center: { lat: g.location.lat(), lng: g.location.lng() },
					bounds: box,
					types: Array.isArray(r.types) ? r.types : [],
					exact: !!g.bounds,
					partial: !!r.partial_match,
					placeId: r.place_id,
				});
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

// ADZ-1407: the Grey map look (a map id brings its own style instead): light grey land, darker water, state and
// city names in grey, no roads, places of interest or transit
export const GREY_STYLE = [
	{ elementType: 'geometry', stylers: [{ color: '#eeeeee' }] },
	{ elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
	{ elementType: 'labels.text.fill', stylers: [{ color: '#8a8a8a' }] },
	{ elementType: 'labels.text.stroke', stylers: [{ color: '#f5f5f5' }] },
	{
		featureType: 'administrative',
		elementType: 'geometry.stroke',
		stylers: [{ color: '#c8c8c8' }],
	},
	{ featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
	{ featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
	{ featureType: 'poi', stylers: [{ visibility: 'off' }] },
	{ featureType: 'road', stylers: [{ visibility: 'off' }] },
	{ featureType: 'transit', stylers: [{ visibility: 'off' }] },
	{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#d4d4d8' }] },
	{ featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

// ADZ-1435: the Dark grey look, the Grey look for a dark page: dark grey land, darker water, names in light grey
export const DARK_GREY_STYLE = [
	{ elementType: 'geometry', stylers: [{ color: '#2b2b2b' }] },
	{ elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
	{ elementType: 'labels.text.fill', stylers: [{ color: '#9a9a9a' }] },
	{ elementType: 'labels.text.stroke', stylers: [{ color: '#1f1f1f' }] },
	{
		featureType: 'administrative',
		elementType: 'geometry.stroke',
		stylers: [{ color: '#4a4a4a' }],
	},
	{ featureType: 'administrative.land_parcel', stylers: [{ visibility: 'off' }] },
	{ featureType: 'administrative.neighborhood', stylers: [{ visibility: 'off' }] },
	{ featureType: 'poi', stylers: [{ visibility: 'off' }] },
	{ featureType: 'road', stylers: [{ visibility: 'off' }] },
	{ featureType: 'transit', stylers: [{ visibility: 'off' }] },
	{ featureType: 'water', elementType: 'geometry', stylers: [{ color: '#1a1a1a' }] },
	{ featureType: 'water', elementType: 'labels', stylers: [{ visibility: 'off' }] },
];

/**
 * The look options a map is made with. Without a map id: Grey and Dark grey style the map. With one, the map id's own
 * style wins; Dark grey then asks for its dark colour scheme (ADZ-1435).
 */
export function lookOptions(mapLook?: string, mapId?: string): Record<string, any> {
	if (mapId) return mapLook === 'GREY_DARK' ? { colorScheme: 'DARK' } : {};
	if (mapLook === 'GREY') return { styles: GREY_STYLE, backgroundColor: '#eeeeee' };
	if (mapLook === 'GREY_DARK') return { styles: DARK_GREY_STYLE, backgroundColor: '#2b2b2b' };
	return {};
}

/** ADZ-1407: the tag text of a place: "Pin" for a dropped pin, else its name up to the first comma. */
export function labelOf(pl: Place): string {
	if (String(pl.type ?? '').toUpperCase() === 'CUSTOM_LOCATION') return 'Pin';
	return String(pl.name ?? '')
		.split(',')[0]
		.trim();
}

/** ADZ-1407: a place's name tag at a point, as a map overlay (none when the Maps script has no overlays). */
function placeTag(google: any, map: any, at: Point, text: string, excluded: boolean) {
	const Base = google?.maps?.OverlayView;
	if (!Base || !text) return undefined;
	const div = document.createElement('div');
	div.className = excluded ? '_placeLabel _excluded' : '_placeLabel';
	div.textContent = text;
	const tag = new Base();
	tag.onAdd = () => tag.getPanes?.()?.floatPane?.appendChild(div);
	tag.draw = () => {
		const p = tag
			.getProjection?.()
			?.fromLatLngToDivPixel(new google.maps.LatLng(at.lat, at.lng));
		if (!p) return;
		div.style.left = p.x + 'px';
		div.style.top = p.y + 'px';
	};
	tag.onRemove = () => div.remove();
	tag.setMap(map);
	return tag;
}

/** radiusKm, else radius in its distanceUnit (MILE / mile: miles, anything else: km). */
function placeKm(p: Place): number {
	if (Number(p.radiusKm) > 0) return Number(p.radiusKm);
	const r = Number(p.radius);
	if (!(r > 0)) return 0;
	return /^mile/i.test(String(p.distanceUnit ?? '')) ? r * 1.609344 : r;
}

// ADZ-1257: the Geocoding result types that ARE a place of each target type (Google Ads target types, Meta's
// lower case ones normalised). A lookup that answers another kind (a state for an unknown postal code, a town
// for a district) is not that place, so it is not drawn. Types listed in POINT_FITS get a marker, not an area.
const AAL = 'administrative_area_level_';
const AREA_FITS: Record<string, string[]> = {
	COUNTRY: ['country'],
	STATE: [AAL + '1'],
	PROVINCE: [AAL + '1'],
	REGION: [AAL + '1'],
	TERRITORY: [AAL + '1'],
	UNION_TERRITORY: [AAL + '1'],
	AUTONOMOUS_COMMUNITY: [AAL + '1'],
	PREFECTURE: [AAL + '1'],
	GOVERNORATE: [AAL + '1'],
	CANTON: [AAL + '1'],
	OKRUG: [AAL + '1'],
	DEPARTMENT: [AAL + '2'],
	DIVISION: [AAL + '2'],
	COUNTY: [AAL + '2', AAL + '3'],
	DISTRICT: [AAL + '2', AAL + '3'],
	SUB_DISTRICT: [AAL + '3', AAL + '4', AAL + '5'],
	CITY: ['locality', 'postal_town', AAL + '3'],
	MUNICIPALITY: ['locality', AAL + '2', AAL + '3', AAL + '4'],
	POST_TOWN: ['postal_town', 'locality'],
	CITY_REGION: ['colloquial_area', 'locality'],
	COLLOQUIAL_AREA: ['colloquial_area'],
	BOROUGH: ['sublocality', 'locality'],
	NEIGHBORHOOD: ['neighborhood', 'sublocality'],
	SUBCITY: ['neighborhood', 'sublocality'],
	WARD: ['sublocality', 'neighborhood', AAL + '4', AAL + '5'],
	SUB_WARD: ['sublocality', 'neighborhood'],
	QUARTER: ['sublocality', 'neighborhood'],
	COMMUNE: ['locality', AAL + '3', AAL + '4'],
	POSTAL_CODE: ['postal_code'],
	ZIP: ['postal_code'],
	AIRPORT: ['airport'],
	UNIVERSITY: ['university'],
	NATIONAL_PARK: ['park', 'natural_feature'],
};
const POINT_FITS: Record<string, string[]> = { SUB_DISTRICT: ['locality'] };
const LAYER_TYPES = ['locality', 'postal_code', AAL + '2', AAL + '1', 'country'];

const hasType = (types: string[], fits: string[] = []) =>
	types.some(t => fits.some(f => t === f || t.startsWith(f + '_level_')));

/**
 * ADZ-1257: how a place looked up by name may be drawn when its type is checked: 'outline' (its real boundary,
 * through a boundary layer), 'area' (the box of its own bounds), 'point' (a marker) or undefined (not drawn).
 */
export function placeFit(
	pl: Place,
	spot: Spot | undefined,
	layered = false,
): 'outline' | 'area' | 'point' | undefined {
	if (!spot) return undefined;
	const kind = String(pl.type ?? '')
		.trim()
		.toUpperCase()
		.replace(/[\s-]+/g, '_');
	const types = spot.types ?? [];
	const fits = AREA_FITS[kind];
	if (!fits) return spot.partial ? undefined : 'point'; // a kind this map does not know: a marker at most
	if (hasType(types, fits)) {
		if (layered && spot.placeId && hasType(types, LAYER_TYPES)) return 'outline';
		return spot.exact && spot.bounds ? 'area' : 'point';
	}
	return hasType(types, POINT_FITS[kind]) ? 'point' : undefined;
}

/**
 * The shape a found place is drawn with, and the box the map fits to (undefined: fit its centre):
 * a small dot where a boundary layer draws the outline, a marker for a point (ADZ-1257), a circle for a radius
 * or a place with no bounds, else the box of its bounds.
 */
function shapeOf(
	google: any,
	look: any,
	pl: Place,
	spot: Spot,
	fit: 'outline' | 'area' | 'point' | null,
	km: number,
	layered: boolean,
): { shape: any; box?: any } {
	if (layered) {
		// the outline is the layer's; a small dot marks it and takes the click
		const shape = new google.maps.Circle({
			...look,
			fillOpacity: 0.6,
			center: spot.center,
			radius: 120,
		});
		return { shape, box: fit === 'outline' ? spot.bounds : undefined };
	}
	if (fit === 'point') {
		const shape = new google.maps.Marker({
			map: look.map,
			clickable: look.clickable,
			position: spot.center,
			title: pl.name ? String(pl.name) : undefined,
		});
		// a marker alone would fit the map to street level: keep a few km around it in view
		const d = 0.05;
		const c = spot.center;
		return {
			shape,
			box: { south: c.lat - d, west: c.lng - d, north: c.lat + d, east: c.lng + d },
		};
	}
	if (km > 0 || !spot.bounds) {
		const shape = new google.maps.Circle({
			...look,
			center: spot.center,
			radius: (km > 0 ? km : 1) * 1000,
		});
		return { shape, box: shape.getBounds?.() };
	}
	// an outlined area (fit 'area' lands here too: no radius, bounds of its own)
	const shape = new google.maps.Rectangle({ ...look, bounds: spot.bounds });
	return { shape, box: shape.getBounds?.() };
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
			mapLook,
			placeLabels,
			matchPlaceType,
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
		hadPlaces?: boolean;
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
					// ADZ-1407: the Grey look, only without a map id (whose style wins); ADZ-1435: Dark grey
					...lookOptions(mapLook, mapId),
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
	}, [apiKey, mapId, mapLook]);

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
	// ADZ-1257: with Match Place Type, a place looked up by name is drawn only when the lookup found that kind of
	// place (placeFit): its real outline (map id), else the box of its bounds, else a marker; never another place.
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
		if (!list.length) {
			// ADZ-1257: the last place went: back to the start view (a picked point keeps the view it has)
			if (live.current.hadPlaces && !asPoint(latest.current.bound)) {
				live.current.fit = undefined;
				map.setCenter({
					lat: Number(centerLat ?? 20.5937),
					lng: Number(centerLng ?? 78.9629),
				});
				map.setZoom(Number(zoom ?? 5));
			}
			live.current.hadPlaces = false;
			return;
		}
		live.current.hadPlaces = true;
		const typed = !!matchPlaceType;
		const colors = { place: placeColor, excluded: excludedColor, suggested: suggestedColor };
		const layers = mapId ? boundaryLayers(google, map) : [];
		const outlined = new Map<string, Place>();
		list.forEach(pl => {
			if (layers.length && pl.placeId && !(placeKm(pl) > 0)) outlined.set(pl.placeId, pl);
		});
		let listening = false;
		const styleLayers = () => {
			if (!outlined.size) return;
			live.current.layers = layers;
			layers.forEach(layer => {
				layer.style = (opts: any) => {
					const pl = outlined.get(opts?.feature?.placeId);
					return pl ? placeLook(pl, colors, true) : null;
				};
				if (clickable && !listening)
					live.current.layerListeners!.push(
						layer.addListener('click', (e: any) => {
							const pl = outlined.get(e?.features?.[0]?.placeId);
							if (pl) clickPlace(pl);
						}),
					);
			});
			listening = true;
		};
		styleLayers();
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
			let moreOutlines = false;
			found.forEach((spot, i) => {
				if (!spot) return;
				const pl = list[i];
				const look = { map, clickable, ...placeLook(pl, colors) };
				const km = placeKm(pl);
				// ADZ-1257: a place looked up by name must be the kind of place its type says
				const fit =
					typed && !asPoint(pl) && !(km > 0)
						? placeFit(pl, spot, layers.length > 0)
						: null;
				if (fit === undefined) return;
				if (fit === 'outline') {
					outlined.set(spot.placeId!, pl);
					moreOutlines = true;
				}
				const layered = fit === 'outline' || !!(pl.placeId && outlined.has(pl.placeId));
				const { shape, box } = shapeOf(google, look, pl, spot, fit, km, layered);
				if (clickable) shape.addListener?.('click', () => clickPlace(pl));
				live.current.shapes!.push(shape);
				if (placeLabels && !pl.suggested) {
					const tag = placeTag(google, map, spot.center, labelOf(pl), !!pl.excluded);
					if (tag) live.current.shapes!.push(tag);
				}
				if (box) all.union(box);
				else all.extend(spot.center);
				any = true;
			});
			if (moreOutlines) styleLayers();
			if (!any) return;
			// the picked point stays in view too
			const at = asPoint(latest.current.bound);
			if (at) all.extend(at);
			fitWhenShown(all);
		});
		return () => {
			stale = true;
		};
	}, [
		ready,
		placesKey,
		placeColor,
		excludedColor,
		suggestedColor,
		mapId,
		clickable,
		matchPlaceType,
		placeLabels,
	]);

	return (
		<div
			className={'comp compMapPicker' + (mapLook === 'GREY_DARK' ? ' _dark' : '')}
			style={resolvedStyles.comp ?? {}}
		>
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
