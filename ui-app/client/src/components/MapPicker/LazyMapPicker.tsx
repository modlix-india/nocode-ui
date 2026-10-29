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

function placeList(v: any, excluded = false): Place[] {
	if (!Array.isArray(v)) return [];
	return v
		.filter(p => p && typeof p === 'object')
		.map(p => (excluded ? { ...p, excluded: true } : p));
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
	const { bindingPath, key } = definition;
	const {
		properties: {
			apiKey,
			centerLat,
			centerLng,
			zoom,
			radiusKm,
			places,
			excludedPlaces,
			placeColor,
			excludedColor,
			noMapText,
			readOnly,
			onChange,
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
		fit?: any;
		idled?: boolean;
	}>({});
	const latest = useRef<{ bound?: any; readOnly?: boolean; onChange?: string }>({});
	latest.current = { bound, readOnly, onChange };

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
	}, [apiKey]);

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

	// ADZ-1171: the places a page targets (or excludes), drawn read-only under the picked point
	const allPlaces = [...placeList(places), ...placeList(excludedPlaces, true)];
	const placesKey = JSON.stringify(allPlaces);
	useEffect(() => {
		const { google, map } = live.current;
		if (!ready || !google || !map) return;
		let stale = false;
		(live.current.shapes ?? []).forEach(s => s.setMap(null));
		live.current.shapes = [];
		const list: Place[] = JSON.parse(placesKey);
		if (!list.length) return;
		Promise.all(
			list.map(pl => {
				const at = asPoint(pl);
				if (at) return Promise.resolve<Spot | undefined>({ center: at });
				return pl.name ? findPlace(google, String(pl.name)) : Promise.resolve(undefined);
			}),
		).then(found => {
			if (stale || live.current.map !== map) return;
			const all = new google.maps.LatLngBounds();
			let any = false;
			found.forEach((spot, i) => {
				if (!spot) return;
				const pl = list[i];
				const color = pl.excluded
					? (excludedColor ?? '#c0362c')
					: (placeColor ?? '#1a1a1a');
				const look = {
					map,
					clickable: false,
					strokeColor: color,
					strokeOpacity: 0.9,
					strokeWeight: pl.excluded ? 2 : 1.5,
					fillColor: color,
					fillOpacity: pl.excluded ? 0.18 : 0.08,
				};
				const km = placeKm(pl);
				let shape: any;
				if (km > 0 || !spot.bounds) {
					shape = new google.maps.Circle({
						...look,
						center: spot.center,
						radius: (km > 0 ? km : 1) * 1000,
					});
				} else {
					shape = new google.maps.Rectangle({ ...look, bounds: spot.bounds });
				}
				live.current.shapes!.push(shape);
				const b = shape.getBounds?.();
				if (b) {
					all.union(b);
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
	}, [ready, placesKey, placeColor, excludedColor]);

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
