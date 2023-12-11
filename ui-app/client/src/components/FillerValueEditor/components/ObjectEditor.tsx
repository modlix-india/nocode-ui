import React from 'react';
import { EditorDefinition, EditorType } from './fillerCommons';
import ToggleButton from './ToggleButton';
import { StoreExtractor } from '@fincity/path-reactive-state-management';

export default function ObjectEditor({
	editor,
	value,
	onPopup,
}: Readonly<{
	editor: EditorDefinition;
	value: Array<any> | undefined;
	onPopup: () => void;
}>) {
	const previewFields = editor.objectEditors?.reduce((acc, curr) => {
		acc[curr.key] = curr;
		return acc;
	}, {} as { [key: string]: EditorDefinition });

	return (
		<div
			className={`_objectEditor _${(editor.arrayPreviewType ?? 'LIST').replace(/\s/, '_')}`}
			onClick={onPopup}
		>
			{value?.length ? (
				value.map(v => {
					const storeExtractor = new StoreExtractor(v, 'Value.');
					return (
						<div className="_eachObject" key={JSON.stringify(v)}>
							{editor.arrayPreviewList?.map(key => {
								let control = <></>;
								const value = storeExtractor.getValue(
									`Value.${previewFields?.[key]?.valueKey}`,
								);
								if (previewFields?.[key]?.type === EditorType.IMAGE) {
									control = (
										<img src={value} className="_eachObjectImage" key={key} />
									);
								} else if (previewFields?.[key]?.type === EditorType.BOOLEAN) {
									control = (
										<ToggleButton value={value} key={key} onChange={() => {}} />
									);
								} else {
									control = <span>{value}</span>;
								}

								return (
									<div key={key} className="_eachField">
										{control}
									</div>
								);
							})}
						</div>
					);
				})
			) : (
				<div className="_empty">Empty</div>
			)}
		</div>
	);
}
