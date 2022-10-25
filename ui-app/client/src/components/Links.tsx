import React from 'react';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

export interface LinkProps extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		properties: {
			linkPath: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			label: {
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

export function LinkComponent(props: LinkProps) {
	const {
		definition: {
			properties: { linkPath, label },
		},
		pageDefinition: { translations },
		...rest
	} = props;
	const labelValue = getData(label);
	const linkPathValue = getData(linkPath);
	return (
		<div className="comp compTextBox">
			<HelperComponent />
			<div className="">
				<a className="link" href={`${linkPathValue}`}>
					{labelValue}
				</a>
			</div>
		</div>
	);
}

LinkComponent.propertiesSchema = Schema.ofObject('Link')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['label', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['linkPath', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const link = LinkComponent;
