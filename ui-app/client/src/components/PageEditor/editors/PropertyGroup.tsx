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
