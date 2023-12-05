import React, { useCallback, useEffect, useState } from 'react';
import { EditorDefinition, EditorType, Filler } from '.././components/fillerCommons';
import { StoreExtractor, setStoreData } from '@fincity/path-reactive-state-management';
import ToggleButton from './ToggleButton';
import { ImageEditor } from './ImageEditor';
import Text from './Text';
import { Dropdown } from './Dropdown';
import Pallette from './Pallette';
import ObjectEditor from './ObjectEditor';

export function Editor({
	editor,
	sectionValueKey,
	filler,
	onValueChanged,
	storeExtractor,
}: Readonly<{
	editor: EditorDefinition;
	sectionValueKey: string;
	filler: Filler;
	onValueChanged: (f: Filler) => void;
	storeExtractor: StoreExtractor;
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
	if (editor.type === EditorType.BOOLEAN) {
		editorControl = <ToggleButton value={!!value} onChange={onChange} />;
	} else if (editor.type === EditorType.IMAGE) {
		editorControl = <ImageEditor value={value} onChange={onChange} />;
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
	} else if (editor.type === EditorType.NUMBER) {
		editorControl = (
			<Text
				value={value}
				onChange={onChange}
				maxChars={editor.maxLength}
				allowedRegex={editor.regex ?? '[0-9]+'}
			/>
		);
	} else if (editor.type === EditorType.ENUM) {
		editorControl = (
			<Dropdown value={value} onChange={onChange} options={editor.enumOptions ?? []} />
		);
	} else if (editor.type === EditorType.PALLETTE) {
		editorControl = (
			<Pallette value={value} onChange={onChange} numOfColors={editor.numColors ?? 5} />
		);
	} else if (editor.type === EditorType.ARRAY_OF_IMAGES) {
		editorControl = (
			<>
				{(value ?? []).map((v: string, i: number) => (
					<ImageEditor
						key={v}
						value={v}
						onChange={e => {
							const x = [...value];
							x[i] = e;
							onChange(x);
						}}
					/>
				))}
				<ImageEditor value={''} onChange={e => onChange([...(value ?? []), e])} />
			</>
		);
	} else if (editor.type === EditorType.ARRAY_OF_OBJECTS) {
		editorControl = <ObjectEditor />;
	}

	const label = editor.hideLabel ? <></> : <div className="_editorLabel">{editor.name}</div>;

	return (
		<div className="_editor">
			{label}
			{editorControl}
		</div>
	);
}
