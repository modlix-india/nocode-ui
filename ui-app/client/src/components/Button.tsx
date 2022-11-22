import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { FUNCTION_EXECUTION_PATH, NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { runEvent } from './util/runEvent';
import { HelperComponent } from './HelperComponent';
import { getTranslations } from './util/getTranslations';
import { DataLocation } from './types';

interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
	definition: {
		key: string;
		properties: {
			label: {
				value: string;
				location: DataLocation;
			};
			type: {
				value: string;
				location: DataLocation;
			};
			onClick: {
				value: string;
				location: DataLocation;
			};
			isDisabled: {
				value: string;
				location: DataLocation;
			};
			leftIcon?: {
				icon?: {
					value: string;
					location: DataLocation;
				};
				iconStyle?: 'REGULAR' | 'SOLID';
			};
			rightIcon?: {
				icon?: {
					value: string;
					location: DataLocation;
				};
				iconStyle?: 'REGULAR' | 'SOLID';
			};
			fabIcon?: {
				icon?: {
					value: string;
					location: DataLocation;
				};
				iconStyle?: 'REGULAR' | 'SOLID';
			};
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
	} = props;
	const buttonType = getData(type, locationHistory);
	const isDisabledButton = getData(isDisabled, locationHistory);
	const clickEventKey = getData(onClick, locationHistory);
	const clickEvent = eventFunctions[clickEventKey];

	const { iconStyle: fabIconStyle = 'SOLID', icon: fabIconLocation = {} } = fabIcon;
	const buttonFabIcon = getData(fabIconLocation, locationHistory);

	const buttonLabel = getData(label, locationHistory);
	const { iconStyle: leftIconStyle = 'SOLID', icon: leftIconLocation = {} } = leftIcon;
	const { iconStyle: rightIconStyle = 'SOLID', icon: rightIconLocation = {} } = rightIcon;
	const buttonLeftIcon = getData(leftIconLocation, locationHistory);
	const buttonRightIcon = getData(rightIconLocation, locationHistory);

	const functionExecutionStorePath = `${FUNCTION_EXECUTION_PATH}.${pageName}.${key}.isRunning`;
	const [isLoading, setIsLoading] = useState(
		getData(functionExecutionStorePath, locationHistory) || false,
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
							fabIconStyle === 'SOLID' ? 'fa-solid' : 'fa-regular'
						} fa-fw ${
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
							leftIconStyle === 'SOLID' ? 'fa-solid' : 'fa-regular'
						} fa-fw ${
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
							rightIconStyle === 'SOLID' ? 'fa-solid' : 'fa-regular'
						} fa-fw ${buttonRightIcon ? buttonRightIcon : `${buttonRightIcon} hide`}`}
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
