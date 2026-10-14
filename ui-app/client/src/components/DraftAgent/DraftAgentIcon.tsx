import React from 'react';
import { IconHelper } from '../util/IconHelper';

export default function DraftAgentIcon() {
	return (
		<IconHelper viewBox="0 0 30 30">
			<circle
				cx="15"
				cy="15"
				r="14"
				fill="none"
				stroke="#6366F1"
				strokeWidth="2"
				strokeDasharray="6 3"
			/>
			<circle cx="15" cy="15" r="10" fill="#6366F1" />
			<path
				d="M15 9.5l1.4 3.6 3.6 1.4-3.6 1.4L15 19.5l-1.4-3.6-3.6-1.4 3.6-1.4z"
				fill="white"
			/>
		</IconHelper>
	);
}
