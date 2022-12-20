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

function ButtonComponent(props: ComponentProps) {
	const pageExtractor = PageStoreExtractor.getForContext(props.context.pageName);

	let {
		key,
		properties: { label, onClick, type, readOnly, leftIcon, rightIcon } = {},
		styleProperties,
	} = useDefinition(props.definition, propertiesDefinition, props.locationHistory, pageExtractor);
	const clickEvent = onClick ? props.pageDefinition.eventFunctions[onClick] : undefined;

	const spinnerPath = `${STORE_PATH_FUNCTION_EXECUTION}.${props.context.pageName}.${key}.isRunning`;
	const [isLoading, setIsLoading] = useState(
		getDataFromPath(spinnerPath, props.locationHistory) || false,
	);

	useEffect(() => addListener((_, value) => setIsLoading(value), spinnerPath), []);

	const handleClick = async () =>
		clickEvent && !isLoading && (await runEvent(clickEvent, onClick, props.context.pageName));

	const rightIconTag =
		!type?.startsWith('fabButton') && !leftIcon ? (
			<i className={`rightButtonIcon ${rightIcon ?? 'fa fa-circle-notch hide'}`} />
		) : undefined;

	const leftIconTag = (
		<i
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
		<div className="comp compButton">
			<HelperComponent definition={props.definition} />
			<button
				className={`button ${type}`}
				disabled={isLoading || readOnly}
				onClick={handleClick}
			>
				<div className="buttonInternalContainer">
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
};

export default component;
