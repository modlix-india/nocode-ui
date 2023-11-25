import React from 'react';
import { PageStoreExtractor } from '../../context/StoreContext';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { HelperComponent } from '../HelperComponent';
import { IconHelper } from '../util/IconHelper';
import useDefinition from '../util/useDefinition';
import GridStyle from './FillerDefinitionEditorStyle';
import {
	propertiesDefinition,
	stylePropertiesDefinition,
} from './fillerDefinitionEditorProperties';
import { styleDefaults } from './fillerDefinitionEditorStyleProperties';

function FillerDefinitionEditor(props: ComponentProps) {
	const { definition, pageDefinition, locationHistory, context } = props;
	const {
		definition: { bindingPath },
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		stylePropertiesWithPseudoStates,
		properties: { onSave } = {},
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	const resolvedStyles = processComponentStylePseudoClasses(
		props.pageDefinition,
		{},
		stylePropertiesWithPseudoStates,
	);

	return (
		<div className={`comp compFillerDefinitionEditor`} style={resolvedStyles.comp ?? {}}>
			<HelperComponent key={`${key}_hlp`} definition={definition} />
		</div>
	);
}

const component: Component = {
	name: 'FillerDefinitionEditor',
	displayName: 'Filler Definition Editor',
	description: 'Filler Definition Editor Component',
	component: FillerDefinitionEditor,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: GridStyle,
	styleDefaults: styleDefaults,
	stylePseudoStates: [],
	styleProperties: stylePropertiesDefinition,
	bindingPaths: {
		bindingPath: { name: 'Filler Definition' },
	},
	defaultTemplate: {
		key: '',
		name: 'Filler Definition Editor',
		type: 'FillerDefinitionEditor',
	},
	subComponentDefinition: [
		{
			name: '',
			displayName: 'Component',
			description: 'Component',
			mainComponent: true,
			icon: (
				<IconHelper viewBox="0 0 24 24">
					<g id="Group_103" data-name="Group 103" transform="translate(-1042 -254)">
						<g id="Group_69" data-name="Group 69" transform="translate(-234 2)">
							<path
								id="Path_141"
								data-name="Path 141"
								d="M16.553,20v2.166H5V20Z"
								transform="translate(1279.447 236.418)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
							<path
								id="Path_149"
								data-name="Path 149"
								d="M21,20v2.166H5V20Z"
								transform="translate(1302.166 251) rotate(90)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
							<path
								id="Path_142"
								data-name="Path 142"
								d="M16.553,20v2.166H5V20Z"
								transform="translate(1279.447 240.751)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
							<path
								id="Path_143"
								data-name="Path 143"
								d="M16.553,20v2.166H5V20Z"
								transform="translate(1279.447 245.083)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
							<path
								id="Path_144"
								data-name="Path 144"
								d="M16.553,20v2.166H5V20Z"
								transform="translate(1279.447 249.415)"
								fill="currentColor"
								fillOpacity={0.2}
							/>
						</g>
						<path
							id="Path_249"
							data-name="Path 249"
							d="M14.554,15.025l4.46-4.46a1.5,1.5,0,0,1,2.341,0,1.5,1.5,0,0,1,0,2.341l-4.46,4.46ZM16.3,17.7l-1.929.214A.331.331,0,0,1,14,17.553l.214-1.929Z"
							transform="translate(1039.653 254)"
							fill="currentColor"
						/>
					</g>
				</IconHelper>
			),
		},
	],
};

export default component;
