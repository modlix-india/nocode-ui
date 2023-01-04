import React from 'react';
import { getData, PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { Link as RouterLink } from 'react-router-dom';
import { getTranslations } from '../util/getTranslations';
import {
	DataLocation,
	ComponentProperty,
	RenderContext,
	ComponentPropertyDefinition,
	ComponentProps,
} from '../../types/common';
import { Component } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './linkProperties';
import LinkStyle from './LinkStyle';
import useDefinition from '../util/useDefinition';

function Link(props: ComponentProps) {
	const {
		pageDefinition: { translations },
		definition,
		locationHistory,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const {
		key,
		properties: {
			linkPath,
			label,
			target = '_self',
			showButton,
			externalButtonTarget = '_blank',
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);

	return (
		<div className="comp compLinks ">
			<HelperComponent definition={definition} />
			<div className="linkDiv">
				<RouterLink className="link" to={`${linkPath}`} target={target}>
					{getTranslations(label, translations)}
				</RouterLink>
				{showButton ? (
					<RouterLink
						to={`${linkPath}`}
						target={externalButtonTarget}
						className="secondLink"
					>
						<i className="fa-solid fa-up-right-from-square"></i>
					</RouterLink>
				) : null}
			</div>
		</div>
	);
}

const component: Component = {
	name: 'Link',
	displayName: 'Link',
	description: 'Link component',
	component: Link,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: LinkStyle,
};

export default component;
