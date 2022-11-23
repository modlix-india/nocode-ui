import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { FUNCTION_EXECUTION_PATH, NAMESPACE_UI_ENGINE } from '../constants';
import {
	addListener,
	getData,
	getDataFromPath,
	PageStoreExtractor,
	setData,
} from '../context/StoreContext';
import { runEvent } from './util/runEvent';
import { HelperComponent } from './HelperComponent';
import { getTranslations } from './util/getTranslations';
import { ComponentProperty, DataLocation, RenderContext } from './types';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
	definition: {
		key: string;
		properties: {
			label: ComponentProperty<string>;
			type: ComponentProperty<string>;
			onClick: ComponentProperty<string>;
			isDisabled: ComponentProperty<string>;
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
				isDisabled,
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
	const isDisabledButton = getData(isDisabled, locationHistory, pageExtractor);
	const clickEventKey = getData(onClick, locationHistory, pageExtractor) || '';
	const clickEvent = eventFunctions[clickEventKey];

	const buttonFabIcon = getData(fabIcon, locationHistory, pageExtractor);

	const buttonLabel = getData(label, locationHistory);

	const buttonLeftIcon = getData(leftIcon, locationHistory, pageExtractor);
	const buttonRightIcon = getData(rightIcon, locationHistory, pageExtractor);

	const functionExecutionStorePath = `${FUNCTION_EXECUTION_PATH}.${pageName}.${key}.isRunning`;
	const [isLoading, setIsLoading] = useState(
		getDataFromPath(functionExecutionStorePath, locationHistory) || false,
	);

	useEffect(() => {
		addListener(functionExecutionStorePath, (_, value) => {
			setIsLoading(value);
		});
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
									: 'fa-circle-notch fa-spin'
								: 'fa-circle-notch hide'
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
									: 'fa-circle-notch fa-spin'
								: 'fa-circle-notch hide'
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

ButtonComponent.propertiesSchema = Schema.ofObject('Button')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['onClick', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export default ButtonComponent;
