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
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { SubHelperComponent } from '../SubHelperComponent';

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
			label,
			isMultiSelect,
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

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;

	const handleClick = async (each: { key: any; label: any; value: any }) => {
		if (!each) return;
		if (isMultiSelect) {
			const index = !value ? -1 : value.findIndex((e: any) => deepEqual(e, each.value));
			let nv = value ? [...value] : [];
			if (index != -1) nv.splice(index, 1);
			else nv.push(each.value);
			setData(bindingPathPath!, nv.length ? nv : undefined, context?.pageName);
		} else {
			setData(bindingPathPath!, each.value, context?.pageName);
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
		<div className="comp compButtonBar" style={resolvedStyles.comp ?? {}}>
			<HelperComponent definition={props.definition} />

			<label style={resolvedStyles.label ?? {}} className="_label">
				<SubHelperComponent definition={props.definition} subComponentName="label" />
				{getTranslations(label, translations)}
			</label>

			<div className="_buttonBarContainer" style={resolvedStyles.container ?? {}}>
				<SubHelperComponent definition={props.definition} subComponentName="container" />
				{buttonBarData?.map(each => (
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
						}`}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="button"
						/>
						{getTranslations(each?.label, translations)}
					</button>
				))}
			</div>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-grip',
	name: 'ButtonBar',
	displayName: 'ButtonBar',
	description: 'ButtonBar component',
	component: ButtonBar,
	styleComponent: ButtonBarStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	stylePseudoStates: ['hover', 'disabled'],
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
		},
	},
};

export default component;
