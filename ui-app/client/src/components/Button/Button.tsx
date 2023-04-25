import React, { useEffect, useState } from 'react';
import { STORE_PATH_FUNCTION_EXECUTION, NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListener,
	getData,
	getDataFromPath,
	PageStoreExtractor,
} from '../../context/StoreContext';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { Component, ComponentPropertyDefinition, ComponentProps } from '../../types/common';
import { propertiesDefinition, stylePropertiesDefinition } from './buttonProperties';
import ButtonStyle from './ButtonStyle';
import useDefinition from '../util/useDefinition';
import { processComponentStylePseudoClasses } from '../../util/styleProcessor';
import { flattenUUID } from '../util/uuid';
import { getHref } from '../util/getHref';
import { useLocation, useNavigate } from 'react-router-dom';
import { SubHelperComponent } from '../SubHelperComponent';

function ButtonComponent(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const [focus, setFocus] = useState(false);
	const [hover, setHover] = useState(false);
	const location = useLocation();
	const navigate = useNavigate();
	let {
		key,
		properties: { label, onClick, type, readOnly, leftIcon, rightIcon, target, linkPath } = {},
		stylePropertiesWithPseudoStates,
	} = useDefinition(
		props.definition,
		propertiesDefinition,
		stylePropertiesDefinition,
		props.locationHistory,
		pageExtractor,
	);

	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;
	const spinnerPath = onClick
		? `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${flattenUUID(
				onClick,
		  )}.isRunning`
		: undefined;

	const [isLoading, setIsLoading] = useState(
		onClick
			? getDataFromPath(spinnerPath, props.locationHistory, pageExtractor) ?? false
			: false,
	);

	useEffect(() => {
		if (spinnerPath) {
			return addListener((_, value) => setIsLoading(value), pageExtractor, spinnerPath);
		}
	}, []);

	const styleProperties = processComponentStylePseudoClasses(
		{ focus, hover, disabled: isLoading || readOnly },
		stylePropertiesWithPseudoStates,
	);

	const handleClick = async () => {
		if (linkPath) {
			if (target) {
				window.open(getHref(linkPath, location), target);
			} else {
				if (
					linkPath?.startsWith('http:') ||
					linkPath?.startsWith('https:') ||
					linkPath?.startsWith('//') ||
					linkPath?.startsWith('www')
				)
					window.location.href = linkPath;
				else navigate(getHref(linkPath, location));
			}
		}

		if (clickEvent && !isLoading)
			await runEvent(
				clickEvent,
				onClick,
				props.context.pageName,
				props.locationHistory,
				props.pageDefinition,
			);
	};

	const rightIconTag =
		!type?.startsWith('fabButton') && !leftIcon ? (
			<i
				style={styleProperties.rightIcon ?? {}}
				className={`rightButtonIcon ${styleProperties.rightIcon?.className ?? ''} ${
					rightIcon ?? 'fa fa-circle-notch hide'
				}`}
			>
				<SubHelperComponent
					definition={props.definition}
					subComponentName="rightIcon"
				></SubHelperComponent>
			</i>
		) : undefined;

	const leftIconTag = (
		<i
			style={styleProperties.leftIcon ?? {}}
			className={`leftButtonIcon ${styleProperties.leftIcon?.className ?? ''} ${
				leftIcon
					? !isLoading
						? leftIcon
						: 'fa fa-circle-notch fa-spin'
					: 'fa fa-circle-notch hide'
			}`}
		>
			<SubHelperComponent
				definition={props.definition}
				subComponentName="leftIcon"
			></SubHelperComponent>
		</i>
	);
	return (
		<button
			className={`comp compButton button ${styleProperties.comp?.className ?? ''} ${type}`}
			disabled={isLoading || readOnly}
			onClick={handleClick}
			style={styleProperties.comp ?? {}}
			onMouseEnter={stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined}
			onMouseLeave={
				stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
			}
			onFocus={stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined}
			onBlur={stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined}
		>
			<HelperComponent definition={props.definition} />
			{leftIconTag}
			{!type?.startsWith('fabButton') &&
				getTranslations(label, props.pageDefinition.translations)}
			{rightIconTag}
		</button>
	);
}

const component: Component = {
	icon: 'fa-solid fa-rectangle-ad',
	name: 'Button',
	displayName: 'Button',
	description: 'Button component',
	component: ButtonComponent,
	styleComponent: ButtonStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['focus', 'hover', 'disabled'],
	defaultTemplate: {
		key: '',
		name: 'button',
		type: 'Button',
		properties: {
			label: { value: 'Button' },
		},
	},
};

export default component;
