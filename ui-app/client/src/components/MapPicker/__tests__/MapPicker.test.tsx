/**
 * MapPicker (ADZ-1089): without a Google Maps key it renders only the "no map" text; with one it
 * loads the Maps script, and a map click writes {lat, lng} to the binding path (other keys kept)
 * and runs On Change. STUBBED: the store, runEvent, styles, the helper overlay and google.maps.
 */
import React from 'react';
import { createRoot, Root } from 'react-dom/client';
import { act } from 'react-dom/test-utils';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

const runEventMock = jest.fn().mockResolvedValue(undefined);
jest.mock('../../util/runEvent', () => ({ runEvent: (...a: any[]) => runEventMock(...a) }));

const storeValues = new Map<string, any>();
const pathListeners = new Map<string, (path: string, v: any) => void>();
const childWatches: Array<{ cb: () => void; paths: string[] }> = [];
jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'p' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListenerAndCallImmediately: (
		_p: string,
		cb: (path: string, v: any) => void,
		path: string,
	) => {
		pathListeners.set(path, cb); // CXZ-1830: a test can change a bound value later
		cb(path, storeValues.get(path));
		return () => {};
	},
	// ADZ-1503: the map's watch on its place lists (children included)
	addListenerWithChildrenActivity: (_p: string, cb: () => void, ...paths: string[]) => {
		childWatches.push({ cb, paths });
		return () => {};
	},
	getPathFromLocation: (bp: any) => bp?.value ?? bp,
	setData: (path: string, value: any) => storeValues.set(path, value),
}));
jest.mock('../../../util/styleProcessor', () => ({
	processComponentStylePseudoClasses: () => ({}),
}));
jest.mock('../../HelperComponents/HelperComponent', () => ({ HelperComponent: () => null }));

let properties: Record<string, any> = {};
jest.mock('../../util/useDefinition', () => ({
	__esModule: true,
	default: () => ({ properties, stylePropertiesWithPseudoStates: {} }),
}));

let clickHandler: ((e: any) => void) | undefined;
const drawn: Array<{ kind: string; opts: any; click?: () => void }> = [];
let fitted = 0;
// ADZ-1217: boundary layers the map id switches on (none unless a test sets them)
let layers: any[] = [];
// ADZ-1257: what the Geocoder answers per address (null: nothing found; absent: a place with bounds, no types)
let GEOCODED: Record<string, any> = {};
const views: any[] = [];
// ADZ-1407: the options the map was made with, and the name tags shown on it
let mapOpts: any;
const tags: Array<{ text: string; cls: string; map: any }> = [];
jest.mock('../../../util/googleMapsLoader', () => ({
	loadGoogleMaps: () =>
		Promise.resolve({
			maps: {
				Map: function (_el: any, opts: any) {
					mapOpts = opts;
					return {
						addListener: (name: string, fn: any) => {
							if (name === 'click') clickHandler = fn;
							if (name === 'idle') setTimeout(fn, 0); // the map settles once
						},
						setCenter: (c: any) => views.push({ center: c }),
						// ADZ-1435: where the user left the map (read when a new look replaces it)
						getCenter: () => ({ lat: () => 12.31, lng: () => 76.64 }),
						getZoom: () => 5,
						setZoom: (z: number) => views.push({ zoom: z }),
						fitBounds: () => fitted++,
						getFeatureLayer: (t: string) => layers.find(l => l.type === t),
					};
				},
				FeatureType: { LOCALITY: 'LOCALITY', POSTAL_CODE: 'POSTAL_CODE' },
				LatLngBounds: function () {
					return { union: () => {}, extend: () => {} };
				},
				Rectangle: function (opts: any) {
					const d: any = { kind: 'rect', opts };
					drawn.push(d);
					return {
						setMap: () => {},
						getBounds: () => opts.bounds,
						addListener: (_n: string, fn: any) => (d.click = fn),
					};
				},
				Geocoder: function () {
					return {
						geocode: (req: any, cb: any) => {
							const r = GEOCODED[req.address];
							if (r === null || req.address === 'Nowhere')
								return cb([], 'ZERO_RESULTS');
							cb(
								[
									r ?? {
										geometry: {
											location: {
												lat: () => 12.97,
												lng: () => 77.59,
											},
											bounds: {
												south: 12.8,
												west: 77.4,
												north: 13.1,
												east: 77.8,
											},
										},
									},
								],
								'OK',
							);
						},
					};
				},
				LatLng: function (lat: number, lng: number) {
					return { lat, lng };
				},
				OverlayView: function (this: any) {
					this.setMap = (m: any) => {
						if (!m) return;
						const div = document.createElement('div');
						this.getPanes = () => ({ floatPane: div });
						this.onAdd();
						const el = div.firstChild as HTMLElement;
						tags.push({ text: el.textContent ?? '', cls: el.className, map: m });
					};
				},
				Marker: function (opts: any) {
					const d: any = { kind: 'marker', opts };
					drawn.push(d);
					return {
						addListener: (n: string, fn: any) => n === 'click' && (d.click = fn),
						setPosition: () => {},
						setMap: () => {},
					};
				},
				SymbolPath: { CIRCLE: 0 },
				Circle: function (opts: any) {
					const d: any = { kind: 'circle', opts };
					drawn.push(d);
					return {
						setCenter: () => {},
						setRadius: () => {},
						setMap: () => {},
						getBounds: () => ({}),
						addListener: (_n: string, fn: any) => (d.click = fn),
					};
				},
			},
		}),
}));

