import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListener,
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
import useDefinition from '../util/useDefinition';

function CheckBox(props: ComponentProps) {
	const [checkBoxdata, setCheckBoxData] = useState(false);
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
		return addListener(
			(_, value) => {
				setCheckBoxData(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPath]);
	const handleChange = (event: any) => {
		setData(bindingPathPath, event.target.checked, context.pageName);
	};
	return (
		<div className="comp compCheckBox">
			<HelperComponent definition={definition} />
			<label
				className={`checkbox ${orientation === 'VERTICAL' ? 'vertical' : 'horizontal'}`}
				htmlFor={key}
			>
				<input
					disabled={readOnly}
					type="checkbox"
					id={key}
					onChange={handleChange}
					checked={checkBoxdata}
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
