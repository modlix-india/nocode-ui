import { isNullValue } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import ComponentDefinitions from '../..';
import { SCHEMA_STRING_COMP_PROP } from '../../../constants';
import {
	PageStoreExtractor,
	addListenerAndCallImmediatelyWithChildrenActivity,
	getDataFromPath,
	setData,
} from '../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentMultiProperty,
	ComponentProperty,
	ComponentPropertyDefinition,
	ComponentPropertyEditor,
	ComponentPropertyGroup,
	LocationHistory,
	PageDefinition,
	StyleClassDefinition,
} from '../../../types/common';
import duplicate from '../../../util/duplicate';
import { PropertyGroup } from './PropertyGroup';
import { ExpressionEditor2 } from './propertyValueEditors/ExpressionEditor2';
import PropertyMultiValueEditor from './propertyValueEditors/PropertyMultiValueEditor';
import PropertyValueEditor from './propertyValueEditors/PropertyValueEditor';
import { shortUUID } from '../../../util/shortUUID';

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
}: ClassEditorProps) {
	const [classes, setClasses] = useState<{ [key: string]: StyleClassDefinition }>({});
	const [pageDef, setPageDef] = useState<PageDefinition>();
	const [filter, setFilter] = useState<string>('');

	useEffect(() => {
		if (!defPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			(_, v: PageDefinition) => {
				setClasses(v.properties?.classes ?? {});
				setPageDef(v);
			},
			pageExtractor,
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

	const updateDefCurry = (key: string, styleClassDefinition: StyleClassDefinition | undefined) =>
		updateDefinition(defPath, locationHistory, pageExtractor, key, styleClassDefinition);

	const filterUpper = filter.toUpperCase();

	return (
		<div className="_propertyEditor">
			<div className="_eachProp">
				<div className="_propLabel">Filter:</div>
				<div className="_pvEditor">
					<div className="_pvValueEditor">
						<input
							type="text"
							className="_peInput"
							value={filter}
							onChange={ev => setFilter(ev.target.value)}
							onBlur={() => onChangePersonalization('classFilterText', filter)}
						/>
						<button
							onClick={() => {
								const key = shortUUID();
								updateDefCurry(key, { key });
							}}
						>
							+ Add Class
						</button>
					</div>
				</div>
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
									Selector Name :
									<span className="_description" title="CSS Selector Name">
										i
									</span>
									<i
										className="fa fa-regular fa-trash-can"
										tabIndex={0}
										onClick={() => updateDefCurry(eClass[1].key, undefined)}
									/>
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
								/>
							</div>
							<div className="_eachProp" key="style">
								<div className="_propLabel" title="Style">
									Style :
									<span className="_description" title="CSS Style">
										i
									</span>
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
										let style = (v.value ?? '').trim();
										let ind = style.indexOf('{');
										if (ind != -1) style = style.substring(ind + 1);
										ind = style.indexOf('}');
										if (ind != -1) style = style.substring(0, ind);
										updateDefCurry(eClass[1].key, {
											...eClass[1],
											style,
										});
									}}
									onShowCodeEditor={onShowCodeEditor}
									editPageName={editPageName}
									slaveStore={slaveStore}
								/>
							</div>
						</div>
					);
				})}
		</div>
	);
}