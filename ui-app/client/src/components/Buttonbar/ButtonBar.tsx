import React from 'react';
import { deepEqual } from '@fincity/kirun-js';
import {
	addListenerAndCallImmediately,
	getPathFromLocation,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { getRenderData } from '../util/getRenderData';
import { getSelectedKeys } from '../util/getSelectedKeys';
import { runEvent } from '../util/runEvent';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './buttonBarproperties';
import ButtonBarStyle from './ButtonBarStyle';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../HelperComponents/SubHelperComponent';
import { styleDefaults } from './buttonBarStyleProperties';
import { IconHelper } from '../util/IconHelper';

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
			readOnly,
			data,
			isMultiSelect,
			colorScheme,
			buttonBarDesign,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [hover, setHover] = React.useState('');
	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover: !!hover, readOnly: !!readOnly },
		stylePropertiesWithPseudoStates,
	);
	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	const [value, setvalue] = React.useState<any>();

	const clickEvent = onClick ? props.pageDefinition.eventFunctions?.[onClick] : undefined;

	const handleClick = async (each: { key: any; label: any; value: any }) => {
		if (!each || !bindingPathPath) return;
		if (isMultiSelect) {
			const index = !value ? -1 : value.findIndex((e: any) => deepEqual(e, each.value));
			let nv = value ? [...value] : [];
			if (index != -1) nv.splice(index, 1);
			else nv.push(each.value);
			setData(bindingPathPath!, nv.length ? nv : undefined, context?.pageName);
		} else {
			setData(
				bindingPathPath!,
				deepEqual(each.value, value) ? undefined : each.value,
				context?.pageName,
			);
		}
		if (clickEvent) {
			await runEvent(
				clickEvent,
				key,
				context.pageName,
				props.locationHistory,
				props.pageDefinition,
			);
		}
	};

	React.useEffect(() => {
		if (!bindingPathPath) return;
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

	const selectedDataKey: Array<any> | string | undefined = React.useMemo(
		() => getSelectedKeys(buttonBarData, value, isMultiSelect),
		[buttonBarData, value],
	);

	const getIsSelected = (key: any) => {
		if (!isMultiSelect) return deepEqual(selectedDataKey, key);
		if (Array.isArray(selectedDataKey))
			return !!selectedDataKey.find((e: any) => deepEqual(e, key));
		return false;
	};

	return (
		<div
			className={`comp compButtonBar ${buttonBarDesign} ${colorScheme}`}
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent definition={props.definition} />
			{buttonBarData?.map((each, i, arr) => (
				<button
					style={resolvedStyles.button ?? {}}
					key={each?.key}
					onMouseEnter={
						stylePropertiesWithPseudoStates?.hover
							? () => setHover(each?.key)
							: undefined
					}
					onMouseLeave={
						stylePropertiesWithPseudoStates?.hover ? () => setHover('') : undefined
					}
					onClick={() => (!readOnly && each ? handleClick(each) : undefined)}
					className={`_button ${getIsSelected(each?.key) ? '_selected' : ''} ${
						readOnly ? '_disabled' : ''
					} ${i == 0 ? '_firstChild' : ''} ${i + 1 == arr.length ? '_lastChild' : ''}`}
				>
					<SubHelperComponent definition={props.definition} subComponentName="button" />
					{getTranslations(each?.label, translations)}
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
	styleDefaults: styleDefaults,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'disabled', 'active'],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Array Binding' },
	},
	defaultTemplate: {
		key: '',
		name: 'buttonBar',
		type: 'ButtonBar',
		properties: {
			label: { value: 'ButtonBar' },
			data: {
				location: {
					type: 'EXPRESSION',
					expression: 'SampleDataStore.radioOptions',
				},
			},
		},
	},
	sections: [{ name: 'ButtonBar', pageName: 'buttonbar' }],
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="15.0879"
						y="14.4531"
						width="7.41176"
						height="7.41176"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="8.91211"
						y="9.51172"
						width="9.88235"
						height="9.88235"
						rx="2"
						fill="currentColor"
						fillOpacity="0.4"
					/>
					<rect
						x="1.5"
						y="2.1001"
						width="14.8235"
						height="14.8235"
						rx="2"
						fill="currentColor"
					/>
				</IconHelper>
			),
			mainComponent: true,
		},
		{
			name: 'label',
			displayName: 'Label',
			description: 'Label',
			icon: 'fa-solid fa-font',
		},
		{
			name: 'container',
			displayName: 'Container',
			description: 'Container',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'button',
			displayName: 'Button',
			description: 'Button',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
