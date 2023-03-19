import React from 'react';
import { getData, PageStoreExtractor } from '../../context/StoreContext';
import { HelperComponent } from '../HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../../constants';
import { Link as RouterLink, useLocation } from 'react-router-dom';
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
import { getHref } from '../util/getHref';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';

function Link(props: ComponentProps) {
	const location = useLocation();
	const [hover, setHover] = React.useState(false);
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
			isExternalUrl,
		} = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		locationHistory,
		pageExtractor,
	);
	const resolvedLink = getHref(linkPath, location);
	const resolvedStyles = processComponentStylePseudoClasses(
		{ hover },
		stylePropertiesWithPseudoStates,
	);
	return (
		<div className="comp compLinks ">
			<HelperComponent definition={definition} />
			<div
				className="linkDiv"
				style={resolvedStyles.container ?? {}}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
			>
				{!isExternalUrl ? (
					<RouterLink
						style={resolvedStyles.link ?? {}}
						className="link"
						to={resolvedLink}
						target={target}
					>
						{getTranslations(label, translations)}
					</RouterLink>
				) : (
					<a
						style={resolvedStyles.link ?? {}}
						className="link"
						href={resolvedLink}
						target={target}
					>
						{getTranslations(label, translations)}
					</a>
				)}
				{showButton ? (
					isExternalUrl ? (
						<RouterLink
							to={resolvedLink}
							target={externalButtonTarget}
							className="secondLink"
						>
							<i
								style={resolvedStyles.icon ?? {}}
								className="fa-solid fa-up-right-from-square"
							></i>
						</RouterLink>
					) : (
						<a href={resolvedLink} target={externalButtonTarget} className="secondLink">
							<i
								style={resolvedStyles.icon ?? {}}
								className="fa-solid fa-up-right-from-square"
							></i>
						</a>
					)
				) : null}
			</div>
		</div>
	);
}

const component: Component = {
	icon: 'fa-solid fa-link',
	name: 'Link',
	displayName: 'Link',
	description: 'Link component',
	component: Link,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleComponent: LinkStyle,
	stylePseudoStates: ['hover'],
};

export default component;
