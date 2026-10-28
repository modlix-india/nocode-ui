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
	const holder = useRef<HTMLDivElement>(null);
	const live = useRef<{ google?: any; map?: any; marker?: any; circle?: any }>({});
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
