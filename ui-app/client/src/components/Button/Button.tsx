import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { STORE_PATH_FUNCTION_EXECUTION, NAMESPACE_UI_ENGINE } from '../../constants';
import {
	addListener,
	getData,
	getDataFromPath,
	PageStoreExtractor,
	setData,
} from '../../context/StoreContext';
import { runEvent } from '../util/runEvent';
import { HelperComponent } from '../HelperComponent';
import { getTranslations } from '../util/getTranslations';
import { ComponentProperty, DataLocation, RenderContext } from '../../types/common';
import { Component } from '../../types/component';
import properties from './buttonProperties';
import ButtonStyle from './ButtonStyle';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
	definition: {
		key: string;
		properties: {
			label: ComponentProperty<string>;
			type: ComponentProperty<string>;
			onClick: ComponentProperty<string>;
			readOnly: ComponentProperty<boolean>;
			leftIcon?: ComponentProperty<string>;
			rightIcon?: ComponentProperty<string>;
			fabIcon?: ComponentProperty<string>;
		};
	};
	pageDefinition: {
		name: string;
		eventFunctions: {
			[key: string]: any;
		};
		translations: { [key: string]: { [key: string]: string } };
	};
	locationHistory: Array<DataLocation | string>;
	context: RenderContext;
}
function ButtonComponent(props: ButtonProps) {
	const {
		pageDefinition: { name: pageName, eventFunctions, translations },
		definition: {
			key,
			properties: {
				label,
				onClick,
				type,
				readOnly,
				leftIcon = {},
				rightIcon = {},
				fabIcon = {},
			},
		},
		locationHistory,
		definition,
		context,
	} = props;
	const pageExtractor = PageStoreExtractor.getForContext(context.pageName);
	const buttonType = getData(type, locationHistory, pageExtractor);
	const isDisabledButton = getData(readOnly, locationHistory, pageExtractor);
	const clickEventKey = getData(onClick, locationHistory, pageExtractor) || '';
	const clickEvent = eventFunctions[clickEventKey];

	const buttonFabIcon = getData(fabIcon, locationHistory, pageExtractor);

	const buttonLabel = getData(label, locationHistory);

	const buttonLeftIcon = getData(leftIcon, locationHistory, pageExtractor);
	const buttonRightIcon = getData(rightIcon, locationHistory, pageExtractor);

	const functionExecutionStorePath = `${STORE_PATH_FUNCTION_EXECUTION}.${pageName}.${key}.isRunning`;
	const [isLoading, setIsLoading] = useState(
		getDataFromPath(functionExecutionStorePath, locationHistory) || false,
	);

	useEffect(() => {
		addListener((_, value) => {
			setIsLoading(value);
		}, functionExecutionStorePath);
	}, []);

	const handleClick = async () => {
		if (clickEvent && !isLoading) {
			await runEvent(clickEvent, clickEventKey, pageName);
		}
	};
	if (buttonType === 'fabButton' || buttonType === 'fabButtonMini')
		return (
			<div className="comp compButton">
				<HelperComponent definition={definition} />
				<button
					className={`${buttonType === 'fabButton' ? 'fabButton' : 'fabButtonMini'}`}
					disabled={isLoading || isDisabledButton}
					onClick={handleClick}
				>
					<i
						className={`fabButtonIcon ${
							buttonFabIcon
								? !isLoading
									? buttonFabIcon
									: 'fa fa-circle-notch fa-spin'
								: 'fa fa-circle-notch hide'
						}`}
					/>
				</button>
			</div>
		);
	return (
		<div className="comp compButton">
			<HelperComponent definition={definition} />
			<button
				className={` button ${buttonType}`}
				disabled={isLoading || isDisabledButton}
				onClick={handleClick}
			>
				<div className="buttonInternalContainer">
					<i
						className={`leftButtonIcon ${
							buttonLeftIcon
								? !isLoading
									? buttonLeftIcon
									: 'fa fa-circle-notch fa-spin'
								: 'fa fa-circle-notch hide'
						}`}
					/>
					{getTranslations(buttonLabel, translations)}
					<i
						className={`rightButtonIcon ${
							buttonRightIcon ? buttonRightIcon : `${buttonRightIcon} hide`
						}`}
					/>
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
	propertyValidation: (props: ButtonProps): Array<string> => [],
	properties,
};

export default component;
