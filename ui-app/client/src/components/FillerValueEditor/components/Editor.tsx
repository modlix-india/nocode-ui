import React, { useCallback, useEffect, useState } from 'react';
import { EditorDefinition, EditorType, Filler } from '.././components/fillerCommons';
import { StoreExtractor, setStoreData } from '@fincity/path-reactive-state-management';
import ToggleButton from './ToggleButton';

export function Editor({
	editor,
	sectionValueKey,
	filler,
	onValueChanged,
	storeExtractor,
}: {
	editor: EditorDefinition;
	sectionValueKey: string;
	filler: Filler;
	onValueChanged: (f: Filler) => void;
	storeExtractor: StoreExtractor;
}) {
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

	if (editor.type === EditorType.BOOLEAN) {
		return <ToggleButton value={!!value} onChange={onChange} />;
	} else if (editor.type === EditorType.TEXT_BOX) {
	} else if (editor.type === EditorType.NUMBER) {
	} else if (editor.type === EditorType.ENUM) {
	} else if (editor.type === EditorType.COLOR_PICKER) {
	}

	return <></>;
}
