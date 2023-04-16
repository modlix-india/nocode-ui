import React, { useMemo, useState } from 'react';
import { PageStoreExtractor, store } from '../../../../context/StoreContext';
import { LocationHistory } from '../../../../types/common';
import PropertyEditor from '../PropertyEditor';
import StylePropertyEditor from '../StylePropertyEditor';
import { allPaths } from '../../../../util/allPaths';
import { LOCAL_STORE_PREFIX, PAGE_STORE_PREFIX, STORE_PREFIX } from '../../../../constants';

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
	editPageName,
}: PropertyBarProps) {
	const [currentTab, setCurrentTab] = useState(1);

	const storePaths = useMemo<Set<string>>(
		() =>
			allPaths(
				STORE_PREFIX,
				slaveStore?.store,
				allPaths(
					LOCAL_STORE_PREFIX,
					slaveStore?.localStore,
					allPaths(PAGE_STORE_PREFIX, slaveStore?.store?.pageData?.[editPageName ?? '']),
				),
			),
		[slaveStore],
	);

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
			<StylePropertyEditor selectedComponent={selectedComponent} storePaths={storePaths} />
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