import MapPicker, {
	boxSize,
	DARK_GREY_STYLE,
	FRAME_WAIT_MS,
	frameLook,
	GREY_STYLE,
	labelOf,
	layoutTags,
	spreadTags,
	TagBoard,
	lookOptions,
	markerIcon,
	placeFit,
	placePaths,
} from '../LazyMapPicker';

const definition = {
	key: 'mp',
	name: 'mp',
	type: 'MapPicker',
	bindingPath: { value: 'Page.pin' },
	bindingPath2: { value: 'Page.clicked' },
} as any;
const pageDefinition = {
	eventFunctions: { picked: { name: 'picked' }, placeClicked: { name: 'placeClicked' } },
} as any;

let root: Root;
let host: HTMLDivElement;
beforeEach(() => {
	host = document.createElement('div');
	document.body.appendChild(host);
	root = createRoot(host);
	storeValues.clear();
	pathListeners.clear();
	runEventMock.mockClear();
	clickHandler = undefined;
	drawn.length = 0;
	fitted = 0;
	layers = [];
	GEOCODED = {};
	views.length = 0;
	mapOpts = undefined;
	tags.length = 0;
	childWatches.length = 0;
	delete definition.properties;
});
afterEach(() => act(() => root.unmount()));

function render() {
	const Comp = MapPicker as any;
	act(() =>
		root.render(
			<Comp
				definition={definition}
				pageDefinition={pageDefinition}
				locationHistory={[]}
				context={{ pageName: 'p' }}
			/>,
		),
	);
}

test('without a key it shows only the no map text', () => {
	properties = { noMapText: 'No map here.' };
	render();
	expect(host.textContent).toBe('No map here.');
	expect(host.querySelector('._map')).toBeNull();
});

test('a map click writes lat and lng, keeps the other keys and runs On Change', async () => {
	properties = { apiKey: 'k', onChange: 'picked' };
	storeValues.set('Page.pin', { radius: 5 });
	render();
	await act(async () => {
		await Promise.resolve();
	});
	expect(clickHandler).toBeDefined();
	act(() => clickHandler!({ latLng: { lat: () => 12.9698123456, lng: () => 77.75 } }));
	expect(storeValues.get('Page.pin')).toEqual({ radius: 5, lat: 12.969812, lng: 77.75 });
	expect(runEventMock).toHaveBeenCalledTimes(1);
});

test('places: a radius is a circle, a name alone is outlined, excluded ones use their colour', async () => {
	// a shown map has a size (jsdom lays nothing out); a hidden one waits for it before fitting
	jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
	jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
	properties = {
		apiKey: 'k',
		places: [
			{ name: 'Bangalore, Karnataka, India', radiusKm: 20 },
			{ name: 'Karnataka, India' },
			{ name: 'Pin', lat: 12.5, lng: 77.1, radius: 5, distanceUnit: 'MILE' },
			{ name: 'Nowhere' },
		],
		excludedPlaces: [{ name: 'Whitefield' }],
		excludedColor: '#ff0000',
	};
	render();
	await act(async () => {
		await new Promise(r => setTimeout(r, 0));
	});
	const circles = drawn.filter(d => d.kind === 'circle');
	const rects = drawn.filter(d => d.kind === 'rect');
	expect(circles.map(c => Math.round(c.opts.radius))).toEqual([20000, 8047]);
	expect(circles[1].opts.center).toEqual({ lat: 12.5, lng: 77.1 });
	expect(rects).toHaveLength(2);
	expect(rects[1].opts.strokeColor).toBe('#ff0000');
	expect(rects[0].opts.strokeColor).toBe('#1a1a1a');
	expect(fitted).toBe(1);
	jest.restoreAllMocks();
});

test('no places draws nothing and keeps the pin behaviour', async () => {
	properties = { apiKey: 'k' };
	render();
	await act(async () => {
		await new Promise(r => setTimeout(r, 0));
	});
	expect(drawn).toHaveLength(0);
	expect(fitted).toBe(0);
});

