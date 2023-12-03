import { StoreExtractor, setStoreData } from '@fincity/path-reactive-state-management';
import React, { useState } from 'react';
import ToggleButton from '../../FillerDefinitionEditor/components/ToggleButton';
import { Filler, SectionDefinition } from '../../FillerDefinitionEditor/components/fillerCommons';

export function Section({
	filler,
	storeExtractor,
	section,
	isUIFiller,
	onSectionSelection,
	onValueChanged,
	index,
}: {
	filler: Filler;
	storeExtractor: StoreExtractor;
	section: SectionDefinition;
	isUIFiller: boolean;
	onSectionSelection: (index: number) => void;
	onValueChanged: (f: Filler) => void;
	index: number;
}) {
	const [collapsed, setCollapsed] = useState<boolean>(false);

	let sectionToggle: React.JSX.Element | undefined = undefined;

	if (section.showSectionToggle) {
		sectionToggle = (
			<ToggleButton
				value={storeExtractor.getValue(
					`Filler.values.${section.valueKey}.${section.toggleKey}`,
				)}
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
			className={`_section ${collapsed ? '_collapsed' : ''}`}
			onMouseDown={() => onSectionSelection(index)}
		>
			<div className="_sectionHeader">
				<div className="_sectionNumber">{index + 1}</div>
				<div className="_sectionName">{section.name}</div>
				{sectionToggle}
			</div>
			<div className="_sectionBody"></div>
		</div>
	);
}
