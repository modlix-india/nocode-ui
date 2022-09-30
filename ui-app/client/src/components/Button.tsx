import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { FUNCTION_EXECUTION_PATH, NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { runEvent } from './util/runEvent';
export interface ButtonProps extends React.ComponentPropsWithoutRef<'button'> {
	definition: {
		key: string;
		properties: {
			label: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			type: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			onClick: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			isDisabled: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			leftIcon?: {
				icon?: {
					value: string;
					location: {
						type: 'EXPRESSION' | 'VALUE';
						value?: string;
						expression?: string;
					};
				};
				iconStyle?: 'REGULAR' | 'SOLID';
			};
			rightIcon?: {
				icon?: {
					value: string;
					location: {
						type: 'EXPRESSION' | 'VALUE';
						value?: string;
						expression?: string;
					};
				};
				iconStyle?: 'REGULAR' | 'SOLID';
			};
			fabIcon?: {
				icon?: {
					value: string;
					location: {
						type: 'EXPRESSION' | 'VALUE';
						value?: string;
						expression?: string;
					};
				};
				iconStyle?: 'REGULAR' | 'SOLID';
			};
		};
	};
	pageDefinition: {
		eventFunctions: {
			[key: string]: any;
		};
	};
}
function ButtonComponent(props: ButtonProps) {
	const {
		pageDefinition: { eventFunctions },
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
		...rest
	} = props;
	const buttonType = getData(type);
	const isDisabledButton = getData(isDisabled);
	const clickEvent = eventFunctions[getData(onClick)];

	const { iconStyle: fabIconStyle = 'SOLID', icon: fabIconLocation = {} } =
		fabIcon;
	const buttonFabIcon = getData(fabIconLocation);

	const buttonLabel = getData(label);
	const { iconStyle: leftIconStyle = 'SOLID', icon: leftIconLocation = {} } =
		leftIcon;
	const {
		iconStyle: rightIconStyle = 'SOLID',
		icon: rightIconLocation = {},
	} = rightIcon;
	const buttonLeftIcon = getData(leftIconLocation);
	const buttonRightIcon = getData(rightIconLocation);

	const functionExecutionStorePath = `${FUNCTION_EXECUTION_PATH}.${key}.isRunning`;
	const [isLoading, setIsLoading] = useState(
		getData(functionExecutionStorePath) || false,
	);

	useEffect(() => {
		addListener(functionExecutionStorePath, (_, value) => {
			setIsLoading(value);
		});
	}, []);

	const handleClick = async () => {
		if (clickEvent && !isLoading) {
			await runEvent(clickEvent, key);
			setData(functionExecutionStorePath, false);
		}
	};
	if (buttonType === 'fabButton' || buttonType === 'fabButtonMini')
		return (
			<button
				className={`compButton ${
					buttonType === 'fabButton' ? 'fabButton' : 'fabButtonMini'
				}`}
				disabled={isLoading || isDisabledButton}
				onClick={handleClick}
				{...rest}
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
		);
	return (
		<button
			className={`compButton button ${buttonType}`}
			disabled={isLoading || isDisabledButton}
			onClick={handleClick}
			{...rest}
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
				{buttonLabel}
				<i
					className={`rightButtonIcon ${
						rightIconStyle === 'SOLID' ? 'fa-solid' : 'fa-regular'
					} fa-fw ${
						buttonRightIcon
							? buttonRightIcon
							: `${buttonRightIcon} hide`
					}`}
				/>
			</div>
		</button>
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

export const Button = ButtonComponent;
