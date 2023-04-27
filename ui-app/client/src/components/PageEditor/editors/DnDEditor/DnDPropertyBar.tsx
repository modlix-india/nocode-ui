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
	previewMode: boolean;
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
	previewMode,
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

	if (!selectedComponent || previewMode) return <div className="_propBar"></div>;

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
				onShowCodeEditor={onShowCodeEditor}
				editPageName={editPageName}
				slaveStore={slaveStore}
			/>
		) : currentTab === 2 ? (
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
				editPageName={editPageName}
				slaveStore={slaveStore}
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
				reverseStyleSections={true}
				editPageName={editPageName}
				slaveStore={slaveStore}
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
				<i
					className={`fa fa-solid fa-gears ${currentTab === 3 ? 'active' : ''}`}
					tabIndex={0}
					onClick={() => onChangePersonalization('currentPropertyTab', 3)}
				/>
			</div>
			<div className="_propContainer">{tab}</div>
		</div>
	);
}
