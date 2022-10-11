import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
export interface LabelProps extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		properties: {
			text: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
		};
	};
	pageDefinition: any;
}
export function LabelComponent(props: LabelProps) {
	const {
		pageDefinition,
		definition: {
			properties: { text },
		},
		...rest
	} = props;
	const labelText = getData(text);
	return <div className='comp compLabel'>
		<HelperComponent/>
		<span {...rest}>{labelText}</span>
		</div>
}

LabelComponent.propertiesSchema = Schema.ofObject('Button')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([['text', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)]]),
	);

export const Label = LabelComponent;
