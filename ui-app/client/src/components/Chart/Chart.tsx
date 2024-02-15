import React from 'react';
import {
	PageStoreExtractor,
	addListenerAndCallImmediately,
	getPathFromLocation,
} from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import SubPageStyle from './ChartStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './chartProperties';
import { styleDefaults } from './chartStyleProperties';
import { isNullValue } from '@fincity/kirun-js';

function Chart(props: Readonly<ComponentProps>) {
	const {
		definition,
		locationHistory,
		context,
		definition: { bindingPath, children },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		stylePropertiesWithPseudoStates,
		properties: {
			hideGrid,
			colorScheme,
			chartType,
			data,
			dataColors,
			xAxisType,
			xAxisLabels,
			xAxisLabelsSort,
			xAxisMin,
			xAxisSuggestedMin,
			xAxisMax,
			xAxisSuggestedMax,
			xAxisReverse,
			xAxisHideTicks,
			xAxisHideLabels,
			xAxisDataPath,
			hideXAxis,
			yAxisType,
			yAxisLabels,
			yAxisLabelsSort,
			yAxisMin,
			yAxisSuggestedMin,
			yAxisMax,
			yAxisSuggestedMax,
			yAxisReverse,
			yAxisHideTicks,
			yAxisHideLabels,
			yAxisDataPath,
			hideYAxis,
			stackedAxis,
			xAxisStartPosition,
			yAxisStartPosition,
			legendPosition,
			xAxisTitle,
			yAxisTitle,
			pointType,
			yAxisDataStyle,
			invertAxis,
		} = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [value, setValue] = React.useState<any>(undefined);

	const bindingPathPath = bindingPath
		? getPathFromLocation(bindingPath, locationHistory, pageExtractor)
		: undefined;

	React.useEffect(() => {
		if (!bindingPathPath) return;
		return addListenerAndCallImmediately(
			(_, v) => {
				if (isNullValue(v)) {
					setValue(undefined);
					return;
				}
				setValue(v);
			},
			pageExtractor,
			bindingPathPath,
		);
	}, [bindingPathPath]);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className="comp compChart" style={resolvedStyles.comp ?? {}}>
			<HelperComponent context={props.context} definition={definition} />
		</div>
	);
}

const component: Component = {
	name: 'Chart',
	displayName: 'Chart',
	description: 'Chart component',
	component: Chart,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	styleComponent: SubPageStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	bindingPaths: {
		bindingPath: { name: 'Selection Binding' },
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 22 24">
					<g id="Group_109" data-name="Group 109" transform="translate(-1387 -336.204)">
						<rect
							id="Rectangle_38"
							data-name="Rectangle 38"
							width="22"
							height="22"
							rx="1"
							transform="translate(1387 338)"
							fill="currentColor"
							fillOpacity="0.2"
						/>
						<rect
							id="Rectangle_39"
							data-name="Rectangle 39"
							width="15"
							height="2"
							rx="0.4"
							transform="translate(1391.5 342.796) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_40"
							data-name="Rectangle 40"
							width="17"
							height="2"
							rx="0.4"
							transform="translate(1389.5 355.796)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_41"
							data-name="Rectangle 41"
							width="9.452"
							height="1.718"
							rx="0.4"
							transform="translate(1394.993 344.876) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_42"
							data-name="Rectangle 42"
							width="6.391"
							height="1.718"
							rx="0.4"
							transform="translate(1401.978 347.937) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_43"
							data-name="Rectangle 43"
							width="3.867"
							height="1.718"
							rx="0.4"
							transform="translate(1398.485 350.461) rotate(90)"
							fill="currentColor"
						/>
						<rect
							id="Rectangle_44"
							data-name="Rectangle 44"
							width="18.124"
							height="1.718"
							rx="0.4"
							transform="translate(1405.471 336.204) rotate(90)"
							fill="currentColor"
						/>
					</g>
				</IconHelper>
			),
		},
	],
};

export default component;
