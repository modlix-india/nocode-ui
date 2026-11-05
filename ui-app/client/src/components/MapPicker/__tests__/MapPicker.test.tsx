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
jest.mock('../../../context/StoreContext', () => ({
	PageStoreExtractor: { getForContext: () => ({ getPageName: () => 'p' }) },
	UrlDetailsExtractor: { getForContext: () => ({}) },
	addListenerAndCallImmediately: (
		_p: string,
		cb: (path: string, v: any) => void,
		path: string,
	) => {
		cb(path, storeValues.get(path));
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
					drawn.push({ kind: 'marker', opts });
					return { addListener: () => {}, setPosition: () => {}, setMap: () => {} };
				},
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

import MapPicker, { GREY_STYLE, labelOf, placeFit } from '../LazyMapPicker';

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
	runEventMock.mockClear();
	clickHandler = undefined;
	drawn.length = 0;
	fitted = 0;
	layers = [];
	GEOCODED = {};
	views.length = 0;
	mapOpts = undefined;
	tags.length = 0;
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

	test('labelOf: up to the first comma, Pin for a dropped pin', () => {
		expect(labelOf({ name: 'Karnataka, India', type: 'region' })).toBe('Karnataka');
		expect(labelOf({ name: 'Pin 1, 2', type: 'CUSTOM_LOCATION' })).toBe('Pin');
		expect(labelOf({})).toBe('');
	});
});
