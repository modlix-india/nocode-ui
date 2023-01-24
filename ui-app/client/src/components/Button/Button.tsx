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

function ButtonComponent(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);
	const [focus, setFocus] = useState(false);
	const [hover, setHover] = useState(false);
	let {
		key,
		properties: { label, onClick, type, readOnly, leftIcon, rightIcon } = {},
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
		onClick ? getDataFromPath(spinnerPath, props.locationHistory) ?? false : false,
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

	const handleClick = async () =>
		clickEvent && !isLoading && (await runEvent(clickEvent, onClick, props.context.pageName));

	const rightIconTag =
		!type?.startsWith('fabButton') && !leftIcon ? (
			<i
				style={styleProperties.icon ?? {}}
				className={`rightButtonIcon ${rightIcon ?? 'fa fa-circle-notch hide'}`}
			/>
		) : undefined;

	const leftIconTag = (
		<i
			style={styleProperties.icon ?? {}}
			className={`leftButtonIcon ${
				leftIcon
					? !isLoading
						? leftIcon
						: 'fa fa-circle-notch fa-spin'
					: 'fa fa-circle-notch hide'
			}`}
		/>
	);
	return (
		<div className="comp compButton" style={styleProperties.comp ?? {}}>
			<HelperComponent definition={props.definition} />
			<button
				className={`button ${type}`}
				disabled={isLoading || readOnly}
				onClick={handleClick}
				style={styleProperties.button ?? {}}
				onMouseEnter={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(true) : undefined
				}
				onMouseLeave={
					stylePropertiesWithPseudoStates?.hover ? () => setHover(false) : undefined
				}
				onFocus={stylePropertiesWithPseudoStates?.focus ? () => setFocus(true) : undefined}
				onBlur={stylePropertiesWithPseudoStates?.focus ? () => setFocus(false) : undefined}
			>
				<div className="buttonInternalContainer" style={styleProperties.container ?? {}}>
					{leftIconTag}
					{!type?.startsWith('fabButton') &&
						getTranslations(label, props.pageDefinition.translations)}
					{rightIconTag}
				</div>
			</button>
		</div>
	);
}

const component: Component = {
	name: 'Button',
	displayName: 'Button',
	description: 'Button component',
	component: ButtonComponent,
	styleComponent: ButtonStyle,
	propertyValidation: (props: ComponentPropertyDefinition): Array<string> => [],
	properties: propertiesDefinition,
	styleProperties: stylePropertiesDefinition,
	stylePseudoStates: ['focus', 'hover', 'disabled'],
};

export default component;
