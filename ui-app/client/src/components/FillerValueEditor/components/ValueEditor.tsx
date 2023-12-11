import React, { useEffect, useMemo, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
} from '../../../context/StoreContext';
import { Filler, PopupType } from '.././components/fillerCommons';
import { CollapseIcon } from './FillerValueEditorIcons';
import { Section } from './Section';
import { StoreExtractor } from '@fincity/path-reactive-state-management';
import { duplicate } from '@fincity/kirun-js';

export default function ValueEditor({
	uiFiller: uiFillerOriginal,
	coreFiller: coreFillerOriginal,
	onPersonalizationChange,
	pageExtractor,
	personalizationPath,
	onSectionSelection,
	onValueChanged,
	selection,
	onPopup,
	appDefinition,
}: Readonly<{
	uiFiller: Filler;
	coreFiller: Filler;
	pageExtractor: PageStoreExtractor;
	onPersonalizationChange: (k: string, v: any) => void;
	personalizationPath?: string;
	onSectionSelection: (isUIFiller: boolean, sectionKey: string, index: number) => void;
	onValueChanged: (isUIFiller: boolean, filler: Filler) => void;
	selection?: { isUIFiller: boolean; sectionKey: string; sectionNumber: number };
	onPopup: (newPopup: PopupType, clear: boolean) => void;
	appDefinition?: any;
}>) {
	const [collapsed, setCollapsed] = useState<boolean>(false);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v) => setCollapsed(!!v?.collapsed),
			pageExtractor,
			personalizationPath,
		);
	}, [personalizationPath]);

	const [uiFiller, uiSTE]: [Filler, StoreExtractor] = useMemo(() => {
		const uiFiller = duplicate(uiFillerOriginal);
		return [uiFiller, new StoreExtractor(uiFiller, 'Filler.')];
	}, [uiFillerOriginal]);

	const [coreFiller, coreSTE]: [Filler, StoreExtractor] = useMemo(() => {
		const coreFiller = duplicate(coreFillerOriginal);
		return [coreFiller, new StoreExtractor(coreFiller, 'Filler.')];
	}, [coreFillerOriginal]);

	const uiSections = Object.values(uiFiller.definition ?? {}).sort((a, b) => a.order - b.order);

	const coreSections = Object.values(coreFiller.definition ?? {}).sort(
		(a, b) => a.order - b.order,
	);

	let sections: JSX.Element = <></>;
	if (!collapsed) {
		sections = (
			<>
				<div className="_sectionContainerHeader">
					<span className="_headerTitle">Site Creator</span>
					<span className="_headerSubTitle">Edit by changing values of any fields</span>
				</div>
				<div className="_sectionContainer">
					{uiSections.map((section, index) => (
						<Section
							filler={uiFiller}
							selected={
								(selection?.isUIFiller && selection?.sectionKey === section.key) ??
								false
							}
							key={section.key}
							index={index}
							isUIFiller={true}
							section={section}
							onSectionSelection={index =>
								onSectionSelection(true, section.key, index)
							}
							onValueChanged={(f: Filler) => onValueChanged(true, f)}
							storeExtractor={uiSTE}
							onPopup={(x, clear, editorDefinition) =>
								onPopup({ ...x, isUIFiller: true, editorDefinition }, clear)
							}
							appDefinition={appDefinition}
						/>
					))}

					{coreSections.map((section, index) => (
						<Section
							filler={coreFiller}
							key={section.key}
							index={uiSections.length + index}
							selected={
								(!selection?.isUIFiller && selection?.sectionKey === section.key) ??
								false
							}
							isUIFiller={false}
							section={section}
							onSectionSelection={index =>
								onSectionSelection(false, section.key, index)
							}
							onValueChanged={(f: Filler) => onValueChanged(false, f)}
							storeExtractor={coreSTE}
							onPopup={(x, clear, editorDefinition) =>
								onPopup({ ...x, isUIFiller: false, editorDefinition }, clear)
							}
							appDefinition={appDefinition}
						/>
					))}
				</div>
			</>
		);
	}

	return (
		<div className={`_valueEditor ${collapsed ? '_collapsed' : ''}`}>
			<div
				role="button"
				tabIndex={0}
				className="_collapseButton"
				onClick={() => onPersonalizationChange('collapsed', !collapsed)}
				onKeyDown={e =>
					e.key === 'Enter' ||
					(e.key === ' ' && onPersonalizationChange('collapsed', !collapsed))
				}
			>
				<CollapseIcon />
			</div>
			{sections}
		</div>
	);
}
