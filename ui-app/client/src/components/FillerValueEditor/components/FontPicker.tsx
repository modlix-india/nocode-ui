import React, { useCallback, useEffect, useState } from 'react';
import { EditorDefinition } from './fillerCommons';
import { Dropdown, DropdownOptions } from './Dropdown';
import { duplicate } from '@fincity/kirun-js';

const FONT_FAMILIES: DropdownOptions = [
	{ name: 'Arial', displayName: 'Arial' },
	{ name: 'Arial Black', displayName: 'Arial Black' },
	{ name: 'Helvetica', displayName: 'Helvetica' },
	{ name: 'Times New Roman', displayName: 'Times New Roman' },
	{ name: 'Times', displayName: 'Times' },
	{ name: 'Courier New', displayName: 'Courier New' },
	{ name: 'Courier', displayName: 'Courier' },
	{ name: 'Comic Sans MS', displayName: 'Comic Sans MS' },
	{ name: 'Impact', displayName: 'Impact' },
	{ name: 'Verdana', displayName: 'Verdana' },
	{ name: 'Georgia', displayName: 'Georgia' },
	{ name: 'Palatino', displayName: 'Palatino' },
	{ name: 'Garamond', displayName: 'Garamond' },
	{ name: 'Trebuchet MS', displayName: 'Trebuchet MS' },
];

const FONT_SIZE: DropdownOptions = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20].map(e => ({
	name: `${e}px`,
	displayName: `${e}px`,
}));

const FONT_WEGIHT: DropdownOptions = [
	{ name: '100', displayName: '100' },
	{ name: '200', displayName: '200' },
	{ name: '300', displayName: '300' },
	{ name: '400', displayName: '400 - Normal' },
	{ name: '500', displayName: '500' },
	{ name: '600', displayName: '600' },
	{ name: '700', displayName: '700 - Bold' },
	{ name: '800', displayName: '800' },
	{ name: '900', displayName: '900' },
	{ name: 'normal', displayName: 'Normal' },
	{ name: 'bold', displayName: 'Bold' },
	{ name: 'lighter', displayName: 'Lighter' },
	{ name: 'bolder', displayName: 'Bolder' },
];

export default function FontPicker({
	editor,
	value,
	onChange,
	appDefinition,
}: {
	editor: EditorDefinition;
	value: Array<any>;
	onChange: (v: Array<any>) => void;
	appDefinition: any;
}) {
	const [fontsList, setFontsList] = useState<DropdownOptions>(FONT_FAMILIES);
	const [selectedIndex, setSelectedIndex] = useState<number>(0);

	useEffect(() => {
		if (!appDefinition?.properties?.fontPacks) return;
		setFontsList(
			Object.values(appDefinition.properties.fontPacks)
				.map((e: any) => ({ name: e.name, displayName: e.name }))
				.concat(FONT_FAMILIES),
		);
	}, [appDefinition]);

	const onChangeLocal = (key: string, v: string) => {
		const inValue = duplicate(value ?? []);
		if (!inValue[selectedIndex]) inValue[selectedIndex] = {};
		inValue[selectedIndex][key] = v;
		onChange(inValue);
	};

	if (!editor.fontNames?.length) return <></>;

	return (
		<div className="_flexBox _column _gap10">
			<Dropdown
				options={editor.fontNames?.map(e => ({ name: e, displayName: e }))}
				value={editor.fontNames?.[selectedIndex]}
				hideNone={true}
				onChange={e => setSelectedIndex(editor.fontNames?.findIndex(x => x == e) ?? 0)}
			/>
			<div className="_flexBox _row _gap10 _flexChildren21">
				<Dropdown
					options={fontsList}
					value={value[selectedIndex]?.family}
					onChange={e => onChangeLocal('family', e)}
					hideNone={true}
				/>
				<Dropdown
					options={FONT_SIZE}
					value={value[selectedIndex]?.size}
					onChange={e => onChangeLocal('size', e)}
					hideNone={true}
				/>
			</div>
			<div className="_flexBox _row _gap10 _flexChildren1">
				<Dropdown
					options={FONT_WEGIHT}
					value={value[selectedIndex]?.weight}
					onChange={e => onChangeLocal('weight', e)}
					hideNone={true}
				/>
			</div>
		</div>
	);
}
