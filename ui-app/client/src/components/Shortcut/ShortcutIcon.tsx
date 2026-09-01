import React from 'react';
import { IconHelper } from '../util/IconHelper';

export default function ShortcutIcon() {
	return (
		<IconHelper viewBox="0 0 30 30">
			<rect
				className="_shortcutIconBg"
				x="0"
				y="4"
				width="30"
				height="22"
				rx="4"
				fill="#4C6EF5"
			/>
			<rect x="4" y="9" width="5" height="5" rx="1.2" fill="white" opacity="0.9" />
			<rect x="12.5" y="9" width="5" height="5" rx="1.2" fill="white" opacity="0.55" />
			<rect x="21" y="9" width="5" height="5" rx="1.2" fill="white" opacity="0.55" />
			<rect x="4" y="17" width="5" height="5" rx="1.2" fill="white" opacity="0.55" />
			<rect x="12.5" y="17" width="13.5" height="5" rx="1.2" fill="white" opacity="0.9" />
		</IconHelper>
	);
}
