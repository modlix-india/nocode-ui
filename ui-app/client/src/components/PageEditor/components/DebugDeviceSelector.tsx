import React from 'react';

interface DebugDeviceSelectorProps {
	messages: Map<string, any[]>;
	onSelectDevice: (device: string) => void;
	onClose: () => void;
}

export default function DebugDeviceSelector({
	messages,
	onSelectDevice,
	onClose,
}: DebugDeviceSelectorProps) {
	return (
		<div className="_popupMenuBackground" onClick={onClose}>
			<div className="_deviceSelectorMenu" onClick={e => e.stopPropagation()}>
				<div className="_deviceSelectorHeader">
					<h3>Select Device</h3>
					<button onClick={onClose}>×</button>
				</div>
				<div className="_deviceSelectorContent">
					{(['desktop', 'tablet', 'mobile'] as const).map(device => {
						const count = messages.get(device)?.length || 0;
						if (count === 0) return null;
						return (
							<button
								key={device}
								className="_deviceSelectorButton"
								onClick={() => onSelectDevice(device)}
							>
								<span className="_deviceName">
									{device.charAt(0).toUpperCase() + device.slice(1)}
								</span>
								<span className="_deviceCount">({count})</span>
							</button>
						);
					})}
				</div>
			</div>
		</div>
	);
}
