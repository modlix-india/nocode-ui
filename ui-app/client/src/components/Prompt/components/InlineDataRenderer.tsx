import React from 'react';
import { LocationMap } from './LocationMap';

export interface InlineDataPayload {
	type: string;
	[key: string]: any;
}

interface InlineDataRendererProps {
	payload: InlineDataPayload;
	onRespond: (sendText: string, displayText: string, meta?: Record<string, any>) => void;
	confirmed?: boolean;
	confirmedMeta?: Record<string, any>;
	disabled?: boolean;
}

export function InlineDataRenderer({
	payload,
	onRespond,
	confirmed,
	confirmedMeta,
	disabled,
}: Readonly<InlineDataRendererProps>) {
	if (payload.type === 'location_map') {
		return (
			<LocationMap
				location={payload as any}
				confirmed={confirmed}
				confirmedMeta={confirmedMeta}
				disabled={disabled}
				onConfirm={(coords, address) => {
					if (coords) {
						const label = address || `${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`;
						onRespond(
							JSON.stringify({
								type: 'location_update',
								lat: coords.lat,
								lng: coords.lng,
								address: address || '',
							}),
							`Location confirmed: ${label}`,
							{ address: label, lat: coords.lat, lng: coords.lng },
						);
					} else {
						onRespond('confirm', 'Location confirmed', {});
					}
				}}
			/>
		);
	}
	return null;
}
