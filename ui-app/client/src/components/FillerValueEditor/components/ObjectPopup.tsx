import React, { useCallback, useEffect, useState } from 'react';
import { EditorDefinition, EditorType, Filler } from './fillerCommons';
import { Popup } from './Popup';
import { deepEqual, duplicate, isNullValue } from '@fincity/kirun-js';
import { setStoreData, StoreExtractor } from '@fincity/path-reactive-state-management';
import ToggleButton from './ToggleButton';
import { Dots, Pencil, Trash } from './FillerValueEditorIcons';
import { Editor } from './Editor';
import { Dropdown } from './Dropdown';
import Text from './Text';
import { ImageEditor } from './ImageEditor';
import ImagePopup from './ImagePoup';

export default function ObjectPopup({
	editor,
	dataPath,
	isUIFiller,
	uiFiller,
	coreFiller,
	onClose,
	onValueChanged,
}: Readonly<{
	editor?: EditorDefinition;
	dataPath: string;
	isUIFiller: boolean;
	uiFiller: Filler;
	coreFiller: Filler;
	onClose: () => void;
	onValueChanged: (isUIFiller: boolean, filler: Filler) => void;
}>) {
	const [arrayObject, setArrayObject] = useState<any[]>([]);

	useEffect(() => {
		const storeExtractor = new StoreExtractor(isUIFiller ? uiFiller : coreFiller, 'Filler.');
		const value = storeExtractor.getValue(dataPath);
		setArrayObject(value);
	}, [dataPath, isUIFiller, uiFiller, coreFiller]);

	const [selected, setSelected] = useState<any[]>([]);

	useEffect(() => {
		if (!editor?.sampleObjects) {
			setSelected([]);
			return;
		}

		const newSelected: any[] = [];

		for (const sampleObject of editor.sampleObjects) {
			const index = arrayObject.findIndex(e => deepEqual(e, sampleObject));
			newSelected.push({ object: duplicate(sampleObject), selected: index !== -1 });
		}

		setSelected(newSelected);
	}, [arrayObject, setSelected, editor?.sampleObjects]);

	const onChange = useCallback(
		(v: any[]) => {
			const newFiller = duplicate(isUIFiller ? uiFiller : coreFiller);
			setStoreData(
				dataPath,
				newFiller,
				v,
				'Filler',
				new Map([['Filler.', new StoreExtractor(newFiller, 'Filler.')]]),
			);
			onValueChanged(isUIFiller, newFiller);
		},
		[isUIFiller, uiFiller, coreFiller, onValueChanged, dataPath],
	);
	const [tabNum, setTabNum] = useState<number>(0);

	const tabs = ['Selected', 'Edit/Rearrange', 'Add new'];

	if (!editor?.sampleObjects) tabs.splice(0, 1);

	let tabContent: React.JSX.Element = <></>;
	let tabButtons: React.JSX.Element = <></>;

	const [newObject, setNewObject] = useState<any>({});
	const [updateObject, setUpdateObject] = useState<any>();
	const [updateObjectIndex, setUpdateObjectIndex] = useState<number>(-1);
	const [showImagePopup, setShowImagePopup] = useState<string | undefined>(undefined);
	const [showImagePopupNewObject, setShowImagePopupNewObject] = useState<string | undefined>(
		undefined,
	);

	let imagePopup = <></>;

	if (showImagePopup || showImagePopupNewObject)
		imagePopup = (
			<ImagePopup
				onClose={() => {
					setShowImagePopup(undefined);
					setShowImagePopupNewObject(undefined);
				}}
				onSimpleValueChanged={img => {
					const newUpdateObject = duplicate(showImagePopup ? updateObject : newObject);
					const strExtr = new StoreExtractor(newUpdateObject, 'Value.');
					setStoreData(
						`Value.${showImagePopup ?? showImagePopupNewObject}`,
						newUpdateObject,
						img,
						'Value',
						new Map([['Value.', strExtr]]),
					);
					if (showImagePopup) setUpdateObject(newUpdateObject);
					else setNewObject(newUpdateObject);
				}}
			/>
		);

	if (editor?.sampleObjects && tabNum === 0) {
		tabButtons = (
			<>
				<button
					className="_button"
					onClick={() => {
						const newArrayObject = duplicate(arrayObject);
						for (const e of selected) {
							const index = newArrayObject.findIndex((n: any) =>
								deepEqual(n, e.object),
							);
							if (!e.selected && index !== -1) newArrayObject.splice(index, 1);
							else if (e.selected && index === -1)
								newArrayObject.push(duplicate(e.object));
						}
						setArrayObject(newArrayObject);
						setTabNum(1);
					}}
				>
					Update Selected
				</button>
				<button
					className="_button"
					onClick={() => {
						setNewObject({});
						setTabNum(tabs.length - 1);
					}}
				>
					+ Add Custom
				</button>
			</>
		);

		const previewFields = editor.objectEditors?.reduce((acc, curr) => {
			acc[curr.key] = curr;
			return acc;
		}, {} as { [key: string]: EditorDefinition });

		tabContent = (
			<>
				{selected.map((e, i) => {
					const storeExtractor = new StoreExtractor(e.object, 'Value.');

					return (
						<div
							key={JSON.stringify(e)}
							className="_eachObject"
							onClick={() => {
								const newSelected = duplicate(selected);
								newSelected[i].selected = !e.selected;
								setSelected(newSelected);
							}}
						>
							<input
								type="checkbox"
								checked={e.selected}
								onChange={() => {
									const newSelected = duplicate(selected);
									newSelected[i].selected = !e.selected;
									setSelected(newSelected);
								}}
							/>
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
				})}
			</>
		);
	} else if (
		(editor?.sampleObjects && tabNum === 1) ||
		(!editor?.sampleObjects && tabNum === 0)
	) {
		const previewFields = editor?.objectEditors?.reduce((acc, curr) => {
			acc[curr.key] = curr;
			return acc;
		}, {} as { [key: string]: EditorDefinition });

		if (isNullValue(updateObject)) {
			tabButtons = (
				<>
					<button className="_button" onClick={() => onChange(arrayObject)}>
						Save Re-arranged
					</button>
					<button
						className="_button"
						onClick={() => {
							setNewObject({});
							setTabNum(tabs.length - 1);
						}}
					>
						+ Add Custom
					</button>
				</>
			);
			tabContent = (
				<>
					{arrayObject.map((e, i) => {
						const storeExtractor = new StoreExtractor(e, 'Value.');

						return (
							<div
								key={JSON.stringify(e)}
								className="_eachObject"
								draggable={true}
								onDragStart={e => {
									e.dataTransfer.setData('text/plain', `REORDER_${i}`);
								}}
								onDragOver={e => e.preventDefault()}
								onDrop={e => {
									const data = e.dataTransfer.getData('text/plain');
									if (!data.startsWith('REORDER_')) return;
									const index = parseInt(data.substring(8));
									if (index === i) return;
									const newArrayObject = duplicate(arrayObject);
									newArrayObject.splice(i, 0, newArrayObject.splice(index, 1)[0]);
									setArrayObject(newArrayObject);
								}}
							>
								<div className="_controlGrid">
									<Dots />
									<div
										onClick={() => {
											setUpdateObject(duplicate(e));
											setUpdateObjectIndex(i);
										}}
									>
										<Pencil />
									</div>
									<div
										onClick={() => {
											const newArrayObject = duplicate(arrayObject);
											newArrayObject.splice(i, 1);
											setArrayObject(newArrayObject);
										}}
									>
										<Trash />
									</div>
								</div>
								{editor?.arrayPreviewList?.map(key => {
									let control = <></>;
									const value = storeExtractor.getValue(
										`Value.${previewFields?.[key]?.valueKey}`,
									);
									if (previewFields?.[key]?.type === EditorType.IMAGE) {
										control = (
											<img
												src={value}
												className="_eachObjectImage"
												key={key}
											/>
										);
									} else if (previewFields?.[key]?.type === EditorType.BOOLEAN) {
										control = (
											<ToggleButton
												value={value}
												key={key}
												onChange={() => {}}
											/>
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
					})}
				</>
			);
		} else {
			const newUpdateObject = duplicate(updateObject);
			const strExtr = new StoreExtractor(newUpdateObject, 'Value.');
			tabButtons = (
				<>
					<button
						className="_button"
						onClick={() => {
							const newArrayObject = duplicate(arrayObject);
							newArrayObject[updateObjectIndex] = newUpdateObject;
							setArrayObject(newArrayObject);
							setUpdateObject(undefined);
							setUpdateObjectIndex(-1);
						}}
					>
						Update
					</button>
					<button
						className="_button"
						onClick={() => {
							setUpdateObject(undefined);
							setUpdateObjectIndex(-1);
						}}
					>
						Cancel
					</button>
				</>
			);
			tabContent = (
				<div className="_sectionBody">
					{editor?.objectEditors?.map(ed => {
						let editorControl: React.JSX.Element | undefined = undefined;
						const onChangeLocal = (v: any) => {
							setStoreData(
								`Value.${ed.valueKey}`,
								newUpdateObject,
								v,
								'Value',
								new Map([['Value.', strExtr]]),
							);
							setUpdateObject(newUpdateObject);
						};
						const value = strExtr.getValue(`Value.${ed.valueKey}`);
						if (ed.type === EditorType.LABEL) {
							editorControl = <div className="_editorLabel">{value ?? ed.name}</div>;
						} else if (ed.type === EditorType.BOOLEAN) {
							editorControl = (
								<ToggleButton value={!!value} onChange={onChangeLocal} />
							);
						} else if (ed.type === EditorType.IMAGE) {
							editorControl = (
								<ImageEditor
									onPopup={() => setShowImagePopup(ed.valueKey)}
									value={value}
									onDelete={onChangeLocal}
								/>
							);
						} else if (ed.type === EditorType.TEXT_BOX) {
							editorControl = (
								<Text
									value={value}
									onChange={onChangeLocal}
									maxChars={ed.maxLength}
									allowedRegex={ed.regex}
								/>
							);
						} else if (ed.type === EditorType.TEXT_AREA) {
							editorControl = (
								<Text
									value={value}
									onChange={onChangeLocal}
									maxChars={ed.maxLength}
									allowedRegex={ed.regex}
									isTextArea={true}
								/>
							);
						} else if (ed.type === EditorType.ENUM) {
							editorControl = (
								<Dropdown
									hideNone={ed.enumHideNone ?? false}
									value={value}
									onChange={onChangeLocal}
									options={ed.enumOptions ?? []}
								/>
							);
						}
						const label = ed.hideLabel ? (
							<></>
						) : (
							<div className="_editorLabel">{ed.name}</div>
						);

						return (
							<div className="_editor" key={ed.key}>
								{label}
								{editorControl}
							</div>
						);
					})}
				</div>
			);
		}
	} else {
		tabButtons = (
			<>
				<button
					className="_button"
					onClick={() => {
						setArrayObject([...arrayObject, newObject]);
						setNewObject({});
						setTabNum(editor?.sampleObjects ? 1 : 0);
					}}
				>
					Save
				</button>

				<button
					className="_button"
					onClick={() => {
						setNewObject({});
						setTabNum(editor?.sampleObjects ? 1 : 0);
					}}
				>
					Cancel
				</button>
			</>
		);
		const newNewObject = duplicate(newObject);
		const strExtr = new StoreExtractor(newNewObject, 'Value.');

		tabContent = (
			<div className="_sectionBody">
				{editor?.objectEditors?.map(ed => {
					let editorControl: React.JSX.Element | undefined = undefined;
					const onChangeLocal = (v: any) => {
						setStoreData(
							`Value.${ed.valueKey}`,
							newNewObject,
							v,
							'Value',
							new Map([['Value.', strExtr]]),
						);
						setNewObject(newNewObject);
					};
					const value = strExtr.getValue(`Value.${ed.valueKey}`);
					if (ed.type === EditorType.LABEL) {
						editorControl = <div className="_editorLabel">{value ?? ed.name}</div>;
					} else if (ed.type === EditorType.BOOLEAN) {
						editorControl = <ToggleButton value={!!value} onChange={onChangeLocal} />;
					} else if (ed.type === EditorType.IMAGE) {
						editorControl = (
							<ImageEditor
								onPopup={() => setShowImagePopupNewObject(ed.valueKey)}
								value={value}
								onDelete={onChangeLocal}
							/>
						);
					} else if (ed.type === EditorType.TEXT_BOX) {
						editorControl = (
							<Text
								value={value}
								onChange={onChangeLocal}
								maxChars={ed.maxLength}
								allowedRegex={ed.regex}
							/>
						);
					} else if (ed.type === EditorType.TEXT_AREA) {
						editorControl = (
							<Text
								value={value}
								onChange={onChangeLocal}
								maxChars={ed.maxLength}
								allowedRegex={ed.regex}
								isTextArea={true}
							/>
						);
					} else if (ed.type === EditorType.ENUM) {
						editorControl = (
							<Dropdown
								hideNone={ed.enumHideNone ?? false}
								value={value}
								onChange={onChangeLocal}
								options={ed.enumOptions ?? []}
							/>
						);
					}
					const label = ed.hideLabel ? (
						<></>
					) : (
						<div className="_editorLabel">{ed.name}</div>
					);

					return (
						<div className="_editor" key={ed.key}>
							{label}
							{editorControl}
						</div>
					);
				})}
			</div>
		);
	}
	return (
		<>
			<Popup onClose={() => onClose()}>
				<div
					className="_flexBox _column _browserBack _tabContainer"
					onClick={e => e.stopPropagation()}
				>
					<i className="_closeIcon fa fa-solid fa-times" onClick={() => onClose()} />
					<div className="_tabHeader">
						{tabs.map((e, i) => (
							<div
								key={e}
								className={`_tabTitle ${tabNum == i ? '_selected' : ''}`}
								onClick={() => setTabNum(i)}
							>
								{e}
							</div>
						))}
					</div>
					<div
						className={`_tab _${(editor?.arrayPreviewType ?? 'LIST').replace(
							/\s/,
							'_',
						)}`}
					>
						{tabContent}
					</div>
					<div className="_tabDivider"></div>
					<div className="_tabFooter">{tabButtons}</div>
				</div>
			</Popup>
			{imagePopup}
		</>
	);
}
