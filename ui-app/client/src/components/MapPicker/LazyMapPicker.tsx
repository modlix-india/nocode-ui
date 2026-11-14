import React, { useEffect, useRef, useState } from 'react';
import {
	addListenerAndCallImmediately,
	addListenerWithChildrenActivity,
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
/** CXZ-1830: Follow the point zooms in at least this far when the point moves */
export const FOLLOW_ZOOM = 15;

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
	/** CXZ-1650: with Point markers on, the marker's shape: CIRCLE (default) or SQUARE. */
	shape?: string;
	/** CXZ-1650: with Point markers on, a short text inside the marker (a count, a letter). */
	label?: string | number;
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

/**
 * ADZ-1503: the store paths a place property reads (Page.x, Store.x, LocalStore.x in its expression). A change
 * INSIDE such a list (one place's radius written at Page.list[0].radius) reaches no listener on the list itself,
 * and the store edits the place in place, so the resolved props look unchanged; the map watches these paths with
 * their children to redraw.
 */
export function placePaths(...props: any[]): string[] {
	const out = new Set<string>();
	for (const p of props) {
		const text = p?.location?.expression;
		if (typeof text !== 'string') continue;
		for (const m of Array.from(
			text.matchAll(/(?:^|[^\w.])((?:Page|Store|LocalStore)(?:\.[A-Za-z_$][\w$]*)+)/g),
		))
			out.add(m[1]);
	}
	return Array.from(out);
}

/** ADZ-1407: the tag text of a place: "Pin" for a dropped pin, else its name up to the first comma. */
export function labelOf(pl: Place): string {
	if (String(pl.type ?? '').toUpperCase() === 'CUSTOM_LOCATION') return 'Pin';
	return String(pl.name ?? '')
		.split(',')[0]
		.trim();
}

type TagBox = { x: number; y: number; w: number; h: number };
export type TagSpot = { dx: number; dy: number; hidden: boolean };

/**
 * ADZ-1435: where each tag goes so that no two cover each other. Tags come in priority order (the larger place
 * first) as boxes centred on their place, in pixels. Each takes the first free spot of: its centre, just below,
 * just above, beside, then the corners and two rows away; a tag with no free spot is hidden (it shows again when
 * the map is zoomed in and the places move apart).
 */
export function spreadTags(items: TagBox[], gap = 4): TagSpot[] {
	const placed: Array<{ l: number; t: number; r: number; b: number }> = [];
	const hits = (a: { l: number; t: number; r: number; b: number }) =>
		placed.some(
			p => a.l < p.r + gap && p.l < a.r + gap && a.t < p.b + gap && p.t < a.b + gap,
		);
	return items.map(it => {
		const dy = it.h + gap;
		const dx = it.w + gap;
		const tries = [
			[0, 0],
			[0, dy],
			[0, -dy],
			[dx, 0],
			[-dx, 0],
			[dx, dy],
			[-dx, dy],
			[dx, -dy],
			[-dx, -dy],
			[0, 2 * dy],
			[0, -2 * dy],
		];
		for (const [ox, oy] of tries) {
			const box = {
				l: it.x + ox - it.w / 2,
				r: it.x + ox + it.w / 2,
				t: it.y + oy - it.h / 2,
				b: it.y + oy + it.h / 2,
			};
			if (hits(box)) continue;
			placed.push(box);
			return { dx: ox, dy: oy, hidden: false };
		}
		return { dx: 0, dy: 0, hidden: true };
	});
}

/** ADZ-1435: the tags of one drawing, laid out together after any of them moves (Keep labels apart). */
export type TagBoard = {
	items: Array<{ div: HTMLDivElement; x: number; y: number; rank: number; seq: number }>;
	queued: boolean;
};

/** ADZ-1435: the size a box covers (degrees squared), to give the larger place's tag its centre. */
export function boxSize(box: any): number {
	const b = typeof box?.toJSON === 'function' ? box.toJSON() : box;
	const n = Number(b?.north) - Number(b?.south);
	const e = Number(b?.east) - Number(b?.west);
	return Number.isFinite(n) && Number.isFinite(e) ? Math.abs(n * e) : 0;
}

export function layoutTags(board: TagBoard) {
	board.queued = false;
	const order = board.items
		.filter(t => Number.isFinite(t.x) && Number.isFinite(t.y))
		.sort((a, b) => b.rank - a.rank || a.seq - b.seq);
	const spots = spreadTags(
		order.map(t => ({
			x: t.x,
			y: t.y,
			// jsdom and a tag not laid out yet have no size: a fair guess from the text
			w: t.div.offsetWidth || (t.div.textContent ?? '').length * 7 + 16,
			h: t.div.offsetHeight || 22,
		})),
	);
	order.forEach((t, i) => {
		const s = spots[i];
		t.div.style.transform = `translate(calc(-50% + ${s.dx}px), calc(-50% + ${s.dy}px))`;
		t.div.style.visibility = s.hidden ? 'hidden' : '';
	});
}

function queueLayout(board: TagBoard) {
	if (board.queued) return;
	board.queued = true;
	const later =
		typeof requestAnimationFrame === 'function'
			? requestAnimationFrame
			: (f: () => void) => setTimeout(f, 0);
	later(() => layoutTags(board));
}

/** ADZ-1407: a place's name tag at a point, as a map overlay (none when the Maps script has no overlays). */
function placeTag(
	google: any,
	map: any,
	at: Point,
	text: string,
	excluded: boolean,
	board?: TagBoard,
	rank = 0,
) {
	const Base = google?.maps?.OverlayView;
	if (!Base || !text) return undefined;
	const div = document.createElement('div');
	div.className = excluded ? '_placeLabel _excluded' : '_placeLabel';
	div.textContent = text;
	// ADZ-1435: with Keep labels apart, the tag's pixel position is shared with the others on the board
	const item = board
		? { div, x: NaN, y: NaN, rank, seq: board.items.length }
		: undefined;
	if (board && item) board.items.push(item);
	const tag = new Base();
	tag.onAdd = () => tag.getPanes?.()?.floatPane?.appendChild(div);
	tag.draw = () => {
		const p = tag
			.getProjection?.()
			?.fromLatLngToDivPixel(new google.maps.LatLng(at.lat, at.lng));
		if (!p) return;
		div.style.left = p.x + 'px';
		div.style.top = p.y + 'px';
		if (board && item) {
			item.x = p.x;
			item.y = p.y;
			queueLayout(board);
		}
	};
	tag.onRemove = () => {
		div.remove();
		if (board && item) board.items = board.items.filter(t => t !== item);
	};
	tag.setMap(map);
	return tag;
}

/** ADZ-1435: the light frame of a place's area (Area frames): thinner and fainter than a drawn outline. */
export function frameLook(
	pl: Place,
	colors: { place?: string; excluded?: string; suggested?: string },
) {
	return {
		...placeLook(pl, colors),
		strokeOpacity: pl.suggested ? 0.35 : 0.6,
		strokeWeight: 1,
		fillOpacity: pl.excluded ? 0.1 : 0.05,
	};
}

/** ADZ-1435: how long a boundary may take to draw after the map settles before its place gets a frame instead. */
export const FRAME_WAIT_MS = 2500;

/** radiusKm, else radius in its distanceUnit (MILE / mile: miles, anything else: km). */
function placeKm(p: Place): number {
	if (Number(p.radiusKm) > 0) return Number(p.radiusKm);
	const r = Number(p.radius);
	if (!(r > 0)) return 0;
	return /^mile/i.test(String(p.distanceUnit ?? '')) ? r * 1.609344 : r;
}

/**
 * CXZ-1650: the icon of a place drawn as a point marker (Point markers on): a filled circle, or a square for
 * shape SQUARE, in the place's colour with a white edge; a little larger when it carries a label.
 */
export function markerIcon(
	google: any,
	pl: Place,
	colors: { place?: string; excluded?: string; suggested?: string },
) {
	const square = String(pl.shape ?? '').toUpperCase() === 'SQUARE';
	const labelled = pl.label !== undefined && pl.label !== null && String(pl.label) !== '';
	const look = placeLook(pl, colors);
	return {
		path: square ? 'M -1 -1 L 1 -1 L 1 1 L -1 1 Z' : (google?.maps?.SymbolPath?.CIRCLE ?? 0),
		scale: (square ? 7 : 8) + (labelled ? 3 : 0),
		fillColor: look.strokeColor,
		fillOpacity: pl.suggested ? 0.6 : 1,
		strokeColor: '#ffffff',
		strokeWeight: 2,
	};
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
	dots = false,
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
	// ADZ-1655: with Area dots, an area with no outline is a small dot like an outlined place's, the map fits its bounds
	if (dots) {
		const shape = new google.maps.Circle({
			...look,
			fillOpacity: 0.6,
			center: spot.center,
			radius: 120,
		});
		return { shape, box: spot.bounds };
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
			pointMarkers,
			areaDots,
			areaFrames,
			tagSpacing,
			noMapText,
			readOnly,
			onChange,
			onPlaceClick,
			followPoint,
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
		/** ADZ-1435: a map made again for a new look keeps the old one's view: no fit on its first draw */
		keepView?: boolean;
	}>({});
	// ADZ-1435: the view of the map being replaced (a new look or map id makes a new map), for the next one
	const view = useRef<{ center: Point; zoom: number } | undefined>(undefined);
	// ADZ-1435: one more for every map made, so the places are drawn again on a new map
	const [mapGen, setMapGen] = useState(0);
	const latest = useRef<{
		bound?: any;
		readOnly?: boolean;
		onChange?: string;
		onPlaceClick?: string;
		clickedPath?: string;
		followPoint?: boolean;
	}>({});
	latest.current = { bound, readOnly, onChange, onPlaceClick, clickedPath, followPoint };

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
				// ADZ-1435: switching the look (Light / Dark) makes a new map; it opens where the old one was
				const carried = view.current;
				view.current = undefined;
				const map = new google.maps.Map(holder.current, {
					center: carried?.center ??
						start ?? {
							lat: Number(centerLat ?? 20.5937),
							lng: Number(centerLng ?? 78.9629),
						},
					zoom: carried?.zoom ?? (start ? PIN_ZOOM : Number(zoom ?? 5)),
					disableDefaultUI: true,
					zoomControl: true,
					gestureHandling: 'cooperative',
					clickableIcons: false,
					// ADZ-1217: a map id whose style has the boundary layers on draws places' real outlines
					...(mapId ? { mapId } : {}),
					// ADZ-1407: the Grey look, only without a map id (whose style wins); ADZ-1435: Dark grey
					...lookOptions(mapLook, mapId),
				});
				live.current = { google, map, keepView: !!carried };
				// a fit asked for before the map first settles is lost, so it is held until then
				map.addListener('idle', () => {
					live.current.idled = true;
					if (live.current.fit) fitWhenShown(live.current.fit);
				});
				setReady(true);
				setMapGen(g => g + 1);
				map.addListener('click', (e: any) => {
					if (latest.current.readOnly || !e?.latLng) return;
					pick({ lat: e.latLng.lat(), lng: e.latLng.lng() });
				});
				drawPoint(asPoint(latest.current.bound));
			})
			.catch(() => !cancelled && setFailed(true));
		return () => {
			cancelled = true;
			const old = live.current.map;
			const c = old?.getCenter?.();
			const z = old?.getZoom?.();
			view.current =
				c && typeof z === 'number'
					? { center: { lat: c.lat(), lng: c.lng() }, zoom: z }
					: undefined;
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

	// CXZ-1830: move the map to the point and zoom in to street level (never out)
	function follow(map: any, p: Point) {
		live.current.fit = undefined;
		if (typeof map.panTo === 'function') map.panTo(p);
		else map.setCenter(p);
		if ((map.getZoom?.() ?? 0) < FOLLOW_ZOOM) map.setZoom(FOLLOW_ZOOM);
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
			if (latest.current.followPoint) follow(map, p);
			else if (!live.current.keepView) {
				map.setCenter(p);
				if (map.getZoom() < PIN_ZOOM - 4) map.setZoom(PIN_ZOOM - 2);
			}
		} else {
			live.current.marker.setPosition(p);
			// CXZ-1830: with Follow the point, every new point is brought into view, not only the first one
			if (latest.current.followPoint) follow(map, p);
		}
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
	// ADZ-1503: a change inside a place list (a radius edited on its own) re-renders the map, so it redraws
	const [, setPlaceTick] = useState(0);
	const placeWatch = placePaths(
		definition.properties?.places,
		definition.properties?.excludedPlaces,
		definition.properties?.suggestedPlaces,
	).join('|');
	useEffect(() => {
		if (!placeWatch) return;
		return addListenerWithChildrenActivity(
			pageExtractor.getPageName(),
			() => setPlaceTick(t => t + 1),
			...placeWatch.split('|'),
		);
	}, [placeWatch]);
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
			live.current.keepView = false;
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
		// ADZ-1435 (Area frames): the place ids whose boundary the map has drawn, and the frames standing in for one
		const styled = new Set<string>();
		const frames = new Map<string, any>();
		const styleLayers = () => {
			if (!outlined.size) return;
			live.current.layers = layers;
			layers.forEach(layer => {
				layer.style = (opts: any) => {
					const id = opts?.feature?.placeId;
					const pl = outlined.get(id);
					if (pl && id) {
						styled.add(id);
						// the boundary drew after all: its stand-in frame goes (not inside the style call)
						const fr = frames.get(id);
						if (fr) {
							frames.delete(id);
							setTimeout(() => fr.setMap(null), 0);
						}
					}
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
			// ADZ-1435: Keep labels apart lays this drawing's tags out together
			const board: TagBoard | undefined = tagSpacing ? { items: [], queued: false } : undefined;
			// ADZ-1435: Area frames: places left to a boundary layer, framed if it draws nothing for them
			const pending: Array<{ pl: Place; id: string; bounds?: any }> = [];
			found.forEach((spot, i) => {
				const pl = list[i];
				if (!spot) {
					// a place id outlined with no lookup: its frame, if it needs one, is looked up then
					if (areaFrames && pl?.placeId && outlined.has(pl.placeId) && !(placeKm(pl) > 0))
						pending.push({ pl, id: pl.placeId });
					return;
				}
				const look = { map, clickable, ...placeLook(pl, colors) };
				const km = placeKm(pl);
				// CXZ-1650: with Point markers on, a place given by lat / lng with no radius is a marker (a fixed
				// size on the screen at every zoom), a circle or square in its colour, its label inside
				if (pointMarkers && asPoint(pl) && !(km > 0)) {
					const labelled =
						pl.label !== undefined && pl.label !== null && String(pl.label) !== '';
					const marker = new google.maps.Marker({
						map,
						clickable,
						position: spot.center,
						title: pl.name ? String(pl.name) : undefined,
						icon: markerIcon(google, pl, colors),
						label: labelled
							? {
									text: String(pl.label),
									color: '#ffffff',
									fontSize: '11px',
									fontWeight: '600',
								}
							: undefined,
					});
					if (clickable) marker.addListener?.('click', () => clickPlace(pl));
					live.current.shapes!.push(marker);
					// a marker alone would fit the map to street level: keep a little around it in view
					const d = 0.01;
					const c = spot.center;
					all.union({
						south: c.lat - d,
						west: c.lng - d,
						north: c.lat + d,
						east: c.lng + d,
					});
					any = true;
					return;
				}
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
				const { shape, box } = shapeOf(google, look, pl, spot, fit, km, layered, !!areaDots);
				if (clickable) shape.addListener?.('click', () => clickPlace(pl));
				live.current.shapes!.push(shape);
				if (areaFrames && !(km > 0) && !asPoint(pl) && fit !== 'point') {
					const id = layered ? (fit === 'outline' ? spot.placeId : pl.placeId) : undefined;
					if (id) pending.push({ pl, id, bounds: spot.bounds });
					else if (areaDots && spot.bounds) {
						// ADZ-1435: an area with no outline on this map: its dot sits on a light frame of its area
						const fr = new google.maps.Rectangle({
							map,
							clickable,
							...frameLook(pl, colors),
							bounds: spot.bounds,
						});
						if (clickable) fr.addListener?.('click', () => clickPlace(pl));
						live.current.shapes!.push(fr);
					}
				}
				if (placeLabels && !pl.suggested) {
					const tag = placeTag(
						google,
						map,
						spot.center,
						labelOf(pl),
						!!pl.excluded,
						board,
						boxSize(box ?? spot.bounds),
					);
					if (tag) live.current.shapes!.push(tag);
				}
				if (box) all.union(box);
				else all.extend(spot.center);
				any = true;
			});
			if (moreOutlines) styleLayers();
			// ADZ-1435: a boundary that has not drawn once the map settled (no WebGL, or none at Google for that
			// place) gets the light frame of the place's area instead; it goes if the boundary draws later
			if (pending.length) {
				let tries = 0;
				const check = () => {
					if (stale || live.current.map !== map) return;
					if (!live.current.idled && tries++ < 4) {
						setTimeout(check, FRAME_WAIT_MS);
						return;
					}
					pending.forEach(({ pl, id, bounds }) => {
						if (styled.has(id) || frames.has(id)) return;
						(bounds
							? Promise.resolve(bounds)
							: pl.name
								? findPlace(google, String(pl.name)).then(s => s?.bounds)
								: Promise.resolve(undefined)
						).then(b => {
							if (!b || stale || live.current.map !== map) return;
							if (styled.has(id) || frames.has(id)) return;
							const fr = new google.maps.Rectangle({
								map,
								clickable,
								...frameLook(pl, colors),
								bounds: b,
							});
							if (clickable) fr.addListener?.('click', () => clickPlace(pl));
							live.current.shapes!.push(fr);
							frames.set(id, fr);
						});
					});
				};
				setTimeout(check, FRAME_WAIT_MS);
			}
			// ADZ-1435: the first draw on a map made for a new look keeps the view the old map had
			const keep = live.current.keepView;
			live.current.keepView = false;
			if (!any || keep) return;
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
		mapGen,
		placesKey,
		placeColor,
		excludedColor,
		suggestedColor,
		mapId,
		clickable,
		matchPlaceType,
		placeLabels,
		pointMarkers,
		areaDots,
		areaFrames,
		tagSpacing,
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
