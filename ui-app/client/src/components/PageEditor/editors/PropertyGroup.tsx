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
}: PropertyGroupProps) {
	const [state, setState] = React.useState(defaultStateOpen ?? true);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setState(!isNullValue(v) ? v : defaultStateOpen ?? true),
			pageExtractor,
			`${personalizationPath}.propertyEditor.${name}`,
		);
	}, [personalizationPath, name]);

	if (!state)
		return (
			<div className="_propertyGroup _closed">
				<div
					className="_propertyGroupHeader"
					tabIndex={0}
					onClick={() => onChangePersonalization('propertyEditor.' + name, true)}
				>
					<i className="fa fa-caret-down" />
					{displayName}
				</div>
			</div>
		);

	return (
		<div className="_propertyGroup">
			<div
				className="_propertyGroupHeader"
				tabIndex={0}
				onClick={() => onChangePersonalization('propertyEditor.' + name, false)}
			>
				<i className="fa fa-caret-down" />
				{displayName}
			</div>
			{children}
		</div>
	);
}
