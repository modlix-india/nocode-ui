import React from 'react';
import { getData } from '../context/StoreContext';
import { HelperComponent } from './HelperComponent';
import { Schema } from '@fincity/kirun-js';
import { NAMESPACE_UI_ENGINE } from '../constants';

export interface Image extends React.ComponentPropsWithoutRef<'span'> {
	definition: {
		properties: {
			width: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			height: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			src: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
			alt: {
				value: string;
				location: {
					type: 'EXPRESSION' | 'VALUE';
					value?: string;
					expression?: string;
				};
			};
		};
		pageDefinition: {};
	};
}
export function ImageComponent(props: Image) {
	const {
		definition: {
			properties: { width, height, alt, src },
		},
	} = props;
	const widthData = getData(width);
	const heightData = getData(height);
	const altData = getData(alt);
	const srcData = getData(src);

	return (
		<div>
			<HelperComponent />
			<div>
				<img
					src={`${srcData}`}
					alt={`${altData}`}
					width={`${widthData}`}
					height={`${heightData}`}
				/>
			</div>
		</div>
	);
}

ImageComponent.propertiesSchema = Schema.ofObject('Image')
	.setNamespace(NAMESPACE_UI_ENGINE)
	.setProperties(
		new Map([
			['src', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['alt', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['width', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
			['height', Schema.ofRef(`${NAMESPACE_UI_ENGINE}.Location`)],
		]),
	);

export const image = ImageComponent;
