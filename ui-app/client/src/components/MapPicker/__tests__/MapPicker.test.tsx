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
const drawn: Array<{ kind: string; opts: any }> = [];
let fitted = 0;
jest.mock('../../../util/googleMapsLoader', () => ({
	loadGoogleMaps: () =>
		Promise.resolve({
			maps: {
				Map: function () {
					return {
						addListener: (name: string, fn: any) => {
							if (name === 'click') clickHandler = fn;
							if (name === 'idle') setTimeout(fn, 0); // the map settles once
						},
						setCenter: () => {},
						getZoom: () => 5,
						setZoom: () => {},
						fitBounds: () => fitted++,
					};
				},
				LatLngBounds: function () {
					return { union: () => {}, extend: () => {} };
				},
				Rectangle: function (opts: any) {
					drawn.push({ kind: 'rect', opts });
					return { setMap: () => {}, getBounds: () => opts.bounds };
				},
				Geocoder: function () {
					return {
						geocode: (req: any, cb: any) =>
							cb(
								req.address === 'Nowhere'
									? []
									: [
											{
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
								req.address === 'Nowhere' ? 'ZERO_RESULTS' : 'OK',
							),
					};
				},
				Marker: function () {
					return { addListener: () => {}, setPosition: () => {}, setMap: () => {} };
				},
				Circle: function (opts: any) {
					drawn.push({ kind: 'circle', opts });
					return {
						setCenter: () => {},
						setRadius: () => {},
						setMap: () => {},
						getBounds: () => ({}),
					};
				},
			},
		}),
}));

import MapPicker from '../LazyMapPicker';

const definition = {
	key: 'mp',
	name: 'mp',
	type: 'MapPicker',
	bindingPath: { value: 'Page.pin' },
} as any;
const pageDefinition = { eventFunctions: { picked: { name: 'picked' } } } as any;

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
