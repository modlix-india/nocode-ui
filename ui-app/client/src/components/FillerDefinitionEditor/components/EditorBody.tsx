import React, { useCallback, useEffect } from 'react';
import { EditorDefinition, EditorType, Filler, SectionDefinition } from './fillerCommons';
import { duplicate, isNullValue } from '@fincity/kirun-js';
import TextBox from './TextBox';
import { Dropdown } from './Dropdown';
import ToggleButton from './ToggleButton';
import Portal from '../../Portal';
import { Editor as ValueEditor } from '@monaco-editor/react';
import { StoreExtractor, setStoreData, useStore } from '@fincity/path-reactive-state-management';
import { Dots } from './FillerDefinitionEditorIcons';
import { shortUUID } from '../../../util/shortUUID';

export function EditorBody({
	editor,
	section,
	filler,
	setFiller,
	parentEditor,
	children,
}: {
	editor: EditorDefinition;
	section: SectionDefinition;
	filler: Filler;
	setFiller: (filler: Filler) => void;
	parentEditor?: EditorDefinition;
	children?: React.ReactNode;
}) {
	const sectionKey = section.key;

	const updateDefinition = useCallback(
		(editorModifier: (e: EditorDefinition) => void) => {
			const newFiller = duplicate(filler) as Filler;
			const section = newFiller.definition?.[sectionKey];
			if (isNullValue(parentEditor)) {
				editorModifier(section?.editors?.find(ed => ed.key == editor.key)!);
			} else {
				const parent = section?.editors?.find(ed => ed.key == parentEditor!.key)!;
				editorModifier(parent?.objectEditors?.find(ed => ed.key == editor.key)!);
			}
			setFiller(newFiller);
		},
		[editor, filler, sectionKey, setFiller],
	);

	const [showValueEditor, setShowValueEditor] = React.useState<
		'value' | 'sampleValue' | undefined
	>(undefined);

	const [editorValue, setEditorValue] = React.useState('');
	const [enableOk, setEnableOk] = React.useState(false);

	useEffect(() => {
		const st: StoreExtractor = new StoreExtractor(filler, 'Filler.');
		if (showValueEditor == 'value') {
			const value = st.getValue(`Filler.values.${section.valueKey}.${editor.valueKey}`);
			const txt = value ? JSON.stringify(value, undefined, 2) : '';
			setEditorValue(txt);
		} else {
			let editors: Array<EditorDefinition> | undefined = st.getValue(
				`Filler.definition.${section.key}.editors`,
			);
			if (!editors) editors = [];
			let editorObject = editors.find(e => e.key == editor.key);
			const txt = editorObject?.sampleObjects
				? JSON.stringify(editorObject.sampleObjects, undefined, 2)
				: '[]';
			setEditorValue(txt);
		}
	}, [showValueEditor, filler]);

	let popup: React.JSX.Element | undefined = undefined;

	if (showValueEditor) {
		popup = (
			<Portal>
				<div
					className={`_popupBackground _fillerDefEditor`}
					onClick={() => setShowValueEditor(undefined)}
				>
					<div className="_popupContainer" onClick={e => e.stopPropagation()}>
						<div className="_jsonEditorContainer">
							<ValueEditor
								language="json"
								height="100%"
								value={editorValue}
								onChange={ev => {
									setEditorValue(ev ?? '');
									try {
										if (ev !== 'undefined' && ev !== 'null' && ev)
											JSON.parse(ev);
										setEnableOk(true);
									} catch (err) {
										setEnableOk(false);
									}
								}}
							/>
						</div>
						<div className="_popupButtons">
							<button
								disabled={!enableOk}
								onClick={() => {
									let v = undefined;
									let ev = (editorValue ?? '').trim();
									if (ev === 'undefined' || ev === '') v = undefined;
									else if (ev === 'null') v = null;
									else if (ev) v = JSON.parse(ev);

									const newFiller = duplicate(filler) as Filler;
									const st: StoreExtractor = new StoreExtractor(
										newFiller,
										'Filler.',
									);
									if (showValueEditor == 'value') {
										setStoreData(
											`Filler.values.${section.valueKey}.${editor.valueKey}`,
											newFiller,
											v,
											'Filler',
											new Map([['Filler', st]]),
										);
									} else {
										let objs = st.getValue(
											`Filler.definition.${section.key}.editors`,
										);
										let ed = objs.find(
											(e: EditorDefinition) => e.key == editor.key,
										);
										if (ed) ed.sampleObjects = v;
									}

									setFiller(newFiller);
									setShowValueEditor(undefined);
								}}
							>
								Ok
							</button>

							<button onClick={() => setShowValueEditor(undefined)}>Cancel</button>
						</div>
					</div>
				</div>
			</Portal>
		);
	}

	let specificFields = <></>;

	const [newEnumOptionName, setNewEnumOptionName] = React.useState<string>('');
	const [newEnumOptionDisplayName, setNewEnumOptionDisplayName] = React.useState<string>('');

	if (editor.type === EditorType.TEXT_BOX || editor.type === EditorType.TEXT_AREA) {
		specificFields = (
			<>
				<div className="_label">Max Length</div>
				<TextBox
					value={(editor.maxLength ?? '') + ''}
					mandatory={false}
					onChange={maxLength =>
						updateDefinition(
							s =>
								(s.maxLength =
									maxLength?.trim().length === 0
										? undefined
										: parseInt(maxLength ?? '')),
						)
					}
				/>
				<div className="_label">Regex</div>
				<TextBox
					value={editor.regex}
					mandatory={false}
					onChange={regex =>
						updateDefinition(
							s => (s.regex = (regex ?? '').length === 0 ? undefined : regex),
						)
					}
				/>
			</>
		);
	} else if (editor.type === EditorType.ENUM) {
		specificFields = (
			<>
				<div className="_label">Enum Options</div>
				<div className="_enumOptionsContainer">
					{(editor.enumOptions ?? []).map((eo, i) => (
						<div
							draggable={true}
							onDragStart={e =>
								e.dataTransfer.setData(
									'text/plain',
									`EDITOROPTION_${editor.key}_${i}}`,
								)
							}
							onDragOver={e => e.preventDefault()}
							onDrop={e => {
								const data = e.dataTransfer.getData('text/plain');
								if (data.startsWith('EDITOROPTION_')) {
									const [_, editorKey, index] = data.split('_');
									if (editorKey !== editor.key) return;
									const newEnumOptions = [...(editor.enumOptions ?? [])];
									const eo = newEnumOptions.splice(parseInt(index), 1)[0];
									newEnumOptions.splice(i, 0, eo);
									updateDefinition(s => (s.enumOptions = newEnumOptions));
								}
							}}
							key={`${eo.name}`}
							className="_enumOption _pointer"
						>
							<div className="_name">{eo.name}</div>
							<div className="_displayName">{eo.displayName}</div>
						</div>
					))}
				</div>
				<div className="_flexBox _gap10">
					<div className="_flexBox _column _flex1">
						<div className="_label">New Option Name</div>
						<TextBox
							value={newEnumOptionName}
							onChange={name => setNewEnumOptionName(name ?? '')}
						/>
					</div>
					<div className="_flexBox _column _flex1">
						<div className="_label">New Option Display Name</div>
						<TextBox
							value={newEnumOptionDisplayName}
							onChange={displayName => setNewEnumOptionDisplayName(displayName ?? '')}
						/>
					</div>
					<div className="_flexBox _column _verticalCenter">
						<button
							onClick={() => {
								const newEnumOptions = [...(editor.enumOptions ?? [])];
								newEnumOptions.push({
									name: newEnumOptionName,
									displayName: newEnumOptionDisplayName,
								});
								updateDefinition(s => (s.enumOptions = newEnumOptions));
								setNewEnumOptionName('');
								setNewEnumOptionDisplayName('');
							}}
						>
							Add Option
						</button>
					</div>
				</div>
			</>
		);
	} else if (editor.type === EditorType.ARRAY_OF_OBJECTS && isNullValue(parentEditor)) {
		let previewList = <></>;
		if (editor.objectEditors?.length) {
			previewList = (
				<>
					<div className="_label">Preview Display Type</div>
					<Dropdown
						value={editor.arrayPreviewType ?? 'LIST'}
						onChange={type => updateDefinition(s => (s.arrayPreviewType = type as any))}
						options={[
							{ name: 'LIST', displayName: 'List' },
							{ name: 'GRID', displayName: 'Grid' },
						]}
					/>
					<div className="_label">Preview List</div>
					<div className="_previewList">
						{[...editor.objectEditors]
							.sort((a, b) => {
								if (editor.arrayPreviewList?.length) {
									const ai = editor.arrayPreviewList.indexOf(a.key);
									const bi = editor.arrayPreviewList.indexOf(b.key);
									if (ai > -1 && bi > -1) return ai - bi;
									if (ai > -1) return -1;
									if (bi > -1) return 1;
								}
								return 0;
							})
							.map((oe, i) => {
								const selected =
									(editor.arrayPreviewList?.indexOf(oe.key) ?? -1) > -1;
								return (
									<div
										draggable={selected}
										key={oe.key}
										className={`_previewItem`}
										onDragStart={e =>
											e.dataTransfer.setData(
												'text/plain',
												`PREVIEWOBJECT_${editor.key}_${oe.key}`,
											)
										}
										onDragOver={e => e.preventDefault()}
										onDrop={e => {
											const data = e.dataTransfer.getData('text/plain');
											if (!data.startsWith('PREVIEWOBJECT_')) return;
											const [, editorKey, objectEditorKey] = data.split('_');
											if (editorKey !== editor.key) return;
											const newPreviewList = [
												...(editor.arrayPreviewList ?? []),
											];
											const index = newPreviewList.indexOf(objectEditorKey);
											if (index > -1) newPreviewList.splice(index, 1);
											newPreviewList.splice(i, 0, objectEditorKey);
											updateDefinition(
												s => (s.arrayPreviewList = newPreviewList),
											);
										}}
										onClick={() =>
											updateDefinition(ed => {
												if (!ed.arrayPreviewList) ed.arrayPreviewList = [];
												const index = ed.arrayPreviewList!.indexOf(oe.key);
												if (index > -1)
													ed.arrayPreviewList!.splice(index, 1);
												else ed.arrayPreviewList!.push(oe.key);
											})
										}
									>
										<div
											className={`_previewNumber ${
												selected ? '_selected' : ''
											}`}
										>
											{i + 1}
										</div>
										{oe.name}
									</div>
								);
							})}
					</div>
				</>
			);
		}
		specificFields = (
			<>
				<div
					onClick={() => {
						setShowValueEditor('sampleValue');
					}}
				>
					<button>Add Sample Objects</button>
				</div>
				<div className="_label">Fields</div>
				<div className="_editorContainer">
					{children}
					<div className={`_section _nondraggable _collapsed`}>
						<div
							className="_sectionHeader"
							onClick={() =>
								addNewEditor({
									sectionKey: section.key,
									filler,
									setFiller,
									editor,
									position: -1,
								})
							}
						>
							<Dots />
							Add Editor for Field
						</div>
					</div>
				</div>
				{previewList}
			</>
		);
	} else if (editor.type === EditorType.PALLETTE) {
		specificFields = (
			<>
				<div className="_label">Number of Colors</div>
				<TextBox
					value={(editor.numColors ?? '') + ''}
					onChange={numColors =>
						updateDefinition(
							s =>
								(s.numColors =
									numColors?.trim().length === 0
										? undefined
										: parseInt(numColors ?? '')),
						)
					}
				/>
			</>
		);
	} else if (editor.type === EditorType.FONT_PICKER) {
		specificFields = (
			<>
				<div className="_label">Number of Fonts</div>
				<TextBox
					value={(editor.numFonts ?? '') + ''}
					onChange={numFonts =>
						updateDefinition(
							s =>
								(s.numFonts =
									numFonts?.trim().length === 0
										? undefined
										: parseInt(numFonts ?? '')),
						)
					}
				/>
			</>
		);
	}

	let addValue = <></>;
	if (isNullValue(parentEditor)) {
		addValue = (
			<div
				onClick={() => {
					setShowValueEditor('value');
				}}
			>
				<button>Add Value</button>
			</div>
		);
	}

	return (
		<div className="_sectionBody">
			<div className="_label">Value Key</div>
			<TextBox
				value={editor.valueKey}
				mandatory={true}
				onChange={valueKey => updateDefinition(s => (s.valueKey = valueKey ?? ''))}
			/>
			<div className="_label">Type</div>
			<Dropdown
				value={editor.type}
				onChange={type => updateDefinition(s => (s.type = type as EditorType))}
				options={Object.keys(EditorType)
					.filter(
						e =>
							isNullValue(parentEditor) ||
							((e as EditorType) !== EditorType.ARRAY_OF_OBJECTS &&
								(e as EditorType) !== EditorType.ARRAY_OF_IMAGES),
					)
					.map(key => ({ name: key, displayName: key }))}
			/>
			<div className="_label">Hide Label</div>
			<ToggleButton
				value={editor.hideLabel ?? false}
				onChange={hideLabel => updateDefinition(s => (s.hideLabel = hideLabel))}
			/>
			<div className="_label">Description</div>
			<TextBox
				value={editor.description}
				mandatory={false}
				onChange={description => updateDefinition(s => (s.description = description ?? ''))}
			/>
			{addValue}
			{specificFields}
			{popup}
		</div>
	);
}

function addNewEditor({
	sectionKey,
	filler,
	setFiller,
	editor,
	position,
}: {
	sectionKey: string;
	filler: Filler;
	setFiller: (filler: Filler) => void;
	editor: EditorDefinition;
	position: number;
}) {
	const obj: Filler = duplicate(filler);
	const def = obj.definition!;
	const section = def[sectionKey];
	const originalEditor = section.editors!.find(e => e.key == editor.key)!;

	if (isNullValue(originalEditor.objectEditors)) originalEditor.objectEditors = [];

	const key = shortUUID();
	let valueKey = 'editor';
	let i = 0;
	let keyNotFound = true;

	while (originalEditor.objectEditors!.some(v => v.valueKey === valueKey)) {
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
		originalEditor.objectEditors!.push(newEditor);
	} else {
		originalEditor.objectEditors!.splice(position, 0, newEditor);
	}

	setFiller(obj);
}
