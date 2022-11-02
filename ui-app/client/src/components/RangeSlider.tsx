import React from 'react';
import { getData, setData, addListener } from '../context/StoreContext';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { Schema } from '@fincity/kirun-js';

export interface RangeSliderProps
	extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		properties: {
			bindingPath: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			initialValue: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			max: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};

			min: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			step: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			options: {
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
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
}

export function RangeSliderComponent(props: RangeSliderProps) {
	const {
		definition: {
			properties: { bindingPath, initialValue, max, min, step },
		},
		pageDefinition: { translations },
		...rest
	} = props;
	const [value, setValue] = React.useState('');
	const minValue = getData(min);
	const maxvalue = getData(max);
	const stepValue = getData(step);
	const sliderBindingPath = getData(bindingPath);
	// const initialValueData = getData(initialValue);
	// console.log(sliderBindingPath + 'hii');
	React.useEffect(() => {
		const unsubscribe = addListener(sliderBindingPath, (_, value) => {
			setValue(value);
		});
		return () => {
			unsubscribe();
		};
	}, []);

	const handleChange = function (event: any) {
		// console.log(event.target.value, sliderBindingPath);
		setData(sliderBindingPath, event?.target.value);
		// setValue(event.target.value);
	};

	return (
		<div>
			<div>
				<span className="rangeSliderValueSpan">{value}</span>
				<div>
					<input
						className="rangeSlider"
						type="range"
						min={minValue}
						max={maxvalue}
						value={value}
						onChange={handleChange}
						step={`${stepValue}`}
						list="volsettings"
					/>
					<datalist id="volsettings">
						<option>0</option>
						<option>20</option>
						<option>40</option>
						<option>60</option>
						<option>80</option>
						<option>100</option>
					</datalist>
				</div>
			</div>
		</div>
	);
}
RangeSliderComponent.propertiesSchema = Schema.ofObject('Link')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['linkPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);
export const RangeSlider = RangeSliderComponent;
