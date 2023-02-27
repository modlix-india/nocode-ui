import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListener,
	addListenerAndCallImmediately,
	getData,
	getDataFromLocation,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { ComponentProps, ComponentPropertyDefinition } from '../../types/common';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './checkBoxProperties';
import CheckBoxStyle from './CheckBoxStyle';
import CommonCheckbox from '../../commonComponents/CommonCheckbox';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function CheckBox(props: ComponentProps) {
	const [checkBoxdata, setCheckBoxData] = useState(false);
	const [hover, setHover] = useState(false);
	const [focus, setFocus] = useState(false);
	const {
		pageDefinition: { translations },
		definition: { bindingPath },
		locationHistory,
		definition,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: { label, readOnly, orientation } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	if (!bindingPath) return <>Binding Path Required</>;
	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);
	useEffect(() => {
		return addListenerAndCallImmediately(
			(_, value) => {
				setCheckBoxData(!!value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPath]);
	const resolvedStyles = processComponentStylePseudoClasses(
		{ hover, focus, disabled: readOnly },
		stylePropertiesWithPseudoStates,
	);
	const handleChange = (event: any) => {
		console.log(event.target.checked, bindingPathPath);
		setData(bindingPathPath, event.target.checked, context.pageName);
	};
	return (
		<div className="comp compCheckBox" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={definition} />
			<label
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
				style={resolvedStyles.label ?? {}}
				className={`checkbox ${orientation === 'VERTICAL' ? 'vertical' : 'horizontal'}`}
				htmlFor={key}
			>
				<CommonCheckbox
					isChecked={checkBoxdata}
					isReadOnly={readOnly}
					id={key}
					onChange={handleChange}
					styles={resolvedStyles.checkbox ?? {}}
					focusHandler={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined
					}
					blurHandler={
						stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined
					}
				/>
				{getTranslations(label, translations)}
			</label>
		</div>
	);
}

const component: Component = {
	name: 'CheckBox',
	displayName: 'CheckBox',
	description: 'CheckBox component',
	styleComponent: CheckBoxStyle,
	component: CheckBox,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Data Binding' },
	},
};

export default component;
