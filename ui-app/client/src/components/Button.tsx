import React from 'react';
import { Schema } from '@fincity/kirun-js';
import { FUNCTION_EXECUTION_PATH, NAMESPACE_UI_ENGINE } from '../constants';
import { getData, setData } from '../context/StoreContext';
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
			onClick: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
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
			properties: { label, onClick },
		},
		...rest
	} = props;
	const functionExecutionStorePath = `${FUNCTION_EXECUTION_PATH}.${key}.isRunning`;
	const buttonLabel = getData(label);
	const clickEvent = eventFunctions[getData(onClick)];
	const handleClick = async () => {
		if (clickEvent) {
			await runEvent(clickEvent, key);
			setData(functionExecutionStorePath, false);
		}
	};
	return (
		<button onClick={handleClick} {...rest}>
			{buttonLabel}
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