test('ADZ-1217: suggested places are lighter, and a click writes the place and runs On Place Click', async () => {
	jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
	jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
	properties = {
		apiKey: 'k',
		places: [{ name: 'Whitefield', lat: 12.97, lng: 77.75 }],
		suggestedPlaces: [{ name: 'Hoodi', lat: 12.99, lng: 77.71 }],
		suggestedColor: '#999999',
		onPlaceClick: 'placeClicked',
	};
	render();
	await act(async () => {
		await new Promise(r => setTimeout(r, 0));
	});
	const [chosen, offered] = drawn;
	expect(chosen.opts.strokeColor).toBe('#1a1a1a');
	expect(offered.opts.strokeColor).toBe('#999999');
	expect(offered.opts.fillOpacity).toBeLessThan(chosen.opts.fillOpacity);
	expect(offered.opts.clickable).toBe(true);
	act(() => offered.click!());
	expect(storeValues.get('Page.clicked')).toEqual({
		name: 'Hoodi',
		lat: 12.99,
		lng: 77.71,
		suggested: true,
	});
	expect(runEventMock).toHaveBeenCalledTimes(1);
	expect(runEventMock.mock.calls[0][1]).toBe('mp');
	jest.restoreAllMocks();
});

test('ADZ-1217: with a map id, a place id is outlined by the boundary layer with no lookup', async () => {
	jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
	jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
	const layer: any = {
		type: 'POSTAL_CODE',
		isAvailable: true,
		style: null,
		addListener: () => ({}),
	};
	layers = [layer, { type: 'LOCALITY', isAvailable: false }];
	properties = {
		apiKey: 'k',
		mapId: 'map-1',
		places: [{ name: '560066', placeId: 'ChIJa', lat: 12.97, lng: 77.75 }],
		suggestedPlaces: [{ name: 'Nowhere', placeId: 'ChIJb' }],
	};
	render();
	await act(async () => {
		await new Promise(r => setTimeout(r, 0));
	});
	expect(layer.style({ feature: { placeId: 'ChIJa' } }).fillOpacity).toBe(0.18);
	expect(layer.style({ feature: { placeId: 'ChIJb' } }).strokeColor).toBe('#6b7280');
	expect(layer.style({ feature: { placeId: 'ChIJz' } })).toBeNull();
	// the outlined place gets a small dot (no viewport box); the one without a point is not looked up at all
	expect(drawn).toHaveLength(1);
	expect(drawn[0].opts.radius).toBe(120);
	jest.restoreAllMocks();
});

// ADZ-1257: a Geocoding result as the Maps JS API gives it (bounds only when the place has its own)
function geo(
	types: string[],
	at: [number, number],
	opts: { bounds?: boolean; partial?: boolean; id?: string } = {},
) {
	const [lat, lng] = at;
	const box = { south: lat - 0.1, west: lng - 0.1, north: lat + 0.1, east: lng + 0.1 };
	return {
		types,
		place_id: opts.id,
		partial_match: opts.partial,
		geometry: {
			location: { lat: () => lat, lng: () => lng },
			viewport: box,
			...(opts.bounds === false ? {} : { bounds: box }),
		},
	};
}

