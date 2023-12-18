import React, { useCallback, useEffect, useState } from 'react';
import { EditorDefinition, EditorType, Filler, PopupType } from '.././components/fillerCommons';
import { StoreExtractor, setStoreData } from '@fincity/path-reactive-state-management';
import ToggleButton from './ToggleButton';
import { ImageEditor } from './ImageEditor';
import Text from './Text';
import { Dropdown } from './Dropdown';
import Palette from './Palette';
import ObjectEditor from './ObjectEditor';
import { isNullValue } from '@fincity/kirun-js';
import FontPicker from './FontPicker';
import MapChoice from './MapChoice';

export function Editor({
	editor,
	parentEditor,
	sectionValueKey,
	filler,
	onValueChanged,
	storeExtractor,
	onPopup,
	index,
	appDefinition,
}: Readonly<{
	editor: EditorDefinition;
	sectionValueKey: string;
	filler: Filler;
	onValueChanged: (f: Filler) => void;
	storeExtractor: StoreExtractor;
	onPopup: (newPopup: PopupType, clear: boolean, editorDefinition: EditorDefinition) => void;
	parentEditor?: EditorDefinition;
	index?: number;
	appDefinition?: any;
}>) {
	const [value, setValue] = useState<any>();

	useEffect(() => {
		const value = storeExtractor.getValue(
			`Filler.values.${sectionValueKey}.${editor.valueKey}`,
		);
		setValue(value);
	}, [filler]);

	const onChange = useCallback(
		(v: any) => {
			setStoreData(
				`Filler.values.${sectionValueKey}.${editor.valueKey}`,
				filler,
				v,
				'Filler',
				new Map([['Filler.', storeExtractor]]),
			);
			onValueChanged(filler);
		},
		[filler, editor, storeExtractor, onValueChanged],
	);

	let editorControl = <></>;
	if (editor.type === EditorType.LABEL) {
		editorControl = <div className="_editorLabel">{value ?? editor.name}</div>;
	} else if (editor.type === EditorType.BOOLEAN) {
		editorControl = <ToggleButton value={!!value} onChange={onChange} />;
	} else if (editor.type === EditorType.IMAGE) {
		editorControl = (
			<ImageEditor
				onPopup={() => {
					const newPopup: PopupType = {
						path: `Filler.values.${sectionValueKey}.${editor.valueKey}`,
						type: 'IMAGE',
					};
					if (!isNullValue(parentEditor))
						newPopup.path = `Filler.values.${sectionValueKey}.${
							parentEditor!.valueKey
						}[${index}].${editor.valueKey}`;
					onPopup(newPopup, !isNullValue(parentEditor), editor);
				}}
				value={value}
				onDelete={() => onChange(undefined)}
			/>
		);
	} else if (editor.type === EditorType.TEXT_BOX) {
		editorControl = (
			<Text
				value={value}
				onChange={onChange}
				maxChars={editor.maxLength}
				allowedRegex={editor.regex}
			/>
		);
	} else if (editor.type === EditorType.TEXT_AREA) {
		editorControl = (
			<Text
				value={value}
				onChange={onChange}
				maxChars={editor.maxLength}
				allowedRegex={editor.regex}
				isTextArea={true}
			/>
		);
	} else if (editor.type === EditorType.ENUM) {
		editorControl = (
			<Dropdown
				hideNone={editor.enumHideNone ?? false}
				value={value}
				onChange={onChange}
				options={editor.enumOptions ?? []}
			/>
		);
	} else if (editor.type === EditorType.PALLETTE) {
		editorControl = (
			<Palette
				value={value ?? []}
				onChange={onChange}
				numOfColors={editor.numColors ?? 5}
				samplePalettes={editor.samplePalettes}
				hideGeneratePalette={editor.hideGeneratePalette}
			/>
		);
	} else if (editor.type === EditorType.ARRAY_OF_IMAGES) {
		editorControl = (
			<div className="_arrayOfImages">
				{(value ?? []).map((v: { image: string }, i: number) => (
					<ImageEditor
						key={v.image}
						value={v.image}
						onDelete={() => onChange(value.filter((_: any, j: number) => j !== i))}
						onPopup={() =>
							onPopup(
								{
									path: `Filler.values.${sectionValueKey}.${editor.valueKey}[${i}].image`,
									type: 'IMAGE',
								},
								!isNullValue(parentEditor),
								editor,
							)
						}
						draggable={true}
						onDragOver={e => e.preventDefault()}
						onDragStart={e =>
							e.dataTransfer.setData('text/plain', `Image_${editor.key}_${i}`)
						}
						onDrop={e => {
							e.preventDefault();

							if (!e.dataTransfer.getData('text/plain').startsWith('Image_')) return;
							const [, key, index] = e.dataTransfer.getData('text/plain').split('_');
							if (key !== editor.key) return;
							const x = [...value];
							x.splice(i, 0, x.splice(parseInt(index), 1)[0]);
							onChange(x);
						}}
					/>
				))}
				<ImageEditor
					value={''}
					onPopup={() =>
						onPopup(
							{
								path: `Filler.values.${sectionValueKey}.${editor.valueKey}[${
									value?.length ?? 0
								}].image`,
								type: 'IMAGE',
							},
							!isNullValue(parentEditor),
							editor,
						)
					}
					onDelete={() => onChange([...(value ?? []), undefined])}
				/>
			</div>
		);
	} else if (editor.type === EditorType.ARRAY_OF_OBJECTS) {
		editorControl = (
			<ObjectEditor
				editor={editor}
				value={value}
				onPopup={() =>
					onPopup(
						{
							path: `Filler.values.${sectionValueKey}.${editor.valueKey}`,
							type: 'OBJECT',
						},
						true,
						editor,
					)
				}
			/>
		);
	} else if (editor.type === EditorType.FONT_PICKER) {
		editorControl = (
			<FontPicker
				editor={editor}
				value={value ?? []}
				onChange={onChange}
				appDefinition={appDefinition}
			/>
		);
	} else if (editor.type === EditorType.MAP) {
		editorControl = (
			<MapChoice
				prefix={editor.mapURLPrefix}
				onPopup={() =>
					onPopup(
						{
							path: `Filler.values.${sectionValueKey}.${editor.valueKey}.image`,
							type: 'IMAGE',
						},
						true,
						editor,
					)
				}
				value={value}
				onChange={onChange}
			/>
		);
	}

	const label = editor.hideLabel ? <></> : <div className="_editorLabel">{editor.name}</div>;

	return (
		<div className="_editor">
			{label}
			{editorControl}
		</div>
	);
}
