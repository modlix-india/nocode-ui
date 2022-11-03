import { Schema } from '@fincity/kirun-js';
import React from 'react';
import { NAMESPACE_UI_ENGINE } from '../constants';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { getTranslations } from './util/getTranslations';
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
	pageDefinition: {
		translations: {
			[key: string]: {
				[key: string]: string;
			};
		};
	};
}
export function LabelComponent(props: LabelProps) {
	const {
		pageDefinition: { translations },
		definition: {
			properties: { text },
		},
		...rest
	} = props;
	const labelText = getData(text);
	return (
		<div className="comp compLabel">
			<HelperComponent />
			<span {...rest}>{getTranslations(labelText, translations)}</span>
		</div>
	);
}

LabelComponent.propertiesSchema = Schema.ofObject('Label')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([['text', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)]]),
	);

export const Label = LabelComponent;