describe('ADZ-1257: Match Place Type', () => {
	beforeEach(() => {
		jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
		jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
		GEOCODED = {
			'Bengaluru,Karnataka,India': geo(['locality', 'political'], [12.97, 77.59], {
				id: 'ChIJcity',
			}),
			'Karnataka,India': geo(['administrative_area_level_1', 'political'], [15.3, 75.7]),
			// an unknown postal code: the Geocoder falls back to its state
			'515671,Andhra Pradesh,India': geo(
				['administrative_area_level_1', 'political'],
				[15.9, 79.7],
				{
					partial: true,
				},
			),
			'560038,Karnataka,India': geo(['postal_code'], [12.97, 77.64]),
			'Indiranagar,Karnataka,India': geo(
				['political', 'sublocality', 'sublocality_level_1'],
				[12.97, 77.64],
				{
					bounds: false,
				},
			),
			'Baglan,Maharashtra,India': geo(['locality', 'political'], [20.8, 74.1]),
			'Somewhere,India': geo(['establishment'], [20, 78]),
			'Gone,India': null,
		};
	});
	afterEach(() => jest.restoreAllMocks());

	test('placeFit: the right kind is an area, a point or an outline; another kind is not drawn', () => {
		const spot = (g: any) => ({
			center: { lat: 1, lng: 2 },
			bounds: g.geometry.bounds,
			types: g.types,
			exact: !!g.geometry.bounds,
			partial: !!g.partial_match,
			placeId: g.place_id,
		});
		const S = (k: string) => spot(GEOCODED[k]);
		expect(placeFit({ type: 'CITY' }, S('Bengaluru,Karnataka,India'))).toBe('area');
		expect(placeFit({ type: 'CITY' }, S('Bengaluru,Karnataka,India'), true)).toBe('outline');
		expect(placeFit({ type: 'city' }, S('Bengaluru,Karnataka,India'))).toBe('area'); // Meta's lower case
		expect(placeFit({ type: 'STATE' }, S('Karnataka,India'))).toBe('area');
		expect(placeFit({ type: 'POSTAL_CODE' }, S('515671,Andhra Pradesh,India'))).toBeUndefined();
		expect(placeFit({ type: 'Postal Code' }, S('560038,Karnataka,India'))).toBe('area');
		expect(placeFit({ type: 'NEIGHBORHOOD' }, S('Indiranagar,Karnataka,India'))).toBe('point');
		expect(placeFit({ type: 'Sub-District' }, S('Baglan,Maharashtra,India'))).toBe('point');
		expect(placeFit({ type: 'CITY' }, S('Karnataka,India'))).toBeUndefined();
		expect(placeFit({ type: 'GEO_MARKET' }, S('Somewhere,India'))).toBe('point');
		expect(placeFit({ type: 'GEO_MARKET' }, S('515671,Andhra Pradesh,India'))).toBeUndefined();
		expect(placeFit({ type: 'CITY' }, undefined)).toBeUndefined();
	});

	test('the map draws each place as what it is and leaves a wrong match off', async () => {
		properties = {
			apiKey: 'k',
			matchPlaceType: true,
			places: [
				{ name: 'Bengaluru,Karnataka,India', type: 'CITY', platformId: '1007768' },
				{ name: '515671,Andhra Pradesh,India', type: 'POSTAL_CODE' },
				{ name: 'Indiranagar,Karnataka,India', type: 'NEIGHBORHOOD' },
				{ name: 'Gone,India', type: 'CITY' },
				{ name: 'Pin', type: 'CUSTOM_LOCATION', lat: 12.5, lng: 77.1, radius: 2 },
			],
		};
		render();
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(drawn.map(d => d.kind)).toEqual(['rect', 'marker', 'circle']);
		expect(drawn[0].opts.bounds).toEqual(GEOCODED['Bengaluru,Karnataka,India'].geometry.bounds);
		expect(drawn[1].opts.position).toEqual({ lat: 12.97, lng: 77.64 });
		expect(drawn[1].opts.title).toBe('Indiranagar,Karnataka,India');
		expect(Math.round(drawn[2].opts.radius)).toBe(2000);
		expect(fitted).toBe(1);
	});

	test('without Match Place Type the old drawing is kept (a wrong match is boxed as before)', async () => {
		properties = {
			apiKey: 'k',
			places: [{ name: '515671,Andhra Pradesh,India', type: 'POSTAL_CODE' }],
		};
		render();
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(drawn.map(d => d.kind)).toEqual(['rect']);
	});

	test('ADZ-1655: with Area dots an area with no outline is a small dot, the map still fits it', async () => {
		properties = {
			apiKey: 'k',
			matchPlaceType: true,
			areaDots: true,
			places: [
				{ name: 'Bengaluru,Karnataka,India', type: 'CITY', platformId: '1007768' },
				{ name: 'Indiranagar,Karnataka,India', type: 'NEIGHBORHOOD' },
				{ name: 'Pin', type: 'CUSTOM_LOCATION', lat: 12.5, lng: 77.1, radius: 2 },
			],
		};
		render();
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(drawn.map(d => d.kind)).toEqual(['circle', 'marker', 'circle']);
		expect(drawn[0].opts.radius).toBe(120);
		expect(drawn[0].opts.center).toBeDefined();
		expect(Math.round(drawn[2].opts.radius)).toBe(2000);
		expect(fitted).toBe(1);
	});

	test('with a map id, a matched city is outlined by its boundary layer through the found place id', async () => {
		const layer: any = {
			type: 'LOCALITY',
			isAvailable: true,
			style: null,
			addListener: () => ({}),
		};
		layers = [layer];
		properties = {
			apiKey: 'k',
			mapId: 'map-1',
			matchPlaceType: true,
			places: [{ name: 'Bengaluru,Karnataka,India', type: 'CITY' }],
		};
		render();
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(layer.style({ feature: { placeId: 'ChIJcity' } }).fillOpacity).toBe(0.18);
		expect(layer.style({ feature: { placeId: 'ChIJother' } })).toBeNull();
		expect(drawn).toHaveLength(1);
		expect(drawn[0].opts.radius).toBe(120);
	});

	test('when the last place is removed the map goes back to its start view', async () => {
		properties = {
			apiKey: 'k',
			matchPlaceType: true,
			centerLat: 20.5,
			centerLng: 78.9,
			zoom: 4,
			places: [{ name: 'Bengaluru,Karnataka,India', type: 'CITY' }],
		};
		render();
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(drawn).toHaveLength(1);
		views.length = 0;
		properties = { ...properties, places: [] };
		render();
		await act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
		expect(views).toEqual([{ center: { lat: 20.5, lng: 78.9 } }, { zoom: 4 }]);
	});
});

