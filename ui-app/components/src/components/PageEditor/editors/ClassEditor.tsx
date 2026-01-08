import React, { useEffect, useState } from 'react';
import { SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData,
} from '../../../context/StoreContext';
import {
	ComponentPropertyEditor,
	LocationHistory,
	PageDefinition,
	StyleClassDefinition,
} from '../../../types/common';
import { duplicate } from '@fincity/kirun-js';
import { shortUUID } from '../../../util/shortUUID';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';
import { processStyleFromString } from '../../../util/styleProcessor';
import { PageOperations } from '../functions/PageOperations';

interface ClassEditorProps {
	selectedComponent: string;
	pageExtractor: PageStoreExtractor;
	defPath: string | undefined;
	locationHistory: Array<LocationHistory>;
	theme: string;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	storePaths: Set<string>;
	onShowCodeEditor: (eventName: string) => void;
	slaveStore: any;
	editPageName: string | undefined;
	pageOperations: PageOperations;
}

function updateDefinition(
	defPath: string | undefined,
	locationHistory: Array<LocationHistory>,
	pageExtractor: PageStoreExtractor,
	key: string,
	styleClassDefinition: StyleClassDefinition | undefined,
) {
	if (!defPath) return;

	const pageDef = duplicate(
		getDataFromPath(defPath, locationHistory, pageExtractor),
	) as PageDefinition;

	if (!pageDef.properties) pageDef.properties = {};
	if (!pageDef.properties.classes) pageDef.properties.classes = {};
	if (!styleClassDefinition) delete pageDef.properties.classes[key];
	else pageDef.properties.classes[key] = styleClassDefinition;

	setData(defPath, pageDef, pageExtractor.getPageName());
}

