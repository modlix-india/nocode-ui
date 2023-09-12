import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect } from 'react';
import {
	addListener,
	addListenerAndCallImmediately,
	PageStoreExtractor,
} from '../../../context/StoreContext';
import { LocationHistory } from '../../../types/common';

interface PropertyGroupProps {
	name: string;
	children?: React.ReactNode[] | React.ReactNode;
	displayName: string;
	defaultStateOpen?: boolean;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	pageExtractor: PageStoreExtractor;
	locationHistory: Array<LocationHistory>;
	tabName: string;
	showStar?: boolean;
}

export function PropertyGroup({
	children,
	defaultStateOpen,
	name,
	displayName,
	personalizationPath,
	onChangePersonalization,
	pageExtractor,
	locationHistory,
	tabName,
	showStar = false,
}: PropertyGroupProps) {
	const [state, setState] = React.useState(defaultStateOpen ?? true);
	const [advancedMode, setAdvancedMode] = React.useState(false);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setState(!isNullValue(v) ? v : defaultStateOpen ?? true),
			pageExtractor,
			`${personalizationPath}.propertyEditor.${tabName}.${name}`,
		);
	}, [personalizationPath, name]);

	let child = undefined;
	if (state) {
		if (Array.isArray(children) && (children?.length ?? 0) > 1)
			child = advancedMode ? children![0] : children![1];
		else child = children;
	}

	let advSwitch = undefined;
	if (state && Array.isArray(children) && (children?.length ?? 0) > 1) {
		advSwitch = (
			<span
				tabIndex={0}
				role="button"
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ') {
						e.preventDefault();
						e.stopPropagation();
						setAdvancedMode(!advancedMode);
					}
				}}
				className={`_microToggle2 ${advancedMode ? '_on' : '_off'}`}
				title={advancedMode ? 'Switch to Basic' : 'Switch to Advanced'}
				onClick={e => {
					e.preventDefault();
					e.stopPropagation();
					setAdvancedMode(!advancedMode);
				}}
			></span>
		);
	}

	let star = undefined;
	if (showStar)
		star = (
			<svg
				width="8"
				height="8"
				viewBox="0 0 8 8"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
				className="_propertyGroupHeaderStar"
			>
				<path d="M7.82059 3.646C7.98663 3.476 8.04265 3.228 7.96663 3C7.89061 2.772 7.70856 2.62 7.4825 2.586L5.55798 2.292C5.49396 2.284 5.43595 2.238 5.40394 2.174L4.54371 0.352C4.44168 0.134 4.23362 0 3.99956 0C3.7655 0 3.55744 0.134 3.45541 0.352L2.59518 2.174C2.56317 2.238 2.50516 2.284 2.43914 2.292L0.516622 2.586C0.290561 2.62 0.106512 2.778 0.032492 3C-0.0415279 3.222 0.0124866 3.476 0.178531 3.646L1.57091 5.064C1.62092 5.116 1.64493 5.192 1.63292 5.268L1.30483 7.27C1.26482 7.514 1.36285 7.75 1.5589 7.89C1.74695 8.022 1.98702 8.036 2.18707 7.926L3.90754 6.98C3.96555 6.948 4.03357 6.948 4.09158 6.98L5.81205 7.926C5.90207 7.976 6.0001 8 6.09813 8C6.21816 8 6.33619 7.962 6.44022 7.89C6.63627 7.75 6.7343 7.514 6.69429 7.27L6.3662 5.268C6.35419 5.192 6.3782 5.116 6.42821 5.064L7.82059 3.646Z" />
			</svg>
		);

	return (
		<div className={`_propertyGroup ${state ? '_opened' : '_closed'}`}>
			<div
				className="_propertyGroupHeader"
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ')
						onChangePersonalization(`propertyEditor.${tabName}.${name}`, !state);
				}}
				onClick={() => onChangePersonalization(`propertyEditor.${tabName}.${name}`, !state)}
				onDoubleClick={() =>
					onChangePersonalization(`propertyEditor.${tabName}`, undefined)
				}
			>
				{star}
				{displayName
					.split(' ')
					.map(e => e.substring(0, 1).toUpperCase() + e.substring(1).toLowerCase())
					.join(' ')}
				{advSwitch}
				<span className="_propertyGroupHeaderIcon">{state ? '-' : '+'}</span>
			</div>
			<div className="_propertyGroupContent">{child}</div>
		</div>
	);
}
