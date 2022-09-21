import React from 'react';
import { getData } from '../context/StoreContext';
export interface LabelProps extends React.ComponentPropsWithoutRef<'p'> {
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
}
export function Label(props: LabelProps) {
	const {
		definition: {
			properties: { text },
		},
		...rest
	} = props;
	const labelText = getData(text);
	return <p {...rest}>{labelText}</p>;
}
