import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import SectionGridStyle from './SectionGridStyle';
import { propertiesDefinition, stylePropertiesDefinition } from './sectionGridProperties';
import { styleDefaults } from './sectionGridStyleProperties';

function SectionGrid(props: ComponentProps) {
	const [hover, setHover] = React.useState(false);
	const [focus, setFocus] = React.useState(false);

	const { definition, pageDefinition, locationHistory, context } = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { containerType, layout, enableChildrenSelection } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const childs = (
		<Children
			key={`${key}_chld`}
			pageDefinition={pageDefinition}
			renderableChildren={definition.children}
			context={{ ...context, disableSelection: !enableChildrenSelection }}
			locationHistory={locationHistory}
		/>
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ focus, hover },
		stylePropertiesWithPseudoStates,
	);

	return React.createElement(
		containerType.toLowerCase(),
		{
			onMouseEnter: stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined,

			onMouseLeave: stylePropertiesWithPseudoStates?.hover
				? () => setHover(false)
				: undefined,

			onFocus: stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined,

			onBlur: stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined,

			className: `comp compSectionGrid _noAnchorGrid _${layout}`,
			style: resolvedStyles.comp ?? {},
			id: key,
		},
		[
			<HelperComponent context={props.context} key={`${key}_hlp`} definition={definition} />,
			childs,
		],
	);
}

const component: Component = {
	name: 'SectionGrid',
	displayName: 'Section Grid',
	description: 'Section Grid component',
	component: SectionGrid,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: SectionGridStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: ['hover', 'focus'],
	allowedChildrenType: new Map<string, number>([['', -1]]),
	styleProperties: stylePropertiesDefinition,
	defaultTemplate: {
		key: '',
		name: 'Section Grid',
		type: 'SectionGrid',
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 30 30">
					<rect
						x="0"
						y="0"
						rx={1}
						ry={1}
						width="14"
						height="14"
						className="_SectionGridBlock1"
						fill="#FF557E"
					/>

					<rect
						x="16"
						y="0"
						rx={1}
						ry={1}
						width="14"
						height="14"
						className="_SectionGridBlock2"
						fill="#FF557E"
					/>

					<rect
						x="0"
						y="16"
						rx={1}
						ry={1}
						width="14"
						height="14"
						className="_SectionGridBlock3"
						fill="#FF557E"
					/>

					<rect
						x="16"
						y="16"
						rx={1}
						ry={1}
						width="14"
						height="14"
						className="_SectionGridBlock4"
						fill="#FF557E"
					/>
				</IconHelper>
			),
		},
	],
};

export default component;
