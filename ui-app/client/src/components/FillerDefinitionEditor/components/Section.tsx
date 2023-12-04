import { duplicate } from '@fincity/kirun-js';
import React, { useState } from 'react';
import { Dots, DustBin, Gear } from './FillerDefinitionEditorIcons';
import { Filler, SectionDefinition } from './fillerCommons';
import { SectionBody } from './SectionBody';

export default function Section({
	section,
	filler,
	setFiller,
}: {
	section: SectionDefinition;
	filler: Filler;
	setFiller: (filler: Filler) => void;
}) {
	const [collapsed, setCollapsed] = useState<boolean>(true);
	const [sectionName, setSectionName] = useState<string | undefined>(undefined);

	let sectionNameControl: React.JSX.Element = <div className="_sectionName">{section.name}</div>;

	if (sectionName !== undefined) {
		const saveSectionName = (name: string | undefined) => {
			if (!name || name == section.name || !name.trim()) {
				setSectionName(undefined);
				return;
			}
			const newFiller = duplicate(filler) as Filler;
			newFiller.definition![section.key].name = name;
			setFiller(newFiller);
			setSectionName(undefined);
		};
		sectionNameControl = (
			<input
				className="_sectionNameInput"
				autoFocus
				type="text"
				value={sectionName}
				onChange={e => setSectionName(e.target.value)}
				onKeyDown={e => {
					if (e.key == 'Escape') saveSectionName(undefined);
					else if (e.key == 'Enter') saveSectionName(sectionName);
				}}
				onBlur={() => saveSectionName(sectionName)}
			/>
		);
	}

	const sectionBody = collapsed ? null : (
		<SectionBody section={section} filler={filler} setFiller={setFiller} />
	);

	return (
		<div
			className="_sectioncontainer"
			onDragOver={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onDrop={e => {
				const key = e.dataTransfer.getData('sectionKey');
				if (!key || !key.startsWith('Section_')) return;
				const dgin = key.split('_')[1];

				const dgon = section.key;
				if (dgin == dgon) return;

				const newFiller = duplicate(filler) as Filler;
				const sections = Object.values(newFiller.definition!).sort(
					(a, b) => a.order - b.order,
				);
				const dgiIndex = sections.findIndex(s => s.key == dgin);
				const dgoIndex = sections.findIndex(s => s.key == dgon);

				const targetSection = sections.splice(dgiIndex, 1);
				sections.splice(dgoIndex + (dgoIndex < dgiIndex ? 0 : 1), 0, targetSection[0]);
				sections.forEach((s, i) => (s.order = i));

				setFiller(newFiller);
			}}
		>
			<div className={`_section ${collapsed ? '_collapsed' : ''}`}>
				<div
					className="_sectionHeader"
					draggable
					onDoubleClick={() => setSectionName(section.name)}
					onDragStart={e =>
						e.dataTransfer.setData('sectionKey', `Section_${section.key}`)
					}
				>
					<Dots />
					{sectionNameControl}
					<div className="_sectionHeaderButtons">
						<div className="_button" onClick={() => setCollapsed(!collapsed)}>
							<Gear />
						</div>
						<div
							className="_button"
							onClick={() => {
								const newFiller = duplicate(filler) as Filler;
								delete newFiller.definition![section.key];
								setFiller(newFiller);
							}}
						>
							<DustBin />
						</div>
					</div>
				</div>
				{sectionBody}
			</div>
		</div>
	);
}