describe('ADZ-1407: the Grey look and the place tags', () => {
	const settle = () =>
		act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});

	test('Grey styles the map only without a map id', async () => {
		properties = { apiKey: 'k', mapLook: 'GREY' };
		render();
		await settle();
		expect(mapOpts.styles).toBe(GREY_STYLE);
		expect(mapOpts.backgroundColor).toBe('#eeeeee');
		act(() => root.unmount());
		root = createRoot(host);
		properties = { apiKey: 'k', mapLook: 'GREY', mapId: 'm1' };
		render();
		await settle();
		expect(mapOpts.mapId).toBe('m1');
		expect(mapOpts.styles).toBeUndefined();
	});

	test('Standard keeps Google’s look', async () => {
		properties = { apiKey: 'k' };
		render();
		await settle();
		expect(mapOpts.styles).toBeUndefined();
	});

	test('chosen and excluded places get a tag, suggested ones and a map without Place labels none', async () => {
		properties = {
			apiKey: 'k',
			placeLabels: true,
			places: [
				{ name: 'Bangalore, Karnataka, India', type: 'city' },
				{
					name: 'Pin 12.97, 77.75',
					type: 'CUSTOM_LOCATION',
					lat: 12.97,
					lng: 77.75,
					radius: 5,
				},
			],
			excludedPlaces: [{ name: 'Mahadevapura, Bangalore', type: 'neighborhood' }],
			suggestedPlaces: [{ name: 'Hosur, Tamil Nadu' }],
		};
		render();
		await settle();
		expect(tags.map(t => [t.text, t.cls])).toEqual([
			['Bangalore', '_placeLabel'],
			['Pin', '_placeLabel'],
			['Mahadevapura', '_placeLabel _excluded'],
		]);
		tags.length = 0;
		properties = { ...properties, placeLabels: false };
		render();
		await settle();
		expect(tags).toHaveLength(0);
	});

	test('ADZ-1435: Dark grey styles the map dark without a map id and asks a map id for its dark scheme', async () => {
		properties = { apiKey: 'k', mapLook: 'GREY_DARK' };
		render();
		await settle();
		expect(mapOpts.styles).toBe(DARK_GREY_STYLE);
		expect(mapOpts.backgroundColor).toBe('#2b2b2b');
		expect(mapOpts.colorScheme).toBeUndefined();
		expect(host.querySelector('.compMapPicker._dark')).not.toBeNull();
		act(() => root.unmount());
		root = createRoot(host);
		properties = { apiKey: 'k', mapLook: 'GREY_DARK', mapId: 'm1' };
		render();
		await settle();
		expect(mapOpts.mapId).toBe('m1');
		expect(mapOpts.styles).toBeUndefined();
		expect(mapOpts.colorScheme).toBe('DARK');
	});

	test('ADZ-1435: lookOptions keeps Standard and Grey as they were', () => {
		expect(lookOptions(undefined, undefined)).toEqual({});
		expect(lookOptions('STANDARD', undefined)).toEqual({});
		expect(lookOptions('GREY', undefined)).toEqual({
			styles: GREY_STYLE,
			backgroundColor: '#eeeeee',
		});
		expect(lookOptions('GREY', 'm1')).toEqual({});
		expect(lookOptions('STANDARD', 'm1')).toEqual({});
	});

	test('a map without Dark grey has no dark class', async () => {
		properties = { apiKey: 'k', mapLook: 'GREY' };
		render();
		await settle();
		expect(host.querySelector('.compMapPicker')).not.toBeNull();
		expect(host.querySelector('.compMapPicker._dark')).toBeNull();
	});

	test('labelOf: up to the first comma, Pin for a dropped pin', () => {
		expect(labelOf({ name: 'Karnataka, India', type: 'region' })).toBe('Karnataka');
		expect(labelOf({ name: 'Pin 1, 2', type: 'CUSTOM_LOCATION' })).toBe('Pin');
		expect(labelOf({})).toBe('');
	});
});

describe('ADZ-1503: a radius changed inside the place list redraws the map', () => {
	const settle = () =>
		act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});

	test('placePaths: the store paths of the place properties, none for a value', () => {
		expect(
			placePaths(
				{ location: { type: 'EXPRESSION', expression: 'Page.w.locations' } },
				{ location: { type: 'EXPRESSION', expression: 'Page.a.b ? Page.a.b : Page.tmp0' } },
				{ value: [{ name: 'x' }] },
				undefined,
			),
		).toEqual(['Page.w.locations', 'Page.a.b', 'Page.tmp0']);
		expect(placePaths({ location: { expression: 'Parent.places' } })).toEqual([]);
	});

	test('an edit inside the bound list (no new list) draws the new circle', async () => {
		definition.properties = {
			places: { location: { type: 'EXPRESSION', expression: 'Page.w.locations' } },
		};
		const list: any[] = [{ name: 'Mysuru, Karnataka, India', type: 'city' }];
		properties = { apiKey: 'k', places: list };
		render();
		await settle();
		expect(drawn.filter(d => d.kind === 'circle')).toHaveLength(0);
		expect(childWatches.map(w => w.paths)).toEqual([['Page.w.locations']]);
		// the store writes the radius into the same place object, so the resolved props look unchanged
		list[0].radius = 20;
		act(() => childWatches[0].cb());
		await settle();
		const circles = drawn.filter(d => d.kind === 'circle');
		expect(circles.map(c => Math.round(c.opts.radius))).toEqual([20000]);
	});

	test('a map without place bindings watches nothing', async () => {
		properties = { apiKey: 'k', places: [{ name: 'Mysuru' }] };
		render();
		await settle();
		expect(childWatches).toHaveLength(0);
	});
});

