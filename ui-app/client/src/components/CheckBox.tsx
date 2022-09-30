import React, { useEffect, useState } from 'react';
import { Schema } from '@fincity/kirun-js';
import { FUNCTION_EXECUTION_PATH, NAMESPACE_UI_ENGINE } from '../constants';
import { addListener, getData, setData } from '../context/StoreContext';
import { runEvent } from './util/runEvent';
export interface CheckBoxProps extends React.ComponentPropsWithoutRef<'input'> {
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
		};
	};
	pageDefinition: {
		eventFunctions: {
			[key: string]: any;
		};
	};
}
function CheckBoxComponent(props: CheckBoxProps) {
	const {
		pageDefinition: { eventFunctions },
		definition: {
			key,
			properties: { label, onClick, type, isDisabled },
		},
		...rest
	} = props;
	const checkBoxLabel = getData(label);
	const buttonType = getData(type);
	const isDisabledButton = getData(isDisabled);
	const clickEvent = eventFunctions[getData(onClick)];

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
	return (
		<>
			<label className="compCheckBox checkbox" htmlFor="key">
				<input type="checkbox" id="key" name="vehicle1" value="Bike" />
				{checkBoxLabel}
			</label>
		</>
	);
}

CheckBoxComponent.propertiesSchema = Schema.ofObject('Button')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['onClick', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const CheckBox = CheckBoxComponent;
