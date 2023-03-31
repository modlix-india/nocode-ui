import React, { useState } from 'react';
import { PageStoreExtractor } from '../../../../context/StoreContext';
import { LocationHistory } from '../../../../types/common';
import PropertyEditor from '../PropertyEditor';
import StylePropertyEditor from '../StylePropertyEditor';

interface PropertyBarProps {
	theme: string;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	selectedComponent?: string;
}

export default function DnDPropertyBar({
	selectedComponent,
	defPath,
	locationHistory,
	pageExtractor,
	personalizationPath,
	onChangePersonalization,
	theme,
}: PropertyBarProps) {
	const [currentTab, setCurrentTab] = useState(1);

	if (!selectedComponent) return <div className="_propBar"></div>;

	const tab =
		currentTab === 1 ? (
			<PropertyEditor
				theme={theme}
				personalizationPath={personalizationPath}
				onChangePersonalization={onChangePersonalization}
				selectedComponent={selectedComponent}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
			/>
		) : (
			<StylePropertyEditor selectedComponent={selectedComponent} />
		);

	return (
		<div className="_propBar _propBarVisible">
			<div className="_tabBar">
				<i
					className={`fa fa-solid fa-sliders ${currentTab === 1 ? 'active' : ''}`}
					tabIndex={0}
					onClick={() => setCurrentTab(1)}
				/>
				<i
					className={`fa fa-solid fa-brush ${currentTab === 2 ? 'active' : ''}`}
					tabIndex={0}
					onClick={() => setCurrentTab(2)}
				/>
			</div>
			<div className="_propContainer">{tab}</div>
		</div>
	);
}