describe('ADZ-1435: a theme switch (new map look) keeps the places and the view', () => {
	const settle = () =>
		act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
	const circles = () => drawn.filter(d => d.kind === 'circle');
	const rects = () => drawn.filter(d => d.kind === 'rect');
	beforeEach(() => {
		jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
		jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
	});
	afterEach(() => jest.restoreAllMocks());

	test('Light to Dark and back: the places are drawn on each new map, which opens where the old one was', async () => {
		properties = {
			apiKey: 'k',
			mapLook: 'GREY',
			matchPlaceType: true,
			places: [
				{ name: 'Mysuru, Karnataka, India', type: 'city', radius: 60 },
				{ name: 'Whitefield, Bangalore, Karnataka, India', type: 'neighborhood' },
			],
		};
		GEOCODED['Whitefield, Bangalore, Karnataka, India'] = {
			types: ['political', 'sublocality', 'sublocality_level_1'],
			geometry: {
				location: { lat: () => 12.97, lng: () => 77.75 },
				bounds: { south: 12.94, west: 77.71, north: 13.0, east: 77.78 },
			},
		};
		render();
		await settle();
		expect(circles()).toHaveLength(1);
		expect(rects()).toHaveLength(1);
		expect(fitted).toBe(1);
		expect(mapOpts.styles).toBe(GREY_STYLE);

		for (const look of ['GREY_DARK', 'GREY']) {
			drawn.length = 0;
			fitted = 0;
			views.length = 0;
			properties = { ...properties, mapLook: look };
			render();
			await settle();
			expect(mapOpts.styles).toBe(look === 'GREY' ? GREY_STYLE : DARK_GREY_STYLE);
			// the places again, on the new map
			expect(circles()).toHaveLength(1);
			expect(rects()).toHaveLength(1);
			expect(circles()[0].opts.map).toBeDefined();
			// the old map's view, not the start view (India) and no new fit
			expect(mapOpts.center).toEqual({ lat: 12.31, lng: 76.64 });
			expect(mapOpts.zoom).toBe(5);
			expect(fitted).toBe(0);
			expect(views).toEqual([]);
		}
	});

	test('a place added after the switch is fitted as before', async () => {
		properties = { apiKey: 'k', mapLook: 'GREY', places: [] };
		render();
		await settle();
		properties = { ...properties, mapLook: 'GREY_DARK' };
		render();
		await settle();
		fitted = 0;
		properties = { ...properties, places: [{ name: 'Mysuru, Karnataka, India', radius: 20 }] };
		render();
		await settle();
		expect(circles()).toHaveLength(1);
		expect(fitted).toBe(1);
	});

	test('a first map still opens on the start view', async () => {
		properties = {
			apiKey: 'k',
			mapLook: 'GREY',
			centerLat: 20.5937,
			centerLng: 78.9629,
			zoom: 5,
		};
		render();
		await settle();
		expect(mapOpts.center).toEqual({ lat: 20.5937, lng: 78.9629 });
		expect(mapOpts.zoom).toBe(5);
	});
});

describe('CXZ-1650: point markers', () => {
	const settle = () =>
		act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});

	test('off (the default): a lat / lng place is still a 1 km circle', async () => {
		properties = { apiKey: 'k', places: [{ name: 'Home', lat: 12.9, lng: 77.6 }] };
		render();
		await settle();
		expect(drawn.map(d => d.kind)).toEqual(['circle']);
		expect(drawn[0].opts.radius).toBe(1000);
	});

	test('on: lat / lng places are markers (circle or square, label inside), a click writes the place', async () => {
		jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
		jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
		properties = {
			apiKey: 'k',
			pointMarkers: true,
			readOnly: true,
			onPlaceClick: 'placeClicked',
			places: [
				{ name: 'Home', lat: 12.9, lng: 77.6, id: 'a' },
				{ name: 'Office', lat: 12.95, lng: 77.7, shape: 'SQUARE', label: 2 },
				{ name: 'Area', lat: 12.5, lng: 77.1, radiusKm: 3 },
			],
		};
		render();
		await settle();
		expect(drawn.map(d => d.kind)).toEqual(['marker', 'marker', 'circle']);
		const [home, office] = drawn;
		expect(home.opts.position).toEqual({ lat: 12.9, lng: 77.6 });
		expect(home.opts.icon.path).toBe(0);
		expect(home.opts.label).toBeUndefined();
		expect(office.opts.icon.path).toContain('M -1 -1');
		expect(office.opts.label.text).toBe('2');
		expect(fitted).toBe(1);
		act(() => home.click!());
		expect(storeValues.get('Page.clicked')).toEqual({
			name: 'Home',
			lat: 12.9,
			lng: 77.6,
			id: 'a',
		});
		expect(runEventMock).toHaveBeenCalledTimes(1);
		jest.restoreAllMocks();
	});

	test('markerIcon: the place colour fills it, a label makes it larger', () => {
		const g = { maps: { SymbolPath: { CIRCLE: 0 } } };
		const plain = markerIcon(g, { name: 'x' }, { place: '#123456' });
		const labelled = markerIcon(g, { name: 'x', label: 'A', shape: 'square' }, {});
		expect(plain.fillColor).toBe('#123456');
		expect(plain.scale).toBe(8);
		expect(labelled.fillColor).toBe('#1a1a1a');
		expect(labelled.scale).toBe(10);
	});
});

