import React from 'react';
import { HelperComponent } from '../HelperComponent';
import { ComponentProperty, DataLocation, RenderContext } from '../../types/common';
import { renderChildren } from '../util/renderChildren';
import { getData, PageStoreExtractor } from '../../context/StoreContext';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './gridProperties';
import GridStyle from './GridStyle';
import useDefinition from '../util/useDefinition';
import { Link } from 'react-router-dom';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

interface GridProps extends React.Component {
	definition: any;
	pageDefinition: any;
	context: RenderContext;
	locationHistory: Array<DataLocation | string>;
	properties: {
		readonly: ComponentProperty<boolean>;
	};
}

function Grid(props: GridProps) {
	const [hover, setHover] = React.useState(false);
	const [focus, setFocus] = React.useState(false);
	const {
		definition,
		pageDefinition,
		locationHistory,
		context,
		properties: { readonly } = {},
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	// const isReadOnly = getData(readonly, locationHistory, pageExtractor);
	// context.isReadonly = isReadOnly;
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { readOnly: isReadonly = false, linkPath, target },
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const childs = renderChildren(
		pageDefinition,
		definition.children,
		{ ...context, isReadonly },
		locationHistory,
	);
	const resolvedStyles = processComponentStylePseudoClasses(
		{ focus, hover, disabled: isReadonly },
		stylePropertiesWithPseudoStates,
	);
	return linkPath ? (
		<div className="comp compGrid">
			<HelperComponent definition={definition} />
			<Link
				className="anchorGrid"
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
				onFocus={stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined}
				onBlur={stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined}
				to={linkPath}
				target={target}
				style={resolvedStyles.comp ?? {}}
			>
				{childs}
			</Link>
		</div>
	) : (
		<div
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			onFocus={stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined}
			onBlur={stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined}
			className="comp compGrid noAnchorGrid"
			style={resolvedStyles.comp ?? {}}
		>
			<HelperComponent definition={definition} />
			{childs}
		</div>
	);
}

const component: Component = {
	name: 'Grid',
	displayName: 'Grid',
	description: 'Grid component',
	component: Grid,
	propertyValidation: (props: GridProps): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
};

export default component;
