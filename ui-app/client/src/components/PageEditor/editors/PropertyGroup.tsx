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
	children?: React.ReactNode;
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

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setState(!isNullValue(v) ? v : defaultStateOpen ?? true),
			pageExtractor,
			`${personalizationPath}.propertyEditor.${tabName}.${name}`,
		);
	}, [personalizationPath, name]);

	return (
		<div
			className={`_propertyGroup ${state ? '_opened' : '_closed'}`}
			onDoubleClick={() => onChangePersonalization(`propertyEditor.${tabName}`, undefined)}
		>
			<div
				className="_propertyGroupHeader"
				tabIndex={0}
				onClick={() => onChangePersonalization(`propertyEditor.${tabName}.${name}`, !state)}
			>
				<span className="_propertyGroupHeaderIcon">{state ? '-' : '+'}</span>
				{displayName.substring(0, 1).toUpperCase() + displayName.substring(1).toLowerCase()}
			</div>
			<div className="_propertyGroupContent">{state ? children : undefined}</div>
		</div>
	);
}