describe('CXZ-1830: Follow the point', () => {
	async function settle() {
		await act(async () => {
			await Promise.resolve();
			await new Promise(r => setTimeout(r, 0));
		});
	}
	function movePin(v: any) {
		storeValues.set('Page.pin', v);
		act(() => pathListeners.get('Page.pin')!('Page.pin', v));
	}

	test('with Follow the point a new point moves the map there and zooms in', async () => {
		properties = { apiKey: 'k', readOnly: true, followPoint: true };
		storeValues.set('Page.pin', { lat: 12.9, lng: 77.6 });
		render();
		await settle();
		views.length = 0;
		movePin({ lat: 17.4, lng: 78.4 });
		expect(views).toContainEqual({ center: { lat: 17.4, lng: 78.4 } });
		expect(views).toContainEqual({ zoom: 15 });
	});

	test('without it a moved point keeps the view (the old behaviour)', async () => {
		properties = { apiKey: 'k', readOnly: true };
		storeValues.set('Page.pin', { lat: 12.9, lng: 77.6 });
		render();
		await settle();
		views.length = 0;
		movePin({ lat: 17.4, lng: 78.4 });
		expect(views).toEqual([]);
	});
});

describe('ADZ-1435: labels kept apart', () => {
	test('spreadTags: apart tags stay at their centre', () => {
		expect(
			spreadTags([
				{ x: 0, y: 0, w: 80, h: 22 },
				{ x: 300, y: 0, w: 80, h: 22 },
			]),
		).toEqual([
			{ dx: 0, dy: 0, hidden: false },
			{ dx: 0, dy: 0, hidden: false },
		]);
	});

	test('spreadTags: a tag on top of another moves just below it, the first one keeps its centre', () => {
		const out = spreadTags([
			{ x: 100, y: 100, w: 80, h: 22 },
			{ x: 102, y: 101, w: 110, h: 22 },
		]);
		expect(out[0]).toEqual({ dx: 0, dy: 0, hidden: false });
		expect(out[1]).toEqual({ dx: 0, dy: 26, hidden: false });
	});

	test('spreadTags: side by side tags that touch (a city and its postcode) are moved apart', () => {
		// Bangalore at the city centre, 560066 some 30 px east: their boxes overlap
		const out = spreadTags([
			{ x: 100, y: 100, w: 80, h: 22 },
			{ x: 130, y: 99, w: 60, h: 22 },
		]);
		expect(out[1].hidden).toBe(false);
		const a = { l: 60, r: 140, t: 89, b: 111 };
		const bx = 130 + out[1].dx;
		const by = 99 + out[1].dy;
		const b = { l: bx - 30, r: bx + 30, t: by - 11, b: by + 11 };
		expect(a.l < b.r && b.l < a.r && a.t < b.b && b.t < a.b).toBe(false);
	});

	test('spreadTags: a tag with no free spot left is hidden (shows when zoomed in)', () => {
		const crowd = Array.from({ length: 12 }, () => ({ x: 0, y: 0, w: 60, h: 22 }));
		const out = spreadTags(crowd);
		const shown = out.filter(o => !o.hidden);
		expect(shown.length).toBeGreaterThan(5);
		expect(out[11]).toEqual({ dx: 0, dy: 0, hidden: true });
		// no two shown tags cover each other
		for (let i = 0; i < shown.length; i++)
			for (let j = i + 1; j < shown.length; j++)
				expect(
					Math.abs(shown[i].dx - shown[j].dx) >= 60 || Math.abs(shown[i].dy - shown[j].dy) >= 22,
				).toBe(true);
	});

	test('layoutTags: the larger place keeps the centre, the smaller one moves; hidden ones are not shown', () => {
		const div = (t: string) => {
			const d = document.createElement('div');
			d.textContent = t;
			return d;
		};
		const board: TagBoard = {
			items: [
				{ div: div('Chamundipuram'), x: 50, y: 50, rank: 0.00005, seq: 0 },
				{ div: div('Mysuru'), x: 51, y: 50, rank: 0.02, seq: 1 },
			],
			queued: true,
		};
		layoutTags(board);
		expect(board.queued).toBe(false);
		expect(board.items[1].div.style.transform).toBe('translate(calc(-50% + 0px), calc(-50% + 0px))');
		expect(board.items[0].div.style.transform).toBe('translate(calc(-50% + 0px), calc(-50% + 26px))');
		expect(board.items[0].div.style.visibility).toBe('');
	});

	test('boxSize: the size of a literal or a LatLngBounds box, 0 when there is none', () => {
		expect(boxSize({ south: 1, west: 1, north: 2, east: 3 })).toBe(2);
		expect(boxSize({ toJSON: () => ({ south: 0, west: 0, north: 1, east: 1 }) })).toBe(1);
		expect(boxSize(undefined)).toBe(0);
		expect(boxSize({})).toBe(0);
	});
});

