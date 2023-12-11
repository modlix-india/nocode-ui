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
				onDelete={onChange}
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
			<Palette value={value ?? []} onChange={onChange} numOfColors={editor.numColors ?? 5} />
		);
	} else if (editor.type === EditorType.ARRAY_OF_IMAGES) {
		editorControl = (
			<div className="_arrayOfImages">
				{(value ?? []).map((v: string, i: number) => (
					<ImageEditor
						key={v}
						value={v}
						onDelete={e => {
							if (!e) return onChange(value.filter((_: any, j: number) => j !== i));
							const x = [...value];
							x[i] = e;
							onChange(x);
						}}
						onPopup={() =>
							onPopup(
								{
									path: `Filler.values.${sectionValueKey}.${editor.valueKey}[${i}]`,
									type: 'IMAGE',
								},
								!isNullValue(parentEditor),
								editor,
							)
						}
					/>
				))}
				<ImageEditor
					value={''}
					onPopup={() =>
						onPopup(
							{
								path: `Filler.values.${sectionValueKey}.${editor.valueKey}[${
									value?.length ?? 0
								}]`,
								type: 'IMAGE',
							},
							!isNullValue(parentEditor),
							editor,
						)
					}
					onDelete={e => onChange([...(value ?? []), e])}
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
	}

	const label = editor.hideLabel ? <></> : <div className="_editorLabel">{editor.name}</div>;

	return (
		<div className="_editor">
			{label}
			{editorControl}
		</div>
	);
}
