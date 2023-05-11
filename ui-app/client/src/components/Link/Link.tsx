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
import { SubHelperComponent } from '../SubHelperComponent';

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
			leftIcon,
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
		props.pageDefinition,
		{ hover },
		stylePropertiesWithPseudoStates,
	);

	const leftIconTag = leftIcon ? (
		<i style={resolvedStyles.leftIcon ?? {}} className={`leftIcon ${leftIcon}`}>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="leftIcon"
			></SubHelperComponent>
		</i>
	) : null;
	return (
		<div
			className="comp compLinks linkDiv"
			style={resolvedStyles.comp ?? {}}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
		>
			<HelperComponent definition={definition} />
			{!isExternalUrl ? (
				<RouterLink
					style={resolvedStyles.link ?? {}}
					className="link"
					to={resolvedLink}
					target={target}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="link"
					></SubHelperComponent>
					{leftIconTag}
					{getTranslations(label, translations)}
				</RouterLink>
			) : (
				<a
					style={resolvedStyles.link ?? {}}
					className="link"
					href={resolvedLink}
					target={target}
				>
					<SubHelperComponent
						definition={props.definition}
						subComponentName="link"
					></SubHelperComponent>
					{leftIconTag}
					{getTranslations(label, translations)}
				</a>
			)}
			{showButton ? (
				isExternalUrl ? (
					<RouterLink
						to={resolvedLink}
						target={externalButtonTarget}
						className="secondLink"
						style={resolvedStyles.secondLink ?? {}}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="secondLink"
						/>
						<i
							style={resolvedStyles.icon ?? {}}
							className="icon fa-solid fa-up-right-from-square"
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="icon"
							></SubHelperComponent>
						</i>
					</RouterLink>
				) : (
					<a
						href={resolvedLink}
						target={externalButtonTarget}
						className="secondLink"
						style={resolvedStyles.secondLink ?? {}}
					>
						<SubHelperComponent
							definition={props.definition}
							subComponentName="secondLink"
						/>
						<i
							style={resolvedStyles.icon ?? {}}
							className="icon fa-solid fa-up-right-from-square"
						>
							<SubHelperComponent
								definition={props.definition}
								subComponentName="icon"
							></SubHelperComponent>
						</i>
					</a>
				)
			) : null}
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
	styleProperties: stylePropertiesDefinition,
	styleComponent: LinkStyle,
	stylePseudoStates: ['hover'],
	defaultTemplate: {
		key: '',
		type: 'Link',
		name: 'Link',
		properties: {
			label: { value: 'Link' },
		},
	},
};

export default component;