describe('ADZ-1435: area frames', () => {
	beforeEach(() => {
		jest.spyOn(HTMLElement.prototype, 'offsetWidth', 'get').mockReturnValue(600);
		jest.spyOn(HTMLElement.prototype, 'offsetHeight', 'get').mockReturnValue(300);
		GEOCODED = {
			'Bangalore City, Karnataka, India': geo(['locality', 'political'], [12.96, 77.58], {
				id: 'ChIJcity',
			}),
			'Chamundipuram, Mysuru, Karnataka, India': geo(['neighborhood', 'political'], [12.29, 76.65]),
			'560066, Bangalore, Karnataka, India': geo(['postal_code'], [12.97, 77.75], {
				id: 'ChIJzip',
			}),
		};
	});
	afterEach(() => {
		jest.useRealTimers();
		jest.restoreAllMocks();
	});
	const settle = () =>
		act(async () => {
			await new Promise(r => setTimeout(r, 0));
		});
	const places = [
		{ name: 'Bangalore City, Karnataka, India', type: 'city' },
		{ name: 'Chamundipuram, Mysuru, Karnataka, India', type: 'neighborhood' },
		{ name: '560066, Bangalore, Karnataka, India', type: 'zip' },
	];

	test('frameLook: thinner and fainter than a place outline', () => {
		const f = frameLook({}, { place: '#111111' });
		expect(f.strokeColor).toBe('#111111');
		expect(f.strokeWeight).toBe(1);
		expect(f.fillOpacity).toBeLessThan(0.08);
		expect(frameLook({ excluded: true }, {}).strokeColor).toBe('#c0362c');
	});

	test('off (the default): Area dots alone draw only the dots, as before', async () => {
		properties = { apiKey: 'k', matchPlaceType: true, areaDots: true, places };
		render();
		await settle();
		expect(drawn.map(d => d.kind)).toEqual(['circle', 'circle', 'circle']);
	});

	test('without a map id (as without WebGL) each area gets its dot on a frame of its own area', async () => {
		properties = { apiKey: 'k', matchPlaceType: true, areaDots: true, areaFrames: true, places };
		render();
		await settle();
		expect(drawn.map(d => d.kind)).toEqual(['circle', 'rect', 'circle', 'rect', 'circle', 'rect']);
		const zip = drawn[5].opts;
		// the postcode is framed on its own area (Whitefield), not at the city centre
		expect(zip.bounds).toEqual(GEOCODED['560066, Bangalore, Karnataka, India'].geometry.bounds);
		expect(zip.strokeWeight).toBe(1);
		expect(drawn[4].opts.center).toEqual({ lat: 12.97, lng: 77.75 });
	});

	test('with a map id: a boundary that draws gets no frame, one that never draws is framed after the wait', async () => {
		jest.useFakeTimers();
		const layer: any = { type: 'LOCALITY', isAvailable: true, style: null, addListener: () => ({}) };
		const zipLayer: any = { type: 'POSTAL_CODE', isAvailable: true, style: null, addListener: () => ({}) };
		layers = [layer, zipLayer];
		properties = {
			apiKey: 'k',
			mapId: 'm1',
			matchPlaceType: true,
			areaDots: true,
			areaFrames: true,
			places,
		};
		const tick = (ms: number) =>
			act(async () => {
				jest.advanceTimersByTime(ms);
				for (let i = 0; i < 5; i++) await Promise.resolve();
			});
		render();
		await tick(0);
		await tick(0);
		// the city boundary draws (Google asks its style); the postcode one never does
		layer.style({ feature: { placeId: 'ChIJcity' } });
		const before = drawn.length;
		await tick(FRAME_WAIT_MS + 10);
		await tick(0);
		const added = drawn.slice(before);
		expect(added.map(d => d.kind)).toEqual(['rect']);
		expect(added[0].opts.bounds).toEqual(GEOCODED['560066, Bangalore, Karnataka, India'].geometry.bounds);
		// the neighbourhood (no boundary layer) has its frame from the start
		expect(drawn.slice(0, before).filter(d => d.kind === 'rect')).toHaveLength(1);
	});
});
