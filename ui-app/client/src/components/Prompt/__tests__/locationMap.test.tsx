/**
 * ADZ-2251: the chat's location map showed no place names, because it drew with its own style list that
 * turned the names off. It now never sends a style list: with a map id (the one the MapPicker maps use)
 * the map id's Google style draws it, without one it is plain Google styling. The snapshot after Confirm
 * carries the map id too.
 */

import React, { act } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { LocationMap, mapLookOptions, staticMapUrl } from '../components/LocationMap';

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

describe('ADZ-2251 LocationMap look', () => {
	let host: HTMLDivElement;
	let root: Root;
	let made: any[];

	beforeEach(() => {
		made = [];
		const fakeMarker = { addListener: jest.fn(), setPosition: jest.fn(), setMap: jest.fn() };
		(window as any).google = {
			maps: {
				Map: jest.fn().mockImplementation((_el: any, opts: any) => {
					made.push(opts);
					return { addListener: jest.fn(), getZoom: () => 15, panTo: jest.fn() };
				}),
				Marker: jest.fn().mockImplementation(() => fakeMarker),
				Geocoder: jest.fn(),
			},
		};
		host = document.createElement('div');
		document.body.appendChild(host);
		root = createRoot(host);
	});

	afterEach(() => {
		act(() => root.unmount());
		host.remove();
		delete (window as any).google;
	});

	async function draw(location: Record<string, any>) {
		await act(async () => {
			root.render(<LocationMap location={location} onConfirm={() => {}} />);
		});
		await act(async () => {
			await new Promise(r => setTimeout(r, 30));
		});
	}

	test('with a map id the map uses it and no style list', async () => {
		await draw({ api_key: 'k', map_id: 'm1', coordinates: { lat: 12.9, lng: 77.6 } });
		expect(made).toHaveLength(1);
		expect(made[0].mapId).toBe('m1');
		expect(made[0].styles).toBeUndefined();
	});

	test('without a map id the map is plain Google styling', async () => {
		await draw({ api_key: 'k', coordinates: { lat: 12.9, lng: 77.6 } });
		expect(made).toHaveLength(1);
		expect(made[0].mapId).toBeUndefined();
		expect(made[0].styles).toBeUndefined();
	});

	test('the options helper and the snapshot after Confirm', () => {
		expect(mapLookOptions('m1')).toEqual({ mapId: 'm1' });
		expect(mapLookOptions('')).toEqual({});
		expect(mapLookOptions(undefined)).toEqual({});
		const withId = staticMapUrl(1, 2, 'k', 'm1');
		expect(withId).toContain('map_id=m1');
		expect(withId).not.toContain('style=');
		const plain = staticMapUrl(1, 2, 'k');
		expect(plain).not.toContain('map_id=');
		expect(plain).not.toContain('style=');
	});

	test('the confirmed card snapshot carries the map id', async () => {
		await act(async () => {
			root.render(
				<LocationMap
					location={{ api_key: 'k', map_id: 'm1' }}
					onConfirm={() => {}}
					confirmed
					confirmedMeta={{ address: 'Whitefield', lat: 12.9, lng: 77.6 }}
				/>,
			);
		});
		const img = host.querySelector('img');
		expect(img?.getAttribute('src')).toContain('map_id=m1');
	});
});
