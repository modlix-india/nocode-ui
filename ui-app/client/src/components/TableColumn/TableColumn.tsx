import React, { useState } from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import Children from '../Children';
import { HelperComponent } from '../HelperComponents/HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import { propertiesDefinition, stylePropertiesDefinition } from './tableCloumnProperties';
import TableColumnStyle from './TableColumnStyle';
import { styleDefaults } from './tableColumnStyleProperties';

function TableColumnComponent(props: ComponentProps) {
	const {
		definition: { children },
		pageDefinition,
		locationHistory = [],
		context,
		definition,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const { stylePropertiesWithPseudoStates } = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const [hover, setHover] = useState(false);
	let entry = Object.entries(children ?? {}).find(([, v]) => v);

	const firstchild: any = {};
	if (entry) firstchild[entry[0]] = true;

	const styleProperties = processComponentStylePseudoClasses(
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	return (
		<div
			className="comp compTableColumn"
			style={styleProperties.comp}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
		>
			<HelperComponent context={props.context} definition={definition} />
			<Children
				pageDefinition={pageDefinition}
				renderableChildren={firstchild}
				context={context}
				locationHistory={locationHistory}
			/>
		</div>
	);
}

const component: Component = {
	name: 'TableColumn',
	displayName: 'Table Column',
	description: 'Table Column component',
	component: TableColumnComponent,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: TableColumnStyle,
	styleDefaults: styleDefaults,
	allowedChildrenType: new Map<string, number>([['', 1]]),
	parentType: 'TableColumns',
	stylePseudoStates: ['hover'],
	styleProperties: stylePropertiesDefinition,
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<rect
						x="2"
						y="5"
						width="9"
						height="14"
						rx="2"
						fill="currentColor"
						fillOpacity="0.2"
					/>
					<rect
						x="1.00195"
						y="1.84766"
						width="21.9967"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="10.3076"
						width="21.9967"
						height="3.38411"
						rx="0.4"
						fill="currentColor"
					/>
					<rect
						x="1.00195"
						y="18.769"
						width="21.9967"
						height="3.38411"
						rx="1"
						fill="currentColor"
					/>
					<rect
						x="4.38672"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 4.38672 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="13.8594"
						y="3.53955"
						width="18.6126"
						height="3.38411"
						transform="rotate(90 13.8594 3.53955)"
						fill="currentColor"
					/>
					<rect
						x="23"
						y="3.53955"
						width="16.9205"
						height="3.38411"
						transform="rotate(90 23 3.53955)"
						fill="currentColor"
					/>
				</IconHelper>
			),
		},
		{
			name: 'leftIcon',
			displayName: 'left Icon',
			description: 'left icon',
			icon: 'fa-solid fa-box',
		},
		{
			name: 'rightIcon',
			displayName: 'right Icon',
			description: 'right icon',
			icon: 'fa-solid fa-box',
		},
	],
};

export default component;
