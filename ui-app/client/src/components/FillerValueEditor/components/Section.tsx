import { StoreExtractor, setStoreData } from '@fincity/path-reactive-state-management';
import React, { useState } from 'react';
import { Filler, PopupType, SectionDefinition } from '.././components/fillerCommons';
import { Editor } from './Editor';
import ToggleButton from './ToggleButton';

export function Section({
	filler,
	storeExtractor,
	section,
	isUIFiller,
	onSectionSelection,
	onValueChanged,
	index,
	selected,
	onPopup,
}: {
	filler: Filler;
	storeExtractor: StoreExtractor;
	section: SectionDefinition;
	isUIFiller: boolean;
	onSectionSelection: (index: number) => void;
	onValueChanged: (f: Filler) => void;
	index: number;
	selected: boolean;
	onPopup: (newPopup: PopupType, clear: boolean) => void;
}) {
	const [collapsed, setCollapsed] = useState<boolean>(false);

	let sectionToggle: React.JSX.Element | undefined = undefined;

	if (section.showSectionToggle) {
		const toggleValue =
			storeExtractor.getValue(`Filler.values.${section.valueKey}.${section.toggleKey}`) !==
			false;
		sectionToggle = (
			<ToggleButton
				value={toggleValue}
				onChange={v => {
					setStoreData(
						`Filler.values.${section.valueKey}.${section.toggleKey}`,
						filler,
						v,
						'Filler',
						new Map([['Filler.', storeExtractor]]),
					);
					onValueChanged(filler);
				}}
			/>
		);
	}

	return (
		<div
			className={`_section ${collapsed ? '_collapsed' : ''} ${selected ? '_selected' : ''}`}
			onMouseDown={() => onSectionSelection(index)}
		>
			<div className="_sectionHeader">
				<div className="_sectionNumber">{index + 1}</div>
				<div className="_sectionName">{section.name}</div>
				{sectionToggle}
			</div>
			<div className={`_sectionBody _${section.layout ?? 'VERTICAL'}`}>
				{Object.values(section.editors ?? {}).map(editor => (
					<Editor
						key={editor.key}
						editor={editor}
						sectionValueKey={section.valueKey}
						filler={filler}
						onValueChanged={onValueChanged}
						storeExtractor={storeExtractor}
						onPopup={onPopup}
					/>
				))}
			</div>
		</div>
	);
}
