import React, { useEffect, useMemo, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	store,
} from '../../../../context/StoreContext';
import { LocationHistory } from '../../../../types/common';
import PropertyEditor from '../PropertyEditor';
import StylePropertyEditor from '../StylePropertyEditor';
import { allPaths } from '../../../../util/allPaths';
import { LOCAL_STORE_PREFIX, PAGE_STORE_PREFIX, STORE_PREFIX } from '../../../../constants';
import { isNullValue } from '@fincity/kirun-js';

interface PropertyBarProps {
	theme: string;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	url: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	selectedComponent?: string;
	onShowCodeEditor: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	selectedSubComponent: string;
	onSelectedSubComponentChanged: (key: string) => void;
	storePaths: Set<string>;
	setStyleSelectorPref: (pref: any) => void;
	styleSelectorPref: any;
}

export default function DnDPropertyBar({
	selectedComponent,
	defPath,
	locationHistory,
	pageExtractor,
	personalizationPath,
	onChangePersonalization,
	theme,
	onShowCodeEditor,
	slaveStore,
	storePaths,
	editPageName,
	selectedSubComponent,
	onSelectedSubComponentChanged,
	setStyleSelectorPref,
	styleSelectorPref,
}: PropertyBarProps) {
	const [currentTab, setCurrentTab] = React.useState(1);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			(_, v) => setCurrentTab(!isNullValue(v) ? v : 1),
			pageExtractor,
			`${personalizationPath}.currentPropertyTab`,
		);
	}, [personalizationPath]);

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
				storePaths={storePaths}
			/>
		) : (
			<StylePropertyEditor
				theme={theme}
				personalizationPath={personalizationPath}
				onChangePersonalization={onChangePersonalization}
				selectedComponent={selectedComponent}
				defPath={defPath}
				locationHistory={locationHistory}
				pageExtractor={pageExtractor}
				storePaths={storePaths}
				selectedSubComponent={selectedSubComponent}
				onSelectedSubComponentChanged={onSelectedSubComponentChanged}
				styleSelectorPref={styleSelectorPref}
				setStyleSelectorPref={setStyleSelectorPref}
			/>
		);

	return (
		<div className="_propBar _propBarVisible">
			<div className="_tabBar">
				<i
					className={`fa fa-solid fa-sliders ${currentTab === 1 ? 'active' : ''}`}
					tabIndex={0}
					onClick={() => onChangePersonalization('currentPropertyTab', 1)}
				/>
				<i
					className={`fa fa-solid fa-brush ${currentTab === 2 ? 'active' : ''}`}
					tabIndex={0}
					onClick={() => onChangePersonalization('currentPropertyTab', 2)}
				/>
			</div>
			<div className="_propContainer">{tab}</div>
		</div>
	);
}
