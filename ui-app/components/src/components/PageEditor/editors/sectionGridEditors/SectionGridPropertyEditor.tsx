import { duplicate } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import {
	addListenerAndCallImmediatelyWithChildrenActivity,
	setData,
} from '../../../../context/StoreContext';
import {
	ComponentDefinition,
	ComponentStyle,
	EachComponentStyle,
	PageDefinition,
	StyleResolution,
} from '../../../../types/common';
import { shortUUID } from '../../../../util/shortUUID';
import { EachSectionPropertyEditor } from './EachSectionPropertyEditor';
import {
	SectionGridPropertyEditorProps,
	SectionProperty,
	SectionPropertyValueType,
} from './common';
import EachSectionPropertyValue from './EachSectionPropertyValue';

export default function SectionGridPropertyEditor({
	selectedComponent,
	selectedComponentsList,
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
	appPath,
	editorType,
}: SectionGridPropertyEditorProps) {
	const [def, setDef] = useState<ComponentDefinition>();
	const [pageDef, setPageDef] = useState<PageDefinition>();

	useEffect(() => {
		if (!defPath) return;

		return addListenerAndCallImmediatelyWithChildrenActivity(
			pageExtractor.getPageName(),
			(_, v: PageDefinition) => {
				setDef(v.componentDefinition[selectedComponent]);
				setPageDef(v);
			},
			defPath,
		);
	}, [defPath, selectedComponent]);

	if (def?.type !== 'SectionGrid') return <>Please select a section grid</>;

	const onChange = (prop: SectionProperty, deleteProperty?: boolean) => {
		const newPageDef = duplicate(pageDef) as PageDefinition;
		const newDef = newPageDef.componentDefinition[selectedComponent] as ComponentDefinition;
		if (!newDef.properties) newDef.properties = {};
		if (!newDef.properties.sectionProperties) newDef.properties.sectionProperties = {};
		if (!newDef.properties.sectionProperties.value)
			newDef.properties.sectionProperties.value = {};
		const newSectionProperties = newDef.properties.sectionProperties.value;
		if (deleteProperty) delete newSectionProperties[prop.key];
		else newSectionProperties[prop.key] = prop;
		setData(defPath!, newPageDef, pageExtractor.getPageName());
	};

	const onValueChange = (prop: SectionProperty) => {
		const newPageDef = duplicate(pageDef) as PageDefinition;
		const newDef = newPageDef.componentDefinition[selectedComponent] as ComponentDefinition;
		const newSectionProperties = newDef?.properties?.sectionProperties.value;
		if (!newSectionProperties) return;
		newSectionProperties[prop.key] = prop;

		if (prop.componentProperties?.length) {
			prop.componentProperties.forEach((e, i) => {
				const newCompDef = newPageDef.componentDefinition[
					e.componentKey
				] as ComponentDefinition;
				if (!newCompDef) return;
				if (e.isStyleProperty) {
					if (!newCompDef.styleProperties) newCompDef.styleProperties = {};
					let styleProp: EachComponentStyle | undefined = Object.values(
						newCompDef.styleProperties,
					).find(e => !e.condition) as EachComponentStyle;
					if (!styleProp) {
						const id = shortUUID();
						newCompDef.styleProperties[id] = styleProp = {
							resolutions: { [StyleResolution.ALL]: {} },
						};
					}
					if (!styleProp.resolutions![StyleResolution.ALL])
						styleProp.resolutions![StyleResolution.ALL] = {};
					styleProp.resolutions![StyleResolution.ALL][e.propertyName] = prop.value;
				} else {
					if (!newCompDef.properties) newCompDef.properties = {};
					if (!prop.value) delete newCompDef.properties[e.propertyName];
					else newCompDef.properties[e.propertyName] = prop.value;
				}
			});
		}

		setData(defPath!, newPageDef, pageExtractor.getPageName());
	};

	const onDroppedOn = (fromKey: string, toKey: string) => {
		if (fromKey === toKey) return;
		const newPageDef = duplicate(pageDef) as PageDefinition;
		const newDef = newPageDef.componentDefinition[selectedComponent] as ComponentDefinition;
		const fromProp = newDef.properties?.sectionProperties?.value?.[fromKey];
		const toProp = newDef.properties?.sectionProperties?.value?.[toKey];
		if (!fromProp || !toProp) return;
		const props = Object.values(
			(newDef.properties?.sectionProperties?.value ?? {}) as {
				[key: string]: SectionProperty;
			},
		).sort((a, b) => a.order - b.order);
		const fromIndex = props.findIndex(e => e.key === fromKey);
		const toIndex = props.findIndex(e => e.key === toKey);
		if (fromIndex === -1 || toIndex === -1) return;
		const newProps = [...props];
		newProps.splice(toIndex, 0, newProps.splice(fromIndex, 1)[0]);
		newProps.forEach((e, i) => (e.order = i));

		setData(defPath!, newPageDef, pageExtractor.getPageName());
	};

	const propsBody =
		editorType === 'SECTION' ? (
			Object.values(
				(def.properties?.sectionProperties?.value ?? {}) as {
					[key: string]: SectionProperty;
				},
			)
				.sort((a: SectionProperty, b: SectionProperty) => a.order - b.order)
				.map((prop: SectionProperty) => (
					<EachSectionPropertyEditor
						key={prop.key}
						property={prop}
						onChange={onChange}
						onDroppedOn={onDroppedOn}
						personalizationPath={personalizationPath}
						onChangePersonalization={onChangePersonalization}
						pageExtractor={pageExtractor}
						pageDef={pageDef!}
						pageOperations={pageOperations}
						editPageName={editPageName}
						slaveStore={slaveStore}
					/>
				))
		) : (
			<></>
		);

	const addButton =
		editorType === 'SECTION' ? (
			<div className="_addPropertyButtonContainer">
				<button
					onClick={() =>
						onChange({
							key: shortUUID(),
							label: 'New Property',
							order:
								Object.values(
									(def.properties?.sectionProperties?.value ?? {}) as {
										[key: string]: SectionProperty;
									},
								)
									.map(e => e.order)
									.reduce((a, c) => (a > c ? a : c), 0) + 1,
							valueType: SectionPropertyValueType.STRING,
							value: undefined,
						})
					}
				>
					+ Add Property
				</button>
			</div>
		) : (
			<></>
		);

	const valuesBody = Object.values(
		(def.properties?.sectionProperties?.value ?? {}) as { [key: string]: SectionProperty },
	)
		.sort((a: SectionProperty, b: SectionProperty) => a.order - b.order)
		.map((prop: SectionProperty) => (
			<EachSectionPropertyValue
				key={`${prop.key}_value`}
				property={prop}
				personalizationPath={personalizationPath}
				onChangePersonalization={onChangePersonalization}
				pageExtractor={pageExtractor}
				onChange={onValueChange}
				isSimpleValueType={false}
			/>
		));

	return (
		<div className="_propertyEditor">
			<div className="_overflowContainer">
				{propsBody}
				{addButton}
				{valuesBody}
			</div>
		</div>
	);
}
