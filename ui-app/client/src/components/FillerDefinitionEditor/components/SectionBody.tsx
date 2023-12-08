import { duplicate, isNullValue } from '@fincity/kirun-js';
import React, { Fragment, useCallback } from 'react';
import { shortUUID } from '../../../util/shortUUID';
import { Dots } from './FillerDefinitionEditorIcons';
import TextBox from './TextBox';
import ToggleButton from './ToggleButton';
import {
	EditorDefinition,
	EditorType,
	Filler,
	SectionDefinition,
	SectionLayout,
} from './fillerCommons';
import Editor from './Editor';

export function SectionBody({
	section,
	filler,
	setFiller,
}: {
	section: SectionDefinition;
	filler: Filler;
	setFiller: (filler: Filler) => void;
}) {
	const updateDefinition = useCallback(
		(sectionModifier: (s: SectionDefinition) => void) => {
			const newFiller = duplicate(filler);
			const newSection = newFiller.definition[section.key];
			sectionModifier(newSection);

			if (section.valueKey != newSection.valueKey) {
				newFiller.values[newSection.valueKey] = newFiller.values[section.valueKey];
				delete newFiller.values[section.valueKey];
			}

			setFiller(newFiller);
		},
		[filler, section, setFiller],
	);

	const editors = (section.editors ?? []).map(editor => {
		let children: React.ReactNode = null;
		if (editor.type === EditorType.ARRAY_OF_OBJECTS) {
			children = (
				<>
					{Object.values(editor.objectEditors ?? {}).map(ed => (
						<Editor
							key={ed.key}
							editor={ed}
							section={section}
							filler={filler}
							setFiller={setFiller}
							parentEditor={editor}
						/>
					))}
				</>
			);
		}
		return (
			<Editor
				key={editor.key}
				editor={editor}
				section={section}
				filler={filler}
				setFiller={setFiller}
			>
				{children}
			</Editor>
		);
	});

	return (
		<div className="_sectionBody">
			<div className="_label">Value Key</div>
			<TextBox
				value={section.valueKey}
				mandatory={true}
				onChange={valueKey => updateDefinition(s => (s.valueKey = valueKey ?? ''))}
			/>
			<div className="_label">Page Path</div>
			<TextBox
				value={section.pagePath}
				mandatory={true}
				onChange={pagePath => updateDefinition(s => (s.pagePath = pagePath ?? '/'))}
			/>
			<div className="_label">Grid Key to Scroll to</div>
			<TextBox
				value={section.gridKey}
				onChange={gridKey => updateDefinition(s => (s.gridKey = gridKey ?? ''))}
			/>
			<div className="_label">Layout</div>
			<div className="_choice">
				<input
					type="radio"
					id={`${section.key}_vertical`}
					name={section.key}
					value={SectionLayout.VERTICAL}
					checked={
						section.layout === undefined || section.layout === SectionLayout.VERTICAL
					}
					onChange={() => updateDefinition(s => (s.layout = SectionLayout.VERTICAL))}
				/>
				<label htmlFor={`${section.key}_vertical`}>Vertical</label>
				{[
					['horizonatal', SectionLayout.HORIZONTAL, 'Horizontal'],
					['two_per_row', SectionLayout.TWO_PER_ROW, 'Two per Row'],
					['three_per_row', SectionLayout.THREE_PER_ROW, 'Three per Row'],
				].map(([label, value, title]) => (
					<Fragment key={label}>
						<input
							type="radio"
							id={`${section.key}_${label}`}
							name={section.key}
							value={value}
							checked={section.layout === value}
							onChange={() =>
								updateDefinition(s => (s.layout = value as SectionLayout))
							}
						/>
						<label htmlFor={`${section.key}_${label}`}>{title}</label>
					</Fragment>
				))}
			</div>
			<div className="_row _gap _alignBottom">
				<div className="_row">
					<ToggleButton
						value={section.showSectionToggle ?? false}
						onChange={v =>
							updateDefinition(s => {
								s.showSectionToggle = v;
								if (v && !s.toggleKey) s.toggleKey = 'showSection';
							})
						}
					/>
					Show Section Toggle
				</div>
				{section.showSectionToggle ? (
					<div className="_column _flex1">
						<div className="_label">Toggle Key</div>
						<TextBox
							value={section.toggleKey}
							onChange={toggleKey =>
								updateDefinition(s => (s.toggleKey = toggleKey ?? ''))
							}
						/>
					</div>
				) : null}
			</div>
			<div className="_editorContainer">
				{editors}
				<div className={`_section _nondraggable _collapsed`}>
					<div
						className="_sectionHeader"
						onClick={() =>
							addNewEditor({
								sectionKey: section.key,
								filler,
								setFiller,
								position: -1,
							})
						}
					>
						<Dots />
						Add Editor
					</div>
				</div>
			</div>
		</div>
	);
}

function addNewEditor({
	sectionKey,
	filler,
	setFiller,
	position,
}: {
	sectionKey: string;
	filler: Filler;
	setFiller: (filler: Filler) => void;
	position: number;
}) {
	const obj: Filler = duplicate(filler);
	const def = obj.definition!;
	const section = def[sectionKey];

	if (isNullValue(section.editors)) section.editors = [];

	const key = shortUUID();
	let valueKey = 'editor';
	let i = 0;
	let keyNotFound = true;

	while (section.editors!.some(v => v.valueKey === valueKey)) {
		i++;
		valueKey = 'editor' + i;
	}

	const newEditor: EditorDefinition = {
		key,
		name: 'New Editor',
		valueKey,
		type: EditorType.TEXT_BOX,
	};

	if (position === -1) {
		section.editors!.push(newEditor);
	} else {
		section.editors!.splice(position, 0, newEditor);
	}

	setFiller(obj);
}
