import React from 'react';
import { deepEqual } from '@fincity/kirun-js';
import {
	addListener,
	addListenerAndCallImmediately,
	getData,
	getDataFromPath,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { SetStore } from '../../functions/SetStore';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getRenderData } from '../util/getRenderData';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './ButtonBarproperties';
import ButtonBarStyle from './ButtonBarStyle';

function ButtonBar(props: ComponentProps) {
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
		properties: {
			labelKey,
			uniqueKey,
			selectionKey,
			labelKeyType,
			selectionType,
			uniqueKeyType,
			onClick,
			datatype,
			visibility,
			readOnly,
			data,
			label,
			isMultiSelect,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	if (!bindingPath) throw new Error('Definition requires binding path');

	const bindingPathPath = getPathFromLocation(bindingPath, locationHistory, pageExtractor);

	const [value, setvalue] = React.useState<any>();

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;

	const handleClick = async (each: { key: any; label: any; value: any }) => {
		if (!each) return;

		if (isMultiSelect) {
			const index = !value ? -1 : value.findIndex((e: any) => deepEqual(e, each.value));
			let nv = value ? [...value] : [];
			if (index != -1) nv.splice(index, 1);
			else nv.push(each.value);
			setData(bindingPathPath, nv.length ? nv : undefined, context?.pageName);
		} else {
			setData(bindingPathPath, each.value, context?.pageName);
		}
	};

	React.useEffect(() => {
		return addListenerAndCallImmediately(
			(_, value) => {
				setvalue(value);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const buttonBarData = React.useMemo(
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

	console.log(buttonBarData);

	const selectedDataKey: Array<any> | string | undefined = React.useMemo(
		() => getSelectedKeys(buttonBarData, value, isMultiSelect),
		[buttonBarData, value],
	);

	const getIsSelected = (key: any) => {
		console.log(selectedDataKey, key);
		if (!isMultiSelect) return deepEqual(selectedDataKey, key);
		if (Array.isArray(selectedDataKey))
			return !!selectedDataKey.find((e: any) => deepEqual(e, key));
		return false;
	};

	return (
		<div className="comp compButtonBar">
			{buttonBarData?.map(each => (
				<button
					key={each?.key}
					onClick={() => each && handleClick(each)}
					className={`_button ${getIsSelected(each?.key) ? '_selected' : ''}`}
				>
					{each?.label}
				</button>
			))}
		</div>
	);
}

const component: Component = {
	name: 'ButtonBar',
	displayName: 'ButtonBar',
	description: 'ButtonBar component',
	component: ButtonBar,
	styleComponent: ButtonBarStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'focus', 'disabled'],
};

export default component;