export default function ClassEditor({
	selectedComponent,
	defPath,
	locationHistory,
	pageExtractor,
	onChangePersonalization,
	theme,
	personalizationPath,
	storePaths,
	onShowCodeEditor,
	slaveStore,
	editPageName,
	pageOperations,
}: ClassEditorProps) {
	const [classes, setClasses] = useState<{ [key: string]: StyleClassDefinition }>({});
	const [pageDef, setPageDef] = useState<PageDefinition>();
	const [filter, setFilter] = useState<string>('');
	const [isDragging, setIsDragging] = useState<boolean>(false);

	useEffect(() => {
		if (!defPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v: PageDefinition) => {
				setClasses(v.properties?.classes ?? {});
				setPageDef(v);
			},
			defPath,
		);
	}, [defPath, selectedComponent]);

	useEffect(() => {
		if (!personalizationPath) return;
		setFilter(
			getDataFromPath(personalizationPath, locationHistory, pageExtractor)?.classFilterText ??
				'',
		);
	}, [personalizationPath]);

	useEffect(() => {
		if (!personalizationPath) return;

		return addListenerAndCallImmediately(
			pageExtractor.getPageName(),
			(_, v) => setIsDragging(v ?? false),
			`${personalizationPath}.propertyTabCurrentState`,
		);
	}, [personalizationPath]);

	const updateDefCurry = (key: string, styleClassDefinition: StyleClassDefinition | undefined) =>
		updateDefinition(defPath, locationHistory, pageExtractor, key, styleClassDefinition);

	const filterUpper = filter.toUpperCase();

	return (
		<div className={`_propertyEditor ${isDragging ? '_withDragProperty' : ''}`}>
			<div className="_overflowContainer">
				<div className="_eachProp">
					<div className="_propLabel">FILTER:</div>
					<div className="_pvEditor">
						<div className="_pvValueEditor">
							<input
								type="text"
								className="_peInput"
								value={filter}
								onChange={ev => setFilter(ev.target.value)}
								onBlur={() => onChangePersonalization('classFilterText', filter)}
							/>
						</div>
					</div>
				</div>
				<div className="_eachProp">
					<button
						className="_addSelector"
						onClick={() => {
							const key = shortUUID();
							updateDefCurry(key, { key });
						}}
					>
						+ Selector
					</button>
				</div>
				{Object.entries(classes)
					.filter(e => {
						if (!filter || !e[1].selector) return true;
						return e[1].selector?.toUpperCase()?.includes(filterUpper);
					})
					.map(eClass => {
						return (
							<div className="_eachStyleClass" key={eClass[1].key}>
								<div className="_eachProp" key="selector">
									<div className="_propLabel" title="Selector">
										Selector Name
										<div className="_tooltip" title="CSS Selector Name">
											<svg
												width="11"
												height="11"
												viewBox="0 0 11 11"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													opacity="0.4"
													d="M5.49967 0C2.46223 0 0 2.46223 0 5.49967C0 8.53711 2.46223 11 5.49967 11C8.53711 11 11 8.53711 11 5.49967C11 2.46223 8.53711 0 5.49967 0ZM5.49967 2.02776C5.97314 2.02776 6.35757 2.41152 6.35757 2.88499C6.35757 3.35847 5.97314 3.74224 5.49967 3.74224C5.0262 3.74224 4.64243 3.35847 4.64243 2.88499C4.64243 2.41152 5.0262 2.02776 5.49967 2.02776ZM5.49967 4.31394C5.7092 4.31394 5.91766 4.39732 6.06477 4.53999C6.21188 4.68265 6.29576 4.88296 6.2928 5.08328V8.20291C6.29579 8.40514 6.21043 8.60722 6.06081 8.75017C5.91118 8.89312 5.69927 8.97528 5.48777 8.97224C5.28024 8.9693 5.07587 8.88459 4.93126 8.74224C4.78666 8.59989 4.7036 8.40135 4.70654 8.20291V5.08328C4.70359 4.88296 4.78812 4.68265 4.93523 4.53999C5.08234 4.39732 5.29014 4.31394 5.49967 4.31394Z"
													fill="#8E90A4"
												/>
											</svg>
										</div>
										<svg
											width="10"
											height="12"
											viewBox="0 0 10 12"
											fill="none"
											xmlns="http://www.w3.org/2000/svg"
											tabIndex={0}
											onClick={() => updateDefCurry(eClass[1].key, undefined)}
										>
											<g opacity="0.4">
												<path
													d="M9.47869 1.09029H6.07745V0.983634C6.07745 0.438487 5.63896 0 5.09382 0C4.54867 0 4.11018 0.438487 4.11018 0.983634V1.09029H0.708944C0.42452 1.09029 0.1875 1.32731 0.1875 1.61174C0.1875 1.89616 0.42452 2.13318 0.708944 2.13318H9.47869C9.76311 2.13318 10.0001 1.89616 10.0001 1.61174C10.0001 1.32731 9.76311 1.09029 9.47869 1.09029Z"
													fill="#8E90A4"
												/>
												<path
													d="M9.09935 2.84424H1.08807C0.981415 2.84424 0.898458 2.93905 0.910309 3.04571L1.82284 10.3341C1.89394 10.8555 2.33243 11.2585 2.86572 11.2585H7.3217C7.855 11.2585 8.29349 10.8674 8.36459 10.3341L9.27712 3.04571C9.28897 2.93905 9.20601 2.84424 9.09935 2.84424Z"
													fill="#8E90A4"
												/>
											</g>
										</svg>
									</div>
									<PropertyValueEditor
										pageDefinition={pageDef}
										propDef={{
											name: 'selector',
											displayName: 'Selector',
											description: 'CSS Selector',
											schema: SCHEMA_STRING_COMP_PROP,
										}}
										value={{ value: eClass[1].selector }}
										onlyValue={true}
										storePaths={storePaths}
										onChange={v => {
											updateDefCurry(eClass[1].key, {
												...eClass[1],
												selector: v.value ?? '',
											});
										}}
										onShowCodeEditor={onShowCodeEditor}
										editPageName={editPageName}
										slaveStore={slaveStore}
										pageOperations={pageOperations}
									/>
								</div>
								<div className="_eachProp" key="style">
									<div className="_propLabel" title="Style">
										Style
										<div className="_tooltip" title="CSS Style">
											<svg
												width="11"
												height="11"
												viewBox="0 0 11 11"
												fill="none"
												xmlns="http://www.w3.org/2000/svg"
											>
												<path
													opacity="0.4"
													d="M5.49967 0C2.46223 0 0 2.46223 0 5.49967C0 8.53711 2.46223 11 5.49967 11C8.53711 11 11 8.53711 11 5.49967C11 2.46223 8.53711 0 5.49967 0ZM5.49967 2.02776C5.97314 2.02776 6.35757 2.41152 6.35757 2.88499C6.35757 3.35847 5.97314 3.74224 5.49967 3.74224C5.0262 3.74224 4.64243 3.35847 4.64243 2.88499C4.64243 2.41152 5.0262 2.02776 5.49967 2.02776ZM5.49967 4.31394C5.7092 4.31394 5.91766 4.39732 6.06477 4.53999C6.21188 4.68265 6.29576 4.88296 6.2928 5.08328V8.20291C6.29579 8.40514 6.21043 8.60722 6.06081 8.75017C5.91118 8.89312 5.69927 8.97528 5.48777 8.97224C5.28024 8.9693 5.07587 8.88459 4.93126 8.74224C4.78666 8.59989 4.7036 8.40135 4.70654 8.20291V5.08328C4.70359 4.88296 4.78812 4.68265 4.93523 4.53999C5.08234 4.39732 5.29014 4.31394 5.49967 4.31394Z"
													fill="#8E90A4"
												/>
											</svg>
										</div>
									</div>
									<PropertyValueEditor
										pageDefinition={pageDef}
										propDef={{
											name: 'style',
											displayName: 'Style',
											description: 'CSS Style',
											schema: SCHEMA_STRING_COMP_PROP,
											editor: ComponentPropertyEditor.LARGE_TEXT,
										}}
										value={{ value: eClass[1].style }}
										onlyValue={true}
										storePaths={storePaths}
										onChange={v => {
											if (eClass[1].selector?.indexOf('@') != -1) {
												updateDefCurry(eClass[1].key, {
													...eClass[1],
													style: v.value ?? '',
												});
												return;
											}

											let style = Object.entries(
												processStyleFromString((v.value ?? '').trim()),
											)
												.map(e => e[0] + ': ' + e[1])
												.join(';\n');
											if (!style.endsWith(';')) style += ';';
											updateDefCurry(eClass[1].key, {
												...eClass[1],
												style,
											});
										}}
										onShowCodeEditor={onShowCodeEditor}
										editPageName={editPageName}
										slaveStore={slaveStore}
										pageOperations={pageOperations}
									/>
								</div>
							</div>
						);
					})}
			</div>
		</div>
	);
}
