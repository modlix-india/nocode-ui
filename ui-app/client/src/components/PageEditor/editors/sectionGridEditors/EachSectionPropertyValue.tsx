import React, { useEffect, useState } from 'react';
import { SectionProperty, SectionPropertyValueType } from './common';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
} from '../../../../context/StoreContext';
import { PageDefinition } from '../../../../types/common';
import { duplicate, isNullValue } from '@fincity/kirun-js';
import StringValueEditor from './StringValueEditor';
import BooleanValueEditor from './BooleanValueEditor';

export default function EachSectionPropertyValue({
	property,
	personalizationPath,
	onChangePersonalization,
	pageExtractor,
	onChange,
	noHeader = false,
	isSimpleValueType = false,
}: {
	property: SectionProperty;
	personalizationPath: string | undefined;
	onChangePersonalization: (prop: string, value: any) => void;
	pageExtractor: PageStoreExtractor;
	onChange: (prop: SectionProperty) => void;
	noHeader?: boolean;
	isSimpleValueType: boolean;
}) {
	const [state, setState] = useState(true);

	useEffect(() => {
		if (!personalizationPath) return;
		return addListenerAndCallImmediately(
			(_, v) => setState(!isNullValue(v) ? v : true),
			pageExtractor,
			`${personalizationPath}.propertyEditor.sectionPropertyValue.${property.key}`,
		);
	}, [personalizationPath]);

	let groupContent = <></>;

	if (state) {
		if (property.valueType === SectionPropertyValueType.STRING || !property.valueType) {
			groupContent = (
				<StringValueEditor
					label={property.hideLabel ? '' : property.label}
					value={isSimpleValueType ? property.value : property.value?.value}
					onChange={str =>
						onChange({ ...property, value: isSimpleValueType ? str : { value: str } })
					}
				/>
			);
		} else if (property.valueType === SectionPropertyValueType.BOOLEAN) {
			groupContent = (
				<BooleanValueEditor
					label={property.label}
					value={isSimpleValueType ? property.value : property.value?.value}
					onChange={boolValue =>
						onChange({
							...property,
							value: isSimpleValueType ? boolValue : { value: boolValue },
						})
					}
				/>
			);
		} else if (property.valueType === SectionPropertyValueType.NUMBER) {
			groupContent = (
				<StringValueEditor
					label={property.label}
					value={isSimpleValueType ? property.value : property.value?.value}
					onChange={str =>
						onChange({
							...property,
							value: isSimpleValueType ? parseInt(str) : { value: parseInt(str) },
						})
					}
				/>
			);
		} else if (property.valueType === SectionPropertyValueType.OBJECT) {
			const obj: { [key: string]: SectionProperty } =
				property.objectProperties?.reduce((acc, prop) => {
					acc[prop.name ?? ''] = prop;
					return acc;
				}, {} as any) ?? {};

			groupContent = (
				<div className="_objectProperties">
					{Object.keys(obj).map(key => (
						<EachSectionPropertyValue
							key={key}
							property={{
								...obj[key],
								value: (isSimpleValueType
									? property.value
									: property.value?.value)?.[key],
							}}
							personalizationPath={personalizationPath}
							onChangePersonalization={onChangePersonalization}
							pageExtractor={pageExtractor}
							onChange={x => {
								const val = duplicate(
									(isSimpleValueType ? property.value : property.value?.value) ??
										{},
								);
								val[key] = x.value;
								onChange({
									...property,
									value: isSimpleValueType ? val : { value: val },
								});
							}}
							noHeader={true}
							isSimpleValueType={true}
						/>
					))}
				</div>
			);
		} else if (property.valueType === SectionPropertyValueType.ARRAY) {
			const value = property.value?.value ?? [];

			if (property.arrayItemProperty) {
				groupContent = (
					<div className="_arrayProperties">
						{value.map((v: any, index: number) => (
							<div className="_arrayItem">
								<div className="_arrayItemHeader"></div>
								<EachSectionPropertyValue
									key={index}
									property={{
										...property.arrayItemProperty!,
										value: v,
									}}
									personalizationPath={personalizationPath}
									onChangePersonalization={onChangePersonalization}
									pageExtractor={pageExtractor}
									onChange={x => {
										const inValue = duplicate(property.value?.value ?? []);
										inValue[index] = x.value;
										onChange({ ...property, value: { value: inValue } });
									}}
									noHeader={true}
									isSimpleValueType={true}
								/>
							</div>
						))}
					</div>
				);
			}
		}
	}

	if (noHeader) {
		return (
			<div className="_propertyGroup">
				<div className="_propertyGroupContent">{groupContent}</div>
			</div>
		);
	}

	const arrayAddButton =
		property.valueType === SectionPropertyValueType.ARRAY ? (
			<button
				className="_addArrayItemButton"
				onClick={e => {
					e.stopPropagation();
					e.preventDefault();
					const value = property.value?.value ?? [];
					onChange({ ...property, value: { value: [...value, undefined] } });
				}}
			>
				+ Add
			</button>
		) : (
			<></>
		);

	return (
		<div className={`_propertyGroup ${state ? '_opened' : '_closed'}`}>
			<div
				className="_propertyGroupHeader"
				tabIndex={0}
				onKeyDown={e => {
					if (e.key === 'Enter' || e.key === ' ')
						onChangePersonalization(
							`propertyEditor.sectionPropertyValue.${property.key}`,
							!state,
						);
				}}
				onClick={() =>
					onChangePersonalization(
						`propertyEditor.sectionPropertyValue.${property.key}`,
						!state,
					)
				}
				onDoubleClick={() =>
					onChangePersonalization(`propertyEditor.sectionPropertyValue`, undefined)
				}
			>
				{property.label}
				<span className="_propertyGroupHeaderIcon">
					{arrayAddButton}
					{state ? '-' : '+'}
				</span>
			</div>
			<div className="_propertyGroupContent">{groupContent}</div>
		</div>
	);
}
