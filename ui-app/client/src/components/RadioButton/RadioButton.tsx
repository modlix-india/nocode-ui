import { deepEqual } from '@fincity/kirun-js';
import React, { useEffect, useState } from 'react';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { getRenderData } from '../util/getRenderData';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { getTranslations } from '../util/getTranslations';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './radioButtonProperties';
import RadioButtonStyle from './RadioButtonStyle';

function RadioButton(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const {
		definition: { bindingPath },
		locationHistory,
		context,
		definition,
		pageDefinition: { translations },
	} = props;
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: {
			orientation,
			labelKey,
			uniqueKey,
			selectionKey,
			labelKeyType,
			selectionType,
			uniqueKeyType,
			onClick,
			datatype,
			data,
			placeholder,
			readOnly,
			label,
			closeOnMouseLeave,
			isMultiSelect,
			isSearchable,
			noFloat,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const radioButtonData = React.useMemo(
		() =>
			getRenderData(
				data,
				datatype,
				uniqueKeyType,
				uniqueKey,
				selectionType,
				selectionKey,
				labelKeyType,
				labelKey,
			),
		[
			data,
			datatype,
			uniqueKeyType,
			uniqueKey,
			selectionType,
			selectionKey,
			labelKeyType,
			labelKey,
		],
	);

	const [selected, setSelected] = useState<any>();

	const resolvedStyles = processComponentStylePseudoClasses(
		{ disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	useEffect(() => {
		if (!bindingPathPath) return;

		return addListenerAndCallImmediately(
			(_, value) => {
				setSelected(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const handleClick = (each: { key: any; label: any; value: any } | undefined) => {
		let newSelection;
		if (!each || !bindingPathPath) return;

		if (isMultiSelect && Array.isArray(selected)) {
			newSelection = selected.find((e: any) => deepEqual(e, each.value));
			if (newSelection) {
				setData(
					bindingPathPath,
					selected.filter(e => !deepEqual(e, each.value)).length > 0
						? selected.filter(e => !deepEqual(e, each.value))
						: undefined,
					context.pageName,
				);
				return;
			}
		}
		setData(
			bindingPathPath,
			isMultiSelect ? (selected ? [...selected, each.value] : [each.value]) : each.value,
			context?.pageName,
		);
	};

	const selectedDataKey: Array<any> | string | undefined = React.useMemo(
		() => getSelectedKeys(radioButtonData, selected, isMultiSelect),
		[selected],
	);

	const getIsSelected = (key: any) => {
		if (!isMultiSelect) return deepEqual(selectedDataKey, key);
		if (Array.isArray(selectedDataKey))
			return !!selectedDataKey.find((e: any) => deepEqual(e, key));
		return false;
	};

	return (
		<div className="comp compRadioButton">
			<HelperComponent definition={definition} />
			{radioButtonData?.map((e: any) => (
				<label
					className={`checkbox ${orientation === 'VERTICAL' ? 'vertical' : 'horizontal'}`}
					htmlFor={key}
					key={e.key}
				>
					<CommonCheckbox
						isChecked={getIsSelected(e.key)}
						onChange={() => handleClick(e)}
						showAsRadio={!isMultiSelect}
						isReadOnly={readOnly}
					/>

					{getTranslations(e.label, translations)}
				</label>
			))}
		</div>
	);
}

const component: Component = {
	name: 'RadioButton',
	displayName: 'RadioButton',
	description: 'RadioButton component',
	component: RadioButton,
	styleComponent: RadioButtonStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
};

export default component;
