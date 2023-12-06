import React, { useCallback, useEffect } from 'react';
import { EditorDefinition, EditorType, Filler, SectionDefinition } from './fillerCommons';
import { duplicate } from '@fincity/kirun-js';
import TextBox from './TextBox';
import { Dropdown } from './Dropdown';
import ToggleButton from './ToggleButton';
import Portal from '../../Portal';
import { Editor as ValueEditor } from '@monaco-editor/react';
import { StoreExtractor, setStoreData, useStore } from '@fincity/path-reactive-state-management';

function getTextualValue(value: any) {
	if (value === undefined) return '';
	if (value === null) return 'null';
	return JSON.stringify(value, null, 2);
}

export function EditorBody({
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

	const updateDefinition = useCallback(
		(editorModifier: (e: EditorDefinition) => void) => {
			const newFiller = duplicate(filler) as Filler;
			const section = newFiller.definition?.[sectionKey];
			editorModifier(section?.editors?.find(ed => ed.key == editor.key)!);
			setFiller(newFiller);
		},
		[editor, filler, sectionKey, setFiller],
	);

	const [showValueEditor, setShowValueEditor] = React.useState(false);

	const [localValue, setLocalValue] = React.useState<string>('');
	const [editorValue, setEditorValue] = React.useState('');
	const [enableOk, setEnableOk] = React.useState(false);

	useEffect(() => {
		const st: StoreExtractor = new StoreExtractor(filler, 'Filler.');
		const value = st.getValue(`Filler.values.${section.valueKey}.${editor.valueKey}`);
		setLocalValue(value ? JSON.stringify(value) : '');
	}, [showValueEditor, filler]);

	let popup: React.JSX.Element | undefined = undefined;

	if (showValueEditor) {
		popup = (
			<Portal>
				<div
					className={`_popupBackground _fillerDefEditor`}
					onClick={() => setShowValueEditor(false)}
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
									setStoreData(
										`Filler.values.${section.valueKey}.${editor.valueKey}`,
										newFiller,
										v,
										'Filler',
										new Map([['Filler', st]]),
									);
									setFiller(newFiller);

									setShowValueEditor(false);
								}}
							>
								Ok
							</button>

							<button onClick={() => setShowValueEditor(false)}>Cancel</button>
						</div>
					</div>
				</div>
			</Portal>
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
			<div className="_label">Value Type</div>
			<Dropdown
				value={editor.valueType}
				onChange={valueType =>
					updateDefinition(s => (s.valueType = valueType as EditorValueType))
				}
				options={Object.keys(EditorValueType).map(key => ({ name: key, displayName: key }))}
			/>
			<div className="_label">Type</div>
			<Dropdown
				value={editor.type}
				onChange={type => updateDefinition(s => (s.type = type as EditorType))}
				options={Object.keys(EditorType).map(key => ({ name: key, displayName: key }))}
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
			<div
				onClick={() => {
					setEditorValue(localValue);
					setShowValueEditor(true);
				}}
			>
				<button>Add Value</button>
			</div>

			{popup}
		</div>
	);
}
