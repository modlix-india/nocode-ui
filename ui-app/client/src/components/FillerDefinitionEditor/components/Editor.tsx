import React, { useState } from 'react';
import { EditorDefinition, Filler, SectionDefinition } from './fillerCommons';
import { duplicate } from '@fincity/kirun-js';
import { Dots, DustBin, Gear } from './FillerDefinitionEditorIcons';
import { EditorBody } from './EditorBody';

export default function Editor({
	editor,
	section,
	filler,
	setFiller,
}: {
	editor: EditorDefinition;
	section: SectionDefinition;
	filler: Filler;
	setFiller: (filler: Filler) => void;
}) {
	const sectionKey = section.key;
	const [collapsed, setCollapsed] = useState<boolean>(true);
	const [editorName, setEditorName] = useState<string | undefined>(undefined);

	let sectionNameControl: React.JSX.Element = <div className="_sectionName">{editor.name}</div>;

	if (editorName !== undefined) {
		const saveEditorName = (name: string | undefined) => {
			if (!name || name == editor.name || !name.trim()) {
				setEditorName(undefined);
				return;
			}
			const newFiller = duplicate(filler) as Filler;
			const editors = newFiller.definition![sectionKey].editors!;
			editors.find(e => e.key == editor.key)!.name = name;
			setFiller(newFiller);
			setEditorName(undefined);
		};
		sectionNameControl = (
			<input
				className="_sectionNameInput"
				autoFocus
				type="text"
				value={editorName}
				onChange={e => setEditorName(e.target.value)}
				onKeyDown={e => {
					if (e.key == 'Escape') saveEditorName(undefined);
					else if (e.key == 'Enter') saveEditorName(editorName);
				}}
				onBlur={() => saveEditorName(editorName)}
			/>
		);
	}

	const editorBody = collapsed ? null : (
		<EditorBody editor={editor} section={section} filler={filler} setFiller={setFiller} />
	);

	return (
		<div
			className="_sectioncontainer"
			onDragOver={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onDrop={e => {
				const key = e.dataTransfer.getData('editorKey');
				if (!key && !key.startsWith('Editor')) return;
				const [, inSectionKey, dgin] = key.split('_');
				if (inSectionKey != sectionKey) return;
				const dgon = editor.key;
				if (dgin == dgon) return;

				const newFiller = duplicate(filler) as Filler;
				const sections = newFiller.definition![sectionKey].editors!;
				const dgiIndex = sections.findIndex(s => s.key == dgin);
				const dgoIndex = sections.findIndex(s => s.key == dgon);

				const targetSection = sections.splice(dgiIndex, 1);
				sections.splice(dgoIndex, 0, targetSection[0]);

				newFiller.definition![sectionKey].editors = sections;

				setFiller(newFiller);
			}}
		>
			<div className={`_section ${collapsed ? '_collapsed' : ''}`}>
				<div
					className="_sectionHeader"
					draggable
					onDoubleClick={() => setEditorName(editor.name)}
					onDragStart={e =>
						e.dataTransfer.setData('editorKey', `Editor_${sectionKey}_${editor.key}`)
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
								const editors = newFiller.definition![sectionKey].editors!;
								editors.splice(
									editors.findIndex(s => s.key == editor.key),
									1,
								);
								setFiller(newFiller);
							}}
						>
							<DustBin />
						</div>
					</div>
				</div>
				{editorBody}
			</div>
		</div>
	);
}
