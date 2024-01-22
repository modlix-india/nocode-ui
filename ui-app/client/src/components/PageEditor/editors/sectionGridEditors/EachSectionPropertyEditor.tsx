import React, { useEffect, useState } from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
} from '../../../../context/StoreContext';
import { ComponentProperty, PageDefinition } from '../../../../types/common';
import { PageOperations } from '../../functions/PageOperations';
import { duplicate, isNullValue } from '@fincity/kirun-js';
import PropertyValueEditor from '../propertyValueEditors/PropertyValueEditor';
import { SCHEMA_BOOL_COMP_PROP, SCHEMA_STRING_COMP_PROP } from '../../../../constants';
import { SectionProperty, SectionPropertyValueType } from './common';
import { shortUUID } from '../../../../util/shortUUID';

export function EachSectionPropertyEditor({
	property,
	onChange,
	onDroppedOn,
	personalizationPath,
	onChangePersonalization,
	pageExtractor,
	pageDef,
	pageOperations,
	editPageName,
	slaveStore,
	parentProps = [],
}: {
	property: SectionProperty;
	onChange: (prop: SectionProperty, deleteProperty?: boolean) => void;
	onDroppedOn: (fromKey: string, toKey: string) => void;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	pageExtractor: PageStoreExtractor;
	pageDef: PageDefinition;
	pageOperations: PageOperations;
	editPageName: string | undefined;
	slaveStore: any;
	parentProps?: SectionProperty[];
}) {
	const [state, setState] = useState(true);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setState(!isNullValue(v) ? v : true),
			pageExtractor,
			`${personalizationPath}.propertyEditor.sectionGridPropertyEditor.${property.key}`,
		);
	}, [personalizationPath]);

	const deleteButton = (
		<svg
			width="12"
			height="15"
			viewBox="0 0 17 19"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			onClick={() => onChange(property, true)}
		>
			<path
				d="M6.1654 2.56406L5.47835 3.5625H10.7217L10.0346 2.56406C9.98036 2.48672 9.88996 2.4375 9.79232 2.4375H6.40406C6.30643 2.4375 6.21603 2.4832 6.16179 2.56406H6.1654ZM11.481 1.62891L12.8081 3.5625H13.3071H15.0429H15.3321C15.8131 3.5625 16.2 3.93867 16.2 4.40625C16.2 4.87383 15.8131 5.25 15.3321 5.25H15.0429V15.9375C15.0429 17.4914 13.7483 18.75 12.15 18.75H4.05C2.4517 18.75 1.15714 17.4914 1.15714 15.9375V5.25H0.867857C0.38692 5.25 0 4.87383 0 4.40625C0 3.93867 0.38692 3.5625 0.867857 3.5625H1.15714H2.89286H3.39188L4.71897 1.62539C5.09504 1.08047 5.72786 0.75 6.40406 0.75H9.79232C10.4685 0.75 11.1013 1.08047 11.4774 1.62539L11.481 1.62891ZM2.89286 5.25V15.9375C2.89286 16.5598 3.40996 17.0625 4.05 17.0625H12.15C12.79 17.0625 13.3071 16.5598 13.3071 15.9375V5.25H2.89286ZM5.78571 7.5V14.8125C5.78571 15.1219 5.52536 15.375 5.20714 15.375C4.88893 15.375 4.62857 15.1219 4.62857 14.8125V7.5C4.62857 7.19063 4.88893 6.9375 5.20714 6.9375C5.52536 6.9375 5.78571 7.19063 5.78571 7.5ZM8.67857 7.5V14.8125C8.67857 15.1219 8.41821 15.375 8.1 15.375C7.78179 15.375 7.52143 15.1219 7.52143 14.8125V7.5C7.52143 7.19063 7.78179 6.9375 8.1 6.9375C8.41821 6.9375 8.67857 7.19063 8.67857 7.5ZM11.5714 7.5V14.8125C11.5714 15.1219 11.3111 15.375 10.9929 15.375C10.6746 15.375 10.4143 15.1219 10.4143 14.8125V7.5C10.4143 7.19063 10.6746 6.9375 10.9929 6.9375C11.3111 6.9375 11.5714 7.19063 11.5714 7.5Z"
				fill="currentColor"
			/>
		</svg>
	);
	const tabName = 'sectionGridPropertyEditor';

	let groupContent = <></>;

	if (state) {
		// value: any;

		// objectProperties?: SectionProperty[];
		// arrayItemProperty?: SectionProperty;
		const storePaths = new Set<string>();
		const nameProperty =
			parentProps.length &&
			parentProps[parentProps.length - 1].valueType === SectionPropertyValueType.OBJECT ? (
				<div className="_eachProp">
					<div className="_propLabel">Name</div>
					<PropertyValueEditor
						pageDefinition={pageDef}
						propDef={{
							name: 'name',
							displayName: 'Name',
							schema: SCHEMA_STRING_COMP_PROP,
						}}
						onlyValue={true}
						value={{ value: property.name } as ComponentProperty<string>}
						onChange={v => onChange({ ...property, name: v.value })}
						slaveStore={slaveStore}
						storePaths={storePaths}
						editPageName={editPageName}
						pageOperations={pageOperations}
					/>
				</div>
			) : (
				<></>
			);
		const changeComponentProperty = (i: number, prop: any) => {
			const x = duplicate(property.componentProperties);
			x[i] = { ...x[i], ...prop };
			onChange({ ...property, componentProperties: x });
		};

		let objectProps = <></>;
		let arrayProps = <></>;

		if (property.valueType === SectionPropertyValueType.OBJECT) {
			objectProps = (
				<div className="_eachProp">
					<div className="_propLabel">
						Object Properties:{' '}
						<i
							className="fa fa-solid fa-plus"
							onClick={() => {
								const prop = duplicate(property);
								if (!prop.objectProperties?.length) prop.objectProperties = [];
								prop.objectProperties.push({
									key: shortUUID(),
									label: 'New Property',
									order: 0,
									valueType: SectionPropertyValueType.STRING,
								});
								onChange(prop);
							}}
						/>
					</div>
					<div className="_propValue _padding">
						{property.objectProperties?.map((e, i) => (
							<EachSectionPropertyEditor
								key={e.key}
								property={e}
								onChange={(prop, deleteProp) => {
									const x = duplicate(property) as SectionProperty;
									if (deleteProp) x.objectProperties?.splice(i, 1);
									else x.objectProperties![i] = prop;
									onChange(x);
								}}
								onDroppedOn={(fromKey, toKey) => {
									const props = property.objectProperties!;
									const fromIndex = props.findIndex(e => e.key === fromKey);
									const toIndex = props.findIndex(e => e.key === toKey);
									if (fromIndex === -1 || toIndex === -1) return;
									const newProps = [...props];
									newProps.splice(toIndex, 0, newProps.splice(fromIndex, 1)[0]);
									newProps.forEach((e, i) => (e.order = i));
									const x = duplicate(property);
									x.objectProperties = newProps;
									onChange(x);
								}}
								personalizationPath={personalizationPath}
								onChangePersonalization={onChangePersonalization}
								pageExtractor={pageExtractor}
								pageDef={pageDef!}
								pageOperations={pageOperations}
								editPageName={editPageName}
								slaveStore={slaveStore}
								parentProps={[...parentProps, property]}
							/>
						))}
					</div>
				</div>
			);
		} else if (property.valueType === SectionPropertyValueType.ARRAY) {
			arrayProps = (
				<div className="_eachProp">
					<div className="_propLabel">Array Item Property: </div>
					<div className="_propValue _padding">
						<EachSectionPropertyEditor
							key={property.arrayItemProperty?.key}
							property={
								property.arrayItemProperty ?? {
									key: shortUUID(),
									label: 'New Property',
									order: 0,
									valueType: SectionPropertyValueType.STRING,
									value: undefined,
								}
							}
							onChange={(prop, deleteProp) => {
								const x = duplicate(property) as SectionProperty;
								if (deleteProp) x.arrayItemProperty = undefined;
								else x.arrayItemProperty = prop;
								onChange(x);
							}}
							onDroppedOn={(fromKey, toKey) => {}}
							personalizationPath={personalizationPath}
							onChangePersonalization={onChangePersonalization}
							pageExtractor={pageExtractor}
							pageDef={pageDef!}
							pageOperations={pageOperations}
							editPageName={editPageName}
							slaveStore={slaveStore}
							parentProps={[...parentProps, property]}
						/>
					</div>
				</div>
			);
		}

		groupContent = (
			<>
				<div className="_eachProp">
					<div className="_propLabel">Label</div>
					<PropertyValueEditor
						pageDefinition={pageDef}
						propDef={{
							name: 'label',
							displayName: 'Label',
							schema: SCHEMA_STRING_COMP_PROP,
						}}
						onlyValue={true}
						value={{ value: property.label } as ComponentProperty<string>}
						onChange={v => onChange({ ...property, label: v.value })}
						slaveStore={slaveStore}
						storePaths={storePaths}
						editPageName={editPageName}
						pageOperations={pageOperations}
					/>
				</div>
				<div className="_eachProp">
					<div className="_propLabel">Hide Label</div>
					<PropertyValueEditor
						pageDefinition={pageDef}
						propDef={{
							name: 'hideLabel',
							displayName: 'Hide Label',
							schema: SCHEMA_BOOL_COMP_PROP,
						}}
						onlyValue={true}
						value={{ value: property.hideLabel } as ComponentProperty<boolean>}
						onChange={v => onChange({ ...property, hideLabel: v.value })}
						slaveStore={slaveStore}
						storePaths={storePaths}
						editPageName={editPageName}
						pageOperations={pageOperations}
					/>
				</div>
				<div className="_eachProp">
					<div className="_propLabel">Value Type</div>
					<PropertyValueEditor
						pageDefinition={pageDef}
						propDef={{
							name: 'valueType',
							displayName: 'Value Type',
							schema: SCHEMA_STRING_COMP_PROP,
							defaultValue: 'STRING',
							enumValues: [
								{ name: 'STRING', displayName: 'String' },
								{ name: 'NUMBER', displayName: 'Number' },
								{ name: 'BOOLEAN', displayName: 'Boolean' },
								{ name: 'COLOR', displayName: 'Color' },
								{ name: 'FONT', displayName: 'Font' },
								{ name: 'IMAGE', displayName: 'Image' },
								{ name: 'ICON', displayName: 'Icon' },
								{ name: 'ARRAY', displayName: 'Array' },
								{ name: 'OBJECT', displayName: 'Object' },
								{ name: 'LINK', displayName: 'Link' },
							],
						}}
						onlyValue={true}
						value={{ value: property.valueType } as ComponentProperty<any>}
						onChange={v => onChange({ ...property, valueType: v.value })}
						slaveStore={slaveStore}
						storePaths={storePaths}
						editPageName={editPageName}
						pageOperations={pageOperations}
					/>
				</div>
				{nameProperty}
				<div className="_eachProp">
					<div className="_propLabel">
						Components:
						<i
							className="fa fa-solid fa-plus"
							onClick={() =>
								onChange({
									...property,
									componentProperties: [
										...(property.componentProperties ?? []),
										{ componentKey: '', propertyName: '' },
									],
								})
							}
						/>
					</div>
					{(property.componentProperties ?? []).map((e, i) => (
						<div
							className="_propValue _flexBox _column _gap10"
							key={`${e.componentKey}_${i}`}
						>
							<div className="_flexBox _verticalCenter _gap10">
								<div
									className={`_microToggle2 _withText ${
										e.isStyleProperty ? '_on' : '_off'
									}`}
									tabIndex={0}
									onKeyDown={inpE =>
										inpE.key === ' '
											? changeComponentProperty(i, {
													isStyleProperty: !e.isStyleProperty,
											  })
											: undefined
									}
									onClick={() =>
										changeComponentProperty(i, {
											isStyleProperty: !e.isStyleProperty,
										})
									}
								>
									{e.isStyleProperty ? 'Style' : 'Component'}
								</div>
								<svg
									width="12"
									height="14"
									viewBox="0 0 17 19"
									fill="none"
									xmlns="http://www.w3.org/2000/svg"
									onClick={() => {
										const x = duplicate(property);
										x.componentProperties.splice(i, 1);
										onChange(x);
									}}
								>
									<path
										d="M6.1654 2.56406L5.47835 3.5625H10.7217L10.0346 2.56406C9.98036 2.48672 9.88996 2.4375 9.79232 2.4375H6.40406C6.30643 2.4375 6.21603 2.4832 6.16179 2.56406H6.1654ZM11.481 1.62891L12.8081 3.5625H13.3071H15.0429H15.3321C15.8131 3.5625 16.2 3.93867 16.2 4.40625C16.2 4.87383 15.8131 5.25 15.3321 5.25H15.0429V15.9375C15.0429 17.4914 13.7483 18.75 12.15 18.75H4.05C2.4517 18.75 1.15714 17.4914 1.15714 15.9375V5.25H0.867857C0.38692 5.25 0 4.87383 0 4.40625C0 3.93867 0.38692 3.5625 0.867857 3.5625H1.15714H2.89286H3.39188L4.71897 1.62539C5.09504 1.08047 5.72786 0.75 6.40406 0.75H9.79232C10.4685 0.75 11.1013 1.08047 11.4774 1.62539L11.481 1.62891ZM2.89286 5.25V15.9375C2.89286 16.5598 3.40996 17.0625 4.05 17.0625H12.15C12.79 17.0625 13.3071 16.5598 13.3071 15.9375V5.25H2.89286ZM5.78571 7.5V14.8125C5.78571 15.1219 5.52536 15.375 5.20714 15.375C4.88893 15.375 4.62857 15.1219 4.62857 14.8125V7.5C4.62857 7.19063 4.88893 6.9375 5.20714 6.9375C5.52536 6.9375 5.78571 7.19063 5.78571 7.5ZM8.67857 7.5V14.8125C8.67857 15.1219 8.41821 15.375 8.1 15.375C7.78179 15.375 7.52143 15.1219 7.52143 14.8125V7.5C7.52143 7.19063 7.78179 6.9375 8.1 6.9375C8.41821 6.9375 8.67857 7.19063 8.67857 7.5ZM11.5714 7.5V14.8125C11.5714 15.1219 11.3111 15.375 10.9929 15.375C10.6746 15.375 10.4143 15.1219 10.4143 14.8125V7.5C10.4143 7.19063 10.6746 6.9375 10.9929 6.9375C11.3111 6.9375 11.5714 7.19063 11.5714 7.5Z"
										fill="#96A1B4"
									/>
								</svg>
							</div>
							<div className="_flexBox _gap10">
								<input
									className="_peInput"
									type="text"
									placeholder="Component Key"
									value={e.componentKey}
									onChange={inpE =>
										changeComponentProperty(i, {
											componentKey: inpE.target.value,
										})
									}
								/>
								<input
									className="_peInput"
									type="text"
									placeholder="Property Name"
									value={e.propertyName}
									onChange={inpE =>
										changeComponentProperty(i, {
											propertyName: inpE.target.value,
										})
									}
								/>
							</div>
						</div>
					))}
				</div>
				{objectProps}
				{arrayProps}
			</>
		);
	}

	return (
		<div
			draggable
			className={`_propertyGroup ${state ? '_opened' : '_closed'}`}
			onDragStart={e =>
				e.dataTransfer.setData('SectionProp', `SectionPropKey_${property.key}`)
			}
			onDragOver={e => {
				e.preventDefault();
				e.stopPropagation();
			}}
			onDrop={e => {
				const key = e.dataTransfer.getData('SectionProp');
				if (!key || !key.startsWith('SectionPropKey_')) return;
				const dgin = key.split('_')[1];
				onDroppedOn(dgin, property.key);
			}}
		>
			<div
				className="_propertyGroupHeader"
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ')
						onChangePersonalization(
							`propertyEditor.${tabName}.${property.key}`,
							!state,
						);
				}}
				onClick={() =>
					onChangePersonalization(`propertyEditor.${tabName}.${property.key}`, !state)
				}
				onDoubleClick={() =>
					onChangePersonalization(`propertyEditor.${tabName}`, undefined)
				}
			>
				{property.label}
				<span className="_propertyGroupHeaderIcon">
					{deleteButton}
					{state ? '-' : '+'}
				</span>
			</div>
			<div className="_propertyGroupContent">{groupContent}</div>
		</div>
	);
}
