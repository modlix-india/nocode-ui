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
			children={definition.children}
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
				<IconHelper viewBox="0 0 25 25">
					<path
						className="_SectionGridBlock1"
						d="M0 10.9091H10.9091V-3.33786e-05H0.800001C0.358173 -3.33786e-05 0 0.358139 0 0.799967V10.9091Z"
						fill="url(#paint0_linear_3818_9724)"
					/>
					<path
						className="_SectionGridBlock4"
						d="M24.5469 13.6356L13.6378 13.6356L13.6378 24.5447H23.7469C24.1887 24.5447 24.5469 24.1865 24.5469 23.7447L24.5469 13.6356Z"
						fill="url(#paint1_linear_3818_9724)"
					/>
					<path
						className="_SectionGridBlock3"
						d="M0 13.6356L10.9091 13.6356L10.9091 24.5447H0.800001C0.358173 24.5447 0 24.1865 0 23.7447L0 13.6356Z"
						fill="url(#paint2_linear_3818_9724)"
					/>
					<path
						className="_SectionGridBlock2"
						d="M24.5469 10.9091L13.6378 10.9091L13.6378 -3.33786e-05L23.7469 -3.33786e-05C24.1887 -3.33786e-05 24.5469 0.358139 24.5469 0.799967L24.5469 10.9091Z"
						fill="url(#paint3_linear_3818_9724)"
					/>
					<defs>
						<linearGradient
							id="paint0_linear_3818_9724"
							x1="5.45455"
							y1="10.9091"
							x2="5.45455"
							y2="-3.33786e-05"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F6C0CD" />
							<stop offset="1" stopColor="#FBA1B7" />
						</linearGradient>
						<linearGradient
							id="paint1_linear_3818_9724"
							x1="19.0923"
							y1="13.6356"
							x2="19.0923"
							y2="24.5447"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F6C0CD" />
							<stop offset="1" stopColor="#FBA1B7" />
						</linearGradient>
						<linearGradient
							id="paint2_linear_3818_9724"
							x1="5.45455"
							y1="13.6356"
							x2="5.45455"
							y2="24.5447"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F6C0CD" />
							<stop offset="1" stopColor="#FBA1B7" />
						</linearGradient>
						<linearGradient
							id="paint3_linear_3818_9724"
							x1="19.0923"
							y1="10.9091"
							x2="19.0923"
							y2="-3.33786e-05"
							gradientUnits="userSpaceOnUse"
						>
							<stop stopColor="#F6C0CD" />
							<stop offset="1" stopColor="#FBA1B7" />
						</linearGradient>
					</defs>
				</IconHelper>
			),
		},
	],
};

export default component;
